/**
 * Website Copilot Review Engine (Phase 5).
 */

import { suggestWebsiteImprovements } from "@/lib/ai-core/website-editor";
import { buildCopilotReviewResult } from "@/lib/ai-core/copilot-kernel/review";
import type { CopilotReviewResult } from "@/lib/ai-core/copilot-kernel/types";
import { validatePostCommandL1 } from "@/lib/ai-core/website-copilot/validators/post-command";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

export function runWebsiteCopilotReview(params: {
  project: GeneratedWebsiteProject;
  prompt?: string;
  language?: string;
}): CopilotReviewResult {
  const l1 = validatePostCommandL1({
    project: params.project,
    prompt: params.prompt,
    language: params.language ?? "en",
  });

  const report = suggestWebsiteImprovements({
    files: params.project.files ?? [],
    project: params.project,
  });

  const recommendations = [
    ...l1.warnings,
    ...report.suggestions.slice(0, 5).map((item) => item.title),
  ].filter(Boolean);

  const score = Math.max(
    35,
    100 - l1.warnings.length * 8 - Math.max(0, report.suggestions.length - 3) * 4,
  );

  return buildCopilotReviewResult({
    score,
    summary:
      recommendations.length > 0
        ? "Post-command review found improvement opportunities."
        : "Post-command review looks good.",
    recommendations,
  });
}
