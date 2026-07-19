/**
 * AI Conversion Optimization Engine —
 * goal detection, industry conversion rules, and pre-publish recommendations.
 */

export type {
  ConversionGoal,
  ConversionRecommendationArea,
  ConversionRecommendationSeverity,
  ConversionRecommendation,
  IndustryConversionRule,
  ConversionGoalDetection,
  ConversionOptimizationReport,
} from "@/lib/ai-core/conversion/types";

export {
  detectConversionGoal,
  normalizeConversionGoal,
  conversionGoalToWebsiteGoal,
  websiteGoalToConversionGoal,
} from "@/lib/ai-core/conversion/goals";

export {
  getIndustryConversionRules,
  listIndustryConversionRules,
} from "@/lib/ai-core/conversion/rules";

export { analyzeConversion } from "@/lib/ai-core/conversion/analyze";

export {
  runConversionOptimization,
  mergeConversionIntoOptimizerReport,
  conversionPublishChecklist,
  type RunConversionOptimizationParams,
} from "@/lib/ai-core/conversion/engine";
