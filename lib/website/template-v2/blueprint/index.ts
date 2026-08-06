export type {
  BlueprintAccessibilityProfile,
  BlueprintColorPalette,
  BlueprintColorRole,
  BlueprintContainerWidths,
  BlueprintCtaStrategy,
  BlueprintFooterStyle,
  BlueprintGridStrategy,
  BlueprintHeroComposition,
  BlueprintHeroLayout,
  BlueprintImageStrategy,
  BlueprintInput,
  BlueprintMotionIntensity,
  BlueprintMotionStrategy,
  BlueprintNavigationStyle,
  BlueprintResponsiveStrategy,
  BlueprintSectionVariant,
  BlueprintSeoProfile,
  BlueprintTypographyProfile,
  BlueprintTypographyScale,
  BlueprintValidation,
  WebsiteBlueprint,
  WebsiteBlueprintMeta,
} from "@/lib/website/template-v2/blueprint/types";

export {
  BLUEPRINT_ENGINE_VERSION,
  BLUEPRINT_SCHEMA_VERSION,
} from "@/lib/website/template-v2/blueprint/weights";

export {
  resolveBlueprintContext,
  inferBusinessSubtype,
  type ResolvedBlueprintContext,
} from "@/lib/website/template-v2/blueprint/defaults";

export {
  resolveColorPalette,
  BLUEPRINT_PALETTE_PRESETS,
} from "@/lib/website/template-v2/blueprint/palettes";

export {
  resolveTypographyProfile,
  BLUEPRINT_TYPOGRAPHY_PRESETS,
} from "@/lib/website/template-v2/blueprint/typography";

export {
  resolveSectionOrder,
  resolveSectionDensity,
} from "@/lib/website/template-v2/blueprint/section-order";

export {
  resolveContainerWidths,
  resolveGridStrategy,
} from "@/lib/website/template-v2/blueprint/layout";

export {
  resolveHeroComposition,
  resolveCtaStrategy,
  resolveImageStrategy,
  resolveMotionStrategy,
  resolveNavigationStyle,
  resolveFooterStyle,
  resolveResponsiveStrategy,
  resolveAccessibilityProfile,
  resolveSeoProfile,
} from "@/lib/website/template-v2/blueprint/strategies";

export {
  buildWebsiteBlueprint,
  buildSectionBlueprint,
} from "@/lib/website/template-v2/blueprint/engine";

export {
  blueprintInputSchema,
  websiteBlueprintSchema,
} from "@/lib/website/template-v2/blueprint/schema";

export {
  serializeWebsiteBlueprint,
  deserializeWebsiteBlueprint,
  parseWebsiteBlueprint,
  parseBlueprintInput,
  isWebsiteBlueprint,
  isSerializedWebsiteBlueprint,
  type SerializedWebsiteBlueprint,
} from "@/lib/website/template-v2/blueprint/serialize";

export {
  validateBlueprintInput,
  validateWebsiteBlueprint,
  validateBlueprintEngine,
} from "@/lib/website/template-v2/blueprint/validate";
