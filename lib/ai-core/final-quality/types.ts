/**
 * Final Website Quality Intelligence — unified pre-publish review.
 */

import type { DesignCriticReport } from "@/lib/ai-core/design-critic/types";
import type { ConversionOptimizationReport } from "@/lib/ai-core/conversion/types";
import type { SeoPerformanceReport } from "@/lib/ai-core/seo-performance/types";
import type { WebsiteOptimizationReport } from "@/lib/ai-core/optimizer/types";
import type { WebsiteEditorSuggestionsReport } from "@/lib/ai-core/website-editor/types";
import type { WebsiteEditAction } from "@/lib/ai-core/website-editor/types";

export type FinalQualityDimension =
  | "visual"
  | "layout"
  | "typography"
  | "spacing"
  | "mobile"
  | "journey"
  | "conversion"
  | "seo"
  | "content"
  | "performance";

export type FinalQualitySeverity = "critical" | "major" | "minor" | "opportunity";

export type FinalQualityFinding = {
  id: string;
  dimension: FinalQualityDimension;
  severity: FinalQualitySeverity;
  title: string;
  detail: string;
  action: string;
  source: "auditor" | "design-critic" | "conversion" | "seo" | "optimizer";
};

/** Canonical website scores before publish. */
export type FinalWebsiteScores = {
  design: number;
  ux: number;
  seo: number;
  conversion: number;
  performance: number;
  overall: number;
};

export type FinalImprovementActionKind =
  | "improve-design"
  | "rewrite-content"
  | "add-section"
  | "improve-images"
  | "improve-ux"
  | "improve-conversion"
  | "improve-seo";

/** AI-suggested improvement that can be applied via editor / optimizer. */
export type FinalImprovementAction = {
  id: string;
  kind: FinalImprovementActionKind;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  /** Natural-language command for Website Editor. */
  command: string;
  /** Structural editor actions when available. */
  editorActions?: WebsiteEditAction[];
  /** Themes to seed into Website Optimizer. */
  optimizeThemes?: string[];
  applied: boolean;
};

export type FinalQualityAuditorReport = {
  score: number;
  findings: FinalQualityFinding[];
  dimensions: Record<
    "visual" | "layout" | "typography" | "spacing" | "mobile" | "journey",
    number
  >;
  summary: string;
};

export type FinalSeoReviewReport = {
  score: number;
  findings: FinalQualityFinding[];
  metadataOk: boolean;
  headingsOk: boolean;
  keywordsOk: boolean;
  structureOk: boolean;
  contentOk: boolean;
  summary: string;
};

export type FinalWebsiteQualityReport = {
  scores: FinalWebsiteScores;
  publishReady: boolean;
  findings: FinalQualityFinding[];
  actions: FinalImprovementAction[];
  auditor: FinalQualityAuditorReport;
  seoReview: FinalSeoReviewReport;
  designCritic?: DesignCriticReport;
  conversion?: ConversionOptimizationReport;
  seoPerformance?: SeoPerformanceReport;
  optimization?: WebsiteOptimizationReport;
  editorSuggestions?: WebsiteEditorSuggestionsReport;
  blockers: string[];
  warnings: string[];
  opportunities: string[];
  summary: string;
  generatedAt: string;
};

export type FinalQualityPublishChecklist = {
  publishReady: boolean;
  scores: FinalWebsiteScores;
  blockers: string[];
  warnings: string[];
  opportunities: string[];
  topActions: FinalImprovementAction[];
};
