export type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
export { analyzeDesignIntelligence } from "@/lib/ai-core/design-intelligence/analyze";
export {
  runDesignIntelligence,
  type RunDesignIntelligenceParams,
} from "@/lib/ai-core/design-intelligence/engine";
export {
  runDesignIntelligenceEngine,
  runDesignIntelligenceFromBrief,
  getDesignIntelligenceTraceFromBrief,
  getDesignSystemSpecFromBrief,
  persistDesignIntelligenceOnBrief,
  intelligenceFromSpec,
  type RunDesignIntelligenceEngineParams,
} from "@/lib/ai-core/design-intelligence/die-engine";
export {
  DESIGN_INTELLIGENCE_TRACE_KEY,
  DESIGN_INTELLIGENCE_SPEC_KEY,
  DESIGN_INTELLIGENCE_ENGINE_ID,
  DESIGN_INTELLIGENCE_ENGINE_VERSION,
  type DesignPolicy,
  type DesignSystemSpec,
  type DesignIntelligenceTrace,
  type DesignTraceEntry,
  type DesignIntelligenceValidation,
  type DesignIntelligenceEngineResult,
} from "@/lib/ai-core/design-intelligence/die-types";
export { resolveDesignPolicy } from "@/lib/ai-core/design-intelligence/policies";
export {
  validateDesignIntelligence,
  applyDesignPolicyCorrections,
  resetDesignValidationTraceCounter,
} from "@/lib/ai-core/design-intelligence/validate-design";
export { buildDesignSystemSpec } from "@/lib/ai-core/design-intelligence/build-spec";
export {
  getDesignKnowledgeEntry,
  DESIGN_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/design-intelligence/knowledge-base/catalog";
export {
  selectWebsiteLayout,
  resolveLayoutIndustryKey,
  pickHeroFromAllowedPool,
  pickSectionLayoutFromAllowedPool,
  type LayoutVariationId,
  type LayoutSelectionResult,
} from "@/lib/ai-core/design-intelligence/layout-selection";
