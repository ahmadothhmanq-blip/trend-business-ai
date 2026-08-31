import type { ProductionVideoProvider } from "@/lib/ai-core/video-production-platform/domain/contracts";

export const PROVIDER_V2_IDS = [
  "veo",
  "omni_flash",
  "kling",
  "runway",
  "heygen",
  "external",
] as const;
export type ProviderV2Id = (typeof PROVIDER_V2_IDS)[number];

export type ProviderV2Status = "ready" | "unconfigured" | "degraded" | "down";

export type ProviderCapability = {
  textToVideo: boolean;
  imageToVideo: boolean;
  avatar: boolean;
  audio: boolean;
  maxDurationSec: number;
};

export type ProviderHealth = {
  ok: boolean;
  status: ProviderV2Status;
  reason: string;
};

export type ProviderCostEstimate = {
  provider: ProviderV2Id;
  credits: number;
  currency: "credits";
  durationSec: number;
  quality: RouterQuality;
};

export type ProviderJobRequest = {
  projectId: string;
  sceneId: string;
  prompt: string;
  promptHash: string;
  durationSec: number;
  aspectRatio?: string;
  imageUrl?: string | null;
  avatar?: { personaId?: string; script?: string };
  idempotencyKey: string;
};

export type ProviderJobHandle = {
  provider: ProviderV2Id;
  status: "queued" | "submitted" | "processing" | "succeeded" | "failed" | "cancelled";
  externalJobId?: string;
  idempotencyKey: string;
  message: string;
  mimeType?: string;
  remoteUrl?: string;
  bytes?: Uint8Array;
  errorCode?: string;
};

export type VideoProviderV2 = {
  id: ProviderV2Id;
  label: string;
  status(): ProviderV2Status;
  capabilities(): ProviderCapability;
  estimateCost(input: { durationSec: number; quality: RouterQuality; avatarRequired?: boolean }): ProviderCostEstimate;
  health(): ProviderHealth;
  createJob(request: ProviderJobRequest): Promise<ProviderJobHandle>;
  pollJob(externalJobId: string, idempotencyKey: string): Promise<ProviderJobHandle>;
  cancelJob(externalJobId: string, idempotencyKey: string): Promise<ProviderJobHandle>;
};

export type RouterTask = "text-to-video" | "image-to-video" | "avatar" | "scene";
export type RouterQuality = "draft" | "standard" | "high";
export type RouterLatencyTarget = "fast" | "balanced" | "quality";

export type ModelRouterInput = {
  task: RouterTask;
  quality: RouterQuality;
  duration: number;
  budget?: number;
  references?: { images?: boolean; video?: boolean };
  audioRequired?: boolean;
  avatarRequired?: boolean;
  language?: string;
  latencyTarget?: RouterLatencyTarget;
  preferredProvider?: ProductionVideoProvider | "preview" | "auto";
  projectId: string;
  sceneId: string;
  prompt: string;
  idempotencySalt?: string;
};

export type ModelRouterDecision = {
  primaryProvider: ProviderV2Id;
  fallbackProvider: ProviderV2Id | null;
  estimatedCost: number;
  capabilityMatch: Record<ProviderV2Id, boolean>;
  metadata: {
    reasons: string[];
    excluded: Array<{ provider: string; reason: string }>;
    candidates: ProviderV2Id[];
    idempotencyPromptHash: string;
  };
};

export function isProviderV2Id(id: string): id is ProviderV2Id {
  return (PROVIDER_V2_IDS as readonly string[]).includes(id);
}
