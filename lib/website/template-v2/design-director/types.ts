import type { BlueprintInput, WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

export const DESIGN_DIRECTOR_VERSION = "1.0.0";

export type DesignIssueSeverity = "critical" | "warning" | "info";

export type DesignIssueCategory =
  | "visual-quality"
  | "conflict"
  | "hierarchy"
  | "brand-identity"
  | "density"
  | "rhythm"
  | "layout-repetition"
  | "color-harmony"
  | "typography"
  | "cta"
  | "image"
  | "navigation"
  | "footer"
  | "responsive"
  | "accessibility"
  | "seo";

export type DesignIssue = {
  id: string;
  category: DesignIssueCategory;
  severity: DesignIssueSeverity;
  message: string;
  sectionKind?: SectionKind;
  field?: string;
  optimizable: boolean;
};

export type DesignWarning = {
  code: string;
  message: string;
  category: DesignIssueCategory;
  severity: DesignIssueSeverity;
};

export type DesignImprovement = {
  id: string;
  category: DesignIssueCategory;
  description: string;
  field: string;
  before: string;
  after: string;
  issueId: string;
};

export type DesignScoreBreakdown = {
  category: DesignIssueCategory;
  score: number;
  maxScore: number;
  weight: number;
  weightedScore: number;
  issueCount: number;
};

export type DesignQualityScore = {
  overall: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: DesignScoreBreakdown[];
};

export type DesignQualityReport = {
  blueprintId: string;
  reviewedAt: string;
  directorVersion: string;
  initialScore: DesignQualityScore;
  finalScore: DesignQualityScore;
  issuesFound: number;
  issuesResolved: number;
  improvementsApplied: number;
  approved: boolean;
  categorySummary: Partial<
    Record<DesignIssueCategory, { found: number; resolved: number }>
  >;
};

export type DesignDirectorInput = {
  /** Provide an existing blueprint, or blueprintInput to build one. */
  blueprint?: WebsiteBlueprint;
  blueprintInput?: BlueprintInput;
  /** Audit only — skip automatic optimization. */
  auditOnly?: boolean;
};

export type DesignDirectorResult = {
  originalBlueprint: WebsiteBlueprint;
  optimizedBlueprint: WebsiteBlueprint;
  report: DesignQualityReport;
  warnings: DesignWarning[];
  improvements: DesignImprovement[];
  finalScore: number;
  approved: boolean;
};

export type DesignDirectorValidation = {
  valid: boolean;
  errors: string[];
  warnings: string[];
};
