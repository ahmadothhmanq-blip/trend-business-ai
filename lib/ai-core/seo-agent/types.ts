/**
 * AI SEO Agent — orchestrated SEO + AI Search optimization report.
 */

import type { SeoAnalysisReport } from "@/lib/ai-core/seo-analysis/types";
import type { SeoOptimizerResult } from "@/lib/ai-core/seo-optimizer/types";
import type { ConversionOptimizerReport } from "@/lib/ai-core/conversion-optimizer/types";
import type { WebsiteAnalyticsSummary } from "@/lib/ai-core/analytics/types";

export type AiSearchEngineTarget =
  | "google-search"
  | "google-ai-overviews"
  | "chatgpt-search"
  | "gemini-search"
  | "perplexity";

export type AiSearchOptimization = {
  targets: AiSearchEngineTarget[];
  entityOptimization: string[];
  brandKnowledgeSignals: string[];
  schemaCoverage: string[];
  readinessScore: number;
  summary: string;
};

export type KeywordTrackingPoint = {
  keyword: string;
  /** Relative visibility score 0–100 (simulated until Search Console). */
  visibility: number;
  trend: "up" | "flat" | "down";
  intent: "informational" | "commercial" | "transactional" | "navigational";
};

export type SeoAgentRecommendation = {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "major" | "minor" | "opportunity";
  fixId?: string;
  source: "analysis" | "optimizer" | "ai-search" | "analytics" | "conversion";
};

export type SeoAgentReport = {
  generationId: string;
  seoScore: number;
  analysis: SeoAnalysisReport;
  optimizer: SeoOptimizerResult;
  aiSearch: AiSearchOptimization;
  keywordTracking: KeywordTrackingPoint[];
  recommendations: SeoAgentRecommendation[];
  analyticsHints?: string[];
  conversionHints?: string[];
  summary: string;
  generatedAt: string;
};
