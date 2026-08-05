import { randomUUID } from "node:crypto";
import { PRODUCTION_PIPELINE_VERSION } from "@/lib/ai-core/generation-engine/production/constants";
import type {
  ProductionExecutionTrace,
  ProductionPipelineStage,
  ProductionQualityReport,
  ProductionStageTiming,
  ProductionTimingReport,
  ProductionValidationEntry,
  ProductionValidationReport,
} from "@/lib/ai-core/generation-engine/production/types";
import type { AwqeWebsiteSpecification } from "@/lib/ai-core/generation-engine/quality-engine/types";

export function createProductionTrace(): ProductionExecutionTrace {
  return {
    traceId: randomUUID(),
    pipelineVersion: PRODUCTION_PIPELINE_VERSION,
    startedAt: new Date().toISOString(),
    stages: [],
  };
}

export function traceStage(
  trace: ProductionExecutionTrace,
  stage: ProductionPipelineStage,
  message: string,
): void {
  trace.stages.push({ stage, message, timestamp: new Date().toISOString() });
}

export function completeTrace(trace: ProductionExecutionTrace): void {
  trace.completedAt = new Date().toISOString();
}

export class ProductionTimer {
  private readonly stages: ProductionStageTiming[] = [];
  private readonly started = performance.now();
  private stageStarted = performance.now();
  private currentStage: ProductionPipelineStage | null = null;

  begin(stage: ProductionPipelineStage): void {
    this.currentStage = stage;
    this.stageStarted = performance.now();
  }

  end(status: "completed" | "failed" | "skipped" = "completed"): void {
    if (!this.currentStage) return;
    this.stages.push({
      stage: this.currentStage,
      durationMs: performance.now() - this.stageStarted,
      status,
    });
    this.currentStage = null;
  }

  toReport(contentMs = 0, builderMs = 0): ProductionTimingReport {
    const totalMs = performance.now() - this.started;
    const planningMs = sumStages(this.stages, ["tbge", "master_plan", "master_plan_validation"]);
    const qualityMs = sumStages(this.stages, ["awqe", "website_specification"]);

    return {
      planningMs,
      qualityMs,
      contentMs,
      builderMs,
      totalMs: totalMs + contentMs + builderMs,
      stages: [...this.stages],
    };
  }
}

function sumStages(stages: ProductionStageTiming[], keys: ProductionPipelineStage[]): number {
  return stages
    .filter((s) => keys.includes(s.stage) && s.status === "completed")
    .reduce((n, s) => n + s.durationMs, 0);
}

export function createValidationReport(
  entries: ProductionValidationEntry[],
): ProductionValidationReport {
  return {
    passed: entries.every((e) => e.valid),
    entries,
  };
}

export function recordValidation(
  report: ProductionValidationReport,
  stage: ProductionPipelineStage,
  valid: boolean,
  errors: string[] = [],
): void {
  report.entries.push({
    stage,
    valid,
    errors,
    timestamp: new Date().toISOString(),
  });
  report.passed = report.entries.every((e) => e.valid);
}

export function buildQualityReport(spec: AwqeWebsiteSpecification): ProductionQualityReport {
  return {
    overallScore: spec.scores.overall,
    dimensionScores: {
      seo: spec.scores.seo,
      ux: spec.scores.ux,
      conversion: spec.scores.conversion,
      accessibility: spec.scores.accessibility,
      performance: spec.scores.performance,
      business: spec.scores.business,
      content: spec.scores.content,
    },
    strengths: spec.report.strengths,
    weaknesses: spec.report.weaknesses,
    appliedImprovements: spec.report.appliedImprovements,
    recommendationCount: spec.report.recommendations.length,
  };
}

export function productionReportsToSettingsPatch(
  trace: ProductionExecutionTrace,
  timing: ProductionTimingReport,
  qualityScore?: number,
): Record<string, string> {
  return {
    productionTraceId: trace.traceId,
    productionPipelineVersion: trace.pipelineVersion,
    productionTotalMs: String(Math.round(timing.totalMs)),
    productionPlanningMs: String(Math.round(timing.planningMs)),
    productionQualityMs: String(Math.round(timing.qualityMs)),
    productionContentMs: String(Math.round(timing.contentMs)),
    productionBuilderMs: String(Math.round(timing.builderMs)),
    ...(qualityScore !== undefined
      ? { productionAwqeScore: String(qualityScore) }
      : {}),
  };
}

export function mergeProductionTiming(
  planning: ProductionTimingReport,
  contentMs: number,
  builderMs: number,
): ProductionTimingReport {
  return {
    ...planning,
    contentMs,
    builderMs,
    totalMs: planning.planningMs + planning.qualityMs + contentMs + builderMs,
  };
}

export function isProductionPipelineContext(
  context: unknown,
): context is import("@/lib/ai-core/generation-engine/production/types").ProductionPipelineContext {
  return (
    Boolean(context) &&
    typeof context === "object" &&
    "websiteSpecification" in (context as object) &&
    "trace" in (context as object)
  );
}
