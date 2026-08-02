/**
 * LLM call budget tracking for TBGE runs (no AI calls in Sprint 1).
 */

import { resolveTbgeProfileLimits } from "@/lib/tbge/flags/resolve-profile";
import type { TbgeGenerationProfile } from "@/lib/tbge/spec/types";

export type TbgeRunBudget = {
  profile: TbgeGenerationProfile;
  maxLlmCalls: number;
  usedLlmCalls: number;
};

export function createTbgeRunBudget(profile: TbgeGenerationProfile): TbgeRunBudget {
  const limits = resolveTbgeProfileLimits(profile);
  return {
    profile,
    maxLlmCalls: limits.maxLlmCalls,
    usedLlmCalls: 0,
  };
}

export function recordTbgeLlmCall(budget: TbgeRunBudget, count = 1): void {
  budget.usedLlmCalls += count;
  if (budget.usedLlmCalls > budget.maxLlmCalls) {
    throw new Error(
      `TBGE LLM budget exceeded: ${budget.usedLlmCalls}/${budget.maxLlmCalls}`,
    );
  }
}

export function remainingTbgeLlmCalls(budget: TbgeRunBudget): number {
  return Math.max(0, budget.maxLlmCalls - budget.usedLlmCalls);
}
