/**
 * Generic external video provider (VIDEO_PROVIDER_API_KEY + BASE_URL).
 */

import { softFallbackClip } from "@/lib/ai-core/video-production-platform/providers/types";
import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";

export const externalVideoProvider: VideoProvider = {
  id: "external",
  label: "External Video API",
  configured: Boolean(
    process.env.VIDEO_PROVIDER_API_KEY && process.env.VIDEO_PROVIDER_BASE_URL,
  ),
  supportsImageToVideo: true,
  supportsAvatar: true,
  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    const key = process.env.VIDEO_PROVIDER_API_KEY;
    const base = process.env.VIDEO_PROVIDER_BASE_URL;
    if (!key || !base) {
      return {
        provider: "external",
        status: "failed",
        mimeType: "video/mp4",
        error: "VIDEO_PROVIDER_API_KEY / BASE_URL missing",
        message: "External provider not configured",
      };
    }

    try {
      const res = await fetch(`${base.replace(/\/$/, "")}/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(req),
      });
      if (!res.ok) {
        const text = await res.text();
        return softFallbackClip(
          "external",
          "external-fallback",
          `HTTP ${res.status} ${text}`,
        );
      }
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("video/")) {
        const buf = new Uint8Array(await res.arrayBuffer());
        return {
          provider: "external",
          status: "completed",
          bytes: buf,
          mimeType: contentType.includes("webm") ? "video/webm" : "video/mp4",
          message: "External provider returned video bytes.",
        };
      }
      const json = (await res.json()) as {
        url?: string;
        jobId?: string;
        status?: string;
      };
      if (json.url) {
        return {
          provider: "external",
          status: "completed",
          remoteUrl: json.url,
          mimeType: "video/mp4",
          message: "External provider returned URL.",
        };
      }
      return {
        provider: "external",
        status: "processing",
        externalJobId: json.jobId,
        mimeType: "video/mp4",
        message: "External job accepted.",
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "External failed";
      return {
        provider: "external",
        status: "failed",
        mimeType: "video/mp4",
        error: msg,
        message: msg,
      };
    }
  },
  async pollJob(externalJobId: string): Promise<VideoProviderClipResult> {
    const key = process.env.VIDEO_PROVIDER_API_KEY;
    const base = process.env.VIDEO_PROVIDER_BASE_URL;
    if (!key || !base) {
      return {
        provider: "external",
        status: "failed",
        mimeType: "video/mp4",
        error: "External provider not configured",
        message: "Not configured",
      };
    }
    try {
      const res = await fetch(
        `${base.replace(/\/$/, "")}/jobs/${encodeURIComponent(externalJobId)}`,
        { headers: { Authorization: `Bearer ${key}` } },
      );
      if (!res.ok) {
        return {
          provider: "external",
          status: "processing",
          externalJobId,
          mimeType: "video/mp4",
          message: `External poll HTTP ${res.status}`,
        };
      }
      const json = (await res.json()) as {
        status?: string;
        url?: string;
        error?: string;
      };
      const status = (json.status || "").toLowerCase();
      if ((status === "completed" || status === "done" || status === "succeeded") && json.url) {
        return {
          provider: "external",
          status: "completed",
          externalJobId,
          remoteUrl: json.url,
          mimeType: "video/mp4",
          message: "External job completed.",
        };
      }
      if (status === "failed" || status === "error") {
        return {
          provider: "external",
          status: "failed",
          externalJobId,
          mimeType: "video/mp4",
          error: json.error || "failed",
          message: "External job failed.",
        };
      }
      return {
        provider: "external",
        status: "processing",
        externalJobId,
        mimeType: "video/mp4",
        message: `External status: ${status || "processing"}`,
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "External poll failed";
      return {
        provider: "external",
        status: "failed",
        externalJobId,
        mimeType: "video/mp4",
        error: msg,
        message: msg,
      };
    }
  },
};
