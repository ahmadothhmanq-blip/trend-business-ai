import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { apiValidationError } from "@/lib/i18n/api-errors";
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
import {
  createWaveCheckpointEngine,
  isWaveCheckpointEngineEnabled,
} from "@/lib/website/wave-checkpoint-engine";
import { isWaveSchedulerEnabled } from "@/lib/ai-core/file-generation/flags";
import { createSseStreamHelpers } from "@/lib/api/sse-stream";
import { isRetryableError, isStreamDisconnectError, withRetry } from "@/lib/ai/retry";
import { clampWebsitePrompt } from "@/lib/ai/timeouts";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import { logger } from "@/lib/logger";
import {
  isWebsiteIncrementalPreviewEnabled,
  isUltraFastWebsiteGenerationEnabled,
  resolveWebsiteGenerationProfile,
} from "@/lib/website/generation-flags";
import { createBillingManager } from "@/lib/billing";
import { isPaidWebsitePlan } from "@/lib/ai-core/quality-authority/billing";
import {
  ArchitectureValidationFailure,
  E2EWebsiteProfiler,
  formatE2EMarkdownReport,
  runWithE2EProfiler,
  runWithWebsiteProfiler,
  WebsitePipelineProfiler,
} from "@/lib/website/generation-api";
import { normalizeWebsiteFeatureList } from "@/lib/website/builder/feature-registry";
import type { GeneratedProjectFile } from "@/plugins/website/types";
import { NextResponse } from "next/server";
import { performance } from "node:perf_hooks";
import {
  getStreamHandoffDelayMs,
  getWebsiteStreamMaxDurationSec,
} from "@/lib/website/stream-limits";

export const runtime = "nodejs";
/**
 * Website Builder SSE route budget (seconds).
 * Set to 900 to match the JSON generation route; Vercel Pro enforces 300s at runtime.
 * Handoff + client DB recovery cover generations that exceed the platform cap.
 */
export const maxDuration = 900;

const WB_STREAM_LOG = "wb-stream";

export async function POST(request: Request) {
  const e2eProfileEnabled = request.headers.get("X-WB-E2E-Profile") === "1";
  const apiRouteStartedAt = performance.now();

  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(auth.supabase, auth.user!.id, "website-builder");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = websiteGenerateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const input = {
    ...parsed.data,
    prompt: clampWebsitePrompt(parsed.data.prompt),
    features: normalizeWebsiteFeatureList(parsed.data.features),
    continueInstruction: parsed.data.continueInstruction
      ? clampWebsitePrompt(parsed.data.continueInstruction, 6000)
      : parsed.data.continueInstruction,
  };
  const aiLanguage = resolveRequestLanguage(request, input.language);
  const localizedInput = { ...input, language: aiLanguage };
  const projectKind = detectWebsiteProjectKind(localizedInput);
  const runId = `wb-${Date.now().toString(36)}`;
  logger.info("Website Builder stream start", WB_STREAM_LOG, {
    runId,
    userId: auth.user!.id,
    mode: input.mode ?? "generate",
    projectKind,
    promptChars: input.prompt.length,
    promptPreview: input.prompt.slice(0, 100),
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

  let billingPlanId = "free";
  try {
    const billing = createBillingManager(auth.supabase);
    const billingStatus = await billing.getStatus(auth.user!.id);
    billingPlanId = billingStatus.currentPlanId;
  } catch (error) {
    logger.warn("Billing status unavailable for generation profile", WB_STREAM_LOG, {
      runId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  const generationInput = {
    ...localizedInput,
    hasPaidPlan: isPaidWebsitePlan(billingPlanId),
    billingPlanId,
  };

  const stream = new ReadableStream({
    async start(controller) {
      const pipelineProfiler = e2eProfileEnabled
        ? new WebsitePipelineProfiler()
        : null;
      const e2eProfiler = e2eProfileEnabled
        ? new E2EWebsiteProfiler(runId)
        : null;

      const runStreamBody = async () => {
      const { send: rawSend, close, isClosed } = createSseStreamHelpers(
        controller,
        WB_STREAM_LOG,
      );
      const send: typeof rawSend = (event, data) => {
        if (e2eProfiler && event !== "ping") {
          const payload = JSON.stringify(data ?? {});
          e2eProfiler.recordSseEvent(
            event,
            payload.length,
            typeof data === "object" &&
              data !== null &&
              "generationId" in data &&
              typeof (data as { generationId?: unknown }).generationId === "string"
              ? (data as { generationId: string }).generationId
              : undefined,
          );
        }
        return rawSend(event, data);
      };
      const startedAt = Date.now();
      let sessionId: string | null = null;
      let lastFiles: GeneratedProjectFile[] = [];
      let checkpointQueue: Promise<void> = Promise.resolve();
      let lastCheckpointAt = 0;
      let handoffSent = false;
      let handoffTimer: ReturnType<typeof setTimeout> | null = null;

      const waveCheckpointEngine = createWaveCheckpointEngine({
        enabled: isWaveCheckpointEngineEnabled(),
        schedulerMode: isWaveSchedulerEnabled() ? "wave" : "serial",
        coalesceMs: 300,
        flush: async ({ files, message, waveState }) => {
          if (!sessionId) return;
          lastFiles = files;
          lastCheckpointAt = Date.now();
          checkpointQueue = checkpointQueue
            .then(async () => {
              if (!sessionId) return;
              await checkpointWebsiteGeneration({
                supabase: auth.supabase,
                userId: auth.user!.id,
                generationId: sessionId,
                message,
                files,
                partialProject: { waveGenerationState: waveState },
              });
            })
            .catch((error) => {
              logger.warn("Wave checkpoint flush failed (non-fatal)", WB_STREAM_LOG, {
                runId,
                sessionId,
                error: error instanceof Error ? error.message : String(error),
              });
            });
          await checkpointQueue;
        },
      });

      const queueCheckpoint = (message?: string, files?: GeneratedProjectFile[]) => {
        if (!sessionId) return;
        if (files) lastFiles = files;
        const now = Date.now();
        // Throttle progress-only DB writes — file checkpoints go through wave engine.
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
              partialProject: {
                waveGenerationState: waveCheckpointEngine.getState(),
              },
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
        e2eProfiler?.markStart("stream-initialization");
        const session = await beginWebsiteGenerationSession({
          supabase: auth.supabase,
          userId: auth.user!.id,
          input: {
            prompt: localizedInput.prompt,
            language: aiLanguage,
            theme: localizedInput.theme,
            features: localizedInput.features,
            productId: localizedInput.productId,
            projectId: localizedInput.projectId,
            mode: localizedInput.mode,
            parentGenerationId: localizedInput.parentGenerationId,
            continueInstruction: localizedInput.continueInstruction,
            projectKind,
          },
        });
        if (session.ok) {
          sessionId = session.generation.id;
          const generationProfile = resolveWebsiteGenerationProfile(generationInput);
          send("session", {
            generationId: sessionId,
            incrementalPreview:
              isWebsiteIncrementalPreviewEnabled() ||
              isUltraFastWebsiteGenerationEnabled() ||
              generationProfile === "ultra",
            generationProfile,
            message: "Generation session started — progress is saved as we go.",
          });

          handoffTimer = setTimeout(() => {
            if (handoffSent || !sessionId) return;
            handoffSent = true;
            const maxSec = getWebsiteStreamMaxDurationSec();
            send("handoff", {
              generationId: sessionId,
              reason: "route_budget",
              pollMode: true,
              maxDurationSec: maxSec,
              message:
                "Generation continues — tracking progress via saved checkpoints while the live stream winds down.",
            });
            void waveCheckpointEngine.drain();
            queueCheckpoint("Stream handoff — progress saved for client recovery.");
          }, getStreamHandoffDelayMs());
        } else {
          send("error", {
            message:
              session.error ||
              "Could not start a saved generation session. Apply database migrations and retry.",
          });
          controller.close();
          return;
        }

        e2eProfiler?.markEnd("stream-initialization");

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

        e2eProfiler?.markStart("ai-core");
        let generateAttempts = 0;
        // Retry transient AI / disconnect failures once the session row exists.
        const project = await withRetry(
          () => {
            generateAttempts += 1;
            if (e2eProfiler && generateAttempts > 1) {
              e2eProfiler.recordRetry("generateWebsite", generateAttempts);
            }
            return generateWebsite({
              ...generationInput,
              projectKind,
              ...parentContext,
              userId: auth.user!.id,
              preferredProvider: settings?.default_provider as
                | AIProviderName
                | undefined,
              autoFallback: settings?.auto_fallback ?? true,
              onProgress: (message) => {
                e2eProfiler?.handleProgressMessage(message);
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
                await waveCheckpointEngine.handleFilesCheckpoint(files, meta);
                send("progress", {
                  message: meta.message,
                  generationId: sessionId,
                  fileCount: files.length,
                });
              },
            });
          },
          {
            maxAttempts: 3,
            delaysMs: [2500, 5000, 10000],
            shouldRetry: (error) =>
              isRetryableError(error) || isStreamDisconnectError(error),
          },
        );
        e2eProfiler?.markEnd("ai-core");

        await waveCheckpointEngine.drain();
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

        e2eProfiler?.markStart("supabase-writes");
        const saved = await persistWebsiteGeneration({
          supabase: auth.supabase,
          userId: auth.user!.id,
          project,
          projectKind: project.projectKind ?? projectKind,
          existingGenerationId: sessionId,
          input: {
            prompt: localizedInput.prompt,
            language: aiLanguage,
            theme: localizedInput.theme,
            features: localizedInput.features,
            productId: localizedInput.productId,
            projectId: localizedInput.projectId,
            mode: localizedInput.mode,
            parentGenerationId: localizedInput.parentGenerationId,
            continueInstruction: localizedInput.continueInstruction,
          },
        });
        e2eProfiler?.markEnd("supabase-writes");

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

        e2eProfiler?.markStart("api-response");
        const e2eReport =
          e2eProfiler && pipelineProfiler
            ? e2eProfiler.toReport({
                pipelineReport: pipelineProfiler.toReport(),
                profile: resolveWebsiteGenerationProfile(generationInput),
                promptChars: localizedInput.prompt.length,
              })
            : null;

        const completeDelivered = send("complete", {
          generationId: saved.generation.id,
          summary: {
            title: saved.project.title,
            fileCount: saved.project.files?.length ?? 0,
            projectKind: saved.project.projectKind ?? projectKind,
          },
          message: "Website saved to your workspace.",
          ...(e2eReport
            ? {
                e2ePerformanceReport: e2eReport,
                e2ePerformanceMarkdown: formatE2EMarkdownReport(e2eReport),
              }
            : {}),
        });
        e2eProfiler?.markEnd("api-response");

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
        await waveCheckpointEngine.drain();
        await checkpointQueue;
        const architectureFailure =
          error instanceof ArchitectureValidationFailure
            ? error.toExplainablePayload()
            : null;
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
            architectureValidation: architectureFailure?.code ?? null,
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
        send(
          "error",
          architectureFailure
            ? {
                error: message,
                generationId: sessionId,
                architectureValidation: architectureFailure,
              }
            : { error: message, generationId: sessionId },
        );
      } finally {
        if (handoffTimer) clearTimeout(handoffTimer);
        logger.info("Website Builder stream finally close", WB_STREAM_LOG, {
          runId,
          elapsedMs: Date.now() - startedAt,
          sseClosed: isClosed(),
          sessionId,
        });
        close();
      }
      };

      if (e2eProfileEnabled && pipelineProfiler && e2eProfiler) {
        e2eProfiler.recordDuration(
          "api-route",
          Math.round(performance.now() - apiRouteStartedAt),
        );
        await runWithWebsiteProfiler(pipelineProfiler, () =>
          runWithE2EProfiler(e2eProfiler, runStreamBody),
        );
      } else {
        await runStreamBody();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-WB-Stream-Max-Duration": String(getWebsiteStreamMaxDurationSec()),
      // Hint proxies/CDNs not to buffer SSE
      "X-Accel-Buffering": "no",
    },
  });
}
