/**
 * Unified Quality Score Authority — canonical dimension model (QE Phase 2 Q1).
 */

export type QualityDimension =
  | "build"
  | "validation"
  | "content"
  | "seo"
  | "accessibility"
  | "ux"
  | "ui"
  | "overall";

export type UnifiedQualityScores = Record<QualityDimension, number>;

export type QualityGateSeverity = "blocker" | "warning";

export type QualityIssueCategory =
  | "missing_file"
  | "broken_import"
  | "build"
  | "validation"
  | "content"
  | "other";

export type ClassifiedQualityIssue = {
  issue: string;
  severity: QualityGateSeverity;
  category: QualityIssueCategory;
};

export type QualityGateResult = {
  passed: boolean;
  blockers: ClassifiedQualityIssue[];
  warnings: ClassifiedQualityIssue[];
  blockingIssues: string[];
  warningIssues: string[];
};

export type PostRepairVerificationResult = {
  accepted: boolean;
  rolledBack: boolean;
  beforeBlockerCount: number;
  afterBlockerCount: number;
  regressionIssues: string[];
};

export type UnifiedQualityScoreInput = {
  validationIssues?: string[];
  qualityReport?: {
    score?: number;
    seoReadinessScore?: number;
    performanceScore?: number;
    passed?: boolean;
    designConsistencyPassed?: boolean;
  };
  optimizationScores?: {
    design?: number;
    seo?: number;
    ux?: number;
    performance?: number;
    overall?: number;
  };
  finalQualityScores?: {
    design?: number;
    ux?: number;
    seo?: number;
    conversion?: number;
    performance?: number;
    overall?: number;
  };
  accessibilityIssueCount?: number;
};
