/**
 * Runway Gen-3 / text + image-to-video adapter.
 * Uses RUNWAY_API_KEY when present; fails honestly when unset or on HTTP errors.
 */

import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";
import { classifyProviderHttpError } from "@/lib/ai-core/video-production-platform/providers/provider-errors";

const RUNWAY_BASE =
  process.env.RUNWAY_API_BASE_URL || "https://api.dev.runwayml.com/v1";

function runwayHeaders(key: string): Record<string, string> {
  return {
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    "X-Runway-Version": process.env.RUNWAY_API_VERSION || "2024-11-06",
  };
}

function runwayRatio(aspectRatio?: string): string {
  return aspectRatio === "9:16" ? "768:1280" : "1280:768";
}

async function submitRunwayTask(
  key: string,
  endpoint: "text_to_video" | "image_to_video",
  body: Record<string, unknown>,
): Promise<VideoProviderClipResult> {
  const res = await fetch(`${RUNWAY_BASE}/${endpoint}`, {
    method: "POST",
    headers: runwayHeaders(key),
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    const classified = classifyProviderHttpError({ httpStatus: res.status, body: text });
    return {
      provider: "runway",
      status: "failed",
      mimeType: "video/mp4",
      error: `HTTP ${classified.httpStatus} ${classified.message}`,
      errorCode: classified.errorCode,
      httpStatus: classified.httpStatus ?? undefined,
      message: "Runway job submission failed.",
    };
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
}

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
        errorCode: "unconfigured",
        message: "Runway not configured",
      };
    }

    try {
      const duration = Math.min(10, Math.max(2, Math.round(req.durationSec)));
      const model = process.env.RUNWAY_MODEL || "gen3a_turbo";
      const ratio = runwayRatio(req.aspectRatio);

      if (req.imageUrl) {
        return submitRunwayTask(key, "image_to_video", {
          promptText: req.prompt,
          model,
          duration,
          ratio,
          promptImage: req.imageUrl,
        });
      }

      return submitRunwayTask(key, "text_to_video", {
        promptText: req.prompt,
        model,
        duration,
        ratio,
      });
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
        errorCode: "unconfigured",
        message: "Runway not configured",
      };
    }
    const res = await fetch(`${RUNWAY_BASE}/tasks/${externalJobId}`, {
      headers: runwayHeaders(key),
    });
    if (!res.ok) {
      const text = await res.text();
      const classified = classifyProviderHttpError({ httpStatus: res.status, body: text });
      return {
        provider: "runway",
        status: "failed",
        externalJobId,
        mimeType: "video/mp4",
        error: `HTTP ${classified.httpStatus} ${classified.message}`,
        errorCode: classified.errorCode,
        httpStatus: classified.httpStatus ?? undefined,
        message: "Runway poll failed.",
      };
    }
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
