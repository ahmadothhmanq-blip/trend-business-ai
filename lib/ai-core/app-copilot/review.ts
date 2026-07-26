/**
 * App Copilot Review Engine (Phase 5).
 */

import { runAppQualityChecks } from "@/lib/ai-core/app-design-platform/quality";
import { buildCopilotReviewResult } from "@/lib/ai-core/copilot-kernel/review";
import type { CopilotReviewResult } from "@/lib/ai-core/copilot-kernel/types";
import type { StructuredAppModel } from "@/lib/ai-core/app-design-platform/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export function runAppCopilotReview(params: {
  model: StructuredAppModel;
  files?: GeneratedProjectFile[];
}): CopilotReviewResult {
  const quality = runAppQualityChecks({
    model: params.model,
    files: params.files ?? [],
  });

  const recommendations = quality.checks
    .filter((check) => !check.passed)
    .map((check) => check.detail || check.label)
    .slice(0, 8);

  return buildCopilotReviewResult({
    score: quality.score,
    summary: quality.summary,
    recommendations,
  });
}
