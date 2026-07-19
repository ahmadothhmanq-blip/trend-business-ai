export type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
export { analyzeDesignIntelligence } from "@/lib/ai-core/design-intelligence/analyze";
export {
  runDesignIntelligence,
  type RunDesignIntelligenceParams,
} from "@/lib/ai-core/design-intelligence/engine";
export {
  selectWebsiteLayout,
  resolveLayoutIndustryKey,
  pickHeroFromAllowedPool,
  pickSectionLayoutFromAllowedPool,
  type LayoutVariationId,
  type LayoutSelectionResult,
} from "@/lib/ai-core/design-intelligence/layout-selection";
