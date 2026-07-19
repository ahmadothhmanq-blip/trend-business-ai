export type {
  BrandPresetId,
  BrandPersonality,
  BrandStrategyBrief,
  BrandColorSystem,
  BrandTypographySystem,
  BrandSpacingRules,
  BrandUiStyle,
  BrandLogoDirection,
  BrandIdentityBrief,
} from "@/lib/ai-core/brand-identity/types";

export {
  BRAND_PRESET_IDS,
  getBrandPreset,
  listBrandPresets,
  normalizeBrandPresetId,
  type BrandPresetPackage,
} from "@/lib/ai-core/brand-identity/presets";

export {
  selectBrandPreset,
  analyzeBrandStrategy,
} from "@/lib/ai-core/brand-identity/strategy";

export { analyzeBrandIdentity } from "@/lib/ai-core/brand-identity/analyze";
export {
  runBrandIdentityIntelligence,
  type RunBrandIdentityIntelligenceParams,
} from "@/lib/ai-core/brand-identity/engine";

export {
  brandIdentityPlanSeeds,
  applyBrandIdentityToDesignSystem,
  applyBrandIdentityToDesignPlan,
} from "@/lib/ai-core/brand-identity/apply";

export { buildLogoDirection } from "@/lib/ai-core/brand-identity/logo";
