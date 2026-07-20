import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";
import { minimalMp4Bytes } from "@/lib/ai-core/video-production-platform/providers/types";

export const previewVideoProvider: VideoProvider = {
  id: "preview",
  label: "Preview Stub",
  configured: true,
  supportsImageToVideo: true,
  supportsAvatar: true,
  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    return {
      provider: "preview",
      status: "completed",
      bytes: minimalMp4Bytes(req.prompt.slice(0, 40) || "preview"),
      mimeType: "video/mp4",
      message: req.imageUrl
        ? "Preview image-to-video clip synthesized (no external provider)."
        : req.avatar
          ? "Preview avatar clip synthesized (no external provider)."
          : "Preview text-to-video clip synthesized (no external provider).",
    };
  },
};
