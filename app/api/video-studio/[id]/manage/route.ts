import { NextResponse } from "next/server";
import { requireUser, parseUuidParam, parseJsonBody } from "@/lib/api/helpers";
import { serverErrorResponse } from "@/lib/api/errors";
import type { VideoGeneration, VideoBlueprint } from "@/types/video";
import {
  extractProductionModel,
  extractVideoVersionHistory,
  withProductionModel,
  runVideoQualityChecks,
  startAndProcessRender,
  synthesizeVoicePreview,
  applyBrandToVideoModel,
  editorReorder,
  editorUpdateScript,
  editorChangePresenter,
  editorChangeVoiceStyle,
  editorTrimScene,
  editorReplaceSceneVisual,
  editorUpdateSubtitles,
  editorReplaceMusic,
  timelineSummary,
  assemblyPlan,
  saveVideoVersion,
  restoreVideoVersion,
  getLatestJob,
  jobStatusSummary,
  rebuildSubtitlesFromScenes,
  runFullRenderPipeline,
  synthesizeSpeech,
  uploadVideoStudioMedia,
  buildSocialExportPackage,
  requestAvatarPresenterClip,
  applyAvatarProfileToModel,
  listVideoProviders,
  resumeRenderJob,
  retryFailedClips,
  buildVisualTimeline,
  editorNudgeScene,
  persistSocialExportAssets,
  reencodeForSocialPreset,
  fetchRemoteToBytes,
  trimClipWithFfmpeg,
  probeFfmpegHealth,
} from "@/lib/ai-core/video-production-platform";
import { z } from "zod";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";
export const maxDuration = 300;

type Params = { params: Promise<{ id: string }> };

async function loadGeneration(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  id: string,
) {
  const { data, error } = await supabase
    .from("video_generations")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as VideoGeneration | null;
}

async function persist(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  id: string,
  blueprint: VideoBlueprint,
  extra?: { video_name?: string },
) {
  const { data, error } = await supabase
    .from("video_generations")
    .update({
      blueprint,
      ...(extra?.video_name ? { video_name: extra.video_name } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
  if (error) throw error;
  return data as VideoGeneration;
}

export async function GET(_request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  try {
    const generation = await loadGeneration(
      auth.supabase,
      auth.user!.id,
      parsedId.id,
    );
    if (!generation) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    const model = extractProductionModel(generation.blueprint, {
      prompt: generation.prompt,
      style: generation.style,
      aspectRatio: generation.aspect_ratio,
      duration: generation.duration,
      videoType: generation.video_type,
    });
    const history = extractVideoVersionHistory(generation.blueprint);
    const job = getLatestJob(model);

    return NextResponse.json({
      generation,
      model,
      history,
      quality: runVideoQualityChecks(model),
      timeline: timelineSummary(model),
      visualTimeline: buildVisualTimeline(model),
      assembly: assemblyPlan(model),
      latestJob: job ? jobStatusSummary(job) : null,
      job,
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.manage.get",
      error,
      "Unable to load video management data.",
    );
  }
}

const manageSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("render"),
    mode: z.enum(["preview", "full", "avatar", "image-to-video"]).default("preview"),
    providerId: z.enum(["preview", "kling", "runway", "heygen", "external"]).optional(),
    sourceImageUrl: z.string().url().optional(),
    useAvatar: z.boolean().optional(),
  }),
  z.object({ action: z.literal("synthesize_voice"), real: z.boolean().optional() }),
  z.object({ action: z.literal("rebuild_subtitles") }),
  z.object({
    action: z.literal("apply_brand"),
    businessName: z.string().trim().min(1),
    primary: z.string().optional(),
    secondary: z.string().optional(),
    accent: z.string().optional(),
    logoUrl: z.string().nullable().optional(),
    headingFont: z.string().optional(),
    bodyFont: z.string().optional(),
    brandIdentityId: z.string().nullable().optional(),
  }),
  z.object({
    action: z.literal("reorder_scenes"),
    sceneIds: z.array(z.string()).min(1),
  }),
  z.object({
    action: z.literal("update_script"),
    sceneId: z.string().min(1),
    script: z.string(),
  }),
  z.object({
    action: z.literal("trim_scene"),
    sceneId: z.string().min(1),
    durationSec: z.number().min(1).max(600),
  }),
  z.object({
    action: z.literal("replace_visual"),
    sceneId: z.string().min(1),
    visualPrompt: z.string().min(3),
  }),
  z.object({
    action: z.literal("update_subtitles"),
    subtitles: z.array(
      z.object({
        timestamp: z.string(),
        text: z.string(),
        startSec: z.number().optional(),
        endSec: z.number().optional(),
      }),
    ),
  }),
  z.object({
    action: z.literal("replace_music"),
    name: z.string().min(1),
    genre: z.string().optional(),
    mood: z.string().optional(),
    bpm: z.string().optional(),
  }),
  z.object({
    action: z.literal("change_presenter"),
    personaId: z.enum([
      "fitness-trainer",
      "doctor",
      "teacher",
      "business-expert",
      "news-presenter",
      "sales-representative",
      "fashion-model",
      "chef",
      "automotive-expert",
      "real-estate-agent",
      "custom",
    ]),
  }),
  z.object({
    action: z.literal("generate_avatar"),
    personaId: z.enum([
      "fitness-trainer",
      "doctor",
      "teacher",
      "business-expert",
      "news-presenter",
      "sales-representative",
      "fashion-model",
      "chef",
      "automotive-expert",
      "real-estate-agent",
      "custom",
    ]),
    script: z.string().min(5).optional(),
    emotion: z.string().optional(),
  }),
  z.object({
    action: z.literal("change_voice"),
    style: z.string().min(1),
  }),
  z.object({
    action: z.literal("export_social"),
    presetId: z.enum([
      "tiktok",
      "instagram-reels",
      "youtube-shorts",
      "youtube",
      "linkedin",
    ]),
    persistAssets: z.boolean().optional().default(true),
    reencode: z.boolean().optional().default(true),
  }),
  z.object({ action: z.literal("platform_health") }),
  z.object({ action: z.literal("resume_render") }),
  z.object({
    action: z.literal("retry_clips"),
    useAvatar: z.boolean().optional(),
  }),
  z.object({
    action: z.literal("nudge_scene"),
    sceneId: z.string().min(1),
    direction: z.enum(["left", "right"]),
  }),
  z.object({
    action: z.literal("save_version"),
    note: z.string().trim().max(200).optional(),
  }),
  z.object({
    action: z.literal("restore_version"),
    versionId: z.string().min(1),
  }),
]);

export async function POST(request: Request, { params }: Params) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  const { id: rawId } = await params;
  const parsedId = parseUuidParam(rawId, "generation id");
  if (parsedId instanceof NextResponse) return parsedId;

  const body = await parseJsonBody<unknown>(request);
  if (body instanceof NextResponse) return body;

  const parsed = manageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid action" },
      { status: 400 },
    );
  }

  try {
    const generation = await loadGeneration(
      auth.supabase,
      auth.user!.id,
      parsedId.id,
    );
    if (!generation) {
      return NextResponse.json({ error: "Video not found." }, { status: 404 });
    }

    let model = extractProductionModel(generation.blueprint, {
      prompt: generation.prompt,
      style: generation.style,
      aspectRatio: generation.aspect_ratio,
      duration: generation.duration,
      videoType: generation.video_type,
    });
    let history = extractVideoVersionHistory(generation.blueprint);
    const action = parsed.data;
    let message = "Updated.";
    let job = getLatestJob(model);
    let socialExport = undefined as ReturnType<typeof buildSocialExportPackage> | undefined;
    let avatarResult = undefined as Awaited<ReturnType<typeof requestAvatarPresenterClip>> | undefined;
    let platformHealth = undefined as Awaited<ReturnType<typeof probeFfmpegHealth>> | undefined;

    switch (action.action) {
      case "render": {
        if (action.mode === "preview") {
          const result = startAndProcessRender(model, "preview");
          model = result.model;
          job = result.job;
          message = result.job.message;
        } else {
          const result = await runFullRenderPipeline({
            model,
            supabase: auth.supabase,
            userId: auth.user!.id,
            generationId: parsedId.id,
            mode: action.mode,
            providerId: action.providerId,
            sourceImageUrl: action.sourceImageUrl,
            useAvatar: action.useAvatar || action.mode === "avatar",
          });
          model = result.model;
          job = result.job;
          message = result.job.message;
        }
        break;
      }
      case "synthesize_voice": {
        if (action.real) {
          const script =
            model.voiceTracks[0]?.script ||
            model.scenes.map((s) => s.script).join("\n");
          const tts = await synthesizeSpeech({
            text: script,
            voiceId: model.presenter?.voiceId,
            language: model.language,
            style: model.presenter?.voiceStyle,
          });
          if (tts.bytes) {
            const uploaded = await uploadVideoStudioMedia({
              supabase: auth.supabase,
              userId: auth.user!.id,
              generationId: parsedId.id,
              kind: "audio",
              bytes: tts.bytes,
              mimeType: tts.mimeType,
              filename: `voice.${tts.mimeType.includes("mpeg") ? "mp3" : "wav"}`,
              durationSec: tts.durationSecEstimate,
              provider: tts.provider,
            });
            model = {
              ...model,
              voiceTracks: model.voiceTracks.map((v, i) =>
                i === 0
                  ? { ...v, status: "completed", asset: uploaded.asset }
                  : v,
              ),
              assets: [...model.assets, uploaded.asset],
              version: model.version + 1,
              updatedAt: new Date().toISOString(),
            };
            message = tts.message;
          } else {
            model = synthesizeVoicePreview(model);
            message = "TTS produced no bytes; used preview.";
          }
        } else {
          model = synthesizeVoicePreview(model);
          message = "Voice/audio tracks synthesized (preview).";
        }
        break;
      }
      case "rebuild_subtitles":
        model = rebuildSubtitlesFromScenes(model);
        message = "Subtitles rebuilt from scenes.";
        break;
      case "apply_brand":
        model = applyBrandToVideoModel(model, action);
        message = "Brand applied to video model.";
        break;
      case "reorder_scenes":
        model = editorReorder(model, action.sceneIds);
        message = "Timeline reordered.";
        break;
      case "update_script":
        model = editorUpdateScript(model, action.sceneId, action.script);
        message = "Scene script updated.";
        break;
      case "trim_scene": {
        model = editorTrimScene(model, action.sceneId, action.durationSec);
        const latest = getLatestJob(model);
        const clip = latest?.clips.find((c) => c.sceneId === action.sceneId);
        if (clip?.asset?.url) {
          const trimmed = await trimClipWithFfmpeg(
            clip.asset.url,
            action.durationSec,
          );
          if (trimmed) {
            const uploaded = await uploadVideoStudioMedia({
              supabase: auth.supabase,
              userId: auth.user!.id,
              generationId: parsedId.id,
              kind: "clip",
              bytes: trimmed,
              mimeType: "video/mp4",
              filename: `trim-${action.sceneId}.mp4`,
              durationSec: action.durationSec,
              provider: "ffmpeg-trim",
              meta: { sceneId: action.sceneId, trimmed: true },
            });
            model = {
              ...model,
              assets: [...model.assets, uploaded.asset],
              jobs: model.jobs.map((j) =>
                j.id === latest?.id
                  ? {
                      ...j,
                      clips: j.clips.map((c) =>
                        c.sceneId === action.sceneId
                          ? { ...c, asset: uploaded.asset }
                          : c,
                      ),
                    }
                  : j,
              ),
            };
            message = "Scene trimmed (duration + media).";
          } else {
            message = "Scene duration trimmed (ffmpeg trim unavailable).";
          }
        } else {
          message = "Scene trimmed.";
        }
        break;
      }
      case "replace_visual":
        model = editorReplaceSceneVisual(
          model,
          action.sceneId,
          action.visualPrompt,
        );
        message = "Scene visual replaced.";
        break;
      case "update_subtitles":
        model = editorUpdateSubtitles(model, action.subtitles);
        message = "Subtitles updated.";
        break;
      case "replace_music":
        model = editorReplaceMusic(model, action);
        message = "Music bed updated.";
        break;
      case "change_presenter":
        model = editorChangePresenter(model, action.personaId);
        message = "Presenter updated.";
        break;
      case "generate_avatar": {
        avatarResult = await requestAvatarPresenterClip({
          personaId: action.personaId,
          script:
            action.script ||
            model.scenes.map((s) => s.script).join(" ") ||
            model.title,
          language: model.language,
          emotion: action.emotion,
          aspectRatio: model.aspectRatio,
        });
        model = applyAvatarProfileToModel(model, avatarResult.profile);
        if (avatarResult.remoteUrl) {
          const bytes = await fetchRemoteToBytes(avatarResult.remoteUrl);
          if (bytes) {
            const uploaded = await uploadVideoStudioMedia({
              supabase: auth.supabase,
              userId: auth.user!.id,
              generationId: parsedId.id,
              kind: "clip",
              bytes,
              mimeType: avatarResult.mimeType || "video/mp4",
              filename: `avatar-${action.personaId}.mp4`,
              provider: avatarResult.provider,
              meta: {
                avatar: true,
                externalJobId: avatarResult.externalJobId,
              },
            });
            model = {
              ...model,
              assets: [...model.assets, uploaded.asset],
            };
          }
        }
        message = avatarResult.message;
        break;
      }
      case "change_voice":
        model = editorChangeVoiceStyle(model, action.style);
        message = "Voice style updated.";
        break;
      case "export_social": {
        if (action.reencode !== false) {
          const reencoded = await reencodeForSocialPreset({
            supabase: auth.supabase,
            userId: auth.user!.id,
            generationId: parsedId.id,
            model,
            presetId: action.presetId,
          });
          socialExport = reencoded.package;
          if (reencoded.reencoded && reencoded.videoUrl) {
            model = {
              ...model,
              assets: [
                ...model.assets,
                {
                  id: `export-${action.presetId}`,
                  kind: "composite" as const,
                  mimeType: "video/mp4",
                  url: reencoded.videoUrl,
                  durationSec: Math.min(
                    model.targetDurationSec,
                    socialExport.preset.maxDurationSec,
                  ),
                  provider: "external",
                  createdAt: new Date().toISOString(),
                },
              ],
            };
          }
          message = reencoded.message;
        } else {
          socialExport = buildSocialExportPackage(model, action.presetId);
          message = `Export package ready for ${socialExport.preset.label}.`;
        }
        if (action.persistAssets !== false && socialExport) {
          const persisted = await persistSocialExportAssets({
            supabase: auth.supabase,
            userId: auth.user!.id,
            generationId: parsedId.id,
            package: socialExport,
          });
          message += ` Captions ${persisted.captionsAssetId ? "saved" : "inline"}.`;
        }
        break;
      }
      case "platform_health": {
        platformHealth = await probeFfmpegHealth();
        message = platformHealth.message;
        break;
      }
      case "resume_render": {
        const current = getLatestJob(model);
        if (!current) {
          return NextResponse.json(
            { error: "No render job to resume." },
            { status: 400 },
          );
        }
        const resumed = await resumeRenderJob({
          model,
          job: current,
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: parsedId.id,
        });
        model = resumed.model;
        job = resumed.job;
        message = resumed.job.message;
        break;
      }
      case "retry_clips": {
        const retried = await retryFailedClips({
          model,
          supabase: auth.supabase,
          userId: auth.user!.id,
          generationId: parsedId.id,
          useAvatar: action.useAvatar,
        });
        model = retried.model;
        job = retried.job;
        message = retried.job.message;
        break;
      }
      case "nudge_scene":
        model = editorNudgeScene(model, action.sceneId, action.direction);
        message = "Scene order updated.";
        break;
      case "save_version":
        history = saveVideoVersion(history, model, action.note);
        message = "Version saved.";
        break;
      case "restore_version": {
        const restored = restoreVideoVersion(history, action.versionId);
        if (!restored) {
          return NextResponse.json({ error: "Version not found." }, { status: 404 });
        }
        model = restored.model;
        history = restored.history;
        message = "Version restored.";
        break;
      }
    }

    if (action.action !== "save_version" && action.action !== "platform_health") {
      history = saveVideoVersion(history, model, `After ${action.action}`);
    }

    if (action.action === "platform_health") {
      return NextResponse.json({
        message,
        model,
        history,
        quality: runVideoQualityChecks(model),
        timeline: timelineSummary(model),
        visualTimeline: buildVisualTimeline(model),
        assembly: assemblyPlan(model),
        latestJob: job ? jobStatusSummary(job) : null,
        job,
        ffmpeg: platformHealth,
        providers: listVideoProviders().map((p) => ({
          id: p.id,
          label: p.label,
          configured: p.configured,
          supportsImageToVideo: p.supportsImageToVideo,
          supportsAvatar: p.supportsAvatar,
        })),
      });
    }

    const blueprint = withProductionModel(
      (generation.blueprint || {}) as VideoBlueprint,
      model,
      history,
    ) as VideoBlueprint;

    const saved = await persist(
      auth.supabase,
      auth.user!.id,
      parsedId.id,
      blueprint,
      { video_name: model.title },
    );

    return NextResponse.json({
      message,
      generation: saved,
      model,
      history,
      quality: runVideoQualityChecks(model),
      timeline: timelineSummary(model),
      visualTimeline: buildVisualTimeline(model),
      assembly: assemblyPlan(model),
      latestJob: job ? jobStatusSummary(job) : null,
      job,
      socialExport,
      avatar: avatarResult,
      providers: listVideoProviders().map((p) => ({
        id: p.id,
        label: p.label,
        configured: p.configured,
        supportsImageToVideo: p.supportsImageToVideo,
        supportsAvatar: p.supportsAvatar,
      })),
    });
  } catch (error) {
    return serverErrorResponse(
      "video-studio.manage.post",
      error,
      "Unable to update video project.",
    );
  }
}
