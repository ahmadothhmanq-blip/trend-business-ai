/**
 * Video Studio environment configuration — validation helpers (Video Studio only).
 */

export type VideoStudioEnvKey =
  | "GEMINI_API_KEY"
  | "VEO_API_KEY"
  | "VEO_MODEL"
  | "VEO_API_BASE_URL"
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
  | "FFMPEG_BINARY"
  | "FFPROBE_PATH"
  | "VIDEO_PROVIDER_STRICT"
  | "VIDEO_STUDIO_STRICT"
  | "VIDEO_STUDIO_CRON_SECRET"
  | "SUPABASE_SERVICE_ROLE_KEY";

export type VideoStudioEnvStatus = {
  key: VideoStudioEnvKey;
  set: boolean;
  required: "production" | "optional" | "recommended";
  description: string;
};

const ENV_CATALOG: Array<Omit<VideoStudioEnvStatus, "set">> = [
  {
    key: "GEMINI_API_KEY",
    required: "recommended",
    description: "Google Gemini API key — powers Veo text/image-to-video via predictLongRunning.",
  },
  {
    key: "VEO_API_KEY",
    required: "optional",
    description: "Optional dedicated Veo API key (falls back to GEMINI_API_KEY).",
  },
  {
    key: "VEO_MODEL",
    required: "optional",
    description: "Veo model id (default veo-3.1-generate-preview).",
  },
  {
    key: "KLING_API_KEY",
    required: "recommended",
    description: "Kling AI text/image-to-video — primary provider for full renders.",
  },
  {
    key: "RUNWAY_API_KEY",
    required: "optional",
    description: "Runway Gen-3 image-to-video generation.",
  },
  {
    key: "HEYGEN_API_KEY",
    required: "optional",
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
    key: "FFMPEG_BINARY",
    required: "optional",
    description: "Alias for FFMPEG_PATH.",
  },
  {
    key: "FFPROBE_PATH",
    required: "optional",
    description: "Path to ffprobe (defaults from FFMPEG_PATH).",
  },
  {
    key: "VIDEO_PROVIDER_STRICT",
    required: "production",
    description: "Must be 1 in production — fail instead of returning stub MP4 clips.",
  },
  {
    key: "VIDEO_STUDIO_STRICT",
    required: "optional",
    description: "Alias for VIDEO_PROVIDER_STRICT.",
  },
  {
    key: "VIDEO_STUDIO_CRON_SECRET",
    required: "production",
    description: "Bearer secret for /api/video-studio/cron background worker.",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    required: "production",
    description: "Service role for cron worker, private bucket admin, and signed media writes.",
  },
];

function envSet(key: string): boolean {
  return Boolean(process.env[key]?.trim());
}

/** Matches billing/site production: live NODE_ENV production, excluding Vercel preview. */
export function isVideoStudioProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview";
}

export function getVideoStudioEnvCatalog(): VideoStudioEnvStatus[] {
  return ENV_CATALOG.map((entry) => ({
    ...entry,
    set: envSet(entry.key),
  }));
}

export function isVideoProviderKeyConfigured(): boolean {
  return isFullRenderProviderConfigured() || envSet("HEYGEN_API_KEY");
}

export function isFullRenderProviderConfigured(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY?.trim() ||
      process.env.VEO_API_KEY?.trim() ||
      process.env.KLING_API_KEY?.trim() ||
      process.env.RUNWAY_API_KEY?.trim() ||
      (process.env.VIDEO_PROVIDER_API_KEY?.trim() && process.env.VIDEO_PROVIDER_BASE_URL?.trim()),
  );
}

export function isFfmpegPathConfigured(): boolean {
  return envSet("FFMPEG_PATH") || envSet("FFMPEG_BINARY");
}

export function isVideoStudioStrictModeConfigured(): boolean {
  return process.env.VIDEO_PROVIDER_STRICT === "1" || process.env.VIDEO_STUDIO_STRICT === "1";
}

export function isTtsKeyConfigured(): boolean {
  return envSet("ELEVENLABS_API_KEY") || envSet("OPENAI_API_KEY");
}

export function validateVideoStudioProductionEnv(options?: { forceProduction?: boolean }): {
  ok: boolean;
  production: boolean;
  blockers: string[];
  warnings: string[];
  catalog: VideoStudioEnvStatus[];
} {
  const catalog = getVideoStudioEnvCatalog();
  const blockers: string[] = [];
  const warnings: string[] = [];
  const production = Boolean(options?.forceProduction || isVideoStudioProductionRuntime());

  const push = (productionBlocker: boolean, message: string) => {
    if (production && productionBlocker) blockers.push(message);
    else warnings.push(message);
  };

  if (!isFullRenderProviderConfigured()) {
    push(
      true,
      "No full-render video provider configured. Set GEMINI_API_KEY/VEO_API_KEY, KLING_API_KEY, RUNWAY_API_KEY, or VIDEO_PROVIDER_API_KEY + VIDEO_PROVIDER_BASE_URL.",
    );
  } else if (!envSet("KLING_API_KEY") && !envSet("GEMINI_API_KEY") && !envSet("VEO_API_KEY")) {
    warnings.push(
      "KLING_API_KEY and Veo/Gemini unset — full renders will use Runway/external if configured, not Kling/Veo.",
    );
  }

  if (!isFfmpegPathConfigured()) {
    push(true, "FFMPEG_PATH is not set. Install ffmpeg and set FFMPEG_PATH (or FFMPEG_BINARY) for production assembly.");
  }

  if (!isTtsKeyConfigured()) {
    push(true, "No TTS API key — set ELEVENLABS_API_KEY (preferred) or OPENAI_API_KEY.");
  }

  if (!isVideoStudioStrictModeConfigured()) {
    push(true, "VIDEO_PROVIDER_STRICT must be 1 in production so provider errors cannot return stub MP4s.");
  }

  if (!envSet("VIDEO_STUDIO_CRON_SECRET")) {
    push(true, "VIDEO_STUDIO_CRON_SECRET unset — /api/video-studio/cron is disabled.");
  }

  if (!envSet("SUPABASE_SERVICE_ROLE_KEY")) {
    push(true, "SUPABASE_SERVICE_ROLE_KEY required for the cron worker and private video-studio bucket writes.");
  }

  if (envSet("HEYGEN_API_KEY") && (!envSet("HEYGEN_AVATAR_ID") || !envSet("HEYGEN_VOICE_ID"))) {
    warnings.push("HEYGEN_API_KEY is set but HEYGEN_AVATAR_ID or HEYGEN_VOICE_ID is missing — avatar lane is incomplete.");
  }

  return {
    ok: blockers.length === 0,
    production,
    blockers,
    warnings,
    catalog,
  };
}

/** Production paid-render block reason, or null when the operation may proceed. */
export function videoStudioProductionRenderBlockReason(options?: {
  forceProduction?: boolean;
}): string | null {
  const env = validateVideoStudioProductionEnv(options);
  if (!env.production || env.ok) return null;
  return env.blockers.join(" ");
}

export const VIDEO_STUDIO_ENV_DOCS = `# Video Studio production environment
# Required in production (fail-closed). Verify: npm run verify:video-studio

# Full render — configure at least one:
KLING_API_KEY=
# GEMINI_API_KEY=
# VEO_API_KEY=
# RUNWAY_API_KEY=
# VIDEO_PROVIDER_API_KEY=
# VIDEO_PROVIDER_BASE_URL=

# Avatar lane (optional)
# HEYGEN_API_KEY=
# HEYGEN_AVATAR_ID=
# HEYGEN_VOICE_ID=

# Voice / TTS (required in production)
ELEVENLABS_API_KEY=
# OPENAI_API_KEY=

# Assembly (required in production)
FFMPEG_PATH=

# Production hardening (required in production)
VIDEO_PROVIDER_STRICT=1
VIDEO_STUDIO_CRON_SECRET=
SUPABASE_SERVICE_ROLE_KEY=
`;
