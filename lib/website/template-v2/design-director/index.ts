export type {
  DesignDirectorInput,
  DesignDirectorResult,
  DesignDirectorValidation,
  DesignImprovement,
  DesignIssue,
  DesignIssueCategory,
  DesignIssueSeverity,
  DesignQualityReport,
  DesignQualityScore,
  DesignScoreBreakdown,
  DesignWarning,
} from "@/lib/website/template-v2/design-director/types";

export { DESIGN_DIRECTOR_VERSION } from "@/lib/website/template-v2/design-director/types";

export {
  SCORE_WEIGHTS,
  SEVERITY_PENALTY,
  APPROVAL_THRESHOLD,
  GRADE_THRESHOLDS,
  ALL_CATEGORIES,
  BRAND_PALETTE_AFFINITY,
  BRAND_TYPOGRAPHY_AFFINITY,
  STYLE_MOTION_COMPAT,
} from "@/lib/website/template-v2/design-director/weights";

export { runValidationRules } from "@/lib/website/template-v2/design-director/validation-rules";

export {
  applyOptimizationRules,
  type OptimizationResult,
} from "@/lib/website/template-v2/design-director/optimization-rules";

export { computeDesignScore } from "@/lib/website/template-v2/design-director/scoring";

export {
  buildDesignWarnings,
  buildQualityReport,
  formatAuditSummary,
} from "@/lib/website/template-v2/design-director/audit-report";

export {
  runDesignDirector,
  directWebsiteDesign,
} from "@/lib/website/template-v2/design-director/engine";

export {
  validateDesignDirectorInput,
  validateDesignDirector,
} from "@/lib/website/template-v2/design-director/validate";
