/**
 * Design Planning Phase — approved visual plan before website code generation.
 */

export type {
  DesignPlanSection,
  DesignPlanImageRequirement,
  DesignPlanColorSystem,
  DesignPlanTypographySystem,
  DesignPlanStatus,
  VisualDesignPlan,
} from "@/lib/ai-core/design-plan/types";

export {
  buildVisualDesignPlan,
  type BuildVisualDesignPlanInput,
} from "@/lib/ai-core/design-plan/build";

export {
  applyDesignPlanToStrategy,
  applyDesignPlanToDesignSystem,
  designPlanSectionLabels,
  designPlanRequiredImageRoles,
} from "@/lib/ai-core/design-plan/apply";

export {
  runDesignPlanningPhase,
  runDesignPlanningPhaseWithBrand,
  assertDesignPlanApproved,
} from "@/lib/ai-core/design-plan/engine";

export type {
  RunDesignPlanningPhaseParams,
  DesignPlanningPhaseResult,
} from "@/lib/ai-core/design-plan/engine";
