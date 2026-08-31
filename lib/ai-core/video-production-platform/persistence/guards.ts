/**
 * Persistence-time guards. Domain freeze stays the source of truth;
 * these wrap it for database writes without touching HTTP APIs.
 */

import type {
  ProviderJob,
  Scene,
  TransitionContext,
  VideoArtifact,
  VideoProjectState,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import {
  assertValidProviderJob,
  assertValidScene,
  assertValidVideoArtifact,
  assertWritableProjectState,
  canTransition,
} from "@/lib/ai-core/video-production-platform/domain/validation";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";
import { toWritableGenerationStatus } from "@/lib/ai-core/video-production-platform/domain/legacy";

export function buildProviderIdempotencyKey(input: {
  projectId: string;
  sceneId: string;
  provider: string;
  promptHash: string;
}): string {
  const promptHash = input.promptHash.trim();
  if (!promptHash) {
    throw new DomainValidationError("Provider job promptHash is required for idempotency.");
  }
  return `${input.projectId}:${input.sceneId}:${input.provider}:${promptHash}`;
}

export function assertCanPersistProjectState(
  from: string,
  to: VideoProjectState,
  artifact?: VideoArtifact | null,
  qcVerdict?: TransitionContext["qcVerdict"],
): void {
  assertWritableProjectState(to);
  if (!canTransition(from, to, { artifact, qcVerdict })) {
    throw new DomainValidationError(`Invalid project state transition ${from} → ${to}.`);
  }
  if (to === "video_rendered" || to === "published") {
    assertValidVideoArtifact(artifact);
  }
  // Maps onto the current generation column without writing legacy `completed`.
  toWritableGenerationStatus(to);
}

export function assertCanPersistScene(scene: Scene): void {
  assertValidScene(scene);
}

export function assertCanPersistProviderJob(job: ProviderJob): void {
  assertValidProviderJob(job);
}

export function assertCanPersistArtifact(artifact: VideoArtifact): void {
  assertValidVideoArtifact(artifact);
}
