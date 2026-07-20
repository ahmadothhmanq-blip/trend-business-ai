import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { generateVideo } from "@/lib/video-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  planBatchVideos,
  batchItemToPluginInput,
  createBatchProgress,
  runFullRenderPipeline,
  withProductionModel,
} from "@/lib/ai-core/video-production-platform";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const batchSchema = z.object({
  prompt: z.string().trim().min(5),
  count: z.number().int().min(1).max(50).default(5),
  durationSec: z.number().int().min(5).max(600).default(30),
  language: z.string().default("English"),
  style: z.string().default("Cinematic"),
  platform: z.string().default("TikTok"),
  videoType: z.string().optional(),
  planOnly: z.boolean().optional().default(false),
  generateLimit: z.number().int().min(1).max(10).optional().default(5),
  fullRender: z.boolean().optional().default(false),
});

/**
 * POST — plan (and optionally generate) a batch of videos.
 * Credits: 1 per generated item (via enforceAiUsage per call — we charge once per request + note).
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const rateLimited = await enforceAiUsage(
    auth.supabase,
    auth.user!.id,
    "video-studio",
  );
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = batchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid batch request" },
      { status: 400 },
    );
  }

  const req = parsed.data;
  const planned = planBatchVideos(req);
  let progress = createBatchProgress(
    planned.batchId,
    planned.items,
    planned.estimatedCredits,
  );

  if (req.planOnly) {
    return NextResponse.json({
      batchId: planned.batchId,
      items: planned.items,
      estimatedCredits: planned.estimatedCredits,
      progress,
      message: `Planned ${planned.items.length} videos (~${planned.estimatedCredits} credits).`,
    });
  }

  const toGenerate = planned.items.slice(0, req.generateLimit);
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
            status: "completed",
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
          const { data: updated } = await auth.supabase
            .from("video_generations")
            .update({ blueprint: nextBp })
            .eq("id", generation.id)
            .select("*")
            .single();
          if (updated) generation = updated as VideoGeneration;
        }

        generations.push(generation);
        progress = {
          ...progress,
          completed: progress.completed + 1,
          spentCredits: progress.spentCredits + 1,
          items: progress.items.map((p) =>
            p.index === item.index
              ? { ...p, status: "completed", generationId: generation.id }
              : p,
          ),
        };
      } catch (itemError) {
        progress = {
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
        };
      }
    }

    return NextResponse.json({
      batchId: planned.batchId,
      planned: planned.items,
      generated: generations,
      progress,
      estimatedCredits: planned.estimatedCredits,
      message: `Generated ${generations.length} of ${planned.items.length} planned videos (limit ${req.generateLimit}).`,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.batch",
      error,
      "Batch video generation failed.",
    );
  }
}
