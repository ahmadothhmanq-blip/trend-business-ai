/**
 * Video Studio production health — database, storage, providers, TTS, FFmpeg, pipeline.
 */

import { createAdminClient } from "@/lib/supabase/admin";
import {
  probeFfmpegHealth,
  probeFfmpegCapabilities,
} from "@/lib/ai-core/video-production-platform/assemble";
import {
  listVideoProviders,
  resolvePreferredProviderId,
  envProviderFlags,
  isStrictVideoProviderMode,
  minimalMp4Bytes,
} from "@/lib/ai-core/video-production-platform/providers";
import { isExternalVideoProviderConfigured } from "@/lib/ai-core/video-production-platform/render-engine";
import {
  isTtsProviderConfigured,
  resolveTtsProviderId,
  synthesizeSpeech,
} from "@/lib/ai-core/video-production-platform/tts";
import { assembleComposite } from "@/lib/ai-core/video-production-platform/assemble";
import {
  validateVideoStudioProductionEnv,
  getVideoStudioEnvCatalog,
} from "@/lib/ai-core/video-production-platform/env-config";
import { VIDEO_STUDIO_BUCKET } from "@/lib/ai-core/video-production-platform/media-storage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type VideoStudioHealthReport = {
  ok: boolean;
  readyForProduction: boolean;
  blockers: string[];
  warnings: string[];
  database: {
    videoMedia: boolean;
    videoRenderJobs: boolean;
    videoGenerations: boolean;
    message: string;
  };
  storage: {
    bucketExists: boolean;
    bucketId: string;
    message: string;
  };
  environment: ReturnType<typeof validateVideoStudioProductionEnv>;
  ffmpeg: Awaited<ReturnType<typeof probeFfmpegHealth>>;
  ffmpegCapabilities: Awaited<ReturnType<typeof probeFfmpegCapabilities>>;
  providers: Array<{
    id: string;
    label: string;
    configured: boolean;
    supportsImageToVideo: boolean;
    supportsAvatar: boolean;
  }>;
  preferredProvider: string;
  videoProviderConfigured: boolean;
  providerFlags: ReturnType<typeof envProviderFlags>;
  strictMode: boolean;
  tts: {
    configured: boolean;
    provider: string;
    smokeOk: boolean;
    message: string;
  };
  renderPipeline: {
    ttsSmoke: boolean;
    assemblySmoke: boolean;
    method: string;
    message: string;
  };
  cronWorker: {
    configured: boolean;
    endpoint: string;
  };
};

async function checkDatabaseTables(
  supabase: AnySupabase,
): Promise<VideoStudioHealthReport["database"]> {
  const tables = ["video_media", "video_render_jobs", "video_generations"] as const;
  const status: Record<string, boolean> = {};

  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    status[table] = !error || error.code !== "PGRST205";
  }

  const videoMedia = Boolean(status.video_media);
  const videoRenderJobs = Boolean(status.video_render_jobs);
  const videoGenerations = Boolean(status.video_generations);

  let message = "All Video Studio tables reachable.";
  if (!videoMedia || !videoRenderJobs) {
    message =
      "Apply migrations 044_video_studio_media.sql and 045_video_studio_media_update_rls.sql.";
  } else if (!videoGenerations) {
    message = "video_generations missing — apply migration 018.";
  }

  return {
    videoMedia,
    videoRenderJobs,
    videoGenerations,
    message,
  };
}

async function checkStorageBucket(
  supabase: AnySupabase,
): Promise<VideoStudioHealthReport["storage"]> {
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      return {
        bucketExists: false,
        bucketId: VIDEO_STUDIO_BUCKET,
        message: error.message,
      };
    }
    const found = (data || []).some(
      (b: { id: string }) => b.id === VIDEO_STUDIO_BUCKET,
    );
    return {
      bucketExists: found,
      bucketId: VIDEO_STUDIO_BUCKET,
      message: found
        ? `Bucket "${VIDEO_STUDIO_BUCKET}" exists.`
        : `Bucket "${VIDEO_STUDIO_BUCKET}" missing — apply migration 044.`,
    };
  } catch (error) {
    return {
      bucketExists: false,
      bucketId: VIDEO_STUDIO_BUCKET,
      message: error instanceof Error ? error.message : "Storage check failed",
    };
  }
}

async function smokeRenderPipeline(): Promise<VideoStudioHealthReport["renderPipeline"]> {
  const tts = await synthesizeSpeech({
    text: "Video Studio health check.",
    voiceId: "alloy",
  });
  const ttsSmoke = tts.status === "completed" && Boolean(tts.bytes?.byteLength);

  const stub = minimalMp4Bytes("health");
  const b64 = Buffer.from(stub).toString("base64");
  const dataUrl = `data:video/mp4;base64,${b64}`;

  const assembled = await assembleComposite({
    clips: [
      { url: dataUrl, durationSec: 1 },
      { url: dataUrl, durationSec: 1 },
    ],
    title: "Health Check",
    subtitles: [{ startSec: 0, endSec: 1, text: "Health" }],
    burnSubtitles: true,
    useTransitions: true,
    outputFormat: "mp4",
  });

  const assemblySmoke =
    assembled.method === "ffmpeg" ||
    assembled.method === "first-clip" ||
    assembled.bytes != null;

  return {
    ttsSmoke,
    assemblySmoke,
    method: assembled.method,
    message: ttsSmoke
      ? `TTS ok (${tts.provider}). Assembly: ${assembled.method} — ${assembled.note}`
      : "TTS smoke failed.",
  };
}

export async function buildVideoStudioHealthReport(
  userSupabase: AnySupabase,
): Promise<VideoStudioHealthReport> {
  const admin = createAdminClient();
  const dbClient = admin ?? userSupabase;
  const storageClient = admin ?? userSupabase;

  const [
    database,
    storage,
    ffmpeg,
    ffmpegCapabilities,
    renderPipeline,
  ] = await Promise.all([
    checkDatabaseTables(dbClient),
    checkStorageBucket(storageClient),
    probeFfmpegHealth(),
    probeFfmpegCapabilities(),
    smokeRenderPipeline(),
  ]);

  const environment = validateVideoStudioProductionEnv();
  const providers = listVideoProviders().map((p) => ({
    id: p.id,
    label: p.label,
    configured: p.configured,
    supportsImageToVideo: p.supportsImageToVideo,
    supportsAvatar: p.supportsAvatar,
  }));

  const blockers: string[] = [...environment.blockers];
  const warnings: string[] = [...environment.warnings];

  if (!database.videoMedia || !database.videoRenderJobs) {
    blockers.push(database.message);
  }
  if (!storage.bucketExists) {
    blockers.push(storage.message);
  }
  if (!ffmpeg.available) {
    warnings.push(ffmpeg.message);
  }
  if (!ffmpegCapabilities.merge) {
    warnings.push("FFmpeg merge/xfade filters unavailable — multi-scene merge degraded.");
  }
  if (!isTtsProviderConfigured()) {
    warnings.push("TTS provider not configured.");
  }
  if (!isExternalVideoProviderConfigured()) {
    warnings.push("No real video provider configured.");
  }

  const readyForProduction =
    database.videoMedia &&
    database.videoRenderJobs &&
    storage.bucketExists &&
    ffmpeg.available &&
    ffmpegCapabilities.merge &&
    isExternalVideoProviderConfigured() &&
    isTtsProviderConfigured() &&
    isStrictVideoProviderMode();

  const cronConfigured = Boolean(process.env.VIDEO_STUDIO_CRON_SECRET?.trim());

  return {
    ok: blockers.length === 0,
    readyForProduction,
    blockers,
    warnings,
    database,
    storage,
    environment: {
      ...environment,
      catalog: getVideoStudioEnvCatalog(),
    },
    ffmpeg,
    ffmpegCapabilities,
    providers,
    preferredProvider: resolvePreferredProviderId(),
    videoProviderConfigured: isExternalVideoProviderConfigured(),
    providerFlags: envProviderFlags(),
    strictMode: isStrictVideoProviderMode(),
    tts: {
      configured: isTtsProviderConfigured(),
      provider: resolveTtsProviderId(),
      smokeOk: renderPipeline.ttsSmoke,
      message: renderPipeline.message,
    },
    renderPipeline,
    cronWorker: {
      configured: cronConfigured,
      endpoint: "/api/video-studio/cron",
    },
  };
}
