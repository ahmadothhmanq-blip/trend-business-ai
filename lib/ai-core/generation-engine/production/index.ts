/**
 * Production Website Generation Pipeline.
 *
 * Connects TBGE → Master Plan → AWQE → Content Provider → Builder → TBDP → GLS.
 * Flag-gated via WB_PRODUCTION_PIPELINE=1.
 */

export {
  PRODUCTION_PIPELINE_VERSION,
  PRODUCTION_PIPELINE_PHASE,
  PRODUCTION_SETTING_TRACE_ID,
  PRODUCTION_SETTING_PIPELINE_VERSION,
} from "@/lib/ai-core/generation-engine/production/constants";

export {
  isProductionPipelineEnabled,
  isIntegratedPipelineEnabled,
} from "@/lib/ai-core/generation-engine/production/flags";

export type {
  ProductionPipelineStage,
  ProductionStageTiming,
  ProductionTimingReport,
  ProductionValidationEntry,
  ProductionValidationReport,
  ProductionExecutionTrace,
  ProductionQualityReport,
  ProductionPipelineContext,
  ProductionPlanningInput,
  ProductionPlanningResult,
  ProductionPipelineReports,
} from "@/lib/ai-core/generation-engine/production/types";

export {
  createProductionTrace,
  traceStage,
  completeTrace,
  ProductionTimer,
  createValidationReport,
  recordValidation,
  buildQualityReport,
  productionReportsToSettingsPatch,
  mergeProductionTiming,
  isProductionPipelineContext,
} from "@/lib/ai-core/generation-engine/production/observability";

export { runProductionPlanningPhase } from "@/lib/ai-core/generation-engine/production/run-planning-phase";
