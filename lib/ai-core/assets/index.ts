/**
 * AI Assets Engine (Phase 7).
 */

export type {
  AssetKind,
  CoreAssetPlanItem,
  GenerateCoreAssetsParams,
} from "@/lib/ai-core/assets/types";

export {
  generateRealisticImage,
  svgFallbackDataUrl,
  isImageProviderConfigured,
} from "@/lib/ai-core/assets/provider";

export { planCoreAssets } from "@/lib/ai-core/assets/plan";

export {
  generateCoreAssets,
  coreAssetManifestSummary,
} from "@/lib/ai-core/assets/generate";
