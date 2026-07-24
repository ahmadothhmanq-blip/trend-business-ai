/**
 * Kling AI video provider adapter.
 * Docs: https://app.klingai.com/global/dev/document-api/apiReference
 */

import {
  isStrictVideoProviderMode,
  softFallbackClip,
} from "@/lib/ai-core/video-production-platform/providers/types";
import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";

const KLING_BASE =
  process.env.KLING_API_BASE_URL || "https://api.klingai.com/v1";

type KlingTaskPayload = {
  data?: {
    task_id?: string;
    task_status?: string;
    task_result?: { videos?: Array<{ url?: string; id?: string }> };
  };
  code?: number;
  message?: string;
};

function klingFailure(
  detail: string,
  externalJobId?: string,
): VideoProviderClipResult {
  if (isStrictVideoProviderMode()) {
    return {
      provider: "kling",
      status: "failed",
      externalJobId,
      mimeType: "video/mp4",
      error: detail.slice(0, 500),
      message: `Kling error (strict mode): ${detail.slice(0, 120)}`,
    };
  }
  return softFallbackClip("kling", "kling-fallback", detail);
}

function parseKlingJson(json: KlingTaskPayload): {
  taskId?: string;
  status: string;
  url?: string;
} {
  const taskId = json.data?.task_id;
  const status = (json.data?.task_status || "").toLowerCase();
  const url = json.data?.task_result?.videos?.[0]?.url;
  return { taskId, status, url };
}

async function pollKlingTask(
  key: string,
  externalJobId: string,
  kind: "text2video" | "image2video",
): Promise<VideoProviderClipResult> {
  const endpoints = [
    `${KLING_BASE}/videos/${kind}/${externalJobId}`,
    `${KLING_BASE}/videos/${externalJobId}`,
  ];

  let lastDetail = "Kling poll failed";

  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${key}` },
      });
      if (!res.ok) {
        lastDetail = `HTTP ${res.status} ${(await res.text()).slice(0, 200)}`;
        continue;
      }

      const json = (await res.json()) as KlingTaskPayload;
      const { status, url } = parseKlingJson(json);

      if ((status === "succeed" || status === "completed") && url) {
        return {
          provider: "kling",
          status: "completed",
          externalJobId,
          remoteUrl: url,
          mimeType: "video/mp4",
          message: "Kling task succeeded.",
        };
      }

      if (status === "failed" || status === "error") {
        const apiMsg = json.message || "Kling task failed";
        return klingFailure(apiMsg, externalJobId);
      }

      return {
        provider: "kling",
        status: "processing",
        externalJobId,
        mimeType: "video/mp4",
        message: `Kling status: ${status || "processing"}`,
      };
    } catch (error) {
      lastDetail = error instanceof Error ? error.message : "Kling poll failed";
    }
  }

  return {
    provider: "kling",
    status: "processing",
    externalJobId,
    mimeType: "video/mp4",
    message: lastDetail,
  };
}

export const klingVideoProvider: VideoProvider = {
  id: "kling",
  label: "Kling",
  configured: Boolean(process.env.KLING_API_KEY?.trim()),
  supportsImageToVideo: true,
  supportsAvatar: false,
  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    const key = process.env.KLING_API_KEY?.trim();
    if (!key) {
      return {
        provider: "kling",
        status: "failed",
        mimeType: "video/mp4",
        error: "KLING_API_KEY not configured",
        message: "Kling not configured — set KLING_API_KEY for full renders.",
      };
    }

    const kind = req.imageUrl ? "image2video" : "text2video";

    try {
      const endpoint = `${KLING_BASE}/videos/${kind}`;
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

      const raw = await res.text();
      if (!res.ok) {
        return klingFailure(`HTTP ${res.status} ${raw.slice(0, 300)}`);
      }

      let json: KlingTaskPayload;
      try {
        json = JSON.parse(raw) as KlingTaskPayload;
      } catch {
        return klingFailure(`Invalid JSON response: ${raw.slice(0, 200)}`);
      }

      const { taskId, status, url } = parseKlingJson(json);

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

      if (!taskId) {
        return klingFailure(
          `Kling API returned no task_id: ${raw.slice(0, 300)}`,
        );
      }

      if (status === "failed" || status === "error") {
        return klingFailure(json.message || "Kling task rejected", taskId);
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
      return klingFailure(msg);
    }
  },
  async pollJob(externalJobId: string): Promise<VideoProviderClipResult> {
    const key = process.env.KLING_API_KEY?.trim();
    if (!key) {
      return {
        provider: "kling",
        status: "failed",
        mimeType: "video/mp4",
        error: "KLING_API_KEY missing",
        message: "Kling not configured",
      };
    }
    // Try text2video poll path first (most common), then image2video, then legacy.
    const text = await pollKlingTask(key, externalJobId, "text2video");
    if (text.status !== "processing" || text.remoteUrl) return text;
    const image = await pollKlingTask(key, externalJobId, "image2video");
    return image;
  },
};
