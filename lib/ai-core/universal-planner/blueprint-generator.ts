import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { PlanningReasoningTrace } from "@/lib/ai-core/planning-reasoning-engine/types";
import type {
  ClarificationResolution,
  RequirementAnalysisResult,
  UniversalBlueprint,
  UniversalBlueprintCore,
  UniversalServiceBlueprint,
} from "@/lib/ai-core/universal-planner/types";

export type BuildUniversalBlueprintCoreParams = {
  briefId: string;
  industryDetection: IndustryDetectionResult;
  requirements: RequirementAnalysisResult;
  clarificationQuestions: UniversalBlueprint["clarifications"]["questions"];
  clarificationResolved?: ClarificationResolution[];
  planningTrace: PlanningReasoningTrace;
  orchestrationTraceRef?: string;
};

export function buildUniversalBlueprintCore(
  params: BuildUniversalBlueprintCoreParams,
): UniversalBlueprintCore {
  return {
    version: "1",
    plannerId: "universal-planner-v1",
    createdAt: new Date().toISOString(),
    briefId: params.briefId,
    industry: {
      industryId: params.industryDetection.industryId,
      confidence: params.industryDetection.confidence,
      reason: params.industryDetection.reason,
      routingProfile: params.industryDetection.profile.label,
    },
    intent: params.requirements.intent,
    requirements: params.requirements.capabilities,
    clarifications: {
      questions: params.clarificationQuestions,
      resolved: params.clarificationResolved ?? [],
    },
    trace: {
      planningTraceRef: params.planningTrace.promptHash,
      orchestrationTraceRef: params.orchestrationTraceRef,
    },
  };
}

export function finalizeUniversalBlueprint(
  core: UniversalBlueprintCore,
  servicePlans: UniversalServiceBlueprint[],
): UniversalBlueprint {
  const orderedServices = servicePlans.map((plan) => plan.serviceId);
  const selectedServiceId = orderedServices[0] ?? "future-service";

  return {
    ...core,
    servicePlans,
    selectedServiceId,
    executionPlan: {
      mode: orderedServices.length > 1 ? "multi-service" : "single-service",
      orderedServices,
      workflowId: core.trace.orchestrationTraceRef,
    },
  };
}

/** @deprecated Use buildUniversalBlueprintCore + finalizeUniversalBlueprint */
export type BuildUniversalBlueprintParams = BuildUniversalBlueprintCoreParams & {
  servicePlans: UniversalServiceBlueprint[];
};

export function buildUniversalBlueprint(
  params: BuildUniversalBlueprintParams,
): UniversalBlueprint {
  const core = buildUniversalBlueprintCore(params);
  return finalizeUniversalBlueprint(core, params.servicePlans);
}
