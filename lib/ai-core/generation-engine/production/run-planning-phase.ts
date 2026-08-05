import { specificationToSettingsPatch } from "@/lib/ai-core/generation-engine/quality-engine/build-spec";
import { runAwqePipeline } from "@/lib/ai-core/generation-engine/quality-engine/pipeline/run-pipeline";
import { validateWebsiteSpecification } from "@/lib/ai-core/generation-engine/quality-engine/validate";
import { wireMasterPlanIntegration } from "@/lib/ai-core/generation-engine/integration/wire-integration";
import {
  validateBeforeBuilder,
  validateBeforeGeneration,
  validateContentTasks,
} from "@/lib/ai-core/generation-engine/integration/validate-integration";
import type {
  ProductionPipelineContext,
  ProductionPlanningInput,
  ProductionPlanningResult,
  ProductionPipelineStage,
  ProductionValidationReport,
} from "@/lib/ai-core/generation-engine/production/types";
import {
  buildQualityReport,
  completeTrace,
  createProductionTrace,
  createValidationReport,
  ProductionTimer,
  productionReportsToSettingsPatch,
  recordValidation,
  traceStage,
} from "@/lib/ai-core/generation-engine/production/observability";

function failResult(
  stage: ProductionPipelineStage,
  errors: string[],
  validationReport: ProductionValidationReport,
  trace: ReturnType<typeof createProductionTrace>,
): ProductionPlanningResult {
  completeTrace(trace);
  return { ok: false, errors, stage, validationReport, trace };
}

/**
 * Production planning phase — TBGE → Master Plan → Validation → AWQE → Website Specification.
 * Deterministic. No builder execution.
 */
export async function runProductionPlanningPhase(
  input: ProductionPlanningInput,
): Promise<ProductionPlanningResult> {
  const trace = createProductionTrace();
  const timer = new ProductionTimer();
  const validationReport = createValidationReport([]);
  const emit = (msg: string) => input.onProgress?.(msg);

  emit("[production] Starting production planning pipeline...");
  traceStage(trace, "tbge", "TBGE analysis initiated");

  timer.begin("master_plan");
  const masterResult = await wireMasterPlanIntegration({
    pluginInput: input.pluginInput,
    tbdpWiring: input.tbdpWiring,
    onProgress: emit,
  });
  timer.end(masterResult.ok ? "completed" : "failed");

  if (!masterResult.ok) {
    recordValidation(validationReport, "master_plan", false, masterResult.errors);
    traceStage(trace, "master_plan", `Failed: ${masterResult.errors.join("; ")}`);
    return failResult("master_plan", masterResult.errors, validationReport, trace);
  }

  const { context: masterContext } = masterResult;
  traceStage(trace, "master_plan", `Master Plan ${masterContext.masterPlan.id} built`);
  traceStage(trace, "tbge", "TBGE analysis complete");

  timer.begin("master_plan_validation");
  const mpValidation = validateBeforeGeneration(masterContext.masterPlan);
  recordValidation(
    validationReport,
    "master_plan_validation",
    mpValidation.valid,
    mpValidation.valid ? [] : mpValidation.errors,
  );
  timer.end(mpValidation.valid ? "completed" : "failed");

  if (!mpValidation.valid) {
    traceStage(trace, "master_plan_validation", "Validation failed");
    return failResult("master_plan_validation", mpValidation.errors, validationReport, trace);
  }

  const builderValidation = validateBeforeBuilder(masterContext.masterPlan);
  recordValidation(
    validationReport,
    "builder",
    builderValidation.valid,
    builderValidation.valid ? [] : builderValidation.errors,
  );
  if (!builderValidation.valid) {
    return failResult("builder", builderValidation.errors, validationReport, trace);
  }

  traceStage(trace, "master_plan_validation", "Master Plan validated");

  timer.begin("content_tasks");
  const contentValidation = validateContentTasks(masterContext.contentRequest);
  recordValidation(
    validationReport,
    "content_tasks",
    contentValidation.valid,
    contentValidation.valid ? [] : contentValidation.errors,
  );
  timer.end(contentValidation.valid ? "completed" : "failed");

  if (!contentValidation.valid) {
    return failResult("content_tasks", contentValidation.errors, validationReport, trace);
  }
  traceStage(trace, "content_tasks", "Content tasks created and validated");

  timer.begin("awqe");
  const awqeResult = runAwqePipeline({ masterPlan: masterContext.masterPlan });
  timer.end(awqeResult.ok ? "completed" : "failed");

  if (!awqeResult.ok) {
    recordValidation(validationReport, "awqe", false, awqeResult.errors);
    traceStage(trace, "awqe", `AWQE failed: ${awqeResult.errors.join("; ")}`);
    return failResult("awqe", awqeResult.errors, validationReport, trace);
  }
  traceStage(trace, "awqe", `Quality score ${awqeResult.specification.scores.overall}`);

  timer.begin("website_specification");
  const specValidation = validateWebsiteSpecification(awqeResult.specification);
  recordValidation(
    validationReport,
    "website_specification",
    specValidation.valid,
    specValidation.valid ? [] : specValidation.errors,
  );
  timer.end(specValidation.valid ? "completed" : "failed");

  if (!specValidation.valid) {
    return failResult("website_specification", specValidation.errors, validationReport, trace);
  }
  traceStage(trace, "website_specification", "Website Specification validated");

  traceStage(trace, "gls", `GLS context ${masterContext.glsContext.meta.contextHash}`);
  traceStage(trace, "tbdp", "TBDP metadata merged in brief patch");

  const qualityReport = buildQualityReport(awqeResult.specification);
  const planningTiming = timer.toReport();

  const settingsPatch = {
    ...masterContext.settingsPatch,
    ...specificationToSettingsPatch(awqeResult.specification),
    ...productionReportsToSettingsPatch(trace, planningTiming, qualityReport.overallScore),
  };

  const briefMetadataPatch = {
    ...masterContext.briefMetadataPatch,
    awqeWebsiteSpecification: awqeResult.specification,
    awqeSpecId: awqeResult.specification.id,
    productionPipeline: true,
    productionTraceId: trace.traceId,
  };

  completeTrace(trace);
  emit(`[production] Planning complete — score ${qualityReport.overallScore}/100`);

  const context: ProductionPipelineContext = {
    ...masterContext,
    websiteSpecification: awqeResult.specification,
    awqeMeta: awqeResult.meta,
    settingsPatch,
    briefMetadataPatch,
    trace,
    planningTiming,
    validationReport,
    qualityReport,
  };

  return { ok: true, context };
}
