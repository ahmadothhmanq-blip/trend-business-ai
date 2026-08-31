import { logger } from "@/lib/logger";

export type AppBuilderPlanningMetrics = {
  totalPlanningMs: number;
  /** DeepSeek (or provider) JSON requests during Stage 2 planning only. */
  llmRequestCount: number;
  promptChars: number;
  responseChars: number;
  mode?: "unified-single-llm" | "deterministic-skip";
};

const LOG_CTX = "app-builder-planning";

let lastMetrics: AppBuilderPlanningMetrics | null = null;

export function getLastAppBuilderPlanningMetrics(): AppBuilderPlanningMetrics | null {
  return lastMetrics;
}

export function recordAppBuilderPlanningMetrics(
  metrics: AppBuilderPlanningMetrics,
): void {
  lastMetrics = metrics;
  logger.info("App Builder Stage 2 planning metrics", LOG_CTX, {
    totalPlanningMs: metrics.totalPlanningMs,
    llmRequestCount: metrics.llmRequestCount,
    promptChars: metrics.promptChars,
    responseChars: metrics.responseChars,
    mode: metrics.mode ?? null,
  });
}
