/**
 * Google Veo via Gemini API (predictLongRunning).
 * Uses GEMINI_API_KEY or VEO_API_KEY — never embeds secrets in code.
 */

import type {
  VideoProvider,
  VideoProviderClipRequest,
  VideoProviderClipResult,
} from "@/lib/ai-core/video-production-platform/providers/types";
import { classifyProviderHttpError } from "@/lib/ai-core/video-production-platform/providers/provider-errors";
import {
  PROVIDER_SUBMISSION_TIMEOUT_MS,
  VEO_QUOTA_COOLDOWN_MS,
} from "@/lib/ai-core/video-production-platform/runtime/timeouts";

const VEO_BASE =
  process.env.VEO_API_BASE_URL?.replace(/\/$/, "") ||
  "https://generativelanguage.googleapis.com/v1beta";

const DEFAULT_MODEL = process.env.VEO_MODEL || "veo-3.1-generate-preview";

const ALLOWED_DURATIONS = [4, 6, 8] as const;

export function veoApiKey(): string | null {
  const key = (process.env.VEO_API_KEY || process.env.GEMINI_API_KEY || "").trim();
  return key || null;
}

export function veoConfigured(): boolean {
  return Boolean(veoApiKey());
}

type VeoQuotaState = {
  exhaustedUntilMs: number;
  reason: string;
};

let veoQuotaState: VeoQuotaState | null = null;

export function resetVeoQuotaState(): void {
  veoQuotaState = null;
}

export function markVeoQuotaExhausted(reason: string, nowMs = Date.now()): void {
  veoQuotaState = {
    exhaustedUntilMs: nowMs + VEO_QUOTA_COOLDOWN_MS,
    reason,
  };
}

export function isVeoQuotaDegraded(nowMs = Date.now()): boolean {
  return Boolean(veoQuotaState && nowMs < veoQuotaState.exhaustedUntilMs);
}

export function getVeoGenerationAvailability(nowMs = Date.now()): {
  status: "ready" | "degraded" | "unconfigured";
  reason: string;
} {
  if (!veoConfigured()) {
    return { status: "unconfigured", reason: "GEMINI_API_KEY or VEO_API_KEY is not configured." };
  }
  if (isVeoQuotaDegraded(nowMs) && veoQuotaState) {
    return { status: "degraded", reason: veoQuotaState.reason };
  }
  return { status: "ready", reason: "Veo credentials are present." };
}

export function extractVeoOperationName(payload: Record<string, unknown>): string | undefined {
  const name = typeof payload.name === "string" ? payload.name.trim() : "";
  if (!name) return undefined;
  if (name.startsWith("operations/") || name.includes("/operations/")) return name;
  return undefined;
}

function snapDuration(durationSec: number): number {
  const rounded = Math.round(durationSec);
  let best: number = ALLOWED_DURATIONS[0];
  let delta = Math.abs(best - rounded);
  for (const value of ALLOWED_DURATIONS) {
    const next = Math.abs(value - rounded);
    if (next < delta) {
      best = value;
      delta = next;
    }
  }
  return best;
}

function normalizeAspectRatio(aspectRatio?: string): "16:9" | "9:16" {
  return aspectRatio === "9:16" ? "9:16" : "16:9";
}

function veoHeaders(key: string): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-goog-api-key": key,
  };
}

type VeoOperation = {
  name?: string;
  done?: boolean;
  error?: { message?: string; code?: number };
  response?: Record<string, unknown>;
};

function failedClip(
  classified: ReturnType<typeof classifyProviderHttpError>,
  extra: Partial<VideoProviderClipResult> = {},
): VideoProviderClipResult {
  if (classified.errorCode === "quota_exhausted") {
    markVeoQuotaExhausted(`Veo quota exhausted (HTTP ${classified.httpStatus}). ${classified.message}`);
  }
  return {
    provider: "veo",
    status: "failed",
    mimeType: "video/mp4",
    error: `HTTP ${classified.httpStatus} ${classified.providerStatus || classified.errorCode}: ${classified.message}`,
    errorCode: classified.errorCode,
    httpStatus: classified.httpStatus ?? undefined,
    message: classified.errorCode === "quota_exhausted"
      ? "Veo quota/billing exhausted. Provider is not ready."
      : "Veo job submission failed.",
    ...extra,
  };
}

function extractVideoUri(operation: VeoOperation): string | undefined {
  const response = operation.response;
  if (!response || typeof response !== "object") return undefined;

  const paths = [
    ["generateVideoResponse", "generatedSamples"],
    ["generatedVideos"],
    ["videos"],
  ] as const;

  for (const path of paths) {
    let cursor: unknown = response;
    for (const key of path) {
      cursor = (cursor as Record<string, unknown> | undefined)?.[key];
    }
    if (!Array.isArray(cursor)) continue;
    for (const sample of cursor) {
      if (!sample || typeof sample !== "object") continue;
      const row = sample as Record<string, unknown>;
      const video = row.video as Record<string, unknown> | undefined;
      const uri =
        (typeof video?.uri === "string" && video.uri) ||
        (typeof row.uri === "string" && row.uri) ||
        (typeof row.fileUri === "string" && row.fileUri);
      if (uri) return uri;
    }
  }
  return undefined;
}

async function downloadVeoVideo(uri: string, key: string): Promise<Uint8Array | null> {
  const headers = veoHeaders(key);
  if (uri.startsWith("http://") || uri.startsWith("https://")) {
    const res = await fetch(uri, { headers });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  }
  if (uri.startsWith("files/")) {
    const res = await fetch(`${VEO_BASE}/${uri}?alt=media`, { headers });
    if (!res.ok) return null;
    return new Uint8Array(await res.arrayBuffer());
  }
  return null;
}

async function fetchReferenceImage(imageUrl: string): Promise<{ bytesBase64Encoded: string; mimeType: string } | null> {
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return null;
    const mimeType = (res.headers.get("content-type") || "image/jpeg").split(";")[0].trim();
    if (!/^image\//i.test(mimeType)) return null;
    const bytes = new Uint8Array(await res.arrayBuffer());
    if (!bytes.byteLength) return null;
    return {
      bytesBase64Encoded: Buffer.from(bytes).toString("base64"),
      mimeType,
    };
  } catch {
    return null;
  }
}

export async function probeVeoHealth(): Promise<{ ok: boolean; reason: string }> {
  const availability = getVeoGenerationAvailability();
  if (availability.status === "unconfigured") {
    return { ok: false, reason: availability.reason };
  }
  if (availability.status === "degraded") {
    return { ok: false, reason: availability.reason };
  }
  const key = veoApiKey();
  if (!key) {
    return { ok: false, reason: "GEMINI_API_KEY or VEO_API_KEY is not configured." };
  }
  try {
    const res = await fetch(`${VEO_BASE}/models/${DEFAULT_MODEL}`, {
      headers: veoHeaders(key),
      signal: AbortSignal.timeout(PROVIDER_SUBMISSION_TIMEOUT_MS),
    });
    if (res.ok) return { ok: true, reason: "Veo model reachable. Generation quota is not confirmed until createJob." };
    if (res.status === 429) {
      const text = await res.text();
      const classified = classifyProviderHttpError({ httpStatus: res.status, body: text });
      markVeoQuotaExhausted(classified.message);
      return { ok: false, reason: classified.message };
    }
    if (res.status === 401 || res.status === 403) {
      return { ok: false, reason: `Veo API rejected credentials (HTTP ${res.status}).` };
    }
    if (res.status >= 500) {
      return { ok: false, reason: `Veo API degraded (HTTP ${res.status}).` };
    }
    const text = await res.text();
    return { ok: false, reason: `Veo health probe failed (HTTP ${res.status}): ${text.slice(0, 200)}` };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Veo health probe failed.";
    return { ok: false, reason: msg };
  }
}

export const veoVideoProvider: VideoProvider = {
  id: "veo",
  label: "Veo",
  configured: veoConfigured(),
  supportsImageToVideo: true,
  supportsAvatar: false,
  async generateClip(req: VideoProviderClipRequest): Promise<VideoProviderClipResult> {
    const key = veoApiKey();
    if (!key) {
      return {
        provider: "veo",
        status: "failed",
        mimeType: "video/mp4",
        error: "GEMINI_API_KEY or VEO_API_KEY not configured",
        errorCode: "unconfigured",
        message: "Veo not configured",
      };
    }

    try {
      const instance: Record<string, unknown> = { prompt: req.prompt.trim() };
      if (req.imageUrl) {
        const image = await fetchReferenceImage(req.imageUrl);
        if (image) instance.image = image;
      }

      const body = {
        instances: [instance],
        parameters: {
          aspectRatio: normalizeAspectRatio(req.aspectRatio),
          resolution: process.env.VEO_RESOLUTION || "720p",
          durationSeconds: snapDuration(req.durationSec),
          sampleCount: 1,
        },
      };

      const res = await fetch(`${VEO_BASE}/models/${DEFAULT_MODEL}:predictLongRunning`, {
        method: "POST",
        headers: veoHeaders(key),
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(PROVIDER_SUBMISSION_TIMEOUT_MS),
      });

      if (!res.ok) {
        const text = await res.text();
        return failedClip(classifyProviderHttpError({ httpStatus: res.status, body: text }));
      }

      const json = (await res.json()) as Record<string, unknown>;
      const operationName = extractVeoOperationName(json);
      if (!operationName) {
        return {
          provider: "veo",
          status: "failed",
          mimeType: "video/mp4",
          error: "Veo did not return an operation name.",
          errorCode: "invalid_request",
          message: "Veo job submission failed.",
        };
      }

      return {
        provider: "veo",
        status: "processing",
        externalJobId: operationName,
        mimeType: "video/mp4",
        message: "Veo long-running operation accepted.",
      };
    } catch (error) {
      const timeout = error instanceof Error && /timeout|aborted/i.test(error.message);
      return {
        provider: "veo",
        status: "failed",
        mimeType: "video/mp4",
        error: error instanceof Error ? error.message : "Veo request failed",
        errorCode: timeout ? "provider_timeout" : "provider_failed",
        message: timeout ? "Veo submission timed out." : (error instanceof Error ? error.message : "Veo request failed"),
      };
    }
  },
  async pollJob(externalJobId: string): Promise<VideoProviderClipResult> {
    const key = veoApiKey();
    if (!key) {
      return {
        provider: "veo",
        status: "failed",
        mimeType: "video/mp4",
        error: "GEMINI_API_KEY or VEO_API_KEY missing",
        errorCode: "unconfigured",
        message: "Veo not configured",
      };
    }

    const operationPath = externalJobId.replace(/^\//, "");

    try {
      const res = await fetch(`${VEO_BASE}/${operationPath}`, {
        headers: veoHeaders(key),
        signal: AbortSignal.timeout(PROVIDER_SUBMISSION_TIMEOUT_MS),
      });
      if (!res.ok) {
        const text = await res.text();
        return failedClip(classifyProviderHttpError({ httpStatus: res.status, body: text }), { externalJobId });
      }

      const operation = (await res.json()) as VeoOperation;
      if (operation.error?.message) {
        return {
          provider: "veo",
          status: "failed",
          externalJobId,
          mimeType: "video/mp4",
          error: operation.error.message,
          message: "Veo generation failed.",
        };
      }

      if (!operation.done) {
        return {
          provider: "veo",
          status: "processing",
          externalJobId,
          mimeType: "video/mp4",
          message: "Veo operation in progress.",
        };
      }

      const uri = extractVideoUri(operation);
      if (!uri) {
        return {
          provider: "veo",
          status: "failed",
          externalJobId,
          mimeType: "video/mp4",
          error: "Veo completed without a video URI.",
          message: "Veo returned no video output.",
        };
      }

      const bytes = await downloadVeoVideo(uri, key);
      if (bytes?.byteLength) {
        return {
          provider: "veo",
          status: "completed",
          externalJobId,
          remoteUrl: uri.startsWith("http") ? uri : undefined,
          bytes,
          mimeType: "video/mp4",
          message: "Veo clip ready.",
        };
      }

      if (uri.startsWith("http")) {
        return {
          provider: "veo",
          status: "completed",
          externalJobId,
          remoteUrl: uri,
          mimeType: "video/mp4",
          message: "Veo clip ready (remote URL).",
        };
      }

      return {
        provider: "veo",
        status: "failed",
        externalJobId,
        mimeType: "video/mp4",
        error: "Unable to download Veo output bytes.",
        message: "Veo download failed.",
      };
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Veo poll failed";
      return {
        provider: "veo",
        status: "failed",
        externalJobId,
        mimeType: "video/mp4",
        error: msg,
        message: msg,
      };
    }
  },
};
