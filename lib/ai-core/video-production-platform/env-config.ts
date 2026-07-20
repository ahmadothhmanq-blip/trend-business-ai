/**
 * Video Studio environment configuration — validation helpers (Video Studio only).
 */

export type VideoStudioEnvKey =
  | "KLING_API_KEY"
  | "RUNWAY_API_KEY"
  | "HEYGEN_API_KEY"
  | "HEYGEN_AVATAR_ID"
  | "HEYGEN_VOICE_ID"
  | "VIDEO_PROVIDER_API_KEY"
  | "VIDEO_PROVIDER_BASE_URL"
  | "ELEVENLABS_API_KEY"
  | "ELEVENLABS_VOICE_ID"
  | "OPENAI_API_KEY"
  | "FFMPEG_PATH"
  | "FFPROBE_PATH"
  | "VIDEO_PROVIDER_STRICT"
  | "VIDEO_STUDIO_STRICT"
  | "VIDEO_STUDIO_CRON_SECRET";

export type VideoStudioEnvStatus = {
  key: VideoStudioEnvKey;
  set: boolean;
  required: "production" | "optional" | "recommended";
  description: string;
};

const ENV_CATALOG: Array<Omit<VideoStudioEnvStatus, "set">> = [
  {
    key: "KLING_API_KEY",
    required: "optional",
    description: "Kling AI text/image-to-video generation.",
  },
  {
    key: "RUNWAY_API_KEY",
    required: "optional",
    description: "Runway Gen-3 image-to-video generation.",
  },
  {
    key: "HEYGEN_API_KEY",
    required: "recommended",
    description: "HeyGen avatar / talking-head video generation.",
  },
  {
    key: "HEYGEN_AVATAR_ID",
    required: "optional",
    description: "Default HeyGen avatar id (required for real avatars).",
  },
  {
    key: "HEYGEN_VOICE_ID",
    required: "optional",
    description: "Default HeyGen voice id for avatar scripts.",
  },
  {
    key: "VIDEO_PROVIDER_API_KEY",
    required: "optional",
    description: "Generic external video API bearer token.",
  },
  {
    key: "VIDEO_PROVIDER_BASE_URL",
    required: "optional",
    description: "Base URL for generic external video API.",
  },
  {
    key: "ELEVENLABS_API_KEY",
    required: "recommended",
    description: "ElevenLabs TTS (preferred voice provider).",
  },
  {
    key: "ELEVENLABS_VOICE_ID",
    required: "optional",
    description: "Default ElevenLabs voice id.",
  },
  {
    key: "OPENAI_API_KEY",
    required: "optional",
    description: "OpenAI TTS fallback when ElevenLabs is unset.",
  },
  {
    key: "FFMPEG_PATH",
    required: "production",
    description: "Path to ffmpeg binary for merge, mux, burn-in, trim, social re-encode.",
  },
  {
    key: "FFPROBE_PATH",
    required: "optional",
    description: "Path to ffprobe (defaults from FFMPEG_PATH).",
  },
  {
    key: "VIDEO_PROVIDER_STRICT",
    required: "recommended",
    description: "Set to 1 to fail instead of returning stub MP4 clips.",
  },
  {
    key: "VIDEO_STUDIO_STRICT",
    required: "optional",
    description: "Alias for VIDEO_PROVIDER_STRICT.",
  },
  {
    key: "VIDEO_STUDIO_CRON_SECRET",
    required: "recommended",
    description: "Bearer secret for /api/video-studio/cron background worker.",
  },
];

export function getVideoStudioEnvCatalog(): VideoStudioEnvStatus[] {
  return ENV_CATALOG.map((entry) => ({
    ...entry,
    set: Boolean(process.env[entry.key]?.trim()),
  }));
}

export function isVideoProviderKeyConfigured(): boolean {
  return Boolean(
    process.env.KLING_API_KEY?.trim() ||
      process.env.RUNWAY_API_KEY?.trim() ||
      process.env.HEYGEN_API_KEY?.trim() ||
      (process.env.VIDEO_PROVIDER_API_KEY?.trim() &&
        process.env.VIDEO_PROVIDER_BASE_URL?.trim()),
  );
}

export function isFfmpegPathConfigured(): boolean {
  return Boolean(
    process.env.FFMPEG_PATH?.trim() ||
      process.env.FFMPEG_BINARY?.trim(),
  );
}

export function validateVideoStudioProductionEnv(): {
  ok: boolean;
  blockers: string[];
  warnings: string[];
  catalog: VideoStudioEnvStatus[];
} {
  const catalog = getVideoStudioEnvCatalog();
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!isVideoProviderKeyConfigured()) {
    warnings.push(
      "No video provider API key configured — renders will use preview/stub clips.",
    );
  }

  if (!isFfmpegPathConfigured()) {
    warnings.push(
      "FFMPEG_PATH not set — install ffmpeg on PATH or set FFMPEG_PATH for assembly.",
    );
  }

  const ttsOk = Boolean(
    process.env.ELEVENLABS_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim(),
  );
  if (!ttsOk) {
    warnings.push("No TTS API key — voice synthesis returns silent preview WAV.");
  }

  if (
    process.env.VIDEO_PROVIDER_STRICT !== "1" &&
    process.env.VIDEO_STUDIO_STRICT !== "1"
  ) {
    warnings.push("Strict provider mode off — stub MP4 fallbacks are allowed.");
  }

  if (!process.env.VIDEO_STUDIO_CRON_SECRET?.trim()) {
    warnings.push("VIDEO_STUDIO_CRON_SECRET unset — cron worker endpoint disabled.");
  }

  const ok =
    blockers.length === 0 &&
    isVideoProviderKeyConfigured() &&
    (isFfmpegPathConfigured() || process.env.NODE_ENV !== "production");

  return { ok, blockers, warnings, catalog };
}

export const VIDEO_STUDIO_ENV_DOCS = `# Video Studio production environment
KLING_API_KEY=
RUNWAY_API_KEY=
HEYGEN_API_KEY=
HEYGEN_AVATAR_ID=
HEYGEN_VOICE_ID=
VIDEO_PROVIDER_API_KEY=
VIDEO_PROVIDER_BASE_URL=
ELEVENLABS_API_KEY=
ELEVENLABS_VOICE_ID=
OPENAI_API_KEY=
FFMPEG_PATH=
FFPROBE_PATH=
VIDEO_PROVIDER_STRICT=1
VIDEO_STUDIO_CRON_SECRET=
`;
