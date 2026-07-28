export type {
  ImagePurpose,
  ImageAssetMetadata,
  ImageEnginePlanItem,
  ImageIntelligenceContext,
  AdvancedAssetsExtras,
  StructuredImageRequirement,
  DesignPlanImageContext,
} from "@/lib/ai-core/image-engine/types";

export type {
  SectionKey,
  SectionImageStrategy,
} from "@/lib/ai-core/image-engine/section-strategies";

export type {
  ImagePromptScore,
} from "@/lib/ai-core/image-engine/prompt-scoring";

export type {
  ImageArtDirection,
} from "@/lib/ai-core/image-engine/art-direction";

export type {
  AssetQualityIssue,
  AssetQualityReport,
} from "@/lib/ai-core/image-engine/validate";

export type {
  VideoAssetKind,
  VideoAssetBrief,
  VideoAssetPackage,
} from "@/lib/ai-core/image-engine/video";

export {
  IMAGE_ENGINE_STYLES,
  resolveImageEngineStyle,
  imageStyleFragment,
} from "@/lib/ai-core/image-engine/styles";

export {
  buildImageIntelligence,
  composeImagePrompt,
  defaultAspectForPurpose,
  resolveShotBriefForRole,
  buildAccessibleAltText,
} from "@/lib/ai-core/image-engine/intelligence";

export {
  inferSectionKey,
  getSectionStrategy,
  resolveIndustryVisualBrief,
  imageQualityGuardrails,
  designToneFragment,
  SUPPORTED_IMAGE_INDUSTRIES,
  SUPPORTED_SECTION_KEYS,
} from "@/lib/ai-core/image-engine/section-strategies";

export {
  scoreImagePrompt,
  improvePromptForScore,
  PROMPT_QUALITY_THRESHOLD,
} from "@/lib/ai-core/image-engine/prompt-scoring";

export {
  getCachedPrompt,
  setCachedPrompt,
  clearPromptCache,
} from "@/lib/ai-core/image-engine/prompt-cache";

export {
  buildImageArtDirection,
  buildArtDirectionMap,
} from "@/lib/ai-core/image-engine/art-direction";

export { planWebsiteImages } from "@/lib/ai-core/image-engine/plan";

export { preferAiImages } from "@/lib/ai-core/image-engine/prefer";

export {
  injectAiImagesIntoProject,
  ensureRequiredPhotoAssets,
  hasPublishableHeroImage,
} from "@/lib/ai-core/image-engine/inject";

export {
  resolvePremiumStockUrl,
  isPremiumStockUrl,
} from "@/lib/ai-core/image-engine/stock";

export {
  validateAssetManifest,
  assertPublishableAssets,
} from "@/lib/ai-core/image-engine/validate";

export {
  prepareVideoAssets,
  buildSiteVideoModule,
} from "@/lib/ai-core/image-engine/video";

export { runAiImageEngine } from "@/lib/ai-core/image-engine/engine";
