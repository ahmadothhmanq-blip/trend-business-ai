/**
 * Runtime Video Studio state machine (Phase 3).
 * Enforces frozen transitions at runtime, not only in types.
 */

import type {
  TransitionContext,
  VideoArtifact,
  VideoProjectState,
} from "@/lib/ai-core/video-production-platform/domain/contracts";
import { VIDEO_PROJECT_STATES } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";
import {
  ALLOWED_TRANSITIONS,
  assertWritableProjectState,
  canTransition,
} from "@/lib/ai-core/video-production-platform/domain/validation";
import { toWritableGenerationStatus } from "@/lib/ai-core/video-production-platform/domain/legacy";
import { assertCanPersistProjectState } from "@/lib/ai-core/video-production-platform/persistence/guards";

export type StateTransitionResult = {
  from: VideoProjectState;
  to: VideoProjectState;
  allowed: true;
  generationStatus: ReturnType<typeof toWritableGenerationStatus>;
};

export function listAllowedTargets(from: string): VideoProjectState[] {
  if (!(VIDEO_PROJECT_STATES as readonly string[]).includes(from)) return [];
  return [...ALLOWED_TRANSITIONS[from as VideoProjectState]];
}

export function assertTransition(
  from: string,
  to: string,
  context: TransitionContext = {},
): asserts to is VideoProjectState {
  if (!canTransition(from, to, context)) {
    throw new DomainValidationError(`Invalid project state transition ${from} → ${to}.`);
  }
}

export function transition(
  from: string,
  to: VideoProjectState,
  context: TransitionContext = {},
): StateTransitionResult {
  assertWritableProjectState(from);
  assertTransition(from, to, context);
  return {
    from,
    to,
    allowed: true,
    generationStatus: toWritableGenerationStatus(to),
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export async function persistTransition(
  supabase: AnySupabase,
  input: {
    projectId: string;
    from: string;
    to: VideoProjectState;
    artifact?: VideoArtifact | null;
    qcVerdict?: TransitionContext["qcVerdict"];
  },
): Promise<StateTransitionResult> {
  assertCanPersistProjectState(input.from, input.to, input.artifact, input.qcVerdict);
  const result = transition(input.from, input.to, { artifact: input.artifact, qcVerdict: input.qcVerdict });
  const { error } = await supabase
    .from("video_generations")
    .update({
      domain_state: result.to,
      status: result.generationStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.projectId);
  if (error) {
    throw new DomainValidationError(`Failed to persist state ${result.to}: ${error.message}`);
  }
  return result;
}
