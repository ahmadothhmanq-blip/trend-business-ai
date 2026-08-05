/**
 * Trend Business AI Generation Engine v2 (TBGE2) — Phase 1 Planning Engine.
 *
 * Thinks before calling any LLM. Isolated, backward compatible, provider independent.
 *
 * @see lib/ai-core/generation-engine/docs/ARCHITECTURE.md
 */

export {
  TBGE2_PACKAGE_ID,
  TBGE2_SPEC_VERSION,
  TBGE2_PHASE,
  TBGE2_PROJECT_SETTING_PLAN_HASH,
  TBGE2_PROJECT_SETTING_PLATFORM_VERSION,
} from "@/lib/ai-core/generation-engine/constants";

export * from "@/lib/ai-core/generation-engine/core/types";
export { analyzeIntent } from "@/lib/ai-core/generation-engine/analyzers/intent-analyzer";
export { analyzeBusiness } from "@/lib/ai-core/generation-engine/analyzers/business-analyzer";
export { analyzeRequirements } from "@/lib/ai-core/generation-engine/analyzers/requirements-analyzer";
export { planWebsite } from "@/lib/ai-core/generation-engine/planners/website-planner";
export { planPages } from "@/lib/ai-core/generation-engine/planners/page-planner";
export { planSections } from "@/lib/ai-core/generation-engine/planners/section-planner";
export { planContent } from "@/lib/ai-core/generation-engine/planners/content-planner";
export { buildLlmRequest, STRUCTURED_PLAN_SCHEMA } from "@/lib/ai-core/generation-engine/llm/request-builder";
export {
  planToStructuredOutput,
  parseStructuredOutput,
  isStructuredPlan,
  containsForbiddenMarkup,
} from "@/lib/ai-core/generation-engine/llm/structured-output";
export type { Tbge2LlmClient, Tbge2LlmRequest, Tbge2LlmResponse, Tbge2StructuredOutputResult } from "@/lib/ai-core/generation-engine/llm/types";
export { runTbge2PlanningPipeline, type Tbge2PipelineOptions } from "@/lib/ai-core/generation-engine/pipeline/run-pipeline";
export { validatePlanningInput, validatePlanningPlan } from "@/lib/ai-core/generation-engine/validation/validate";
export {
  TBGE2_PLANNING_LIFECYCLE,
  getLifecyclePhase,
  planToSettingsPatch,
} from "@/lib/ai-core/generation-engine/lifecycle";
export { TBGE2_INTENT_PATTERNS, TBGE2_INTENT_TO_INDUSTRY } from "@/lib/ai-core/generation-engine/registry/intents";
export { TBGE2_REQUIREMENT_PATTERNS, TBGE2_BASE_REQUIREMENTS } from "@/lib/ai-core/generation-engine/registry/requirements";
export { bridgeToTbgePlanDraft } from "@/lib/ai-core/generation-engine/bridges/tbge-bridge";
export { enrichPlanWithGls } from "@/lib/ai-core/generation-engine/bridges/gls-bridge";
export {
  bridgeFromWebsiteGenerationInput,
  planToWebsiteMetadata,
} from "@/lib/ai-core/generation-engine/bridges/website-bridge";

// Phase 1.5 — Master Plan Engine
export {
  MASTER_PLAN_SCHEMA_VERSION,
  MASTER_PLAN_PHASE,
  buildMasterPlan,
  validateMasterPlan,
  isMasterPlan,
  buildMasterPlanContentLlmRequest,
  runMasterPlanPipeline,
  MASTER_PLAN_LIFECYCLE,
  getMasterPlanLifecyclePhase,
  masterPlanToSettingsPatch,
  STRUCTURED_CONTENT_SCHEMA,
} from "@/lib/ai-core/generation-engine/master-plan";
export type {
  MasterPlan,
  MasterPlanInput,
  MasterPlanResult,
  MasterPlanMeta,
  MasterPlanContentLlmRequest,
} from "@/lib/ai-core/generation-engine/master-plan";
export {
  isMasterPlanIntegrationEnabled,
  wireMasterPlanIntegration,
  mergeIntegrationSettings,
  validateBeforeGeneration,
  validateContentTasks,
  validateStructuredContent,
  validateBeforeBuilder,
  validateBeforeExport,
  createContentProviderFromAiProvider,
  masterPlanToLegacyWebsitePlan,
  buildLockedSpecFromMasterPlan,
} from "@/lib/ai-core/generation-engine/integration";
export type { MasterPlanIntegrationContext } from "@/lib/ai-core/generation-engine/integration";

// AWQE — AI Website Quality Engine (Phase 1)
export {
  AWQE_PACKAGE_ID,
  AWQE_SPEC_VERSION,
  AWQE_PHASE,
  runAwqePipeline,
  evaluateQuality,
  applyQualityImprovements,
  validateWebsiteSpecification,
  isAwqeWebsiteSpecification,
  specificationToSettingsPatch,
  AWQE_QUALITY_LIFECYCLE,
} from "@/lib/ai-core/generation-engine/quality-engine";
export type {
  AwqeWebsiteSpecification,
  AwqeQualityScores,
  AwqeImprovementReport,
  AwqePipelineResult,
} from "@/lib/ai-core/generation-engine/quality-engine";

// Production Pipeline — final wiring (TBGE → Master Plan → AWQE → Builder)
export {
  PRODUCTION_PIPELINE_VERSION,
  PRODUCTION_PIPELINE_PHASE,
  isProductionPipelineEnabled,
  isIntegratedPipelineEnabled,
  runProductionPlanningPhase,
  createProductionTrace,
  buildQualityReport,
  productionReportsToSettingsPatch,
  mergeProductionTiming,
} from "@/lib/ai-core/generation-engine/production";
export type {
  ProductionPipelineContext,
  ProductionPipelineReports,
  ProductionTimingReport,
  ProductionValidationReport,
  ProductionExecutionTrace,
  ProductionQualityReport,
} from "@/lib/ai-core/generation-engine/production";
