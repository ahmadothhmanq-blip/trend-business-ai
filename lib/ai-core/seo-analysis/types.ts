/**
 * AI SEO Analysis Engine — full-site SEO audit contracts.
 */

import type {
  HeadingStructureReport,
  KeywordPlan,
  SeoPerformanceReport,
  TechnicalSeoChecklist,
} from "@/lib/ai-core/seo-performance/types";

export type SeoAuditArea =
  | "titles"
  | "meta-descriptions"
  | "headings"
  | "keywords"
  | "content-quality"
  | "internal-links"
  | "image-alt"
  | "page-speed"
  | "mobile-seo"
  | "schema-markup"
  | "ai-search"
  | "entity-brand";

export type SeoIssueSeverity = "critical" | "major" | "minor" | "opportunity";

export type SeoIssue = {
  id: string;
  area: SeoAuditArea;
  severity: SeoIssueSeverity;
  title: string;
  detail: string;
  recommendation: string;
  /** Maps to applyable fix id in optimizer. */
  fixId?: string;
};

export type SeoAreaScore = {
  area: SeoAuditArea;
  score: number;
  label: string;
};

export type SeoAnalysisReport = {
  generationId?: string;
  overallScore: number;
  areaScores: SeoAreaScore[];
  issues: SeoIssue[];
  keywordPlan: KeywordPlan;
  headingStructure: HeadingStructureReport;
  technicalSeo: TechnicalSeoChecklist;
  /** Snapshot from wrapped SEO Performance Engine. */
  performanceReport: SeoPerformanceReport;
  contentQualityNotes: string[];
  internalLinkNotes: string[];
  imageAltNotes: string[];
  pageSpeedNotes: string[];
  mobileNotes: string[];
  schemaNotes: string[];
  summary: string;
  generatedAt: string;
};
