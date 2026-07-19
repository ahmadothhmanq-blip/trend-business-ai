/**
 * AI SEO + Performance Engine —
 * titles/meta, headings, keywords, technical SEO, CWV/mobile, pre-publish scores.
 */

export type {
  SeoPerformanceRecommendationArea,
  SeoPerformanceSeverity,
  SeoPerformanceRecommendation,
  HeadingStructureReport,
  KeywordPlan,
  SeoPerformanceScores,
  TechnicalSeoChecklist,
  SeoPerformanceReport,
} from "@/lib/ai-core/seo-performance/types";

export {
  buildKeywordPlan,
  resolveIndustryId,
  type BuildKeywordPlanInput,
} from "@/lib/ai-core/seo-performance/keywords";

export { analyzeHeadingStructure } from "@/lib/ai-core/seo-performance/headings";

export {
  analyzeSeoPerformance,
  type AnalyzeSeoPerformanceInput,
} from "@/lib/ai-core/seo-performance/analyze";

export {
  runSeoPerformanceEngine,
  mergeSeoPerformanceIntoOptimizerReport,
  seoPerformancePublishChecklist,
  type RunSeoPerformanceParams,
} from "@/lib/ai-core/seo-performance/engine";
