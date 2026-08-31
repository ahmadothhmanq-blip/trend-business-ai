export const LIP_SYNC_PROVIDER_IDS = ["heygen"] as const;
export type LipSyncProviderId = (typeof LIP_SYNC_PROVIDER_IDS)[number];

export type LipSyncProviderStatus = "ready" | "unconfigured" | "degraded" | "down";

export type LipSyncCapabilities = {
  languages: string[];
  modes: Array<"speed" | "precision">;
  requiresHttpsAssets: true;
  maxDurationSec: number;
};

export type LipSyncHealth = {
  ok: boolean;
  status: LipSyncProviderStatus;
  reason: string;
};

export type LipSyncCostEstimate = {
  provider: LipSyncProviderId;
  credits: number;
  currency: "credits";
  durationSec: number;
};

export type LipSyncJobRequest = {
  projectId: string;
  videoUrl: string;
  audioUrl: string;
  speaker?: string;
  language?: string;
  startSec?: number | null;
  endSec?: number | null;
  mode?: "speed" | "precision";
  idempotencyKey: string;
};

export type LipSyncJobHandle = {
  provider: LipSyncProviderId;
  status: "queued" | "processing" | "succeeded" | "failed";
  idempotencyKey: string;
  externalJobId?: string;
  mimeType?: "video/mp4" | "video/webm";
  bytes?: Uint8Array;
  durationSec?: number;
  width?: number;
  height?: number;
  remoteUrl?: string;
  message: string;
  errorCode?: string;
};

export type LipSyncProvider = {
  id: LipSyncProviderId;
  label: string;
  status(): LipSyncProviderStatus;
  capabilities(): LipSyncCapabilities;
  estimateCost(input: { durationSec: number }): LipSyncCostEstimate;
  health(): LipSyncHealth;
  createJob(request: LipSyncJobRequest): Promise<LipSyncJobHandle>;
  pollJob(externalJobId: string, idempotencyKey: string): Promise<LipSyncJobHandle>;
};
