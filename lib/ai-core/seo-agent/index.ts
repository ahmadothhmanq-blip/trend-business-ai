export type {
  AiSearchEngineTarget,
  AiSearchOptimization,
  KeywordTrackingPoint,
  SeoAgentRecommendation,
  SeoAgentReport,
} from "@/lib/ai-core/seo-agent/types";

export {
  runSeoAgent,
  type RunSeoAgentParams,
} from "@/lib/ai-core/seo-agent/engine";

export { buildAiSearchOptimization } from "@/lib/ai-core/seo-agent/ai-search";

export {
  syncKeywordTracking,
  getKeywordTracking,
} from "@/lib/ai-core/seo-agent/keyword-tracking";
