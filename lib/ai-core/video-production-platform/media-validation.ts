/**
 * Clip / composite validation — keep stub media out of production renders.
 * FFmpeg assembly is unchanged; guards run before clips reach assembleComposite().
 */

import type {
  VideoMediaAsset,
  VideoRenderJob,
  VideoRenderClip,
} from "@/lib/ai-core/video-production-platform/types";
import {
  isStrictVideoProviderMode,
  isStubVideoBytes,
} from "@/lib/ai-core/video-production-platform/providers/types";

export function isPlayableVideoMime(mime?: string | null): boolean {
  if (!mime) return false;
  const normalized = mime.split(";")[0].trim().toLowerCase();
  return normalized === "video/mp4" || normalized === "video/webm";
}

export function isProductionRenderMode(mode: VideoRenderJob["mode"]): boolean {
  return (
    mode === "full" ||
    mode === "avatar" ||
    mode === "image-to-video" ||
    mode === "batch-item"
  );
}

/** Paid / production renders may only complete via FFmpeg assembly, never first-clip or manifest-only. */
export function isFfmpegAssemblyMethod(method?: string | null): boolean {
  return method === "ffmpeg";
}

export function validateClipMediaForRender(params: {
  bytes?: Uint8Array | null;
  provider: string;
  mimeType?: string;
  mode: VideoRenderJob["mode"];
}): { valid: boolean; error?: string } {
  if (!isProductionRenderMode(params.mode)) {
    return { valid: true };
  }

  if (params.provider === "preview" || params.provider === "preview-stub") {
    return {
      valid: false,
      error:
        "Preview provider cannot produce production clips. Set KLING_API_KEY for full renders.",
    };
  }

  if (params.mimeType?.includes("image/svg")) {
    return {
      valid: false,
      error: "SVG poster placeholders cannot be used in production assembly.",
    };
  }

  if (params.bytes && isStubVideoBytes(params.bytes)) {
    const strict = isStrictVideoProviderMode();
    return {
      valid: false,
      error: strict
        ? "Stub MP4 rejected (VIDEO_PROVIDER_STRICT=1). Configure KLING_API_KEY and verify provider API access."
        : "Stub MP4 rejected for production render. Configure KLING_API_KEY for real video clips.",
    };
  }

  return { valid: true };
}

export function isRealProductionClipAsset(
  asset: VideoMediaAsset | undefined | null,
): boolean {
  if (!asset?.url) return false;
  if (asset.provider === "preview" || asset.provider === "preview-stub") return false;
  if (asset.mimeType?.includes("image/svg")) return false;
  if (!asset.mimeType?.includes("video")) return false;
  return true;
}

export function filterClipsForProductionAssembly(params: {
  clips: VideoRenderClip[];
  mode: VideoRenderJob["mode"];
}): {
  eligible: VideoRenderClip[];
  skipped: number;
  message?: string;
} {
  const completed = params.clips.filter(
    (c) => c.status === "completed" && c.asset?.url,
  );

  if (!isProductionRenderMode(params.mode)) {
    return { eligible: completed, skipped: 0 };
  }

  const eligible = completed.filter((c) => isRealProductionClipAsset(c.asset));
  const skipped = completed.length - eligible.length;

  if (skipped > 0 && eligible.length === 0) {
    return {
      eligible: [],
      skipped,
      message:
        "No real video clips available for assembly. Configure KLING_API_KEY and re-run full render.",
    };
  }

  if (skipped > 0) {
    return {
      eligible,
      skipped,
      message: `${skipped} stub clip(s) excluded from FFmpeg assembly.`,
    };
  }

  return { eligible, skipped: 0 };
}
