/**
 * Semantic Content Quality Engine — dimension model (QE Phase 3).
 */

export type SemanticQualityDimension =
  | "genericCopy"
  | "industryRelevance"
  | "ctaQuality"
  | "headingHierarchy"
  | "semanticSeo"
  | "crossPageConsistency"
  | "localization"
  | "overall";

export type SemanticQualitySeverity = "error" | "warning";

export type SemanticQualityIssue = {
  id: string;
  dimension: SemanticQualityDimension;
  severity: SemanticQualitySeverity;
  message: string;
  filePath?: string;
  repairHint?: string;
};

export type SemanticQualityScores = Record<SemanticQualityDimension, number>;

export type SemanticLlmScoreResult = {
  applied: boolean;
  filesScored: number;
  promptChars: number;
  genericScore?: number;
  industryScore?: number;
  notes?: string[];
};

export type SemanticContentQualityReport = {
  passed: boolean;
  scores: SemanticQualityScores;
  issues: SemanticQualityIssue[];
  weakSections: string[];
  summary: string;
  llmScore?: SemanticLlmScoreResult;
};

export type SemanticQualityContext = {
  files: Array<{ path: string; content: string }>;
  prompt?: string;
  language?: string;
  industryId?: string;
  industry?: string;
  brandName?: string;
  seoFocus?: string[];
  primaryCta?: string;
  forbiddenSubjects?: string[];
  toneKeywords?: string[];
  requiredSections?: string[];
};
