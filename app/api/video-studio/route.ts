import { requireUser, parseJsonBody, paginationParams } from "@/lib/api/helpers";
import { databaseErrorResponse, serverErrorResponse } from "@/lib/api/errors";
import { enforceAiRateLimit } from "@/lib/api/rate-limit";
import { buildMultiColumnIlikeOrFilter } from "@/lib/api/search-filters";
import { generateVideo } from "@/lib/video-generator";
import { getActiveProvider } from "@/lib/ai/provider-config";
import { getVideoTypeLabel } from "@/lib/constants/video-studio";
import type { VideoGeneration, VideoBlueprint } from "@/types/video";
import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  prompt: z.string().trim().min(5, "Describe your video in at least 5 characters."),
  videoType: z.string().trim().min(1, "Select a video type."),
  style: z.string().trim().default("Cinematic"),
  aspectRatio: z.string().trim().default("16:9"),
  duration: z.string().trim().default("10s"),
  mood: z.string().trim().default("Professional"),
  cameraMove: z.string().trim().default("Static"),
  options: z.array(z.string().trim()).default([]),
  sceneCount: z.number().int().min(1).max(8).default(3),
  mode: z.enum(["generate", "regenerate", "continue", "retry"]).optional(),
  parentGenerationId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
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

  const rateLimited = await enforceAiRateLimit(auth.user!.id, "video-studio");
  if (rateLimited) return rateLimited;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const input = parsed.data;
  const typeLabel = getVideoTypeLabel(input.videoType);
  let stage = "generateVideo";

  try {
    const result = await generateVideo({
      prompt: input.prompt,
      videoType: input.videoType,
      style: input.style,
      aspectRatio: input.aspectRatio,
      duration: input.duration,
      mood: input.mood,
      cameraMove: input.cameraMove,
      options: input.options,
      sceneCount: input.sceneCount,
    });

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
      progressEvents: [...result.progressEvents, "Saving...", "Done."],
    };

    stage = "supabase.insert.video_generations";

    const row = {
      user_id: auth.user!.id,
      video_name: result.title || `${typeLabel} Video`,
      video_type: input.videoType,
      description: result.description || input.prompt,
      style: input.style,
      aspect_ratio: input.aspectRatio,
      duration: input.duration,
      options: input.options,
      prompt: input.prompt,
      blueprint: blueprint as unknown as Record<string, unknown>,
      status: "completed",
      mode: input.mode ?? "generate",
      provider: result.provider ?? getActiveProvider(),
      token_usage: result.usage,
      generation_time_ms: result.generationTimeMs,
      parent_generation_id: input.parentGenerationId ?? null,
      project_id: input.projectId ?? null,
    };

    const { data, error } = await auth.supabase.from("video_generations").insert(row).select("*").single();

    if (error) {
      if (error.code === "42P01" || (typeof error.message === "string" && error.message.includes("relation"))) {
        return NextResponse.json({ error: "Video Studio table not found. Please apply migration 018." }, { status: 503 });
      }
      logError(stage, error);
      return databaseErrorResponse("video-studio.insert", error);
    }

    return NextResponse.json({ generation: data as VideoGeneration, message: "Video project generated and saved." });
  } catch (error) {
    logError(stage, error);
    return serverErrorResponse(stage, error, "Unable to generate video project.");
  }
}
