export type {
  ImagePurpose,
  ImageAssetMetadata,
  ImageEnginePlanItem,
  ImageIntelligenceContext,
  AdvancedAssetsExtras,
} from "@/lib/ai-core/image-engine/types";

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
} from "@/lib/ai-core/image-engine/intelligence";

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
