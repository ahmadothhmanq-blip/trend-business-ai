import type { ArchitectureValidationTraceEntry } from "@/lib/ai-core/architecture-validation/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { CoreBrief } from "@/lib/ai-core/layers/types";

export const PLANNING_REASONING_TRACE_KEY = "planningReasoningTrace";
export const PLANNING_REASONING_ENGINE_ID = "planning-reasoning-engine";
export const PLANNING_REASONING_ENGINE_VERSION = "1.0.0";

/** Ordered phases in the PRE orchestration DAG — EDS-002. */
export type PlanningPhaseId =
  | "reuse"
  | "business-analysis"
  | "agency-synthesis"
  | "auto-design"
  | "template-routing"
  | "architecture-validation"
  | "master-plan-lock";

export type DecisionTraceCategory =
  | ArchitectureValidationTraceEntry["category"]
  | "planning"
  | "agency"
  | "business"
  | "routing"
  | "heuristic";

export type DecisionTraceSeverity = "info" | "warning" | "error";

/** Structured, explainable decision record — propagated across all planning phases. */
export type DecisionTraceEntry = {
  id: string;
  phase: PlanningPhaseId;
  ruleId: string;
  category: DecisionTraceCategory;
  passed: boolean;
  severity: DecisionTraceSeverity;
  message: string;
  confidence?: number;
  knowledgeEntryId?: string;
  inputs?: Record<string, unknown>;
  outputs?: Record<string, unknown>;
  timestamp: string;
  durationMs?: number;
};

export type PlanningReasoningTrace = {
  version: "1";
  engineId: typeof PLANNING_REASONING_ENGINE_ID;
  engineVersion: typeof PLANNING_REASONING_ENGINE_VERSION;
  createdAt: string;
  promptHash: string;
  phases: PlanningPhaseId[];
  entries: DecisionTraceEntry[];
  summary: string;
};

export type PlanningReasoningEngineParams = {
  brief: CoreBrief;
  onProgress?: (message: string) => void;
  reuseExisting?: boolean;
};

export type PlanningReasoningEngineResult = {
  plan: MasterWebsitePlan;
  brief: CoreBrief;
  industryDetection: IndustryDetectionResult;
  trace: PlanningReasoningTrace;
};
