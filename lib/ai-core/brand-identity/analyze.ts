/**
 * Compose a complete Brand Identity Brief from business signals + brand presets.
 */

import { getBrandPreset } from "@/lib/ai-core/brand-identity/presets";
import { analyzeBrandStrategy } from "@/lib/ai-core/brand-identity/strategy";
import {
  buildAnimationDirection,
  buildBrandColorSystem,
  buildBrandSpacing,
  buildBrandTypography,
  buildBrandUiStyle,
  buildComponentStyle,
  buildImageDirection,
} from "@/lib/ai-core/brand-identity/identity";
import { buildLogoDirection } from "@/lib/ai-core/brand-identity/logo";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

function slugId(brandName: string, presetId: string): string {
  const base = brandName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 24);
  return `brand-${base || "identity"}-${presetId.replace(/-brand$/, "")}`;
}

/**
 * Build complete professional brand identity before design generation.
 */
export function analyzeBrandIdentity(params: {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  preferredStyle?: string | null;
}): BrandIdentityBrief {
  const brandName =
    params.profile?.projectName?.trim() ||
    params.strategy?.positioning?.split(/[.|—-]/)[0]?.trim() ||
    "Brand";

  const { strategy, presetId } = analyzeBrandStrategy(params);
  const preset = getBrandPreset(presetId);

  const colors = buildBrandColorSystem(preset, brandName);
  const typography = buildBrandTypography(preset);
  const spacing = buildBrandSpacing(preset);
  const uiStyle = buildBrandUiStyle(preset, strategy);
  const imageDirection = buildImageDirection(preset, strategy);
  const animationDirection = buildAnimationDirection(preset);
  const componentStyle = buildComponentStyle(preset);
  const logo = buildLogoDirection(preset, strategy, brandName);

  const artDirectionNotes = [
    "Brand Identity Intelligence — complete identity before any website design",
    `Preset: ${preset.label} → premium style ${preset.premiumStyleId}`,
    `Voice: ${strategy.brandVoice.tone}`,
    `Visual: ${strategy.visualDirection}`,
    `Type pairing: ${typography.pairing}`,
    `UI: ${uiStyle.notes}`,
    `Image: ${imageDirection}`,
    `Logo: ${logo.logoStyle} · ${logo.iconConcept}`,
    `Archetype: ${strategy.archetype} · Personality: ${strategy.brandPersonality}`,
  ];

  const summary = `${brandName}: ${preset.label} identity · ${typography.pairing} · primary ${colors.primary} · ${strategy.brandPersonality} voice · logo ${logo.logoStyle}`;

  return {
    id: slugId(brandName, presetId),
    brandName,
    presetId,
    premiumStyleId: preset.premiumStyleId,
    enginePreset: preset.enginePreset,
    strategy,
    colors,
    typography,
    spacing,
    uiStyle,
    imageDirection,
    animationDirection,
    componentStyle,
    logo,
    artDirectionNotes,
    confidence: 0.9,
    reason: `Brand Identity Intelligence chose ${preset.label} for ${strategy.businessType} targeting ${strategy.targetAudience.split(/[,.]/)[0]?.trim()}`,
    summary,
  };
}
