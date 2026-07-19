/**
 * Pre-publish checklist from Final Website Quality Intelligence.
 */

import type {
  FinalQualityPublishChecklist,
  FinalWebsiteQualityReport,
} from "@/lib/ai-core/final-quality/types";

export function finalQualityPublishChecklist(
  report: FinalWebsiteQualityReport,
): FinalQualityPublishChecklist {
  return {
    publishReady: report.publishReady,
    scores: report.scores,
    blockers: report.blockers,
    warnings: report.warnings.slice(0, 8),
    opportunities: report.opportunities.slice(0, 8),
    topActions: report.actions.filter((a) => a.priority === "high").slice(0, 6),
  };
}
