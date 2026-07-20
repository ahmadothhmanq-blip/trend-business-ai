/**
 * Runway Gen-3 / image-to-video style adapter.
 * Uses RUNWAY_API_KEY when present; falls back to structured failure for queue retry.
 */

import { softFallbackClip } from "@/lib/ai-core/video-production-platform/providers/types";
import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";

const RUNWAY_BASE =
  process.env.RUNWAY_API_BASE_URL || "https://api.dev.runwayml.com/v1";

export const runwayVideoProvider: VideoProvider = {
  id: "runway",
  label: "Runway",
  configured: Boolean(process.env.RUNWAY_API_KEY),
  supportsImageToVideo: true,
  supportsAvatar: false,
  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    const key = process.env.RUNWAY_API_KEY;
    if (!key) {
      return {
        provider: "runway",
        status: "failed",
        mimeType: "video/mp4",
        error: "RUNWAY_API_KEY not configured",
        message: "Runway not configured",
      };
    }

    try {
      const body: Record<string, unknown> = {
        promptText: req.prompt,
        model: process.env.RUNWAY_MODEL || "gen3a_turbo",
        duration: Math.min(10, Math.max(2, Math.round(req.durationSec))),
        ratio: req.aspectRatio === "9:16" ? "768:1280" : "1280:768",
      };
      if (req.imageUrl) body.promptImage = req.imageUrl;

      const res = await fetch(`${RUNWAY_BASE}/image_to_video`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          "X-Runway-Version": process.env.RUNWAY_API_VERSION || "2024-11-06",
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const text = await res.text();
        return softFallbackClip("runway", "runway-fallback", `HTTP ${res.status} ${text}`);
      }

      const json = (await res.json()) as { id?: string; output?: string[] };
      if (json.id && !json.output?.[0]) {
        return {
          provider: "runway",
          status: "processing",
          externalJobId: json.id,
          mimeType: "video/mp4",
          message: "Runway job accepted; poll for completion.",
        };
      }
      const remoteUrl = json.output?.[0];
      return {
        provider: "runway",
        status: remoteUrl ? "completed" : "processing",
        externalJobId: json.id,
        remoteUrl,
        mimeType: "video/mp4",
        message: remoteUrl ? "Runway clip ready." : "Runway processing.",
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Runway request failed";
      return {
        provider: "runway",
        status: "failed",
        mimeType: "video/mp4",
        error: msg,
        message: msg,
      };
    }
  },
  async pollJob(externalJobId: string): Promise<VideoProviderClipResult> {
    const key = process.env.RUNWAY_API_KEY;
    if (!key) {
      return {
        provider: "runway",
        status: "failed",
        mimeType: "video/mp4",
        error: "RUNWAY_API_KEY missing",
        message: "Not configured",
      };
    }
    const res = await fetch(`${RUNWAY_BASE}/tasks/${externalJobId}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        "X-Runway-Version": process.env.RUNWAY_API_VERSION || "2024-11-06",
      },
    });
    const json = (await res.json()) as {
      status?: string;
      output?: string[];
      failure?: string;
    };
    if (json.status === "SUCCEEDED" && json.output?.[0]) {
      return {
        provider: "runway",
        status: "completed",
        externalJobId,
        remoteUrl: json.output[0],
        mimeType: "video/mp4",
        message: "Runway task succeeded.",
      };
    }
    if (json.status === "FAILED") {
      return {
        provider: "runway",
        status: "failed",
        externalJobId,
        mimeType: "video/mp4",
        error: json.failure || "failed",
        message: "Runway task failed.",
      };
    }
    return {
      provider: "runway",
      status: "processing",
      externalJobId,
      mimeType: "video/mp4",
      message: `Runway status: ${json.status || "processing"}`,
    };
  },
};
