import type { IndustryId } from "@/lib/ai-core/templates/types";

export type SeoPerformanceRecommendationArea =
  | "title-meta"
  | "headings"
  | "keywords"
  | "technical-seo"
  | "structured-data"
  | "social"
  | "images"
  | "lazy-loading"
  | "mobile"
  | "core-web-vitals"
  | "content-structure"
  | "internal-seo";

export type SeoPerformanceSeverity =
  | "critical"
  | "major"
  | "minor"
  | "opportunity";

export type SeoPerformanceRecommendation = {
  id: string;
  area: SeoPerformanceRecommendationArea;
  severity: SeoPerformanceSeverity;
  title: string;
  detail: string;
  action: string;
  target?: string;
};

export type HeadingStructureReport = {
  h1Count: number;
  h2Count: number;
  h3Count: number;
  hasSingleH1: boolean;
  issues: string[];
  suggestions: string[];
};

export type KeywordPlan = {
  primary: string;
  secondary: string[];
  longTail: string[];
  industryKeywords: string[];
  source: "strategy" | "industry" | "premium-template" | "hybrid";
};

export type SeoPerformanceScores = {
  seo: number;
  performance: number;
  mobile: number;
  overall: number;
};

export type TechnicalSeoChecklist = {
  hasMetadata: boolean;
  hasOpenGraph: boolean;
  hasTwitterCard: boolean;
  hasSitemap: boolean;
  hasRobotsTxt: boolean;
  hasStructuredData: boolean;
  hasCanonical: boolean;
};

export type SeoPerformanceReport = {
  scores: SeoPerformanceScores;
  keywordPlan: KeywordPlan;
  headingStructure: HeadingStructureReport;
  technicalSeo: TechnicalSeoChecklist;
  recommendations: SeoPerformanceRecommendation[];
  improveThemes: string[];
  summary: string;
  publishReady: boolean;
  industryId: IndustryId | string;
  generatedAt: string;
  /** Snapshot of suggested title/description for pre-publish UI. */
  suggestedMeta: {
    title: string;
    description: string;
  };
};
