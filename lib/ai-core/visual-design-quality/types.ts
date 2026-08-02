/**
 * Visual Design & UX Excellence Engine — dimension model (QE Phase 4).
 */

export type VisualQualityDimension =
  | "designTokens"
  | "visualHierarchy"
  | "responsiveLayout"
  | "heroQuality"
  | "navigationUx"
  | "ctaPlacement"
  | "componentSpacing"
  | "typographyHierarchy"
  | "crossPageConsistency"
  | "layout"
  | "ux"
  | "overall";

export type VisualQualitySeverity = "error" | "warning";

export type VisualQualityIssue = {
  id: string;
  dimension: VisualQualityDimension;
  severity: VisualQualitySeverity;
  message: string;
  filePath?: string;
  repairHint?: string;
};

export type VisualQualityScores = Record<VisualQualityDimension, number>;

export type VisualDesignQualityReport = {
  passed: boolean;
  scores: VisualQualityScores;
  issues: VisualQualityIssue[];
  weakSections: string[];
  summary: string;
};

export type VisualDesignQualityContext = {
  files: Array<{ path: string; content: string }>;
  designSystem?: {
    colors?: { primary?: string; secondary?: string; accent?: string };
    typography?: { headingFont?: string; bodyFont?: string };
    spacingScale?: string;
  };
  brandName?: string;
  pages?: string[];
};
