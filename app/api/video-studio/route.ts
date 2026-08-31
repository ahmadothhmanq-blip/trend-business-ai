import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { API_ERROR_CODES, apiErrorResponse, apiValidationError } from "@/lib/i18n/api-errors";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { beginAiUsage } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { resolveIteratedPrompt } from "@/lib/ai/iteration";
import { getVideoTypeLabel } from "@/lib/constants/video-studio";
import { resolveRequestLanguage } from "@/lib/i18n/api";
import type { VideoGeneration, VideoBlueprint } from "@/types/video";
import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { VIDEO_WORKFLOWS } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { storyboardGeneratedMessage } from "@/lib/ai-core/video-production-platform/generation-status";
import { persistTransition } from "@/lib/ai-core/video-production-platform/state-machine";
import { loadGenerationDomainRow } from "@/lib/ai-core/video-production-platform/runtime/seed";
import {
  collectDirectorSourceImageUrls,
  ingestDirectorSourceImages,
} from "@/lib/ai-core/video-production-platform/image-to-video";
import { VideoStudioUploadError } from "@/lib/ai-core/video-production-platform/upload-validation";
import {
  applyVideoStudioCreditOutcome,
  directorCreditOutcome,
  videoStudioCreditOperationId,
  type VideoCreditOutcome,
} from "@/lib/ai-core/video-production-platform/runtime/video-credits";
import {
  directorInputFromGenerateRequest,
  projectDirectorBlueprint,
  resolveDirectorWorkflow,
  runDirector,
} from "@/lib/ai-core/video-production-platform/director";
import { assertSafeRemoteFetchUrl, UnsafeRemoteUrlError } from "@/lib/website/url-safety";

const workflowEnum = VIDEO_WORKFLOWS as unknown as [string, ...string[]];

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Describe your video in at least 5 characters."),
  videoType: z.string().trim().min(1, "Select a video type."),
  style: z.string().trim().default("Cinematic"),
  aspectRatio: z.string().trim().default("16:9"),
  duration: z.string().trim().default("10s"),
  mood: z.string().trim().default("Professional"),
  cameraMove: z.string().trim().default("Static"),
  options: z.array(z.string().trim()).default([]),
  sceneCount: z.number().int().min(1).max(24).default(3),
  language: z.string().trim().optional(),
  country: z.string().trim().optional(),
  templateId: z.string().trim().optional(),
  productImageUrl: z.string().url().optional(),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  continueInstruction: z.string().trim().max(4000).optional(),
  projectId: z.string().uuid().optional(),
  workflow: z.enum(workflowEnum).optional(),
  objective: z.string().trim().min(1).optional(),
  audience: z.string().trim().min(1).optional(),
  quality: z.enum(["draft", "standard", "high"]).optional(),
  budget: z.number().positive().optional(),
  brandId: z.string().trim().min(1).optional(),
  productIds: z.array(z.string().trim().min(1)).optional(),
  characterIds: z.array(z.string().trim().min(1)).optional(),
  voicePreference: z.string().trim().min(1).optional(),
  platform: z.string().trim().min(1).optional(),
  callToAction: z.string().trim().min(1).optional(),
  sourceImageUrls: z.array(z.string().url()).max(8).optional(),
  sourceImages: z
    .array(
      z.object({
        filename: z.string().trim().min(1).max(120),
        mimeType: z.string().trim().min(3).max(80),
        base64: z.string().min(8),
      }),
    )
    .max(8)
    .optional(),
});

function logError(stage: string, error: unknown) {
  const msg = error instanceof Error ? (error.stack ?? error.message) : JSON.stringify(error, null, 2);
  console.error(`[video-studio:${stage}]`, msg);
}

export async function GET(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = paginationParams(searchParams);
  const search = searchParams.get("search")?.trim();
  const favorite = searchParams.get("favorite");

  let query = auth.supabase
    .from("video_generations")
    .select("*", { count: "exact" })
    .eq("user_id", auth.user!.id)
    .order("created_at", { ascending: false });

  const orFilter = buildMultiColumnIlikeOrFilter(["video_name", "description", "video_type"], search);
  if (orFilter) query = query.or(orFilter);
  if (favorite === "true") query = query.eq("is_favorite", true);
  if (favorite === "false") query = query.eq("is_favorite", false);

  const { data, error, count } = await query.range(from, to);

  if (error) {
    if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
      return NextResponse.json({ generations: [], page, limit, total: 0, totalPages: 1 });
    }
    return databaseErrorResponse("video-studio.list", error);
  }

  const total = count ?? 0;
  return NextResponse.json({
    generations: data as VideoGeneration[],
    page, limit, total,
    totalPages: Math.ceil(total / limit) || 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return apiValidationError(parsed.error.issues[0]?.message);
  }

  const input = parsed.data;
  const pendingSourceUrls = collectDirectorSourceImageUrls({
    productImageUrl: input.productImageUrl,
    sourceImageUrls: input.sourceImageUrls,
  });
  const pendingUploads = input.sourceImages ?? [];
  if (input.videoType === "image-to-video" && pendingSourceUrls.length + pendingUploads.length < 1) {
    const isNewGenerate = (input.mode ?? "generate") === "generate" && !input.parentGenerationId;
    if (isNewGenerate) {
      return apiValidationError("Image to Video requires at least one source image.");
    }
  }

  for (const url of pendingSourceUrls) {
    try {
      await assertSafeRemoteFetchUrl(url);
    } catch (error) {
      const message =
        error instanceof UnsafeRemoteUrlError ? error.message : "Invalid source image URL.";
      return apiValidationError(message);
    }
  }

  const generationId = randomUUID();
  const creditOperationId = videoStudioCreditOperationId({ kind: "director", projectId: generationId });
  const usage = await beginAiUsage(auth.supabase, auth.user!.id, "video-studio", creditOperationId);
  if (!usage.ok) return usage.response;

  const aiLanguage = resolveRequestLanguage(request, input.language, input.country);
  const typeLabel = getVideoTypeLabel(input.videoType);
  let stage = "director.plan";
  let creditOutcome: VideoCreditOutcome = "failed";

  try {
    const iterated = await resolveIteratedPrompt({
      supabase: auth.supabase,
      table: "video_generations",
      userId: auth.user!.id,
      mode: input.mode,
      prompt: input.prompt,
      continueInstruction: input.continueInstruction,
      parentGenerationId: input.parentGenerationId,
      titleField: "video_name",
    });
    if (!iterated.ok) {
      return apiErrorResponse(API_ERROR_CODES.SERVER_ERROR, iterated.status, iterated.error);
    }

    const startedAt = Date.now();
    const workflow = resolveDirectorWorkflow(input.videoType, input.workflow);
    const placeholderBlueprint: VideoBlueprint = {
      title: `${typeLabel} Video`,
      description: iterated.prompt,
      videoType: input.videoType,
      style: input.style,
      aspectRatio: input.aspectRatio,
      totalDuration: input.duration,
      scenes: [],
      script: "",
      voiceoverScript: "",
      musicSuggestions: [],
      subtitles: [],
      thumbnailSvg: "",
      colorGrade: "",
      exportPreset: "1080p",
      files: [],
      prompt: input.prompt,
      language: aiLanguage,
      generatedAt: new Date().toISOString(),
      progressEvents: ["Director planning..."],
    };

    stage = "supabase.insert.video_generations";
    const domainRow = {
      id: generationId,
      user_id: auth.user!.id,
      video_name: `${typeLabel} Video`,
      video_type: input.videoType,
      description: iterated.prompt,
      style: input.style,
      aspect_ratio: input.aspectRatio,
      duration: input.duration,
      options: input.options,
      prompt: input.prompt,
      blueprint: placeholderBlueprint as unknown as Record<string, unknown>,
      status: "pending",
      domain_state: "draft",
      workflow,
      language: aiLanguage,
      mode: input.mode ?? "generate",
      provider: getActiveProvider(),
      token_usage: null,
      generation_time_ms: null,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase.from("video_generations").insert(domainRow).select("*").single();

    if (error && /domain_state|workflow|column|schema cache/i.test(error.message || "")) {
      return apiErrorResponse(
        API_ERROR_CODES.MIGRATION_REQUIRED,
        503,
        "Video Studio domain columns are missing. Apply video domain migrations before Director planning.",
      );
    }

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return apiErrorResponse(API_ERROR_CODES.MIGRATION_REQUIRED, 503, "Video Studio table not found. Please apply migration 018.");
      }
      logError(stage, error);
      return databaseErrorResponse("video-studio.insert", error);
    }

    const generation = data as VideoGeneration;
    stage = "source-images.ingest";
    let productImageUrls: string[] = pendingSourceUrls;
    if (pendingUploads.length || pendingSourceUrls.length) {
      try {
        productImageUrls = await ingestDirectorSourceImages({
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: generation.id,
          uploads: pendingUploads,
          urls: pendingSourceUrls,
        });
      } catch (error) {
        if (error instanceof VideoStudioUploadError || error instanceof UnsafeRemoteUrlError) {
          return apiValidationError(error.message);
        }
        throw error;
      }
    }
    if (input.videoType === "image-to-video" && productImageUrls.length < 1) {
      const isNewGenerate = (input.mode ?? "generate") === "generate" && !input.parentGenerationId;
      if (isNewGenerate) {
        return apiValidationError("Image to Video requires at least one source image.");
      }
    }

    const directorInput = directorInputFromGenerateRequest({
      ...input,
      prompt: iterated.prompt,
      language: aiLanguage,
      country: input.country,
      projectId: generation.id,
      productImageUrls,
      productImageUrl: productImageUrls[0],
    });

    stage = "director.planning";
    await persistTransition(auth.supabase, { projectId: generation.id, from: "draft", to: "planning" });

    const directed = await runDirector({
      supabase: auth.supabase,
      userId: auth.user!.id,
      projectId: generation.id,
      input: directorInput,
      persistProjectState: true,
    });

    creditOutcome = directorCreditOutcome(directed);
    if (directed.status === "failed" || !directed.plan) {
      const reloaded = await loadGenerationDomainRow(auth.supabase, generation.id, auth.user!.id);
      const status =
        directed.errorCode === "invalid_input" ? 400 : directed.errorCode === "llm_unconfigured" ? 503 : 422;
      return NextResponse.json(
        {
          status: "failed",
          errorCode: directed.errorCode,
          error: directed.errorMessage,
          generation: reloaded || { ...generation, domain_state: "failed", status: "failed" },
          plan: null,
          scenes: [],
          outputKind: "storyboard",
          playableVideo: false,
        },
        { status },
      );
    }

    const blueprint = projectDirectorBlueprint({
      plan: directed.plan,
      input: directorInput,
      videoType: input.videoType,
    });

    stage = "director.persist-projection";
    await auth.supabase
      .from("video_generations")
      .update({
        video_name: directed.plan.title || blueprint.title,
        description: directed.plan.narrative,
        blueprint: blueprint as unknown as Record<string, unknown>,
        active_plan_id: directed.plan.id,
        workflow: directed.plan.workflow,
        language: directed.plan.language,
        generation_time_ms: Date.now() - startedAt,
        updated_at: new Date().toISOString(),
      })
      .eq("id", generation.id)
      .eq("user_id", auth.user!.id);

    if (!directed.reused) {
      await persistTransition(auth.supabase, { projectId: generation.id, from: "planning", to: "storyboard_ready" });
    }

    const reloaded = await loadGenerationDomainRow(auth.supabase, generation.id, auth.user!.id);
    return NextResponse.json({
      generation: reloaded || generation,
      plan: directed.plan,
      scenes: directed.plan.scenes,
      outputKind: "storyboard",
      playableVideo: false,
      message: storyboardGeneratedMessage(),
    });
  } catch (error) {
    creditOutcome = "failed";
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate video project.");
  } finally {
    await applyVideoStudioCreditOutcome({
      supabase: auth.supabase,
      userId: auth.user!.id,
      operationId: creditOperationId,
      outcome: creditOutcome,
    });
  }
}

