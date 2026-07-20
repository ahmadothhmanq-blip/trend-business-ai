/**
 * Apply Brand Kit tokens to downstream product surfaces.
 * Returns portable payloads — consumers read via Brand Studio API without coupling.
 */

import type {
  BrandApplyPayload,
  BrandApplyTarget,
  BrandIdentityModel,
} from "@/lib/ai-core/brand-studio/types";

export function buildBrandApplyPayload(
  model: BrandIdentityModel,
  target: BrandApplyTarget,
): BrandApplyPayload {
  return {
    target,
    brandName: model.brandName,
    tokens: model.tokens,
    colors: model.colors,
    typography: model.typography,
    voice: model.voice,
    logoVariants: model.logoVariants,
    guidelines: model.logoDirection.guidelinesDocument,
  };
}

/** Website Builder token shape (read-only contract). */
export function toWebsiteBuilderTokens(model: BrandIdentityModel) {
  return {
    brandName: model.brandName,
    primaryColor: model.tokens.primary,
    secondaryColor: model.tokens.secondary,
    accentColor: model.tokens.accent,
    headingFont: model.tokens.headingFont,
    bodyFont: model.tokens.bodyFont,
    voiceTone: model.tokens.voiceTone,
    tagline: model.tokens.tagline,
    logoSvg: model.logoVariants.find((v) => v.variant === "primary")?.svg,
  };
}

/** App Builder token shape (read-only contract). */
export function toAppBuilderTokens(model: BrandIdentityModel) {
  return {
    name: model.brandName,
    primary: model.tokens.primary,
    accent: model.tokens.accent,
    secondary: model.tokens.secondary,
    headingFont: model.tokens.headingFont,
    bodyFont: model.tokens.bodyFont,
    tagline: model.tokens.tagline,
  };
}

/** Video Studio token shape (read-only contract). */
export function toVideoStudioTokens(model: BrandIdentityModel) {
  return {
    brandName: model.brandName,
    primary: model.tokens.primary,
    accent: model.tokens.accent,
    secondary: model.tokens.secondary,
    voiceTone: model.tokens.voiceTone,
    logoSvg: model.logoVariants.find((v) => v.variant === "icon")?.svg,
  };
}

export function applyBrandKit(
  model: BrandIdentityModel,
  target: BrandApplyTarget,
): Record<string, unknown> {
  switch (target) {
    case "website-builder":
      return toWebsiteBuilderTokens(model);
    case "app-builder":
      return toAppBuilderTokens(model);
    case "video-studio":
      return toVideoStudioTokens(model);
    default:
      return buildBrandApplyPayload(model, target) as unknown as Record<string, unknown>;
  }
}
