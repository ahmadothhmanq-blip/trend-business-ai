import { logger } from "@/lib/logger";

const LOG_CTX = "app-builder-ui-repair";

export type UiRepairMetrics = {
  localUiFixes: string[];
  createdBarrel: boolean;
  repairRoundsAvoided: number;
  estimatedSecondsSaved: number;
  remainingLlmRepairReasons: string[];
};

const ESTIMATED_SECONDS_PER_AVOIDED_REPAIR = 60;

let metrics: UiRepairMetrics = {
  localUiFixes: [],
  createdBarrel: false,
  repairRoundsAvoided: 0,
  estimatedSecondsSaved: 0,
  remainingLlmRepairReasons: [],
};

export function resetUiRepairMetrics(): void {
  metrics = {
    localUiFixes: [],
    createdBarrel: false,
    repairRoundsAvoided: 0,
    estimatedSecondsSaved: 0,
    remainingLlmRepairReasons: [],
  };
}

export function recordUiHardenerFix(input: {
  injected: string[];
  createdBarrel: boolean;
  requiredCount: number;
}): void {
  if (input.createdBarrel) metrics.createdBarrel = true;
  for (const name of input.injected) {
    if (!metrics.localUiFixes.includes(name)) metrics.localUiFixes.push(name);
  }
  logger.info("UI hardener local fix", LOG_CTX, {
    injected: input.injected,
    createdBarrel: input.createdBarrel,
    requiredCount: input.requiredCount,
  });
}

export function recordUiRepairSkipped(pathsOrIssues: string[]): void {
  if (pathsOrIssues.length === 0) return;
  metrics.repairRoundsAvoided += 1;
  metrics.estimatedSecondsSaved += ESTIMATED_SECONDS_PER_AVOIDED_REPAIR;
  logger.info("UI LLM repair skipped — fixed locally", LOG_CTX, {
    skipped: pathsOrIssues,
    repairRoundsAvoided: metrics.repairRoundsAvoided,
    estimatedSecondsSaved: metrics.estimatedSecondsSaved,
  });
}

export function recordRemainingLlmRepairReasons(reasons: string[]): void {
  metrics.remainingLlmRepairReasons = [...reasons];
}

export function getUiRepairMetrics(): UiRepairMetrics {
  return {
    ...metrics,
    localUiFixes: [...metrics.localUiFixes],
    remainingLlmRepairReasons: [...metrics.remainingLlmRepairReasons],
  };
}
