/**
 * Pluggable video generation providers (Video Studio only).
 */

export type VideoProviderId = "preview" | "kling" | "runway" | "heygen" | "external";

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
  if (isStrictVideoProviderMode()) {
    return {
      provider,
      status: "failed",
      mimeType: "video/mp4",
      error: httpDetail.slice(0, 500),
      message: `${provider} error (strict mode)`,
    };
  }
  return {
    provider,
    status: "completed",
    bytes: minimalMp4Bytes(label),
    mimeType: "video/mp4",
    message: `${provider} fallback stub MP4. ${httpDetail.slice(0, 120)}`,
  };
}

export function envProviderFlags() {
  return {
    runway: Boolean(process.env.RUNWAY_API_KEY),
    kling: Boolean(process.env.KLING_API_KEY),
    heygen: Boolean(process.env.HEYGEN_API_KEY),
    external: Boolean(process.env.VIDEO_PROVIDER_API_KEY),
    baseUrl: process.env.VIDEO_PROVIDER_BASE_URL || "",
  };
}

export function resolvePreferredProviderId(): VideoProviderId {
  const f = envProviderFlags();
  if (f.heygen) return "heygen";
  if (f.kling) return "kling";
  if (f.runway) return "runway";
  if (f.external) return "external";
  return "preview";
}
