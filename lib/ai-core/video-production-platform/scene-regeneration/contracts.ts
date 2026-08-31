import type { SceneProviderPreference } from "@/lib/ai-core/video-production-platform/domain/contracts";
import type { ProviderV2Id, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import type { ProviderEnvSnapshot } from "@/lib/ai-core/video-production-platform/provider-router/registry";

export type RegenerateSceneOptions = {
  promptOverride?: string;
  providerPreference?: SceneProviderPreference;
  /** Stable client id — duplicate requests reuse the same attempt/job. */
  requestId?: string;
  /** Force a new attempt even when a prior job exists for the same request fingerprint. */
  retry?: boolean;
  /** Only active plans are allowed unless explicitly set (rollback / admin flows). */
  allowInactivePlan?: boolean;
  aspectRatio?: string;
  language?: string;
  snapshot?: ProviderEnvSnapshot;
  registry?: Record<ProviderV2Id, VideoProviderV2>;
};

export type SceneRegenerationStatus =
  | "queued"
  | "submitted"
  | "processing"
  | "quality_check"
  | "ready"
  | "failed";

export type RegenerateSceneResult = {
  projectId: string;
  planId: string;
  sceneId: string;
  attempt: number;
  jobId: string;
  status: SceneRegenerationStatus;
  activeArtifactId: string | null;
  preservedArtifactId: string | null;
  candidateArtifactId: string | null;
  reused: boolean;
  estimatedCost: number | null;
  actualCost: number | null;
  errorCode: string | null;
  errorMessage: string | null;
};
