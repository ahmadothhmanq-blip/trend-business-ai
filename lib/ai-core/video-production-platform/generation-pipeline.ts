/**
 * Real video generation pipeline — domain render facade + assembly helpers.
 * Full/avatar/image-to-video/batch render is owned by runtime/render-pipeline.ts.
 */

import type {
  VideoMediaAsset,
  VideoProductionModel,
  VideoRenderClip,
  VideoRenderJob,
} from "@/lib/ai-core/video-production-platform/types";
import { nowIso } from "@/lib/ai-core/video-production-platform/ids";
import type { VideoProviderId } from "@/lib/ai-core/video-production-platform/providers";
import { uploadVideoStudioMedia } from "@/lib/ai-core/video-production-platform/media-storage";
import {
  assembleComposite,
  probeMediaBytes,
  resolveExportPreset,
  type AssemblyResult,
} from "@/lib/ai-core/video-production-platform/assemble";
import {
  filterClipsForProductionAssembly,
  isFfmpegAssemblyMethod,
  isProductionRenderMode,
} from "@/lib/ai-core/video-production-platform/media-validation";
import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";
import { sha256Hex } from "@/lib/ai-core/video-production-platform/runtime/ingest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

const MAX_INLINE_POLLS = 8;
const MIN_PRODUCTION_COMPOSITE_BYTES = 1024;

export type AssembleAndUploadResult = {
  compositeAsset?: VideoMediaAsset;
  assemblyManifest: VideoRenderJob["assemblyManifest"];
  assets: VideoMediaAsset[];
  ok: boolean;
  errorMessage?: string;
};

function productionAssemblyRejected(note: string, manifest?: VideoRenderJob["assemblyManifest"]): AssembleAndUploadResult {
  return {
    assets: [],
    assemblyManifest: manifest || {
      clipUrls: [],
      method: "manifest-only",
      note,
    },
    ok: false,
    errorMessage: note,
  };
}

export async function assembleAndUpload(params: {
  model: VideoProductionModel;
  job: VideoRenderJob;
  clips: VideoRenderClip[];
  audioAsset?: VideoMediaAsset;
  supabase: AnySupabase;
  userId: string;
  generationId: string;
  assets: VideoMediaAsset[];
  assemble?: typeof assembleComposite;
}): Promise<AssembleAndUploadResult> {
  const production = isProductionRenderMode(params.job.mode);
  const assemble = params.assemble || assembleComposite;
  const { eligible, message: filterMessage } = filterClipsForProductionAssembly({
    clips: params.clips,
    mode: params.job.mode,
  });

  if (!eligible.length) {
    const note = filterMessage || "No clips to assemble.";
    return {
      ...productionAssemblyRejected(note, {
        clipUrls: [],
        method: "manifest-only",
        note,
      }),
      assets: params.assets,
    };
  }

  const assembled: AssemblyResult = await assemble({
    title: params.model.title,
    clips: eligible.map((c) => {
      const scene = params.model.scenes.find((s) => s.id === c.sceneId);
      return {
        url: c.asset!.url,
        durationSec: c.asset!.durationSec || scene?.durationSec || 5,
        transition: scene?.transition || "fade",
      };
    }),
    audioUrl: params.audioAsset?.url,
    musicUrl: params.audioAsset
      ? undefined
      : params.model.audioBeds.find((b) => b.kind === "music" && b.asset?.url)?.asset?.url,
    subtitles: params.model.subtitles.map((s, i) => ({
      startSec: s.startSec ?? i * 3,
      endSec: s.endSec ?? (s.startSec ?? i * 3) + 3,
      text: s.text,
    })),
    burnSubtitles: params.model.subtitles.length > 0,
    useTransitions: eligible.length > 1,
    exportPreset: resolveExportPreset(params.model.aspectRatio, "1080p"),
    requireFfmpeg: production,
  });

  const manifest: VideoRenderJob["assemblyManifest"] = filterMessage
    ? { ...assembled.manifest, note: `${assembled.manifest.note} ${filterMessage}`.trim() }
    : assembled.manifest;

  if (production) {
    const bytes = assembled.bytes;
    const playable =
      isFfmpegAssemblyMethod(assembled.method) &&
      Boolean(bytes?.byteLength && bytes.byteLength >= MIN_PRODUCTION_COMPOSITE_BYTES) &&
      !isStubVideoBytes(bytes!);
    if (!playable) {
      return {
        assets: params.assets,
        assemblyManifest: manifest,
        ok: false,
        errorMessage:
          assembled.note ||
          "FFmpeg did not produce a playable MP4. Production renders cannot finish as first-clip or manifest-only.",
      };
    }
  }

  let compositeAsset = assembled.assetStub;
  const assets = [...params.assets];

  if (assembled.bytes && (!production || isFfmpegAssemblyMethod(assembled.method))) {
    const probed = await probeMediaBytes(assembled.bytes);
    const checksum = sha256Hex(assembled.bytes);
    const durationSec = probed.durationSec && probed.durationSec > 0 ? probed.durationSec : compositeAsset.durationSec;
    if (production && !(durationSec > 0)) {
      return {
        assets: params.assets,
        assemblyManifest: manifest,
        ok: false,
        errorMessage: "Assembled MP4 has no playable duration.",
      };
    }
    const width = probed.width || compositeAsset.width;
    const height = probed.height || compositeAsset.height;
    const uploaded = await uploadVideoStudioMedia({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      kind: "composite",
      bytes: assembled.bytes,
      mimeType: assembled.mimeType,
      filename: `final.${assembled.mimeType.includes("webm") ? "webm" : "mp4"}`,
      durationSec,
      provider: assembled.method === "ffmpeg" ? "ffmpeg" : params.job.provider,
      meta: {
        assembly: assembled.manifest,
        sha256: checksum,
        codec: probed.codec,
        width,
        height,
      },
    });
    compositeAsset = {
      ...uploaded.asset,
      kind: "composite",
      durationSec,
      width: width || uploaded.asset.width,
      height: height || uploaded.asset.height,
    };
    assets.push(compositeAsset);
    if (uploaded.record?.id) {
      try {
        await params.supabase
          .from("video_media")
          .update({
            sha256: checksum,
            width,
            height,
            codec: probed.codec,
            duration_sec: durationSec,
          })
          .eq("id", uploaded.record.id);
      } catch {
        /* probe metadata is additive */
      }
    }
    try {
      const { recordMediaRevision } = await import(
        "@/lib/ai-core/video-production-platform/media-revisions"
      );
      if (uploaded.record) {
        await recordMediaRevision({
          supabase: params.supabase,
          userId: params.userId,
          mediaId: uploaded.record.id,
          storagePath: uploaded.storagePath,
          publicUrl: uploaded.record.publicUrl,
          note: `Composite ${assembled.method}`,
        });
      }
    } catch {
      /* revisions optional */
    }
  } else if (!production && compositeAsset.url) {
    assets.push(compositeAsset);
  }

  const ok = !production || (isFfmpegAssemblyMethod(manifest?.method) && Boolean(compositeAsset.url));
  return {
    compositeAsset: ok ? compositeAsset : undefined,
    assemblyManifest: manifest,
    assets: ok ? assets : params.assets,
    ok,
    errorMessage: ok ? undefined : assembled.note || "Production assembly did not produce a playable MP4.",
  };
}

export function applyJobToModel(
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
  if (params.mode === "preview") {
    const { startAndProcessRender } = await import(
      "@/lib/ai-core/video-production-platform/render-engine"
    );
    return startAndProcessRender(params.model, "preview");
  }
  const { runDomainRenderPipeline } = await import(
    "@/lib/ai-core/video-production-platform/runtime/render-pipeline"
  );
  const result = await runDomainRenderPipeline({
    model: params.model,
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    mode: params.mode === "avatar" || params.mode === "image-to-video" || params.mode === "batch-item"
      ? params.mode
      : "full",
    providerId: params.providerId,
    sourceImageUrl: params.sourceImageUrl,
    useAvatar: params.useAvatar || params.mode === "avatar",
  });
  void params.pollInline;
  return { model: result.model, job: result.job };
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
  const { resumeDomainRender } = await import(
    "@/lib/ai-core/video-production-platform/runtime/render-pipeline"
  );
  const result = await resumeDomainRender({
    model: params.model,
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    mode: params.job.mode === "preview" ? "full" : params.job.mode,
    providerId: params.job.provider,
  });
  void params.pollRounds;
  return { model: result.model, job: result.job };
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
  const { retryDomainRender } = await import(
    "@/lib/ai-core/video-production-platform/runtime/render-pipeline"
  );
  const result = await retryDomainRender({
    model: params.model,
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    providerId: params.providerId,
    sourceImageUrl: params.sourceImageUrl,
    useAvatar: params.useAvatar,
  });
  return { model: result.model, job: result.job };
}

/**
 * Background worker helper — process queued/processing jobs from DB.
 */
async function processRenderJobRow(params: {
  supabase: AnySupabase;
  row: {
    id: string;
    user_id: string;
    generation_id: string;
    payload: VideoRenderJob;
  };
  pollRounds?: number;
  action: "resume" | "retry";
}): Promise<{ jobId: string; status: string; action: string }> {
  const { data: gen } = await params.supabase
    .from("video_generations")
    .select("blueprint,prompt,style,aspect_ratio,duration,video_type")
    .eq("id", params.row.generation_id)
    .eq("user_id", params.row.user_id)
    .maybeSingle();

  if (!gen) {
    return { jobId: params.row.id, status: "skipped", action: params.action };
  }

  const { extractProductionModel, withProductionModel, extractVideoVersionHistory } =
    await import("@/lib/ai-core/video-production-platform/management");

  let model = extractProductionModel(gen.blueprint, {
    prompt: gen.prompt,
    style: gen.style,
    aspectRatio: gen.aspect_ratio,
    duration: gen.duration,
    videoType: gen.video_type,
  });

  const jobFromModel =
    model.jobs.find((j) => j.id === params.row.id) || params.row.payload;

  const outcome =
    params.action === "retry"
      ? await retryFailedClips({
          model,
          supabase: params.supabase,
          userId: params.row.user_id,
          generationId: params.row.generation_id,
        })
      : await resumeRenderJob({
          model,
          job: jobFromModel,
          supabase: params.supabase,
          userId: params.row.user_id,
          generationId: params.row.generation_id,
          pollRounds: params.pollRounds,
        });

  model = outcome.model;
  const history = extractVideoVersionHistory(gen.blueprint);
  const blueprint = withProductionModel(gen.blueprint || {}, model, history);

  await params.supabase
    .from("video_generations")
    .update({ blueprint, updated_at: nowIso() })
    .eq("id", params.row.generation_id)
    .eq("user_id", params.row.user_id);

  return {
    jobId: params.row.id,
    status: outcome.job.status,
    action: params.action,
  };
}

export async function processPendingRenderJobs(params: {
  supabase: AnySupabase;
  /** Required for tenant HTTP callers. Omit only from the secret-gated cron worker. */
  userId?: string;
  limit?: number;
  pollRounds?: number;
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
    if (params.userId && row.user_id !== params.userId) continue;
    const result = await processRenderJobRow({
      supabase: params.supabase,
      row,
      pollRounds: params.pollRounds,
      action: "resume",
    });
    results.push({ jobId: result.jobId, status: result.status });
  }

  return { processed: results.length, results };
}

/**
 * Background queue — resume async jobs and optionally retry recent failures.
 * Pass `userId` for authenticated tenant requests. Omit only from `/api/video-studio/cron`
 * (service-role + VIDEO_STUDIO_CRON_SECRET).
 */
export async function processVideoStudioBackgroundQueue(params: {
  supabase: AnySupabase;
  userId?: string;
  limit?: number;
  pollRounds?: number;
  retryFailed?: boolean;
  maxRetryAttempts?: number;
}): Promise<{
  processed: number;
  resumed: number;
  retried: number;
  providerJobs?: Awaited<ReturnType<typeof import("@/lib/ai-core/video-production-platform/runtime/provider-job-worker").processDueProviderJobs>>;
  results: Array<{ jobId: string; status: string; action: string }>;
}> {
  const { processDueProviderJobs } = await import(
    "@/lib/ai-core/video-production-platform/runtime/provider-job-worker"
  );
  const providerJobs = await processDueProviderJobs({
    supabase: params.supabase,
    limit: params.limit ?? 10,
    userId: params.userId,
  });
  const limit = params.limit ?? 10;
  const maxAttempts = params.maxRetryAttempts ?? 3;
  const results: Array<{ jobId: string; status: string; action: string }> = [];

  let pendingQuery = params.supabase
    .from("video_render_jobs")
    .select("*")
    .in("status", ["queued", "processing"])
    .order("updated_at", { ascending: true })
    .limit(limit);

  if (params.userId) {
    pendingQuery = pendingQuery.eq("user_id", params.userId);
  }

  const { data: pending } = await pendingQuery;

  for (const row of (pending || []) as Array<{
    id: string;
    user_id: string;
    generation_id: string;
    payload: VideoRenderJob;
  }>) {
    if (params.userId && row.user_id !== params.userId) continue;
    results.push(
      await processRenderJobRow({
        supabase: params.supabase,
        row,
        pollRounds: params.pollRounds ?? MAX_INLINE_POLLS * 2,
        action: "resume",
      }),
    );
  }

  let retried = 0;
  if (params.retryFailed !== false && results.length < limit) {
    let failedQuery = params.supabase
      .from("video_render_jobs")
      .select("*")
      .eq("status", "failed")
      .order("updated_at", { ascending: true })
      .limit(limit - results.length);

    if (params.userId) {
      failedQuery = failedQuery.eq("user_id", params.userId);
    }

    const { data: failedRows } = await failedQuery;

    for (const row of (failedRows || []) as Array<{
      id: string;
      user_id: string;
      generation_id: string;
      payload: VideoRenderJob;
    }>) {
      if (params.userId && row.user_id !== params.userId) continue;
      const attempts = row.payload?.attemptCount ?? 1;
      if (attempts >= maxAttempts) continue;
      results.push(
        await processRenderJobRow({
          supabase: params.supabase,
          row,
          pollRounds: params.pollRounds ?? MAX_INLINE_POLLS * 2,
          action: "retry",
        }),
      );
      retried += 1;
    }
  }

  return {
    processed: results.length + providerJobs.processed,
    resumed: results.filter((r) => r.action === "resume").length,
    retried,
    providerJobs,
    results: [
      ...providerJobs.results,
      ...results,
    ],
  };
}
