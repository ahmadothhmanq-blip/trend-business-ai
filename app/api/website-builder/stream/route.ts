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
import { createSseStreamHelpers } from "@/lib/api/sse-stream";
import { isStreamDisconnectError } from "@/lib/ai/retry";
import { logger } from "@/lib/logger";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
/** Long Website Builder generations (multiple DeepSeek calls). */
export const maxDuration = 800;

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

  const input = parsed.data;
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

      try {
        const okConnect = send("progress", {
          message: "Connecting to AI website engine...",
        });
        if (!okConnect) {
          logger.error("Website Builder stream aborted before generation", WB_STREAM_LOG, {
            runId,
            phase: "initial_progress",
          });
        }

        logger.info("Website Builder generateWebsite start", WB_STREAM_LOG, {
          runId,
          provider: settings?.default_provider ?? "default",
        });

        const project = await generateWebsite({
          ...input,
          projectKind,
          ...parentContext,
          userId: auth.user!.id,
          preferredProvider: settings?.default_provider as
            | AIProviderName
            | undefined,
          autoFallback: settings?.auto_fallback ?? true,
          onProgress: (message) => {
            // Client may disconnect mid-run; keep generating until save when possible.
            const delivered = send("progress", { message });
            if (!delivered) {
              logger.warn("SSE progress dropped (client disconnected)", WB_STREAM_LOG, {
                runId,
                message,
                elapsedMs: Date.now() - startedAt,
              });
            }
          },
        });

        logger.info("Website Builder generateWebsite done", WB_STREAM_LOG, {
          runId,
          elapsedMs: Date.now() - startedAt,
          fileCount: project.files?.length ?? 0,
          title: project.title,
          sseClosed: isClosed(),
        });

        send("progress", { message: "Building product preview..." });

        logger.info("Final database save start", WB_STREAM_LOG, {
          runId,
          userId: auth.user!.id,
          fileCount: project.files?.length ?? 0,
        });

        const saved = await persistWebsiteGeneration({
          supabase: auth.supabase,
          userId: auth.user!.id,
          project,
          projectKind: project.projectKind ?? projectKind,
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
          });
          send("error", { error: saved.error });
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
        const message = isStreamDisconnectError(error)
          ? "AI provider connection interrupted during generation. Please retry."
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
            message,
          },
          error,
        );
        send("error", { error: message });
      } finally {
        logger.info("Website Builder stream finally close", WB_STREAM_LOG, {
          runId,
          elapsedMs: Date.now() - startedAt,
          sseClosed: isClosed(),
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
