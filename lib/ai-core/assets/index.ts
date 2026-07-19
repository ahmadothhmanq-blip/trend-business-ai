/**
 * AI Real Images Engine / AI Assets Engine.
 * Image providers: OpenAI DALL·E, Replicate Flux, Stability AI.
 * DeepSeek is used only for text prompt refinement — never for pixels.
 */

export type {
  AssetKind,
  CoreAssetPlanItem,
  GenerateCoreAssetsParams,
} from "@/lib/ai-core/assets/types";

export type {
  ImageStylePreset,
  ImageAspectRatio,
  ImageQuality,
  ImageProviderId,
  ImageGenerationSettings,
} from "@/lib/ai-core/assets/settings";

export {
  getDefaultImageSettings,
  normalizeImageStyle,
  stylePromptFragment,
} from "@/lib/ai-core/assets/settings";

export {
  generateRealisticImage,
  svgFallbackDataUrl,
  isImageProviderConfigured,
} from "@/lib/ai-core/assets/provider";

export {
  listImageProviders,
  listConfiguredImageProviders,
  isAnyImageProviderConfigured,
  generateWithImageProviders,
} from "@/lib/ai-core/assets/providers/router";

export { planCoreAssets } from "@/lib/ai-core/assets/plan";

export { buildImagePrompts } from "@/lib/ai-core/assets/prompt-engine";

export {
  generateCoreAssets,
  coreAssetManifestSummary,
} from "@/lib/ai-core/assets/generate";
