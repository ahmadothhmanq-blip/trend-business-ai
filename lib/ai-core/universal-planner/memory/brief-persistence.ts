import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type {
  RequirementAnalysisResult,
  UniversalBlueprint,
} from "@/lib/ai-core/universal-planner/types";

export const UNIVERSAL_BLUEPRINT_KEY = "universalPlannerBlueprint";
export const UNIVERSAL_REQUIREMENTS_KEY = "universalPlannerRequirements";
export const UNIVERSAL_CLARIFICATIONS_KEY = "universalPlannerClarifications";
export const UNIVERSAL_SERVICE_PLANS_KEY = "universalPlannerServicePlans";

export function persistUniversalBlueprint(
  brief: CoreBrief,
  blueprint: UniversalBlueprint,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [UNIVERSAL_BLUEPRINT_KEY]: blueprint,
      [UNIVERSAL_SERVICE_PLANS_KEY]: blueprint.servicePlans,
      [UNIVERSAL_CLARIFICATIONS_KEY]: blueprint.clarifications,
    },
  };
}

export function persistUniversalRequirements(
  brief: CoreBrief,
  requirements: RequirementAnalysisResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [UNIVERSAL_REQUIREMENTS_KEY]: requirements,
    },
  };
}

export function getUniversalBlueprintFromBrief(
  brief: CoreBrief,
): UniversalBlueprint | null {
  const raw = brief.metadata?.[UNIVERSAL_BLUEPRINT_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as UniversalBlueprint;
}
