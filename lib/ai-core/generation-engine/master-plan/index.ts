/**
 * TBGE2 Master Plan Engine — Phase 1.5.
 *
 * Single Source of Truth for every AI provider.
 * LLMs execute copy only; they never make planning decisions.
 */

export {
  MASTER_PLAN_SCHEMA_VERSION,
  MASTER_PLAN_PHASE,
  MASTER_PLAN_SETTING_ID,
  MASTER_PLAN_SETTING_VERSION,
  MASTER_PLAN_SETTING_SCHEMA_VERSION,
} from "@/lib/ai-core/generation-engine/master-plan/constants";

export type {
  MasterPlan,
  MasterPlanInput,
  MasterPlanResult,
  MasterPlanMeta,
  MasterPlanValidationResult,
  MasterPlanPipelineStage,
  MasterPlanProject,
  MasterPlanBusiness,
  MasterPlanBrand,
  MasterPlanLocalization,
  MasterPlanPage,
  MasterPlanSection,
  MasterPlanComponent,
  MasterPlanSeoStrategy,
  MasterPlanContentStrategy,
  MasterPlanMediaStrategy,
  MasterPlanCtaStrategy,
  MasterPlanTrustStrategy,
  MasterPlanLegalPage,
  MasterPlanPerformanceTargets,
  MasterPlanAccessibilityTargets,
  MasterPlanFutureExpansion,
} from "@/lib/ai-core/generation-engine/master-plan/types";

export { buildMasterPlan } from "@/lib/ai-core/generation-engine/master-plan/build-master-plan";
export { validateMasterPlan, isMasterPlan } from "@/lib/ai-core/generation-engine/master-plan/validate";
export {
  buildMasterPlanContentLlmRequest,
  STRUCTURED_CONTENT_SCHEMA,
  type MasterPlanContentLlmRequest,
} from "@/lib/ai-core/generation-engine/master-plan/llm-request-builder";
export { runMasterPlanPipeline } from "@/lib/ai-core/generation-engine/master-plan/pipeline/run-pipeline";
export {
  MASTER_PLAN_LIFECYCLE,
  getMasterPlanLifecyclePhase,
  masterPlanToSettingsPatch,
} from "@/lib/ai-core/generation-engine/master-plan/lifecycle";
