/**
 * Website Quality Benchmark System (WQBS) — Phase 1
 *
 * Official quality gate for generated websites.
 * Does NOT generate websites — evaluates artifacts only.
 */

export {
  WQBS_VERSION,
  WQBS_PHASE,
  WQBS_PACKAGE_ID,
  WQBS_PASS_THRESHOLD,
  WQBS_WEAK_SCORE_THRESHOLD,
  WQBS_BENCHMARK_MODES,
  WQBS_CATEGORIES,
  WQBS_REFERENCE_PLATFORMS,
  WQBS_CATEGORY_WEIGHTS,
  WQBS_MODE_CATEGORIES,
} from "@/lib/website/quality-benchmark/constants";

export type {
  WqbsBenchmarkMode,
  WqbsCategory,
  WqbsReferencePlatform,
  WqbsSubDimensionScore,
  WqbsCategoryEvaluation,
  WqbsCategoryScores,
  WqbsRecommendation,
  WqbsBenchmarkInput,
  WqbsArtifactSignals,
  WqbsBenchmarkMeta,
  WqbsQualityReport,
  WqbsBenchmarkReport,
  WqbsExecutiveSummary,
  WqbsTechnicalSummary,
  WqbsDeveloperSummary,
  WqbsComparisonInput,
  WqbsComparisonResult,
  WqbsBenchmarkResult,
  WqbsBenchmarkOutcome,
} from "@/lib/website/quality-benchmark/types";

export { extractArtifactSignals } from "@/lib/website/quality-benchmark/analyze/extract-artifact";

export {
  evaluateVisualDesign,
  evaluateUserExperience,
  evaluateBusiness,
  evaluateSeo,
  evaluatePerformance,
  evaluateAccessibility,
  evaluateContent,
  evaluateLocalization,
  evaluateAllCategories,
} from "@/lib/website/quality-benchmark/evaluate/categories";

export {
  computeOverallScore,
  finalizeScores,
  resolveGateStatus,
  collectStrengthsWeaknesses,
} from "@/lib/website/quality-benchmark/scoring/model";

export { generateRecommendations } from "@/lib/website/quality-benchmark/recommendations/engine";

export {
  buildQualityReport,
  buildBenchmarkReport,
  buildExecutiveSummary,
  buildTechnicalSummary,
  buildDeveloperSummary,
} from "@/lib/website/quality-benchmark/reports/build-reports";

export {
  compareWebsiteQuality,
  compareAgainstReferencePlatform,
} from "@/lib/website/quality-benchmark/compare/compare-engine";

export { runWebsiteQualityBenchmark } from "@/lib/website/quality-benchmark/pipeline/run-benchmark";
