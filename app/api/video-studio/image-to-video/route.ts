import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { enforceAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { generateVideo } from "@/lib/video-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  buildImageToVideoBrief,
  attachSourceImageToModel,
  runFullRenderPipeline,
  withProductionModel,
} from "@/lib/ai-core/video-production-platform";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const schema = z.object({
  imageUrl: z.string().url(),
  prompt: z.string().trim().min(5),
  motion: z.string().optional(),
  cameraMove: z.string().optional(),
  duration: z.string().optional(),
  aspectRatio: z.string().optional(),
  kind: z.enum(["product", "person", "scene"]).optional(),
  intensity: z.enum(["subtle", "medium", "dynamic"]).optional(),
  render: z.boolean().optional().default(true),
  providerId: z.enum(["preview", "kling", "runway", "heygen", "external"]).optional(),
});

/**
 * POST — Image to Video: upload URL → concept package → optional real render.
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

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  try {
    const brief = buildImageToVideoBrief(parsed.data);
    const result = await generateVideo(brief.pluginInput);

    let productionModel = result.productionModel
      ? attachSourceImageToModel(
          result.productionModel,
          parsed.data.imageUrl,
          parsed.data.kind,
        )
      : undefined;

    const blueprint: VideoBlueprint = {
      title: result.title,
      description: result.description,
      videoType: "image-to-video",
      style: result.style,
      aspectRatio: brief.pluginInput.aspectRatio,
      totalDuration: brief.pluginInput.duration,
      scenes: result.scenes,
      script: result.script,
      voiceoverScript: result.voiceoverScript,
      musicSuggestions: result.musicSuggestions,
      subtitles: result.subtitles,
      thumbnailSvg: result.thumbnailSvg,
      colorGrade: result.colorGrade,
      exportPreset: "1080p",
      files: result.files,
      prompt: brief.pluginInput.prompt,
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
        video_type: "image-to-video",
        description: blueprint.description,
        style: brief.pluginInput.style,
        aspect_ratio: brief.pluginInput.aspectRatio,
        duration: brief.pluginInput.duration,
        options: brief.pluginInput.options,
        prompt: brief.pluginInput.prompt,
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
      return NextResponse.json(
        { error: error?.message || "Insert failed" },
        { status: 500 },
      );
    }

    let generation = data as VideoGeneration;
    let job = null;

    if (parsed.data.render && productionModel) {
      const rendered = await runFullRenderPipeline({
        model: productionModel,
        supabase: auth.supabase,
        userId: auth.user!.id,
        generationId: generation.id,
        mode: "image-to-video",
        providerId: parsed.data.providerId,
        sourceImageUrl: parsed.data.imageUrl,
      });
      productionModel = rendered.model;
      job = rendered.job;
      const nextBlueprint = withProductionModel(
        blueprint,
        productionModel,
        result.versionHistory,
      ) as VideoBlueprint;
      const { data: updated } = await auth.supabase
        .from("video_generations")
        .update({ blueprint: nextBlueprint, updated_at: new Date().toISOString() })
        .eq("id", generation.id)
        .eq("user_id", auth.user!.id)
        .select("*")
        .single();
      if (updated) generation = updated as VideoGeneration;
    }

    return NextResponse.json({
      generation,
      job,
      message: job
        ? `Image-to-video created and rendered (${job.status}).`
        : "Image-to-video package created.",
      templateId: brief.templateId,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.image-to-video",
      error,
      "Unable to create image-to-video.",
    );
  }
}
