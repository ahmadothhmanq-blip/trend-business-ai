/**
 * Real video generation pipeline — scenes → provider → storage → job states.
 */

import type {
  VideoMediaAsset,
  VideoProductionModel,
  VideoRenderClip,
  VideoRenderJob,
} from "@/lib/ai-core/video-production-platform/types";
import { nowIso, vid } from "@/lib/ai-core/video-production-platform/ids";
import {
  getVideoProvider,
  type VideoProviderId,
} from "@/lib/ai-core/video-production-platform/providers";
import {
  fetchRemoteToBytes,
  uploadVideoStudioMedia,
} from "@/lib/ai-core/video-production-platform/media-storage";
import { synthesizeSpeech } from "@/lib/ai-core/video-production-platform/tts";
import { createRenderJobFromModel } from "@/lib/ai-core/video-production-platform/render-engine";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function runFullRenderPipeline(params: {
  model: VideoProductionModel;
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  mode?: VideoRenderJob["mode"];
  providerId?: VideoProviderId;
  sourceImageUrl?: string | null;
  useAvatar?: boolean;
}): Promise<{ model: VideoProductionModel; job: VideoRenderJob }> {
  const provider = getVideoProvider(params.providerId);
  const mode = params.mode || "full";
  let job = createRenderJobFromModel(params.model, mode === "preview" ? "preview" : "full");
  job = {
    ...job,
    mode,
    provider: provider.id,
    status: "processing",
    progress: 5,
    message: `Rendering with ${provider.label}…`,
    costCreditsEstimate: Math.max(1, params.model.scenes.length),
    updatedAt: nowIso(),
  };

  const assets: VideoMediaAsset[] = [...params.model.assets];
  const clips: VideoRenderClip[] = [];

  // 1) TTS for full voice track (script sync)
  const fullScript =
    params.model.voiceTracks[0]?.script ||
    params.model.scenes.map((s) => s.script).filter(Boolean).join("\n\n");
  let audioAsset: VideoMediaAsset | undefined;
  if (fullScript.trim() && mode !== "preview") {
    const tts = await synthesizeSpeech({
      text: fullScript,
      voiceId: params.model.presenter?.voiceId,
      language: params.model.language,
      style: params.model.presenter?.voiceStyle,
    });
    if (tts.bytes) {
      const uploaded = await uploadVideoStudioMedia({
        supabase: params.supabase,
        userId: params.userId,
        generationId: params.generationId,
        kind: "audio",
        bytes: tts.bytes,
        mimeType: tts.mimeType,
        filename: `voice.${tts.mimeType.includes("mpeg") ? "mp3" : "wav"}`,
        durationSec: tts.durationSecEstimate,
        provider: tts.provider,
        meta: { sync: "script-to-voice" },
      });
      audioAsset = uploaded.asset;
      assets.push(uploaded.asset);
    }
  }

  // 2) Per-scene video clips
  for (let i = 0; i < job.clips.length; i++) {
    const baseClip = job.clips[i]!;
    const scene = params.model.scenes.find((s) => s.id === baseClip.sceneId);
    const prompt = scene?.visualPrompt || baseClip.visualPrompt;
    const durationSec = scene?.durationSec || 5;

    let clip: VideoRenderClip = {
      ...baseClip,
      status: "processing",
      progress: 20,
      updatedAt: nowIso(),
    };

    const result = await provider.generateClip({
      prompt,
      durationSec,
      aspectRatio: params.model.aspectRatio,
      imageUrl: params.sourceImageUrl || params.model.productImageUrl,
      avatar:
        params.useAvatar || mode === "avatar"
          ? {
              personaId: params.model.presenter?.personaId || "business-expert",
              script: scene?.script || prompt,
              voiceId: params.model.presenter?.voiceId,
            }
          : undefined,
    });

    if (result.status === "failed") {
      clip = {
        ...clip,
        status: "failed",
        progress: 100,
        error: result.error || result.message,
        updatedAt: nowIso(),
      };
      clips.push(clip);
      continue;
    }

    if (result.status === "processing" && result.externalJobId) {
      clip = {
        ...clip,
        status: "processing",
        progress: 50,
        externalJobId: result.externalJobId,
        updatedAt: nowIso(),
      };
      clips.push(clip);
      continue;
    }

    let bytes = result.bytes;
    if (!bytes && result.remoteUrl) {
      bytes = (await fetchRemoteToBytes(result.remoteUrl)) || undefined;
    }

    if (bytes) {
      const uploaded = await uploadVideoStudioMedia({
        supabase: params.supabase,
        userId: params.userId,
        generationId: params.generationId,
        kind: "clip",
        bytes,
        mimeType: result.mimeType,
        filename: `scene-${i + 1}.${result.mimeType.includes("webm") ? "webm" : "mp4"}`,
        durationSec,
        provider: result.provider,
        meta: { sceneId: scene?.id, prompt },
      });
      assets.push(uploaded.asset);
      clip = {
        ...clip,
        status: "completed",
        progress: 100,
        asset: uploaded.asset,
        updatedAt: nowIso(),
      };
    } else if (result.remoteUrl) {
      const asset: VideoMediaAsset = {
        id: vid("asset", `remote-${i}`, i),
        kind: "clip",
        mimeType: result.mimeType,
        url: result.remoteUrl,
        durationSec,
        provider: "external",
        createdAt: nowIso(),
      };
      assets.push(asset);
      clip = {
        ...clip,
        status: "completed",
        progress: 100,
        asset,
        updatedAt: nowIso(),
      };
    } else {
      clip = {
        ...clip,
        status: "failed",
        progress: 100,
        error: "No media returned",
        updatedAt: nowIso(),
      };
    }
    clips.push(clip);
  }

  const completedClips = clips.filter((c) => c.status === "completed");
  const failed = clips.filter((c) => c.status === "failed");
  const processing = clips.filter((c) => c.status === "processing");

  // 3) Composite: use first completed clip as composite stand-in (assembly hook)
  let compositeAsset = completedClips[0]?.asset;
  if (completedClips.length > 1 && completedClips[0]?.asset) {
    // Mark a composite alias pointing at first clip; real concat needs ffmpeg worker later
    compositeAsset = {
      ...completedClips[0].asset,
      id: vid("composite", params.model.title, 0),
      kind: "composite",
    };
    assets.push(compositeAsset);
  }

  const progress = Math.round(
    (completedClips.length / Math.max(1, clips.length)) * 100,
  );

  const finalJob: VideoRenderJob = {
    ...job,
    clips,
    audioAsset,
    compositeAsset,
    progress: processing.length ? Math.min(90, progress) : progress,
    status: failed.length && !completedClips.length
      ? "failed"
      : processing.length
        ? "processing"
        : "completed",
    message: processing.length
      ? `Waiting on ${processing.length} provider job(s).`
      : failed.length
        ? `Completed ${completedClips.length} clips, ${failed.length} failed.`
        : `Rendered ${completedClips.length} clips via ${provider.label}.`,
    updatedAt: nowIso(),
    completedAt: processing.length ? undefined : nowIso(),
  };

  // Persist job row (best-effort)
  try {
    await params.supabase.from("video_render_jobs").upsert({
      id: finalJob.id,
      user_id: params.userId,
      generation_id: params.generationId,
      status: finalJob.status,
      provider: finalJob.provider,
      mode: finalJob.mode,
      progress: finalJob.progress,
      payload: finalJob,
      updated_at: nowIso(),
    });
  } catch {
    /* table may not exist yet */
  }

  const scenes = params.model.scenes.map((s) => {
    const clip = clips.find((c) => c.sceneId === s.id);
    return clip?.asset ? { ...s, clipId: clip.id } : s;
  });

  const voiceTracks = params.model.voiceTracks.map((v, idx) =>
    idx === 0 && audioAsset
      ? { ...v, status: "completed" as const, asset: audioAsset }
      : v,
  );

  return {
    model: {
      ...params.model,
      scenes,
      voiceTracks,
      assets,
      jobs: [...params.model.jobs.filter((j) => j.id !== finalJob.id), finalJob],
      updatedAt: nowIso(),
      version: params.model.version + 1,
    },
    job: finalJob,
  };
}
