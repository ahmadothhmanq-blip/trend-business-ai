import type {
  LipSyncCapabilities,
  LipSyncCostEstimate,
  LipSyncHealth,
  LipSyncJobHandle,
  LipSyncJobRequest,
  LipSyncProvider,
  LipSyncProviderStatus,
} from "@/lib/ai-core/video-production-platform/lip-sync/contract";
import { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";
import {
  recallSucceededLipSyncJob,
  rememberSucceededLipSyncJob,
} from "@/lib/ai-core/video-production-platform/lip-sync/job-cache";

const HEYGEN_LIPSYNC_BASE = "https://api.heygen.com/v3";

export function heygenLipSyncConfigured(): boolean {
  return Boolean(process.env.HEYGEN_API_KEY?.trim());
}

function status(): LipSyncProviderStatus {
  return heygenLipSyncConfigured() ? "ready" : "unconfigured";
}

function capabilities(): LipSyncCapabilities {
  return {
    languages: ["en", "ar", "es", "fr", "de", "pt", "zh", "ja", "ko"],
    modes: ["speed", "precision"],
    requiresHttpsAssets: true,
    maxDurationSec: 60,
  };
}

function estimateCost(input: { durationSec: number }): LipSyncCostEstimate {
  const durationSec = Number.isFinite(input.durationSec) ? Math.max(0, input.durationSec) : 0;
  return {
    provider: "heygen",
    credits: Math.max(2, Math.ceil(durationSec / 4)),
    currency: "credits",
    durationSec,
  };
}

function health(): LipSyncHealth {
  return heygenLipSyncConfigured()
    ? { ok: true, status: "ready", reason: "HEYGEN_API_KEY is configured." }
    : { ok: false, status: "unconfigured", reason: "HEYGEN_API_KEY is not configured." };
}

function requireKey(): string {
  const key = process.env.HEYGEN_API_KEY?.trim() || "";
  if (!key) {
    throw new LipSyncError("HeyGen lip-sync is not configured. Set HEYGEN_API_KEY.", "unconfigured");
  }
  return key;
}

export function isPublicHttpsUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function failedHandle(idempotencyKey: string, message: string, errorCode = "provider_failed"): LipSyncJobHandle {
  return {
    provider: "heygen",
    status: "failed",
    idempotencyKey,
    message,
    errorCode,
  };
}

function looksLikeMp4(bytes: Uint8Array): boolean {
  return bytes.byteLength >= 12 && Buffer.from(bytes.subarray(4, 8)).toString("ascii") === "ftyp";
}

async function downloadPlayableVideo(url: string): Promise<{ bytes: Uint8Array; mimeType: "video/mp4" | "video/webm" } | null> {
  if (!isPublicHttpsUrl(url)) return null;
  const res = await fetch(url);
  if (!res.ok) return null;
  const bytes = new Uint8Array(await res.arrayBuffer());
  if (looksLikeMp4(bytes)) return { bytes, mimeType: "video/mp4" };
  if (bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return { bytes, mimeType: "video/webm" };
  }
  return null;
}

type HeyGenLipSyncPayload = {
  data?: {
    lipsync_id?: string;
    status?: string;
    video_url?: string;
    error?: { message?: string } | string;
    failure_message?: string;
  };
  error?: { message?: string } | string;
};

function payloadStatus(payload: HeyGenLipSyncPayload): string {
  return String(payload.data?.status || "").toLowerCase();
}

function payloadError(payload: HeyGenLipSyncPayload): string | null {
  const nested = payload.data?.failure_message || payload.data?.error;
  const top = payload.error;
  const raw = nested || top;
  if (!raw) return null;
  return typeof raw === "string" ? raw : raw.message || null;
}

async function materializeCompleted(
  payload: HeyGenLipSyncPayload,
  idempotencyKey: string,
  externalJobId: string,
): Promise<LipSyncJobHandle> {
  const videoUrl = payload.data?.video_url?.trim();
  if (!videoUrl) {
    return failedHandle(idempotencyKey, "HeyGen completed without a video_url.", "provider_failed");
  }
  const downloaded = await downloadPlayableVideo(videoUrl);
  if (!downloaded) {
    return failedHandle(
      idempotencyKey,
      "HeyGen returned a video URL that is not a playable MP4/WebM artifact.",
      "provider_failed",
    );
  }
  const handle: LipSyncJobHandle = {
    provider: "heygen",
    status: "succeeded",
    idempotencyKey,
    externalJobId,
    mimeType: downloaded.mimeType,
    bytes: downloaded.bytes,
    remoteUrl: videoUrl,
    message: "HeyGen lip-sync succeeded.",
  };
  rememberSucceededLipSyncJob(handle);
  return handle;
}

async function interpretPayload(
  payload: HeyGenLipSyncPayload,
  idempotencyKey: string,
  externalJobId: string,
): Promise<LipSyncJobHandle> {
  const statusName = payloadStatus(payload);
  if (statusName === "completed" || statusName === "success" || statusName === "succeeded") {
    return materializeCompleted(payload, idempotencyKey, externalJobId);
  }
  if (statusName === "failed" || statusName === "error" || statusName === "canceled" || statusName === "cancelled") {
    return failedHandle(
      idempotencyKey,
      payloadError(payload) || "HeyGen lip-sync failed.",
      "provider_failed",
    );
  }
  return {
    provider: "heygen",
    status: "processing",
    idempotencyKey,
    externalJobId,
    message: `HeyGen lip-sync ${statusName || "processing"}.`,
  };
}

export const heygenLipSyncProvider: LipSyncProvider = {
  id: "heygen",
  label: "HeyGen Lip Sync",
  status,
  capabilities,
  estimateCost,
  health,
  async createJob(request: LipSyncJobRequest): Promise<LipSyncJobHandle> {
    const cached = recallSucceededLipSyncJob("heygen", request.idempotencyKey);
    if (cached) return cached;
    const key = requireKey();
    if (!isPublicHttpsUrl(request.videoUrl) || !isPublicHttpsUrl(request.audioUrl)) {
      return failedHandle(
        request.idempotencyKey,
        "HeyGen lip-sync requires publicly reachable HTTPS video and audio URLs.",
        "invalid_input",
      );
    }
    try {
      const res = await fetch(`${HEYGEN_LIPSYNC_BASE}/lipsyncs`, {
        method: "POST",
        headers: {
          "X-Api-Key": key,
          "Content-Type": "application/json",
          "Idempotency-Key": request.idempotencyKey.slice(0, 255),
        },
        body: JSON.stringify({
          video: { type: "url", url: request.videoUrl },
          audio: { type: "url", url: request.audioUrl },
          mode: request.mode || "precision",
          ...(request.startSec != null ? { start_time: request.startSec } : {}),
          ...(request.endSec != null ? { end_time: request.endSec } : {}),
        }),
      });
      const payload = (await res.json().catch(() => ({}))) as HeyGenLipSyncPayload;
      if (!res.ok) {
        return failedHandle(
          request.idempotencyKey,
          payloadError(payload) || `HeyGen lip-sync failed (HTTP ${res.status}).`,
          "provider_failed",
        );
      }
      const lipsyncId = payload.data?.lipsync_id?.trim();
      if (!lipsyncId) {
        return failedHandle(request.idempotencyKey, "HeyGen did not return a lipsync_id.", "provider_failed");
      }
      return interpretPayload(payload, request.idempotencyKey, lipsyncId);
    } catch (error) {
      if (error instanceof LipSyncError) throw error;
      return failedHandle(
        request.idempotencyKey,
        error instanceof Error ? error.message : "HeyGen lip-sync failed.",
      );
    }
  },
  async pollJob(externalJobId: string, idempotencyKey: string): Promise<LipSyncJobHandle> {
    const cached = recallSucceededLipSyncJob("heygen", idempotencyKey);
    if (cached) return cached;
    const key = requireKey();
    try {
      const res = await fetch(`${HEYGEN_LIPSYNC_BASE}/lipsyncs/${encodeURIComponent(externalJobId)}`, {
        headers: { "X-Api-Key": key },
      });
      const payload = (await res.json().catch(() => ({}))) as HeyGenLipSyncPayload;
      if (!res.ok) {
        return failedHandle(
          idempotencyKey,
          payloadError(payload) || `HeyGen lip-sync poll failed (HTTP ${res.status}).`,
        );
      }
      return interpretPayload(payload, idempotencyKey, externalJobId);
    } catch (error) {
      if (error instanceof LipSyncError) throw error;
      return failedHandle(idempotencyKey, error instanceof Error ? error.message : "HeyGen lip-sync poll failed.");
    }
  },
};
