/**
 * AI Conversion Optimizer — analytics-informed improvement suggestions.
 */

export type ConversionInsightCategory =
  | "cta"
  | "layout"
  | "trust"
  | "seo"
  | "ux"
  | "pricing"
  | "experiment";

export type ConversionInsightSeverity = "high" | "medium" | "low";

export type ConversionInsight = {
  id: string;
  category: ConversionInsightCategory;
  severity: ConversionInsightSeverity;
  title: string;
  detail: string;
  suggestion: string;
  impact: string;
  relatedMetric?: string;
};

export type ConversionOptimizerReport = {
  generationId: string;
  conversionScore: number;
  analyticsScore: number;
  experimentScore: number;
  overallScore: number;
  insights: ConversionInsight[];
  betterCtaSuggestions: string[];
  layoutSuggestions: string[];
  missingTrustSections: string[];
  seoImprovements: string[];
  uxImprovements: string[];
  summary: string;
  generatedAt: string;
};
