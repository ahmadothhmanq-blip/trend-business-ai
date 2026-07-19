/**
 * Premium Design System Engine —
 * Industry + Brand → complete visual identity for Website Builder.
 */

export type {
  PremiumStyleId,
  PremiumTypographySystem,
  PremiumColorHarmony,
  PremiumSpacingSystem,
  PremiumRadiusScale,
  PremiumShadowScale,
  PremiumGradientSystem,
  PremiumGlassSystem,
  PremiumAnimationPresets,
  PremiumResponsiveRules,
  PremiumLayoutIntelligence,
  PremiumDesignSystem,
  BuildPremiumDesignInput,
} from "@/lib/ai-core/design-system/premium/types";

export { generateColorHarmony } from "@/lib/ai-core/design-system/premium/color-harmony";

export {
  PREMIUM_STYLE_IDS,
  buildPremiumStylePackage,
  premiumStyleToEnginePreset,
  getPremiumStyleBase,
} from "@/lib/ai-core/design-system/premium/styles";

export { resolveLayoutIntelligence } from "@/lib/ai-core/design-system/premium/layout-intelligence";

export {
  normalizePremiumStyleId,
  buildPremiumDesignSystem,
  applyPremiumDesignToCore,
  listPremiumStyles,
} from "@/lib/ai-core/design-system/premium/build";

export {
  premiumDesignCssVariables,
  premiumUtilityCss,
} from "@/lib/ai-core/design-system/premium/css";
