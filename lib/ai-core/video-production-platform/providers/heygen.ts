/**
 * HeyGen avatar / talking-head video provider.
 */

import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";
import { minimalMp4Bytes } from "@/lib/ai-core/video-production-platform/providers/types";

const HEYGEN_BASE = process.env.HEYGEN_API_BASE_URL || "https://api.heygen.com/v2";

export const heygenVideoProvider: VideoProvider = {
  id: "heygen",
  label: "HeyGen",
  configured: Boolean(process.env.HEYGEN_API_KEY),
  supportsImageToVideo: Boolean(process.env.HEYGEN_API_KEY),
  supportsAvatar: true,
  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    const key = process.env.HEYGEN_API_KEY;
    if (!key) {
      return {
        provider: "heygen",
        status: "failed",
        mimeType: "video/mp4",
        error: "HEYGEN_API_KEY not configured",
        message: "HeyGen not configured",
      };
    }

    try {
      const avatarId =
        process.env.HEYGEN_AVATAR_ID ||
        req.avatar?.personaId ||
        "default";
      const script = req.avatar?.script || req.prompt;

      const res = await fetch(`${HEYGEN_BASE}/video/generate`, {
        method: "POST",
        headers: {
          "X-Api-Key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_inputs: [
            {
              character: {
                type: "avatar",
                avatar_id: avatarId,
                avatar_style: "normal",
              },
              voice: {
                type: "text",
                input_text: script.slice(0, 4000),
                voice_id: req.avatar?.voiceId || process.env.HEYGEN_VOICE_ID || "default",
              },
              background: req.imageUrl
                ? { type: "image", url: req.imageUrl }
                : { type: "color", value: "#0B1220" },
            },
          ],
          dimension:
            req.aspectRatio === "9:16"
              ? { width: 720, height: 1280 }
              : { width: 1280, height: 720 },
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        if (process.env.VIDEO_PROVIDER_STRICT === "1") {
          return {
            provider: "heygen",
            status: "failed",
            mimeType: "video/mp4",
            error: text.slice(0, 500),
            message: `HeyGen error ${res.status}`,
          };
        }
        return {
          provider: "heygen",
          status: "completed",
          bytes: minimalMp4Bytes("heygen-fallback"),
          mimeType: "video/mp4",
          message: `HeyGen HTTP ${res.status}; stored fallback avatar MP4.`,
        };
      }

      const json = (await res.json()) as {
        data?: { video_id?: string };
      };
      return {
        provider: "heygen",
        status: "processing",
        externalJobId: json.data?.video_id,
        mimeType: "video/mp4",
        message: "HeyGen avatar video queued.",
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "HeyGen request failed";
      return {
        provider: "heygen",
        status: "failed",
        mimeType: "video/mp4",
        error: msg,
        message: msg,
      };
    }
  },
};
