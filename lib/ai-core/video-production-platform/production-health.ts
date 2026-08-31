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
} from "@/lib/ai-core/video-production-platform/providers";
import {
  isExternalVideoProviderConfigured,
  isKlingVideoProviderConfigured,
} from "@/lib/ai-core/video-production-platform/render-engine";
import {
  isTtsProviderConfigured,
  resolveTtsProviderId,
  synthesizeSpeech,
} from "@/lib/ai-core/video-production-platform/tts";
import {
  isVideoStudioProductionRuntime,
  validateVideoStudioProductionEnv,
  getVideoStudioEnvCatalog,
  isFullRenderProviderConfigured,
} from "@/lib/ai-core/video-production-platform/env-config";
import { buildProviderHealthReport } from "@/lib/ai-core/video-production-platform/provider-health";
import {
  VIDEO_STUDIO_BUCKET,
  probeVideoStudioStorage,
  type VideoStudioStorageHealth,
} from "@/lib/ai-core/video-production-platform/media-storage";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type VideoStudioOperationalStatus = "PASS" | "FAIL" | "WARN";

export type VideoStudioOperationalCheck = {
  id: string;
  label: string;
  status: VideoStudioOperationalStatus;
  detail: string;
};

export type VideoStudioHealthReport = {
  ok: boolean;
  readyForProduction: boolean;
  blockers: string[];
  warnings: string[];
  operationalChecks: VideoStudioOperationalCheck[];
  database: {
    videoMedia: boolean;
    videoRenderJobs: boolean;
    videoGenerations: boolean;
    message: string;
  };
  storage: VideoStudioStorageHealth;
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
  providerHealth: Awaited<ReturnType<typeof buildProviderHealthReport>>;
  fullRenderProvider: string;
  avatarProvider: string;
  klingConfigured: boolean;
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

async function smokeTts(): Promise<{ ttsSmoke: boolean; message: string; provider: string }> {
  const tts = await synthesizeSpeech({
    text: "Video Studio health check.",
    voiceId: "alloy",
  });
  const ttsSmoke = tts.status === "completed" && Boolean(tts.bytes?.byteLength);
  return {
    ttsSmoke,
    provider: tts.provider,
    message: ttsSmoke
      ? `TTS ok (${tts.provider}).`
      : "TTS smoke failed.",
  };
}

function check(
  id: string,
  label: string,
  status: VideoStudioOperationalStatus,
  detail: string,
): VideoStudioOperationalCheck {
  return { id, label, status, detail };
}

export async function buildVideoStudioHealthReport(
  userSupabase: AnySupabase,
): Promise<VideoStudioHealthReport> {
  const admin = createAdminClient();
  const dbClient = admin ?? userSupabase;
  const storageClient = admin ?? userSupabase;
  const production = isVideoStudioProductionRuntime();

  const [
    database,
    storage,
    ffmpeg,
    ffmpegCapabilities,
    ttsSmoke,
    providerHealth,
  ] = await Promise.all([
    checkDatabaseTables(dbClient),
    probeVideoStudioStorage(storageClient),
    probeFfmpegHealth(),
    probeFfmpegCapabilities(),
    smokeTts(),
    buildProviderHealthReport(),
  ]);

  const environment = validateVideoStudioProductionEnv();
  const providers = listVideoProviders().map((p) => ({
    id: p.id,
    label: p.label,
    configured: p.configured,
    supportsImageToVideo: p.supportsImageToVideo,
    supportsAvatar: p.supportsAvatar,
  }));

  const blockers: string[] = [...environment.blockers, ...providerHealth.blockers];
  const warnings: string[] = [...environment.warnings, ...providerHealth.warnings];

  const failOrWarn = (message: string) => {
    if (production) blockers.push(message);
    else warnings.push(message);
  };

  if (!database.videoMedia || !database.videoRenderJobs) {
    blockers.push(database.message);
  }
  if (!storage.bucketExists || !storage.private) {
    blockers.push(storage.message);
  } else if (!storage.uploadOk || !storage.signedUrlOk) {
    failOrWarn(storage.message);
  } else if (storage.fileSizeLimitBytes == null || !storage.allowedMimeTypes?.length) {
    warnings.push(storage.message);
  }
  if (!ffmpeg.available) {
    failOrWarn(ffmpeg.message);
  }
  if (!ffmpegCapabilities.merge) {
    failOrWarn("FFmpeg merge/xfade filters unavailable — multi-scene merge cannot run.");
  }
  if (!isKlingVideoProviderConfigured() && isFullRenderProviderConfigured()) {
    warnings.push("KLING_API_KEY not set — full renders cannot use Kling.");
  } else if (isKlingVideoProviderConfigured() && !providerHealth.fullRenderReady) {
    warnings.push("Kling key set but full-render lane not ready — check API access.");
  }

  const assemblySmoke = ffmpeg.available && ffmpegCapabilities.merge;
  const renderPipeline = {
    ttsSmoke: ttsSmoke.ttsSmoke,
    assemblySmoke,
    method: assemblySmoke ? "ffmpeg" : "unavailable",
    message: ttsSmoke.ttsSmoke
      ? `${ttsSmoke.message} Assembly: ${assemblySmoke ? "ffmpeg filters ready" : "FFmpeg merge unavailable"}.`
      : ttsSmoke.message,
  };

  const cronConfigured = Boolean(process.env.VIDEO_STUDIO_CRON_SECRET?.trim());

  const readyForProduction =
    blockers.length === 0 &&
    database.videoMedia &&
    database.videoRenderJobs &&
    storage.bucketExists &&
    storage.private &&
    storage.uploadOk &&
    storage.signedUrlOk &&
    ffmpeg.available &&
    ffmpegCapabilities.merge &&
    providerHealth.fullRenderReady &&
    isTtsProviderConfigured() &&
    isStrictVideoProviderMode() &&
    cronConfigured;

  const operationalChecks: VideoStudioOperationalCheck[] = [
    check(
      "full_render_provider",
      "Full-render provider (Kling / Veo / Runway / external)",
      providerHealth.fullRenderReady ? "PASS" : production ? "FAIL" : "WARN",
      providerHealth.fullRenderReady
        ? `Ready via ${providerHealth.fullRenderProvider}.`
        : "Set GEMINI_API_KEY/VEO_API_KEY, KLING_API_KEY, RUNWAY_API_KEY, or VIDEO_PROVIDER_API_KEY + BASE_URL.",
    ),
    check(
      "kling",
      "Kling",
      providerHealth.klingConfigured ? "PASS" : "WARN",
      providerHealth.klingConfigured ? "KLING_API_KEY set." : "KLING_API_KEY unset.",
    ),
    check(
      "veo",
      "Veo / Gemini",
      envProviderFlags().veo ? "PASS" : "WARN",
      envProviderFlags().veo ? "GEMINI_API_KEY or VEO_API_KEY set." : "Veo unset (optional if Kling/Runway configured).",
    ),
    check(
      "runway",
      "Runway",
      envProviderFlags().runway ? "PASS" : "WARN",
      envProviderFlags().runway ? "RUNWAY_API_KEY set." : "RUNWAY_API_KEY unset (optional fallback).",
    ),
    check(
      "heygen",
      "HeyGen avatar",
      providerHealth.avatarRenderReady ? "PASS" : envProviderFlags().heygen ? "WARN" : "WARN",
      providerHealth.avatarRenderReady
        ? "Avatar lane ready."
        : "Set HEYGEN_API_KEY, HEYGEN_AVATAR_ID, and HEYGEN_VOICE_ID for avatar renders.",
    ),
    check(
      "elevenlabs",
      "ElevenLabs / TTS",
      isTtsProviderConfigured() ? "PASS" : production ? "FAIL" : "WARN",
      isTtsProviderConfigured()
        ? `TTS via ${resolveTtsProviderId()}.`
        : "Set ELEVENLABS_API_KEY or OPENAI_API_KEY.",
    ),
    check(
      "ffmpeg_path",
      "FFMPEG_PATH",
      ffmpeg.available ? "PASS" : production ? "FAIL" : "WARN",
      ffmpeg.message,
    ),
    check(
      "ffmpeg_merge",
      "FFmpeg merge filters",
      ffmpegCapabilities.merge ? "PASS" : production ? "FAIL" : "WARN",
      ffmpegCapabilities.merge ? "xfade/concat available." : "FFmpeg cannot merge scenes.",
    ),
    check(
      "strict_mode",
      "VIDEO_PROVIDER_STRICT=1",
      isStrictVideoProviderMode() ? "PASS" : production ? "FAIL" : "WARN",
      isStrictVideoProviderMode() ? "Strict provider mode on." : "Set VIDEO_PROVIDER_STRICT=1.",
    ),
    check(
      "cron_secret",
      "VIDEO_STUDIO_CRON_SECRET",
      cronConfigured ? "PASS" : production ? "FAIL" : "WARN",
      cronConfigured
        ? "Cron worker secret configured."
        : "Unset — /api/video-studio/cron is disabled.",
    ),
    check(
      "service_role",
      "SUPABASE_SERVICE_ROLE_KEY",
      Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) ? "PASS" : production ? "FAIL" : "WARN",
      Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY?.trim())
        ? "Service role configured."
        : "Required for cron and private bucket admin.",
    ),
    check(
      "storage_bucket",
      `Private bucket "${VIDEO_STUDIO_BUCKET}"`,
      storage.bucketExists && storage.private ? "PASS" : "FAIL",
      storage.message,
    ),
    check(
      "storage_upload_signed",
      "Storage upload + signed download",
      storage.uploadOk && storage.signedUrlOk ? "PASS" : production ? "FAIL" : "WARN",
      storage.uploadOk && storage.signedUrlOk
        ? `Upload and signed URL ok (TTL ${storage.signedUrlTtlSec}s).`
        : storage.message,
    ),
    check(
      "storage_lifecycle",
      "Storage lifecycle / upload policy",
      storage.fileSizeLimitBytes != null && (storage.allowedMimeTypes?.length ?? 0) > 0
        ? "PASS"
        : "WARN",
      storage.fileSizeLimitBytes != null && (storage.allowedMimeTypes?.length ?? 0) > 0
        ? `file_size_limit=${storage.fileSizeLimitBytes}; mime allow-list set; objects expire via signed URLs (${storage.signedUrlTtlSec}s).`
        : "Apply migration 098 for file_size_limit and allowed_mime_types. Downloads use signed-URL expiry (7d).",
    ),
    check(
      "database",
      "Video Studio tables",
      database.videoMedia && database.videoRenderJobs && database.videoGenerations ? "PASS" : "FAIL",
      database.message,
    ),
  ];

  return {
    ok: blockers.length === 0,
    readyForProduction,
    blockers,
    warnings,
    operationalChecks,
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
    fullRenderProvider: providerHealth.fullRenderProvider,
    avatarProvider: providerHealth.avatarProvider,
    klingConfigured: providerHealth.klingConfigured,
    providerHealth,
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
