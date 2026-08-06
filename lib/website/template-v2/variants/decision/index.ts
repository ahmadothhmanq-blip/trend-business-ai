export type {
  AccessibilityLevel,
  BrandPersonality,
  BusinessModel,
  BusinessSize,
  ContentDensity,
  DevicePriority,
  ImageAvailability,
  LanguageDirection,
  PremiumLevel,
  ScoredVariant,
  TargetAudience,
  VariantDecisionContext,
  VariantDecisionPlan,
  VariantDecisionProfile,
  VariantDecisionValidation,
  VariantScoreBreakdown,
  VariantSelection,
  VisualStyle,
  WebsiteGoal,
} from "@/lib/website/template-v2/variants/decision/types";

export {
  DECISION_ENGINE_VERSION,
  DECISION_WEIGHTS,
  DIVERSITY_CONFIG,
  SCORE_BANDS,
  normalizeIndustry,
  resolveDecisionSections,
} from "@/lib/website/template-v2/variants/decision/weights";

export {
  VARIANT_DECISION_PROFILES,
  getVariantDecisionProfile,
  goalAffinity,
  industryAffinity,
  styleAffinity,
} from "@/lib/website/template-v2/variants/decision/profiles";

export {
  checkVariantCompatibility,
  isSectionRelevantForGoal,
  SECTION_GOAL_MATRIX,
  type CompatibilityResult,
  type SectionCompatibilityMatrix,
} from "@/lib/website/template-v2/variants/decision/compatibility";

export {
  scoreVariant,
  topScoringFactors,
} from "@/lib/website/template-v2/variants/decision/rules";

export {
  applyDiversityTieBreak,
  computeDiversityPenalty,
  createDiversityState,
  recordSelection,
  seededTieBreak,
  type DiversityState,
} from "@/lib/website/template-v2/variants/decision/diversity";

export {
  decideVariantPlan,
  decideSectionVariant,
} from "@/lib/website/template-v2/variants/decision/engine";

export {
  validateDecisionContext,
  validateDecisionPlan,
  validateDecisionEngine,
} from "@/lib/website/template-v2/variants/decision/validate";
