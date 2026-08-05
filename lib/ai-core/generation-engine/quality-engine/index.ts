/**
 * AI Website Quality Engine (AWQE) — Phase 1.
 *
 * Transforms Master Plan into world-class Website Specification.
 * Runs AFTER Master Plan, BEFORE Website Builder.
 */

export {
  AWQE_PACKAGE_ID,
  AWQE_SPEC_VERSION,
  AWQE_PHASE,
  AWQE_SETTING_SPEC_ID,
  AWQE_SETTING_SPEC_VERSION,
  AWQE_SETTING_OVERALL_SCORE,
} from "@/lib/ai-core/generation-engine/quality-engine/constants";

export type {
  AwqeWebsiteSpecification,
  AwqeQualityScores,
  AwqeImprovementReport,
  AwqeRecommendation,
  AwqePipelineInput,
  AwqePipelineResult,
  AwqePipelineMeta,
  AwqeEvaluationResult,
  AwqeSeoSpec,
  AwqeConversionSpec,
  AwqeAccessibilitySpec,
  AwqePerformanceSpec,
} from "@/lib/ai-core/generation-engine/quality-engine/types";

export { evaluateQuality } from "@/lib/ai-core/generation-engine/quality-engine/evaluate";
export { generateRecommendations, buildImprovementReport } from "@/lib/ai-core/generation-engine/quality-engine/recommend";
export { applyQualityImprovements } from "@/lib/ai-core/generation-engine/quality-engine/improve";
export {
  optimizeSeo,
  optimizeConversion,
  optimizeAccessibility,
  optimizePerformance,
} from "@/lib/ai-core/generation-engine/quality-engine/optimize";
export {
  buildWebsiteSpecification,
  hashSpecification,
  specificationToSettingsPatch,
} from "@/lib/ai-core/generation-engine/quality-engine/build-spec";
export { validateWebsiteSpecification, isAwqeWebsiteSpecification } from "@/lib/ai-core/generation-engine/quality-engine/validate";
export { runAwqePipeline } from "@/lib/ai-core/generation-engine/quality-engine/pipeline/run-pipeline";
export { AWQE_QUALITY_LIFECYCLE, getAwqeLifecyclePhase } from "@/lib/ai-core/generation-engine/quality-engine/lifecycle";
