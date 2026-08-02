export type {
  ArchitectureValidationCorrection,
  ArchitectureValidationOptions,
  ArchitectureValidationResult,
  ArchitectureValidationStatus,
  ArchitectureValidationTraceEntry,
  WebsiteGenerationPlan,
} from "@/lib/ai-core/architecture-validation/types";
export {
  ARCHITECTURE_VALIDATION_KEY,
  WEBSITE_GENERATION_PLAN_KEY,
} from "@/lib/ai-core/architecture-validation/types";
export {
  allowedFamiliesForIndustry,
  isLayoutFamilyAllowed,
} from "@/lib/ai-core/architecture-validation/rules";
export {
  buildWebsiteGenerationPlan,
  resolvePlanComponents,
} from "@/lib/ai-core/architecture-validation/build-plan";
export { validateWebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/validate";
export {
  applyArchitectureCorrectionsToBrief,
  ARCHITECTURE_CORRECTIONS_KEY,
  ARCHITECTURE_REPLAN_ATTEMPT_KEY,
} from "@/lib/ai-core/architecture-validation/replan";
export { ArchitectureValidationFailure } from "@/lib/ai-core/architecture-validation/errors";
export {
  getArchitectureValidationFromBrief,
  getWebsiteGenerationPlanFromBrief,
  validateAndRouteWebsiteGeneration,
} from "@/lib/ai-core/architecture-validation/orchestrate";
