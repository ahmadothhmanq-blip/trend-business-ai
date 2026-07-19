export type {
  SeoFixApplyMode,
  SeoGeneratedAssets,
  SeoFix,
  SeoOptimizerResult,
} from "@/lib/ai-core/seo-optimizer/types";

export {
  runSeoOptimizer,
  getSeoFix,
  type RunSeoOptimizerParams,
} from "@/lib/ai-core/seo-optimizer/engine";

export {
  applySeoPackageFix,
  type ApplySeoFixResult,
} from "@/lib/ai-core/seo-optimizer/apply";
