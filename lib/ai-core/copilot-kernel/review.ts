/**
 * Copilot Review Engine — shared result shaping (Phase 5).
 */

import type { CopilotReviewResult } from "@/lib/ai-core/copilot-kernel/types";

export function buildCopilotReviewResult(params: {
  score: number;
  summary: string;
  recommendations: string[];
}): CopilotReviewResult {
  const score = Math.min(100, Math.max(0, Math.round(params.score)));
  const grade =
    score >= 90
      ? "A"
      : score >= 80
        ? "B"
        : score >= 70
          ? "C"
          : score >= 60
            ? "D"
            : "F";

  return {
    score,
    grade,
    summary: params.summary,
    recommendations: params.recommendations.slice(0, 8),
  };
}
