import type { TtsProviderId } from "@/lib/ai-core/video-production-platform/domain/audio";

export type TtsProviderStatus = "ready" | "unconfigured" | "degraded" | "down";

export type TtsCapabilities = {
  languages: string[];
  voices: Array<{ id: string; label: string; languages: string[] }>;
  maxChars: number;
};

export type TtsHealth = {
  ok: boolean;
  status: TtsProviderStatus;
  reason: string;
};

export type TtsCostEstimate = {
  provider: TtsProviderId;
  credits: number;
  currency: "credits";
  characters: number;
};

export type TtsJobRequest = {
  projectId: string;
  trackId: string;
  script: string;
  language: string;
  voiceId?: string;
  tone?: string;
  idempotencyKey: string;
};

export type TtsJobHandle = {
  provider: TtsProviderId;
  status: "queued" | "processing" | "succeeded" | "failed";
  idempotencyKey: string;
  mimeType?: "audio/mpeg" | "audio/wav" | "audio/ogg";
  bytes?: Uint8Array;
  durationSec?: number;
  message: string;
  errorCode?: string;
};

export type TtsProvider = {
  id: TtsProviderId;
  label: string;
  status(): TtsProviderStatus;
  capabilities(): TtsCapabilities;
  estimateCost(input: { characters: number }): TtsCostEstimate;
  health(): TtsHealth;
  createJob(request: TtsJobRequest): Promise<TtsJobHandle>;
  pollJob(externalJobId: string, idempotencyKey: string): Promise<TtsJobHandle>;
};
