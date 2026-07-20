/**
 * Real video generation pipeline — scenes → provider → storage → job states.
 * Supports sync render, poll/resume, retry, and final assembly.
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
import { assembleComposite } from "@/lib/ai-core/video-production-platform/assemble";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MAX_INLINE_POLLS = 8;
const POLL_DELAY_MS = 1500;

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function persistJob(
  supabase: AnySupabase,
  userId: string,
  generationId: string,
  job: VideoRenderJob,
) {
  try {
    await supabase.from("video_render_jobs").upsert({
      id: job.id,
      user_id: userId,
      generation_id: generationId,
      status: job.status,
      provider: job.provider,
      mode: job.mode,
      progress: job.progress,
      payload: job,
      updated_at: nowIso(),
    });
  } catch {
    /* table may not exist yet */
  }
}

async function finalizeClipFromResult(params: {
  clip: VideoRenderClip;
  result: {
    status: string;
    bytes?: Uint8Array;
    remoteUrl?: string;
    mimeType: string;
    provider: string;
    error?: string;
    externalJobId?: string;
    message?: string;
  };
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  sceneId?: string;
  prompt: string;
  durationSec: number;
  index: number;
}): Promise<{ clip: VideoRenderClip; asset?: VideoMediaAsset }> {
  const { result } = params;
  if (result.status === "failed") {
    return {
      clip: {
        ...params.clip,
        status: "failed",
        progress: 100,
        error: result.error || result.message,
        externalJobId: result.externalJobId || params.clip.externalJobId,
        updatedAt: nowIso(),
      },
    };
  }

  if (result.status === "processing") {
    return {
      clip: {
        ...params.clip,
        status: "processing",
        progress: 50,
        externalJobId: result.externalJobId || params.clip.externalJobId,
        updatedAt: nowIso(),
      },
    };
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
      mimeType: result.mimeType.includes("webm") ? "video/webm" : "video/mp4",
      filename: `scene-${params.index + 1}.${result.mimeType.includes("webm") ? "webm" : "mp4"}`,
      durationSec: params.durationSec,
      provider: result.provider,
      meta: { sceneId: params.sceneId, prompt: params.prompt },
    });
    return {
      clip: {
        ...params.clip,
        status: "completed",
        progress: 100,
        asset: uploaded.asset,
        externalJobId: result.externalJobId || params.clip.externalJobId,
        updatedAt: nowIso(),
      },
      asset: uploaded.asset,
    };
  }

  if (result.remoteUrl) {
    const asset: VideoMediaAsset = {
      id: vid("asset", `remote-${params.index}`, params.index),
      kind: "clip",
      mimeType: result.mimeType.includes("webm") ? "video/webm" : "video/mp4",
      url: result.remoteUrl,
      durationSec: params.durationSec,
      provider: result.provider,
      createdAt: nowIso(),
    };
    return {
      clip: {
        ...params.clip,
        status: "completed",
        progress: 100,
        asset,
        externalJobId: result.externalJobId || params.clip.externalJobId,
        updatedAt: nowIso(),
      },
      asset,
    };
  }

  return {
    clip: {
      ...params.clip,
      status: "failed",
      progress: 100,
      error: "No media returned",
      updatedAt: nowIso(),
    },
  };
}

async function assembleAndUpload(params: {
  model: VideoProductionModel;
  job: VideoRenderJob;
  clips: VideoRenderClip[];
  audioAsset?: VideoMediaAsset;
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  assets: VideoMediaAsset[];
}): Promise<{ compositeAsset?: VideoMediaAsset; assemblyManifest: VideoRenderJob["assemblyManifest"]; assets: VideoMediaAsset[] }> {
  const completed = params.clips.filter((c) => c.status === "completed" && c.asset?.url);
  if (!completed.length) {
    return { assets: params.assets, assemblyManifest: undefined };
  }

  const assembled = await assembleComposite({
    title: params.model.title,
    clips: completed.map((c) => ({
      url: c.asset!.url,
      durationSec: c.asset!.durationSec || 5,
    })),
    audioUrl: params.audioAsset?.url,
  });

  let compositeAsset = assembled.assetStub;
  const assets = [...params.assets];

  if (assembled.bytes) {
    const uploaded = await uploadVideoStudioMedia({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      kind: "composite",
      bytes: assembled.bytes,
      mimeType: assembled.mimeType,
      filename: `final.${assembled.mimeType.includes("webm") ? "webm" : "mp4"}`,
      durationSec: compositeAsset.durationSec,
      provider: assembled.method === "ffmpeg" ? "ffmpeg" : params.job.provider,
      meta: { assembly: assembled.manifest },
    });
    compositeAsset = { ...uploaded.asset, kind: "composite" };
    assets.push(compositeAsset);
  } else if (compositeAsset.url) {
    assets.push(compositeAsset);
  }

  return {
    compositeAsset,
    assemblyManifest: assembled.manifest,
    assets,
  };
}

function applyJobToModel(
  model: VideoProductionModel,
  job: VideoRenderJob,
  assets: VideoMediaAsset[],
  audioAsset?: VideoMediaAsset,
): VideoProductionModel {
  const scenes = model.scenes.map((s) => {
    const clip = job.clips.find((c) => c.sceneId === s.id);
    return clip?.asset ? { ...s, clipId: clip.id } : s;
  });
  const voiceTracks = model.voiceTracks.map((v, idx) =>
    idx === 0 && audioAsset
      ? { ...v, status: "completed" as const, asset: audioAsset }
      : v,
  );
  return {
    ...model,
    scenes,
    voiceTracks,
    assets,
    jobs: [...model.jobs.filter((j) => j.id !== job.id), job],
    updatedAt: nowIso(),
    version: model.version + 1,
  };
}

export async function runFullRenderPipeline(params: {
  model: VideoProductionModel;
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  mode?: VideoRenderJob["mode"];
  providerId?: VideoProviderId;
  sourceImageUrl?: string | null;
  useAvatar?: boolean;
  /** When true, poll processing provider jobs inline (bounded). */
  pollInline?: boolean;
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
    costCreditsSpent: 0,
    attemptCount: 1,
    updatedAt: nowIso(),
  };

  const assets: VideoMediaAsset[] = [...params.model.assets];
  const clips: VideoRenderClip[] = [];

  // 1) TTS
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
      emotion: params.model.presenter?.facialExpressionStyle,
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

  // 2) Per-scene clips
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

    let result = await provider.generateClip({
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

    // Bounded inline poll for async providers
    if (
      (params.pollInline !== false) &&
      result.status === "processing" &&
      result.externalJobId &&
      provider.pollJob
    ) {
      const poll = provider.pollJob.bind(provider);
      const jobId = result.externalJobId;
      for (let p = 0; p < MAX_INLINE_POLLS; p++) {
        await sleep(POLL_DELAY_MS);
        result = await poll(jobId);
        if (result.status !== "processing") break;
      }
    }

    const finalized = await finalizeClipFromResult({
      clip,
      result,
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      sceneId: scene?.id,
      prompt,
      durationSec,
      index: i,
    });
    clip = finalized.clip;
    if (finalized.asset) assets.push(finalized.asset);
    if (clip.status === "completed") {
      job = { ...job, costCreditsSpent: (job.costCreditsSpent || 0) + 1 };
    }
    clips.push(clip);
  }

  const completedClips = clips.filter((c) => c.status === "completed");
  const failed = clips.filter((c) => c.status === "failed");
  const processing = clips.filter((c) => c.status === "processing");

  let compositeAsset: VideoMediaAsset | undefined;
  let assemblyManifest: VideoRenderJob["assemblyManifest"];

  if (!processing.length && completedClips.length) {
    const assembled = await assembleAndUpload({
      model: params.model,
      job: { ...job, clips },
      clips,
      audioAsset,
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      assets,
    });
    compositeAsset = assembled.compositeAsset;
    assemblyManifest = assembled.assemblyManifest;
    assets.length = 0;
    assets.push(...assembled.assets);
  }

  const progress = Math.round(
    (completedClips.length / Math.max(1, clips.length)) * 100,
  );

  const finalJob: VideoRenderJob = {
    ...job,
    clips,
    audioAsset,
    compositeAsset,
    assemblyManifest,
    progress: processing.length ? Math.min(90, progress) : progress,
    status:
      failed.length && !completedClips.length
        ? "failed"
        : processing.length
          ? "processing"
          : "completed",
    message: processing.length
      ? `Waiting on ${processing.length} provider job(s) — resume to continue.`
      : failed.length
        ? `Completed ${completedClips.length} clips, ${failed.length} failed.`
        : `Rendered ${completedClips.length} clips via ${provider.label}${assemblyManifest ? ` · assembled (${assemblyManifest.method})` : ""}.`,
    updatedAt: nowIso(),
    completedAt: processing.length ? undefined : nowIso(),
  };

  await persistJob(params.supabase, params.userId, params.generationId, finalJob);

  return {
    model: applyJobToModel(params.model, finalJob, assets, audioAsset),
    job: finalJob,
  };
}

/**
 * Resume a processing job — poll external providers, upload completed clips, assemble.
 */
export async function resumeRenderJob(params: {
  model: VideoProductionModel;
  job: VideoRenderJob;
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  pollRounds?: number;
}): Promise<{ model: VideoProductionModel; job: VideoRenderJob }> {
  const provider = getVideoProvider(params.job.provider);
  const assets = [...params.model.assets];
  const rounds = params.pollRounds ?? MAX_INLINE_POLLS;
  let clips = [...params.job.clips];
  let audioAsset = params.job.audioAsset;

  for (let round = 0; round < rounds; round++) {
    let anyProcessing = false;
    const nextClips: VideoRenderClip[] = [];

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i]!;
      if (clip.status !== "processing" || !clip.externalJobId || !provider.pollJob) {
        nextClips.push(clip);
        continue;
      }
      anyProcessing = true;
      const result = await provider.pollJob(clip.externalJobId);
      const scene = params.model.scenes.find((s) => s.id === clip.sceneId);
      const finalized = await finalizeClipFromResult({
        clip,
        result,
        supabase: params.supabase,
        userId: params.userId,
        generationId: params.generationId,
        sceneId: scene?.id,
        prompt: clip.visualPrompt,
        durationSec: scene?.durationSec || 5,
        index: i,
      });
      if (finalized.asset) assets.push(finalized.asset);
      nextClips.push(finalized.clip);
    }

    clips = nextClips;
    if (!anyProcessing || !clips.some((c) => c.status === "processing")) break;
    await sleep(POLL_DELAY_MS);
  }

  const completedClips = clips.filter((c) => c.status === "completed");
  const failed = clips.filter((c) => c.status === "failed");
  const processing = clips.filter((c) => c.status === "processing");

  let compositeAsset = params.job.compositeAsset;
  let assemblyManifest = params.job.assemblyManifest;
  let nextAssets = assets;

  if (!processing.length && completedClips.length) {
    const assembled = await assembleAndUpload({
      model: params.model,
      job: { ...params.job, clips },
      clips,
      audioAsset,
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      assets,
    });
    compositeAsset = assembled.compositeAsset;
    assemblyManifest = assembled.assemblyManifest;
    nextAssets = assembled.assets;
  }

  const progress = Math.round(
    (completedClips.length / Math.max(1, clips.length)) * 100,
  );

  const finalJob: VideoRenderJob = {
    ...params.job,
    clips,
    audioAsset,
    compositeAsset,
    assemblyManifest,
    progress: processing.length ? Math.min(95, Math.max(progress, 50)) : progress,
    status:
      failed.length && !completedClips.length
        ? "failed"
        : processing.length
          ? "processing"
          : "completed",
    message: processing.length
      ? `Still waiting on ${processing.length} provider job(s).`
      : `Resumed — ${completedClips.length} clips ready.`,
    costCreditsSpent:
      (params.job.costCreditsSpent || 0) +
      Math.max(0, completedClips.length - (params.job.clips.filter((c) => c.status === "completed").length)),
    updatedAt: nowIso(),
    completedAt: processing.length ? undefined : nowIso(),
  };

  await persistJob(params.supabase, params.userId, params.generationId, finalJob);
  return {
    model: applyJobToModel(params.model, finalJob, nextAssets, audioAsset),
    job: finalJob,
  };
}

/**
 * Retry only failed (or optionally missing) clips on the latest job.
 */
export async function retryFailedClips(params: {
  model: VideoProductionModel;
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  providerId?: VideoProviderId;
  sourceImageUrl?: string | null;
  useAvatar?: boolean;
}): Promise<{ model: VideoProductionModel; job: VideoRenderJob }> {
  const latest = params.model.jobs[params.model.jobs.length - 1];
  if (!latest) {
    return runFullRenderPipeline({
      ...params,
      mode: "full",
      pollInline: true,
    });
  }

  const provider = getVideoProvider(params.providerId || latest.provider);
  const assets = [...params.model.assets];
  const clips: VideoRenderClip[] = [];
  let spent = latest.costCreditsSpent || 0;

  for (let i = 0; i < latest.clips.length; i++) {
    const existing = latest.clips[i]!;
    if (existing.status === "completed" && existing.asset) {
      clips.push(existing);
      continue;
    }

    const scene = params.model.scenes.find((s) => s.id === existing.sceneId);
    const prompt = scene?.visualPrompt || existing.visualPrompt;
    const durationSec = scene?.durationSec || 5;

    let result = await provider.generateClip({
      prompt,
      durationSec,
      aspectRatio: params.model.aspectRatio,
      imageUrl: params.sourceImageUrl || params.model.productImageUrl,
      avatar: params.useAvatar
        ? {
            personaId: params.model.presenter?.personaId || "business-expert",
            script: scene?.script || prompt,
            voiceId: params.model.presenter?.voiceId,
          }
        : undefined,
    });

    if (result.status === "processing" && result.externalJobId && provider.pollJob) {
      const poll = provider.pollJob.bind(provider);
      const jobId = result.externalJobId;
      for (let p = 0; p < MAX_INLINE_POLLS; p++) {
        await sleep(POLL_DELAY_MS);
        result = await poll(jobId);
        if (result.status !== "processing") break;
      }
    }

    const finalized = await finalizeClipFromResult({
      clip: { ...existing, status: "processing", progress: 20, error: undefined },
      result,
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      sceneId: scene?.id,
      prompt,
      durationSec,
      index: i,
    });
    if (finalized.asset) {
      assets.push(finalized.asset);
      spent += 1;
    }
    clips.push(finalized.clip);
  }

  const processing = clips.filter((c) => c.status === "processing");
  const completedClips = clips.filter((c) => c.status === "completed");
  const failed = clips.filter((c) => c.status === "failed");
  const audioAsset = latest.audioAsset;

  let compositeAsset = latest.compositeAsset;
  let assemblyManifest = latest.assemblyManifest;
  let nextAssets = assets;

  if (!processing.length && completedClips.length) {
    const assembled = await assembleAndUpload({
      model: params.model,
      job: { ...latest, clips },
      clips,
      audioAsset,
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      assets,
    });
    compositeAsset = assembled.compositeAsset;
    assemblyManifest = assembled.assemblyManifest;
    nextAssets = assembled.assets;
  }

  const finalJob: VideoRenderJob = {
    ...latest,
    clips,
    audioAsset,
    compositeAsset,
    assemblyManifest,
    attemptCount: (latest.attemptCount || 1) + 1,
    costCreditsSpent: spent,
    progress: Math.round((completedClips.length / Math.max(1, clips.length)) * 100),
    status:
      failed.length && !completedClips.length
        ? "failed"
        : processing.length
          ? "processing"
          : "completed",
    message: `Retry #${(latest.attemptCount || 1) + 1}: ${completedClips.length} ok, ${failed.length} failed.`,
    provider: provider.id,
    updatedAt: nowIso(),
    completedAt: processing.length ? undefined : nowIso(),
  };

  await persistJob(params.supabase, params.userId, params.generationId, finalJob);
  return {
    model: applyJobToModel(params.model, finalJob, nextAssets, audioAsset),
    job: finalJob,
  };
}

/**
 * Background worker helper — process queued/processing jobs from DB.
 */
export async function processPendingRenderJobs(params: {
  supabase: AnySupabase;
  userId?: string;
  limit?: number;
}): Promise<{ processed: number; results: Array<{ jobId: string; status: string }> }> {
  let query = params.supabase
    .from("video_render_jobs")
    .select("*")
    .in("status", ["queued", "processing"])
    .order("updated_at", { ascending: true })
    .limit(params.limit ?? 5);

  if (params.userId) {
    query = query.eq("user_id", params.userId);
  }

  const { data, error } = await query;
  if (error || !data?.length) {
    return { processed: 0, results: [] };
  }

  const results: Array<{ jobId: string; status: string }> = [];

  for (const row of data as Array<{
    id: string;
    user_id: string;
    generation_id: string;
    payload: VideoRenderJob;
  }>) {
    const { data: gen } = await params.supabase
      .from("video_generations")
      .select("blueprint,prompt,style,aspect_ratio,duration,video_type")
      .eq("id", row.generation_id)
      .eq("user_id", row.user_id)
      .maybeSingle();

    if (!gen) {
      results.push({ jobId: row.id, status: "skipped" });
      continue;
    }

    const { extractProductionModel, withProductionModel } = await import(
      "@/lib/ai-core/video-production-platform/management"
    );
    const { extractVideoVersionHistory } = await import(
      "@/lib/ai-core/video-production-platform/management"
    );

    let model = extractProductionModel(gen.blueprint, {
      prompt: gen.prompt,
      style: gen.style,
      aspectRatio: gen.aspect_ratio,
      duration: gen.duration,
      videoType: gen.video_type,
    });

    // Prefer job from model if present
    const jobFromModel = model.jobs.find((j) => j.id === row.id) || row.payload;
    const resumed = await resumeRenderJob({
      model,
      job: jobFromModel,
      supabase: params.supabase,
      userId: row.user_id,
      generationId: row.generation_id,
    });
    model = resumed.model;
    const history = extractVideoVersionHistory(gen.blueprint);
    const blueprint = withProductionModel(gen.blueprint || {}, model, history);

    await params.supabase
      .from("video_generations")
      .update({ blueprint, updated_at: nowIso() })
      .eq("id", row.generation_id)
      .eq("user_id", row.user_id);

    results.push({ jobId: row.id, status: resumed.job.status });
  }

  return { processed: results.length, results };
}
