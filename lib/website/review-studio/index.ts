/**
 * AI Website Review Studio — Phase 1
 *
 * Professional website review and targeted improvement.
 * Does NOT generate websites. Does NOT provide a visual editor.
 */

export {
  REVIEW_STUDIO_VERSION,
  REVIEW_STUDIO_PHASE,
  REVIEW_STUDIO_PACKAGE_ID,
  REVIEW_AREAS,
  REVIEW_PRIORITIES,
  ANALYZER_DIMENSIONS,
} from "@/lib/website/review-studio/constants";

export type {
  ReviewArea,
  ReviewPriority,
  AnalyzerDimension,
  ReviewStudioInput,
  AnalyzerDimensionResult,
  WebsiteAnalysis,
  ReviewIssue,
  ImpactEstimate,
  StudioImprovement,
  ReviewInsights,
  ReviewOutput,
  ReviewStudioMeta,
  WebsiteVersion,
  VersionComparison,
  ReviewStudioResult,
  ReviewStudioOutcome,
  ApplyImprovementInput,
  TargetedImprovementExecutor,
  ApplyImprovementResult,
  ReviewStudioSession,
  ReviewStudioPersistedState,
  ReviewStudioPersistedVersion,
} from "@/lib/website/review-studio/types";

export { analyzeWebsite } from "@/lib/website/review-studio/analyze/website-analyzer";

export {
  detectIssues,
  buildReviewInsights,
  buildReviewOutput,
} from "@/lib/website/review-studio/review/review-engine";

export { generateImprovements } from "@/lib/website/review-studio/improvements/improvement-engine";

export { estimateImprovementImpact } from "@/lib/website/review-studio/impact/impact-estimator";

export {
  categorizePriority,
  groupByPriority,
  formatPriorityLabel,
} from "@/lib/website/review-studio/recommendations/recommendation-engine";

export {
  getOrCreateSession,
  createVersion,
  rollbackToVersion,
  getCurrentVersion,
  listVersions,
  getSession,
  clearReviewSessions,
} from "@/lib/website/review-studio/versions/version-manager";

export { compareVersions } from "@/lib/website/review-studio/compare/comparison-engine";

export {
  applyDeterministicPatch,
  applyImprovementToFiles,
} from "@/lib/website/review-studio/execution/patches";

export {
  applySelectedImprovements,
  listAvailableImprovements,
} from "@/lib/website/review-studio/execution/execution-engine";

export { runWebsiteReview } from "@/lib/website/review-studio/pipeline/run-review";
