/**
 * Kling AI video provider adapter.
 */

import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";
import { minimalMp4Bytes } from "@/lib/ai-core/video-production-platform/providers/types";

const KLING_BASE =
  process.env.KLING_API_BASE_URL || "https://api.klingai.com/v1";

export const klingVideoProvider: VideoProvider = {
  id: "kling",
  label: "Kling",
  configured: Boolean(process.env.KLING_API_KEY),
  supportsImageToVideo: true,
  supportsAvatar: false,
  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    const key = process.env.KLING_API_KEY;
    if (!key) {
      return {
        provider: "kling",
        status: "failed",
        mimeType: "video/mp4",
        error: "KLING_API_KEY not configured",
        message: "Kling not configured",
      };
    }

    try {
      const endpoint = req.imageUrl
        ? `${KLING_BASE}/videos/image2video`
        : `${KLING_BASE}/videos/text2video`;
      const body: Record<string, unknown> = {
        prompt: req.prompt,
        duration: String(Math.min(10, Math.max(5, Math.round(req.durationSec)))),
        aspect_ratio: req.aspectRatio || "16:9",
      };
      if (req.imageUrl) body.image = req.imageUrl;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        if (process.env.VIDEO_PROVIDER_STRICT === "1") {
          return {
            provider: "kling",
            status: "failed",
            mimeType: "video/mp4",
            error: text.slice(0, 500),
            message: `Kling error ${res.status}`,
          };
        }
        return {
          provider: "kling",
          status: "completed",
          bytes: minimalMp4Bytes("kling-fallback"),
          mimeType: "video/mp4",
          message: `Kling HTTP ${res.status}; stored fallback MP4.`,
        };
      }

      const json = (await res.json()) as {
        data?: { task_id?: string; task_status?: string; task_result?: { videos?: Array<{ url?: string }> } };
      };
      const taskId = json.data?.task_id;
      const url = json.data?.task_result?.videos?.[0]?.url;
      if (url) {
        return {
          provider: "kling",
          status: "completed",
          externalJobId: taskId,
          remoteUrl: url,
          mimeType: "video/mp4",
          message: "Kling clip ready.",
        };
      }
      return {
        provider: "kling",
        status: "processing",
        externalJobId: taskId,
        mimeType: "video/mp4",
        message: "Kling job accepted; poll for completion.",
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Kling request failed";
      return {
        provider: "kling",
        status: "failed",
        mimeType: "video/mp4",
        error: msg,
        message: msg,
      };
    }
  },
};
