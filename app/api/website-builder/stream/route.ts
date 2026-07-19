import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { generateWebsite } from "@/lib/website-generator";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import {
  detectWebsiteProjectKind,
  websiteGenerateRequestSchema,
} from "@/lib/validations/website-builder";
import {
  asSupabaseMaybeSingleClient,
  asSupabaseSingleClient,
} from "@/lib/api/supabase-query";
import { loadWebsiteParentContext } from "@/plugins/website/iteration";
import { persistWebsiteGeneration } from "@/lib/website/save-generation";
import {
  beginWebsiteGenerationSession,
  checkpointWebsiteGeneration,
  failWebsiteGenerationSession,
} from "@/lib/website/generation-session";
import { createSseStreamHelpers } from "@/lib/api/sse-stream";
import { isRetryableError, isStreamDisconnectError, withRetry } from "@/lib/ai/retry";
import { clampWebsitePrompt } from "@/lib/ai/timeouts";
import { logger } from "@/lib/logger";
import type { GeneratedProjectFile } from "@/plugins/website/types";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** Long Website Builder generations (multiple DeepSeek + image calls). */
export const maxDuration = 900;

const WB_STREAM_LOG = "wb-stream";

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "website-builder");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = websiteGenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const input = {
    ...parsed.data,
    prompt: clampWebsitePrompt(parsed.data.prompt),
    continueInstruction: parsed.data.continueInstruction
      ? clampWebsitePrompt(parsed.data.continueInstruction, 6000)
      : parsed.data.continueInstruction,
  };
  const projectKind = detectWebsiteProjectKind(input);
  const runId = `wb-${Date.now().toString(36)}`;
  logger.info("Website Builder stream start", WB_STREAM_LOG, {
    runId,
    userId: auth.user!.id,
    mode: input.mode ?? "generate",
    projectKind,
    promptChars: input.prompt.length,
    parentGenerationId: input.parentGenerationId ?? null,
    optimizeWithAi: Boolean(input.optimizeWithAi),
  });

  const settings = await providerManager.loadUserSettings(
    asSupabaseSingleClient(auth.supabase),
    auth.user!.id,
  );
  const parentContext = await loadWebsiteParentContext(
    asSupabaseMaybeSingleClient(auth.supabase),
    auth.user!.id,
    input.parentGenerationId,
  );

  const stream = new ReadableStream({
    async start(controller) {
      const { send, close, isClosed } = createSseStreamHelpers(
        controller,
        WB_STREAM_LOG,
      );
      const startedAt = Date.now();
      let sessionId: string | null = null;
      let lastFiles: GeneratedProjectFile[] = [];
      let checkpointQueue: Promise<void> = Promise.resolve();
      let lastCheckpointAt = 0;

      const queueCheckpoint = (message?: string, files?: GeneratedProjectFile[]) => {
        if (!sessionId) return;
        if (files) lastFiles = files;
        const now = Date.now();
        // Throttle DB writes — keep progress fresh without hammering Supabase.
        if (!files && now - lastCheckpointAt < 4000) return;
        lastCheckpointAt = now;
        checkpointQueue = checkpointQueue
          .then(async () => {
            if (!sessionId) return;
            await checkpointWebsiteGeneration({
              supabase: auth.supabase,
              userId: auth.user!.id,
              generationId: sessionId,
              message,
              files: lastFiles.length ? lastFiles : undefined,
            });
          })
          .catch((error) => {
            logger.warn("Checkpoint failed (non-fatal)", WB_STREAM_LOG, {
              runId,
              sessionId,
              error: error instanceof Error ? error.message : String(error),
            });
          });
      };

      try {
        const session = await beginWebsiteGenerationSession({
          supabase: auth.supabase,
          userId: auth.user!.id,
          input: {
            prompt: input.prompt,
            language: input.language,
            theme: input.theme,
            features: input.features,
            productId: input.productId,
            projectId: input.projectId,
            mode: input.mode,
            parentGenerationId: input.parentGenerationId,
            continueInstruction: input.continueInstruction,
            projectKind,
          },
        });
        if (session.ok) {
          sessionId = session.generation.id;
          send("session", {
            generationId: sessionId,
            message: "Generation session started — progress is saved as we go.",
          });
        }

        const okConnect = send("progress", {
          message: "Connecting to AI website engine...",
          generationId: sessionId,
        });
        if (!okConnect) {
          logger.error("Website Builder stream aborted before generation", WB_STREAM_LOG, {
            runId,
            phase: "initial_progress",
            sessionId,
          });
        }

        logger.info("Website Builder generateWebsite start", WB_STREAM_LOG, {
          runId,
          provider: settings?.default_provider ?? "default",
          sessionId,
        });

        // Retry transient AI / disconnect failures once the session row exists.
        const project = await withRetry(
          () =>
            generateWebsite({
              ...input,
              projectKind,
              ...parentContext,
              userId: auth.user!.id,
              preferredProvider: settings?.default_provider as
                | AIProviderName
                | undefined,
              autoFallback: settings?.auto_fallback ?? true,
              onProgress: (message) => {
                const delivered = send("progress", {
                  message,
                  generationId: sessionId,
                });
                if (!delivered) {
                  logger.warn("SSE progress dropped (client disconnected)", WB_STREAM_LOG, {
                    runId,
                    message,
                    sessionId,
                    elapsedMs: Date.now() - startedAt,
                  });
                }
                queueCheckpoint(message);
              },
              onFilesCheckpoint: async (files, meta) => {
                lastFiles = files;
                queueCheckpoint(meta.message, files);
                send("progress", {
                  message: meta.message,
                  generationId: sessionId,
                  fileCount: files.length,
                });
              },
            }),
          {
            maxAttempts: 3,
            delaysMs: [2500, 5000, 10000],
            shouldRetry: (error) =>
              isRetryableError(error) || isStreamDisconnectError(error),
          },
        );

        await checkpointQueue;

        logger.info("Website Builder generateWebsite done", WB_STREAM_LOG, {
          runId,
          elapsedMs: Date.now() - startedAt,
          fileCount: project.files?.length ?? 0,
          title: project.title,
          sseClosed: isClosed(),
          sessionId,
        });

        send("progress", {
          message: "Building product preview...",
          generationId: sessionId,
        });

        logger.info("Final database save start", WB_STREAM_LOG, {
          runId,
          userId: auth.user!.id,
          fileCount: project.files?.length ?? 0,
          sessionId,
        });

        const saved = await persistWebsiteGeneration({
          supabase: auth.supabase,
          userId: auth.user!.id,
          project,
          projectKind: project.projectKind ?? projectKind,
          existingGenerationId: sessionId,
          input: {
            prompt: input.prompt,
            language: input.language,
            theme: input.theme,
            features: input.features,
            productId: input.productId,
            projectId: input.projectId,
            mode: input.mode,
            parentGenerationId: input.parentGenerationId,
            continueInstruction: input.continueInstruction,
          },
        });

        if (!saved.ok) {
          logger.error("Final database save failed", WB_STREAM_LOG, {
            runId,
            error: saved.error,
            sseClosed: isClosed(),
            sessionId,
          });
          if (sessionId) {
            await failWebsiteGenerationSession({
              supabase: auth.supabase,
              userId: auth.user!.id,
              generationId: sessionId,
              errorMessage: saved.error,
              files: project.files,
            });
          }
          send("error", { error: saved.error, generationId: sessionId });
          return;
        }

        logger.info("Final database save ok", WB_STREAM_LOG, {
          runId,
          generationId: saved.generation.id,
          fileCount: saved.project.files?.length ?? 0,
          sseClosed: isClosed(),
        });

        const completeDelivered = send("complete", {
          project: saved.project,
          generation: saved.generation,
          generationId: saved.generation.id,
          message: "Website saved to your workspace.",
        });

        if (!completeDelivered) {
          logger.error(
            "SSE complete event NOT delivered — client already disconnected",
            WB_STREAM_LOG,
            {
              runId,
              generationId: saved.generation.id,
              phase: "complete_enqueue_failed",
              elapsedMs: Date.now() - startedAt,
            },
          );
        } else {
          logger.info("SSE complete event delivered", WB_STREAM_LOG, {
            runId,
            generationId: saved.generation.id,
            elapsedMs: Date.now() - startedAt,
          });
        }
      } catch (error) {
        await checkpointQueue;
        const message = isStreamDisconnectError(error)
          ? "AI provider connection interrupted during generation. Progress was saved — use Resume to continue."
          : error instanceof Error
            ? error.message
            : "Unable to generate website application.";
        logger.error(
          "Website Builder stream failure",
          WB_STREAM_LOG,
          {
            runId,
            phase: "catch",
            disconnect: isStreamDisconnectError(error),
            sseClosed: isClosed(),
            elapsedMs: Date.now() - startedAt,
            sessionId,
            message,
          },
          error,
        );
        if (sessionId) {
          await failWebsiteGenerationSession({
            supabase: auth.supabase,
            userId: auth.user!.id,
            generationId: sessionId,
            errorMessage: message,
            files: lastFiles,
          });
        }
        send("error", { error: message, generationId: sessionId });
      } finally {
        logger.info("Website Builder stream finally close", WB_STREAM_LOG, {
          runId,
          elapsedMs: Date.now() - startedAt,
          sseClosed: isClosed(),
          sessionId,
        });
        close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      // Hint proxies/CDNs not to buffer SSE
      "X-Accel-Buffering": "no",
    },
  });
}
