export {
  runImageIntelligenceEngine,
  runImageIntelligenceFromBrief,
  getImageIntelligenceTraceFromBrief,
  getImageSystemSpecFromBrief,
  persistImageIntelligenceOnBrief,
  type RunImageIntelligenceEngineParams,
} from "@/lib/ai-core/image-intelligence/iie-engine";
export {
  IMAGE_INTELLIGENCE_TRACE_KEY,
  IMAGE_INTELLIGENCE_SPEC_KEY,
  IMAGE_INTELLIGENCE_ENGINE_ID,
  IMAGE_INTELLIGENCE_ENGINE_VERSION,
  type ImagePolicy,
  type ImageSystemSpec,
  type ImageSpecification,
  type ImageIntelligenceTrace,
  type ImageTraceEntry,
  type ImageIntelligenceValidation,
  type ImageIntelligenceEngineResult,
} from "@/lib/ai-core/image-intelligence/iie-types";
export { resolveImagePolicy } from "@/lib/ai-core/image-intelligence/policies";
export {
  validateImageSpecifications,
  computeCoverage,
  resetImageValidationTraceCounter,
} from "@/lib/ai-core/image-intelligence/validate-image";
export {
  buildImageSystemSpec,
  imageSpecificationsToPlanItems,
  specificationsFromPlannedItems,
} from "@/lib/ai-core/image-intelligence/build-spec";
export {
  getImageKnowledgeEntry,
  IMAGE_KNOWLEDGE_ENTRIES,
} from "@/lib/ai-core/image-intelligence/knowledge-base/catalog";
export {
  resolveSemanticVisualConcept,
  applySemanticRelevanceToSpecifications,
  validateSemanticRelevance,
  isGenericImageSpec,
  GENERIC_IMAGE_PHRASES,
} from "@/lib/ai-core/image-intelligence/semantic-relevance";
