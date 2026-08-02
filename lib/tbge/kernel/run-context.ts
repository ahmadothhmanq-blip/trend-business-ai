/**
 * Per-run context for TBGE orchestrator.
 */

import { randomUUID } from "node:crypto";
import type { TbgeFeatureFlags } from "@/lib/tbge/flags";
import { resolveTbgeFlags } from "@/lib/tbge/flags";
import type { TbgePhase } from "@/lib/tbge/kernel/phases";
import { canTransition } from "@/lib/tbge/kernel/phases";
import type { TbgeBrief, TbgeProgressEvent } from "@/lib/tbge/kernel/types";
import type { TbgeGenerationProfile, TbgeRunMode } from "@/lib/tbge/spec/types";

export type TbgeRunContext = {
  runId: string;
  brief: TbgeBrief;
  mode: TbgeRunMode;
  profile: TbgeGenerationProfile;
  flags: TbgeFeatureFlags;
  phase: TbgePhase;
  phasesVisited: TbgePhase[];
  startedAt: string;
  onProgress?: (event: TbgeProgressEvent) => void;
};

export function createTbgeRunContext(input: {
  brief: TbgeBrief;
  mode?: TbgeRunMode;
  profile?: TbgeGenerationProfile;
  flags?: Partial<TbgeFeatureFlags>;
  onProgress?: (event: TbgeProgressEvent) => void;
}): TbgeRunContext {
  const baseFlags = resolveTbgeFlags();
  return {
    runId: `tbge-${randomUUID()}`,
    brief: input.brief,
    mode: input.mode ?? "generate",
    profile: input.profile ?? "professional",
    flags: { ...baseFlags, ...input.flags },
    phase: "accepted",
    phasesVisited: ["accepted"],
    startedAt: new Date().toISOString(),
    onProgress: input.onProgress,
  };
}

export function transitionPhase(ctx: TbgeRunContext, next: TbgePhase): void {
  if (!canTransition(ctx.phase, next)) {
    throw new Error(`Invalid TBGE phase transition: ${ctx.phase} → ${next}`);
  }
  ctx.phase = next;
  ctx.phasesVisited.push(next);
  ctx.onProgress?.({
    phase: next,
    message: `[tbge] ${next}`,
    timestamp: new Date().toISOString(),
  });
}
