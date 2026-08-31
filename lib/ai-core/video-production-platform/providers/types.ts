/**
 * Pluggable video generation providers (Video Studio only).
 */

export type VideoProviderId =
  | "preview"
  | "veo"
  | "omni_flash"
  | "kling"
  | "runway"
  | "heygen"
  | "external";

/** Render modes that influence provider routing (mirrors VideoRenderJob.mode). */
export type VideoProviderRenderMode =
  | "preview"
  | "full"
  | "batch-item"
  | "image-to-video"
  | "avatar";

export type VideoProviderResolution = {
  providerId: VideoProviderId;
  error?: string;
};

export type VideoProviderClipRequest = {
  prompt: string;
  durationSec: number;
  aspectRatio: string;
  imageUrl?: string | null;
  /** Avatar / presenter mode */
  avatar?: {
    personaId: string;
    script: string;
    voiceId?: string;
  };
  width?: number;
  height?: number;
};

export type VideoProviderClipResult = {
  provider: VideoProviderId;
  externalJobId?: string;
  status: "completed" | "processing" | "failed";
  /** Remote URL from provider, if any */
  remoteUrl?: string;
  /** Raw bytes when provider returns binary or we synthesize */
  bytes?: Uint8Array;
  mimeType: "video/mp4" | "video/webm";
  posterUrl?: string;
  error?: string;
  errorCode?: string;
  httpStatus?: number;
  message: string;
};

export type VideoProvider = {
  id: VideoProviderId;
  label: string;
  configured: boolean;
  supportsImageToVideo: boolean;
  supportsAvatar: boolean;
  generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult>;
  pollJob?(externalJobId: string): Promise<VideoProviderClipResult>;
};

/** Tiny valid-ish MP4 placeholder (ftyp+mdat minimal) for offline/full stub renders. */
export function minimalMp4Bytes(label = "clip"): Uint8Array {
  // Prefer real provider bytes; this is a deterministic non-empty MP4-like container
  // used only when no provider returns media so storage always gets a file.
  const encoder = new TextEncoder();
  const note = encoder.encode(`TB-AI-VIDEO:${label}`.slice(0, 64));
  // Minimal ISO BMFF: ftyp + free + mdat
  const ftyp = new Uint8Array([
    0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d, 0x00, 0x00, 0x02, 0x00,
    0x69, 0x73, 0x6f, 0x6d, 0x69, 0x73, 0x6f, 0x32,
  ]);
  const mdatSize = 8 + note.length;
  const mdatHeader = new Uint8Array(8);
  const view = new DataView(mdatHeader.buffer);
  view.setUint32(0, mdatSize);
  mdatHeader[4] = 0x6d;
  mdatHeader[5] = 0x64;
  mdatHeader[6] = 0x61;
  mdatHeader[7] = 0x74;
  const out = new Uint8Array(ftyp.length + mdatHeader.length + note.length);
  out.set(ftyp, 0);
  out.set(mdatHeader, ftyp.length);
  out.set(note, ftyp.length + mdatHeader.length);
  return out;
}

/** When true, providers must fail instead of returning stub MP4 fallbacks. */
export function isStrictVideoProviderMode(): boolean {
  return (
    process.env.VIDEO_PROVIDER_STRICT === "1" ||
    process.env.VIDEO_STUDIO_STRICT === "1"
  );
}

/** Detect stub/minimal placeholder MP4s (not real generated media). */
export function isStubVideoBytes(bytes: Uint8Array | undefined | null): boolean {
  if (!bytes || bytes.byteLength < 24) return true;
  if (bytes.byteLength > 4096) return false;
  try {
    const text = new TextDecoder().decode(bytes);
    return text.includes("TB-AI-VIDEO:");
  } catch {
    return bytes.byteLength < 512;
  }
}

export function softFallbackClip(
  provider: VideoProviderId,
  label: string,
  httpDetail: string,
): VideoProviderClipResult {
  void label;
  return {
    provider,
    status: "failed",
    mimeType: "video/mp4",
    error: httpDetail.slice(0, 500),
    message: `${provider} failed. Stub MP4 fallbacks are disabled.`,
  };
}

export function envProviderFlags() {
  return {
    veo: Boolean(process.env.VEO_API_KEY || process.env.GEMINI_API_KEY),
    omni_flash: Boolean(process.env.GEMINI_API_KEY),
    runway: Boolean(process.env.RUNWAY_API_KEY),
    kling: Boolean(process.env.KLING_API_KEY),
    heygen: Boolean(process.env.HEYGEN_API_KEY),
    external: Boolean(process.env.VIDEO_PROVIDER_API_KEY),
    baseUrl: process.env.VIDEO_PROVIDER_BASE_URL || "",
  };
}

/**
 * Default provider for health checks and legacy callers (scene / full render lane).
 * Avatar renders must use resolveVideoProviderForMode("avatar").
 */
export function resolvePreferredProviderId(): VideoProviderId {
  const f = envProviderFlags();
  if (f.veo) return "veo";
  if (f.omni_flash) return "omni_flash";
  if (f.kling) return "kling";
  if (f.runway) return "runway";
  if (f.external) return "external";
  if (f.heygen) return "heygen";
  return "preview";
}

/**
 * Mode-based provider routing:
 * - preview → preview stub
 * - full / image-to-video / batch-item → Kling (primary), then Runway, external; preview if unset
 * - avatar → HeyGen only
 */
export function resolveVideoProviderForMode(
  mode: VideoProviderRenderMode = "full",
  explicitId?: VideoProviderId | string,
): VideoProviderResolution {
  const validIds: VideoProviderId[] = [
    "preview",
    "veo",
    "kling",
    "runway",
    "heygen",
    "external",
  ];

  if (explicitId && validIds.includes(explicitId as VideoProviderId)) {
    const id = explicitId as VideoProviderId;
    if (id === "preview") {
      if (mode === "preview") return { providerId: "preview" };
      return {
        providerId: "preview",
        error:
          "Preview provider cannot be used for production video. Configure KLING_API_KEY or RUNWAY_API_KEY.",
      };
    }
    const configured = envProviderFlags();
    const isConfigured =
      (id === "veo" && configured.veo) ||
      (id === "kling" && configured.kling) ||
      (id === "runway" && configured.runway) ||
      (id === "heygen" && configured.heygen) ||
      (id === "external" && configured.external);
    if (!isConfigured) {
      return {
        providerId: id,
        error: `${id} provider requested but API key is not configured.`,
      };
    }
    return { providerId: id };
  }

  if (mode === "preview") {
    return { providerId: "preview" };
  }

  if (mode === "avatar") {
    if (envProviderFlags().heygen) {
      return { providerId: "heygen" };
    }
    return {
      providerId: "heygen",
      error:
        "Avatar render requires HEYGEN_API_KEY plus HEYGEN_AVATAR_ID and HEYGEN_VOICE_ID.",
    };
  }

  // full, image-to-video, batch-item — Veo/Runway/Kling priority. Never fall back to preview.
  const f = envProviderFlags();
  if (f.veo) return { providerId: "veo" };
  if (f.kling) return { providerId: "kling" };
  if (f.runway) return { providerId: "runway" };
  if (f.external) return { providerId: "external" };

  return {
    providerId: "runway",
    error:
      "Full render requires GEMINI_API_KEY/VEO_API_KEY, KLING_API_KEY, or RUNWAY_API_KEY. Preview stubs cannot be used for production video.",
  };
}
