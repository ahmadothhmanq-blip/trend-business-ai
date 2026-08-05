import type { AwqePipelineMeta, AwqeWebsiteSpecification } from "@/lib/ai-core/generation-engine/quality-engine/types";
import type {
  MasterPlanIntegrationContext,
  StructuredContentResult,
} from "@/lib/ai-core/generation-engine/integration/types";

export type ProductionPipelineStage =
  | "tbge"
  | "master_plan"
  | "master_plan_validation"
  | "awqe"
  | "website_specification"
  | "content_tasks"
  | "structured_content"
  | "builder"
  | "tbdp"
  | "gls"
  | "export";

export type ProductionStageTiming = {
  stage: ProductionPipelineStage;
  durationMs: number;
  status: "completed" | "failed" | "skipped";
};

export type ProductionTimingReport = {
  planningMs: number;
  qualityMs: number;
  contentMs: number;
  builderMs: number;
  totalMs: number;
  stages: ProductionStageTiming[];
};

export type ProductionValidationEntry = {
  stage: ProductionPipelineStage;
  valid: boolean;
  errors: string[];
  timestamp: string;
};

export type ProductionValidationReport = {
  passed: boolean;
  entries: ProductionValidationEntry[];
};

export type ProductionExecutionTrace = {
  traceId: string;
  pipelineVersion: string;
  startedAt: string;
  completedAt?: string;
  stages: Array<{
    stage: ProductionPipelineStage;
    message: string;
    timestamp: string;
  }>;
};

export type ProductionQualityReport = {
  overallScore: number;
  dimensionScores: Record<string, number>;
  strengths: string[];
  weaknesses: string[];
  appliedImprovements: string[];
  recommendationCount: number;
};

export type ProductionPipelineContext = MasterPlanIntegrationContext & {
  websiteSpecification: AwqeWebsiteSpecification;
  awqeMeta: AwqePipelineMeta;
  structuredContent?: StructuredContentResult;
  trace: ProductionExecutionTrace;
  planningTiming: ProductionTimingReport;
  validationReport: ProductionValidationReport;
  qualityReport: ProductionQualityReport;
};

export type ProductionPlanningInput = {
  pluginInput: import("@/lib/website/types").WebsiteGenerationInput;
  tbdpWiring?: import("@/lib/website/tbdp-wiring/types").TbdpWiringResult;
  onProgress?: (message: string) => void;
};

export type ProductionPlanningResult =
  | { ok: true; context: ProductionPipelineContext }
  | {
      ok: false;
      errors: string[];
      stage: ProductionPipelineStage;
      validationReport: ProductionValidationReport;
      trace: ProductionExecutionTrace;
    };

export type ProductionPipelineReports = {
  trace: ProductionExecutionTrace;
  timing: ProductionTimingReport;
  validation: ProductionValidationReport;
  quality: ProductionQualityReport;
};
