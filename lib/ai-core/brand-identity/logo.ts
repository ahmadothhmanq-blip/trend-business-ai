/**
 * Logo Intelligence — style, icon concept, symbolism, usage guidelines.
 */

import type { BrandPresetPackage } from "@/lib/ai-core/brand-identity/presets";
import type { BrandLogoDirection, BrandStrategyBrief } from "@/lib/ai-core/brand-identity/types";

export function buildLogoDirection(
  preset: BrandPresetPackage,
  strategy: BrandStrategyBrief,
  brandName: string,
): BrandLogoDirection {
  const shortName = brandName.trim() || "Brand";
  const industryHint = strategy.industry.toLowerCase();

  let iconConcept = preset.iconConcept;
  if (/restaurant|dining|food/.test(industryHint)) {
    iconConcept = "Refined mark inspired by plate, flame, or monogram letterform";
  } else if (/auto|vehicle|motor/.test(industryHint)) {
    iconConcept = "Sculptural motion mark or monogram seal for flagship vehicles";
  } else if (/saas|software|tech/.test(industryHint)) {
    iconConcept = "App-ready geometric glyph that scales from favicon to wordmark";
  } else if (/financ|bank|clinic/.test(industryHint)) {
    iconConcept = "Trust emblem — shield, column, or precise lettermark";
  } else if (/agency|studio|creative/.test(industryHint)) {
    iconConcept = "Expressive lettermark or craft-tool abstraction";
  }

  return {
    logoStyle: preset.logoStyle,
    iconConcept,
    symbolism: [
      ...preset.symbolism,
      strategy.brandPersonality,
      strategy.archetype.split("/")[0]?.trim() || "brand",
    ].slice(0, 6),
    usageGuidelines: [
      `Primary lockup: ${shortName} wordmark with optional mark to the left`,
      "Maintain clear space equal to the height of the mark's cap height on all sides",
      "Use full-color on light surfaces; use light/mono reverse on dark or photographic heroes",
      "Favicon and app icon: mark-only crop of the primary icon concept",
      "Never stretch, rotate, recolor with off-brand hues, or place on busy textures without a scrim",
      `Align logo personality with ${strategy.brandPersonality} voice — ${preset.label}`,
    ],
    clearSpace: "Minimum clear space = 1× mark height on all sides",
    doNot: [
      "Do not outline, add drop shadows, or apply gradients not in the brand palette",
      "Do not set the wordmark in a non-brand typeface",
      "Do not place the logo smaller than 24px digital height without switching to mark-only",
      "Do not crowd the logo with competing badges in the first viewport",
    ],
  };
}
