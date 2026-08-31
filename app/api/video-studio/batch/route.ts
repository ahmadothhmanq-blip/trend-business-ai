import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { z } from "zod";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { generateVideo } from "@/lib/video-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  planBatchVideos,
  batchItemToPluginInput,
  createBatchProgress,
  updateBatchProgressPercent,
  runFullRenderPipeline,
  withProductionModel,
  resolveBatchCreditLeaseAction,
  BATCH_PLAN_MAX,
  BATCH_GENERATE_MAX,
  ProviderNotConfiguredError,
} from "@/lib/ai-core/video-production-platform";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";
import { generationStatusAfterRenderJob } from "@/lib/ai-core/video-production-platform/generation-status";
import { resolveRequestLanguage } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const batchSchema = z.object({
  prompt: z.string().trim().min(5),
  count: z.number().int().min(1).max(BATCH_PLAN_MAX).default(5),
  durationSec: z.number().int().min(5).max(600).default(30),
  language: z.string().optional(),
  country: z.string().optional(),
  style: z.string().default("Cinematic"),
  platform: z.string().default("TikTok"),
  videoType: z.string().optional(),
  planOnly: z.boolean().optional().default(false),
  generateLimit: z
    .number()
    .int()
    .min(1)
    .max(BATCH_GENERATE_MAX)
    .optional()
    .default(5),
  fullRender: z.boolean().optional().default(false),
  varyTalent: z.boolean().optional().default(true),
  /** Skip first N planned items (for chunked 50/100 generation) */
  offset: z.number().int().min(0).max(BATCH_PLAN_MAX).optional().default(0),
});

/**
 * POST — plan (and optionally generate) a batch of videos.
 * Credits: settle-after-success for this request lease (1 credit) when at least one
 * item is successfully generated. planOnly does not charge. Failures release (no-op
 * if never settled). Chunked retries are separate requests with their own leases.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const usage = await beginAiUsage(
    auth.supabase,
    auth.user!.id,
    "video-studio",
  );
  if (!usage.ok) return usage.response;
  const creditLease = usage.lease;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) {
    await creditLease.release(auth.supabase);
    return body;
  }

  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    await creditLease.release(auth.supabase);
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const req = {
    ...parsed.data,
    language: resolveRequestLanguage(request, parsed.data.language, parsed.data.country),
  };
  const planned = planBatchVideos(req);
  let progress = createBatchProgress(
    planned.batchId,
    planned.items,
    planned.estimatedCredits,
  );

  if (req.planOnly) {
    // planOnly never settles (see resolveBatchCreditLeaseAction)
    await creditLease.release(auth.supabase);
    return NextResponse.json({
      batchId: planned.batchId,
      items: planned.items,
      estimatedCredits: planned.estimatedCredits,
      variation: planned.variation,
      progress,
      message: `Planned ${planned.items.length} videos (~${planned.estimatedCredits} credits).`,
    });
  }

  const toGenerate = planned.items.slice(
    req.offset,
    req.offset + req.generateLimit,
  );
  const generations: VideoGeneration[] = [];

  try {
    for (const item of toGenerate) {
      progress = {
        ...progress,
        items: progress.items.map((p) =>
          p.index === item.index ? { ...p, status: "generating" } : p,
        ),
        pending: Math.max(0, progress.pending - 1),
      };

      try {
        const pluginInput = batchItemToPluginInput(req, item);
        const result = await generateVideo(pluginInput);
        let productionModel: VideoProductionModel | undefined = result.productionModel
          ? {
              ...result.productionModel,
              batchMeta: {
                batchId: planned.batchId,
                index: item.index,
                total: planned.items.length,
              },
            }
          : undefined;

        const blueprint: VideoBlueprint = {
          title: result.title || item.title,
          description: result.description,
          videoType: result.videoType,
          style: result.style,
          aspectRatio: pluginInput.aspectRatio,
          totalDuration: pluginInput.duration,
          scenes: result.scenes,
          script: result.script,
          voiceoverScript: result.voiceoverScript,
          musicSuggestions: result.musicSuggestions,
          subtitles: result.subtitles,
          thumbnailSvg: result.thumbnailSvg,
          colorGrade: result.colorGrade,
          exportPreset: "1080p",
          files: result.files,
          prompt: pluginInput.prompt,
          generatedAt: new Date().toISOString(),
          progressEvents: result.progressEvents,
          productionModel,
          versionHistory: result.versionHistory,
        };

        const { data, error } = await auth.supabase
          .from("video_generations")
          .insert({
            user_id: auth.user!.id,
            video_name: blueprint.title,
            video_type: pluginInput.videoType,
            description: blueprint.description || item.idea,
            style: pluginInput.style,
            aspect_ratio: pluginInput.aspectRatio,
            duration: pluginInput.duration,
            options: pluginInput.options,
            prompt: pluginInput.prompt,
            blueprint,
            status: "storyboard_ready",
            mode: "generate",
            provider: result.provider ?? getActiveProvider(),
            token_usage: result.usage,
            generation_time_ms: result.generationTimeMs,
          })
          .select("*")
          .single();

        if (error || !data) {
          progress = {
            ...progress,
            failed: progress.failed + 1,
            items: progress.items.map((p) =>
              p.index === item.index
                ? { ...p, status: "failed", error: error?.message || "insert failed" }
                : p,
            ),
          };
          continue;
        }

        let generation = data as VideoGeneration;

        if (req.fullRender && productionModel) {
          try {
            const rendered = await runFullRenderPipeline({
              model: productionModel,
              supabase: auth.supabase,
              userId: auth.user!.id,
              generationId: generation.id,
              mode: "batch-item",
            });
            productionModel = rendered.model;
            const nextBp = withProductionModel(
              blueprint,
              productionModel,
              result.versionHistory,
            ) as VideoBlueprint;
            const nextStatus = generationStatusAfterRenderJob({
              mode: rendered.job.mode,
              status: rendered.job.status,
              provider: rendered.job.provider,
              composite: rendered.job.compositeAsset,
              clips: (rendered.job.clips || []).map((c) => ({
                mimeType: c.asset?.mimeType,
                url: c.asset?.url,
                isStub: c.asset?.provider === "preview",
                durationSec: c.asset?.durationSec,
              })),
            });
            const { data: updated } = await auth.supabase
              .from("video_generations")
              .update({
                blueprint: nextBp,
                status: nextStatus,
                updated_at: new Date().toISOString(),
              })
              .eq("id", generation.id)
              .select("*")
              .single();
            if (updated) generation = updated as VideoGeneration;
          } catch (renderError) {
            if (!(renderError instanceof ProviderNotConfiguredError)) {
              throw renderError;
            }
          }
        }

        generations.push(generation);
        progress = updateBatchProgressPercent({
          ...progress,
          completed: progress.completed + 1,
          spentCredits: progress.spentCredits + 1,
          items: progress.items.map((p) =>
            p.index === item.index
              ? { ...p, status: "completed", generationId: generation.id }
              : p,
          ),
        });
      } catch (itemError) {
        progress = updateBatchProgressPercent({
          ...progress,
          failed: progress.failed + 1,
          items: progress.items.map((p) =>
            p.index === item.index
              ? {
                  ...p,
                  status: "failed",
                  error:
                    itemError instanceof Error
                      ? itemError.message
                      : "generation failed",
                }
              : p,
          ),
        });
      }
    }

    if (resolveBatchCreditLeaseAction({
      planOnly: false,
      successfulGenerations: generations.length,
    }) === "settle") {
      await creditLease.settle(auth.supabase);
    } else {
      await creditLease.release(auth.supabase);
    }

    return NextResponse.json({
      batchId: planned.batchId,
      planned: planned.items,
      generated: generations,
      progress: updateBatchProgressPercent(progress),
      variation: planned.variation,
      estimatedCredits: planned.estimatedCredits,
      message: `Generated ${generations.length} of ${planned.items.length} planned videos (offset ${req.offset}, limit ${req.generateLimit}).`,
      nextOffset:
        req.offset + generations.length < planned.items.length
          ? req.offset + req.generateLimit
          : null,
    });
  } catch (error) {
    await creditLease.release(auth.supabase);
    return serverErrorResponse(
      "video-studio.batch",
      error,
      "Batch video generation failed.",
    );
  }
}
