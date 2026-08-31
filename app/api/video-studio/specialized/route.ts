import { NextResponse } from "next/server";
import { API_ERROR_CODES, apiErrorResponse, apiNotFoundError, apiValidationError } from "@/lib/i18n/api-errors";
import { z } from "zod";
import { requireUser, parseJsonBody } from "@/lib/api/helpers";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { serverErrorResponse } from "@/lib/api/errors";
import { generateVideo } from "@/lib/video-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import {
  buildProductPresenterBrief,
  buildEducationalVideoBrief,
  applyBrandToVideoModel,
  runFullRenderPipeline,
  withProductionModel,
  attachSourceImageToModel,
  ProviderNotConfiguredError,
} from "@/lib/ai-core/video-production-platform";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";
import {
  generationStatusAfterStoryboard,
  generationStatusAfterRenderJob,
  storyboardGeneratedMessage,
  videoRenderedMessage,
} from "@/lib/ai-core/video-production-platform/generation-status";
import { assertSafeRemoteFetchUrl, UnsafeRemoteUrlError } from "@/lib/website/url-safety";
import { resolveRequestLanguage } from "@/lib/i18n/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

const productSchema = z.object({
  mode: z.literal("product"),
  productName: z.string().trim().min(1),
  productDescription: z.string().trim().min(5),
  productImageUrl: z.string().url(),
  category: z
    .enum(["clothing", "electronics", "cars", "beauty", "food", "other"])
    .optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  duration: z.string().optional(),
  brandName: z.string().optional(),
  brandPrimary: z.string().optional(),
  /** Run full TTS + provider render after package creation */
  fullRender: z.boolean().optional().default(false),
  useAvatar: z.boolean().optional().default(true),
});

const eduSchema = z.object({
  mode: z.literal("educational"),
  topic: z.string().trim().min(2),
  content: z.string().trim().min(20),
  sourceKind: z.enum(["text", "pdf", "document"]).optional(),
  language: z.string().optional(),
  country: z.string().optional(),
  duration: z.string().optional(),
  audience: z.string().optional(),
  fullRender: z.boolean().optional().default(false),
});

const schema = z.discriminatedUnion("mode", [productSchema, eduSchema]);

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
  if (body instanceof NextResponse) return body;

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }
  const aiLanguage = resolveRequestLanguage(request, parsed.data.language, parsed.data.country);

  try {
    if (parsed.data.mode === "product") {
      try {
        await assertSafeRemoteFetchUrl(parsed.data.productImageUrl);
      } catch (error) {
        const message =
          error instanceof UnsafeRemoteUrlError
            ? error.message
            : "Invalid product image URL.";
        return apiValidationError(message);
      }
    }
    const input =
      parsed.data.mode === "product"
        ? buildProductPresenterBrief({
            productName: parsed.data.productName,
            productDescription: parsed.data.productDescription,
            productImageUrl: parsed.data.productImageUrl,
            category: parsed.data.category,
            language: aiLanguage,
            duration: parsed.data.duration,
            brand: parsed.data.brandName
              ? {
                  businessName: parsed.data.brandName,
                  primary: parsed.data.brandPrimary,
                }
              : undefined,
          }).pluginInput
        : buildEducationalVideoBrief({
            topic: parsed.data.topic,
            content: parsed.data.content,
            sourceKind: parsed.data.sourceKind,
            language: aiLanguage,
            duration: parsed.data.duration,
            audience: parsed.data.audience,
          }).pluginInput;

    const result = await generateVideo(input);

    let productionModel = result.productionModel;
    if (parsed.data.mode === "product") {
      if (productionModel && parsed.data.brandName) {
        productionModel = applyBrandToVideoModel(productionModel, {
          businessName: parsed.data.brandName,
          primary: parsed.data.brandPrimary,
        });
      }
      if (productionModel) {
        productionModel = attachSourceImageToModel(
          {
            ...productionModel,
            productImageUrl: parsed.data.productImageUrl,
          },
          parsed.data.productImageUrl,
        );
      }
    } else if (productionModel) {
      productionModel = {
        ...productionModel,
        educationalSource: {
          kind: parsed.data.sourceKind || "text",
          summary: parsed.data.content.slice(0, 280),
        },
      };
    }

    const blueprint: VideoBlueprint = {
      title: result.title,
      description: result.description,
      videoType: result.videoType,
      style: result.style,
      aspectRatio: input.aspectRatio,
      totalDuration: input.duration,
      scenes: result.scenes,
      script: result.script,
      voiceoverScript: result.voiceoverScript,
      musicSuggestions: result.musicSuggestions,
      subtitles: result.subtitles,
      thumbnailSvg: result.thumbnailSvg,
      colorGrade: result.colorGrade,
      exportPreset: "1080p",
      files: result.files,
      prompt: input.prompt,
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
        video_type: input.videoType,
        description: blueprint.description,
        style: input.style,
        aspect_ratio: input.aspectRatio,
        duration: input.duration,
        options: input.options,
        prompt: input.prompt,
        blueprint,
        status: generationStatusAfterStoryboard(),
        mode: "generate",
        provider: result.provider ?? getActiveProvider(),
        token_usage: result.usage,
        generation_time_ms: result.generationTimeMs,
      })
      .select("*")
      .single();

    if (error || !data) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, 500, error?.message || "Failed to save generation");
    }

    let generation = data as VideoGeneration;
    let job = null as Awaited<
      ReturnType<typeof runFullRenderPipeline>
    >["job"] | null;

    if (parsed.data.fullRender && productionModel) {
      try {
        const rendered = await runFullRenderPipeline({
          model: productionModel,
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: generation.id,
          mode: parsed.data.mode === "product" ? "full" : "full",
          sourceImageUrl:
            parsed.data.mode === "product"
              ? parsed.data.productImageUrl
              : undefined,
          useAvatar:
            parsed.data.mode === "product" ? parsed.data.useAvatar : false,
        });
        productionModel = rendered.model;
        job = rendered.job;
        const nextBp = withProductionModel(
          blueprint,
          productionModel,
          result.versionHistory,
        ) as VideoBlueprint;
        const nextStatus = generationStatusAfterRenderJob({
          mode: job.mode,
          status: job.status,
          provider: job.provider,
          composite: job.compositeAsset,
          clips: (job.clips || []).map((c) => ({
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
        job = null;
      }
    }

    const playableVideo = generation.status === "video_rendered";
    await creditLease.settle(auth.supabase);
    return NextResponse.json({
      generation,
      job,
      outputKind: playableVideo ? "video" : "storyboard",
      playableVideo,
      message: playableVideo
        ? videoRenderedMessage()
        : parsed.data.fullRender && !job
          ? `${storyboardGeneratedMessage()} Full render blocked: video provider is not configured.`
          : job && job.status === "failed"
            ? `Storyboard saved. Render failed: ${job.message}`
            : storyboardGeneratedMessage(),
      mode: parsed.data.mode,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.specialized",
      error,
      "Unable to generate specialized video.",
    );
  }
}
