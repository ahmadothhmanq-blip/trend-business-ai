/**
 * Apply Brand Identity Brief onto design systems and design-plan seeds.
 */

import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { VisualDesignPlan } from "@/lib/ai-core/design-plan/types";
import type { CoreDesignSystem } from "@/lib/ai-core/layers/types";

/** Seed payload for premium / design plan builders. */
export function brandIdentityPlanSeeds(brand: BrandIdentityBrief): {
  preferredStyle: string;
  seedPrimary: string;
  seedSecondary: string;
  seedAccent: string;
  brandTone: string;
  imageStyle: string;
  animationStyle: string;
  componentStyle: string;
} {
  return {
    preferredStyle: brand.premiumStyleId,
    seedPrimary: brand.colors.primary,
    seedSecondary: brand.colors.secondary,
    seedAccent: brand.colors.accent,
    brandTone: brand.strategy.brandVoice.tone,
    imageStyle: brand.imageDirection,
    animationStyle: brand.animationDirection,
    componentStyle: brand.componentStyle,
  };
}

/**
 * Lock CoreDesignSystem tokens to the approved brand identity.
 * Call after premium apply / design plan apply so brand colors & type win.
 */
export function applyBrandIdentityToDesignSystem(
  design: CoreDesignSystem,
  brand: BrandIdentityBrief,
): CoreDesignSystem {
  return {
    ...design,
    style: design.style || `${brand.brandName} · ${brand.presetId}`,
    stylePreset: brand.enginePreset || design.stylePreset,
    colors: {
      ...design.colors,
      primary: brand.colors.primary,
      secondary: brand.colors.secondary,
      accent: brand.colors.accent,
      neutral: brand.colors.neutral,
      surface: brand.colors.surface,
      background: brand.colors.background,
      foreground: brand.colors.foreground,
    },
    typography: {
      ...design.typography,
      headingFont: brand.typography.headingFont,
      bodyFont: brand.typography.bodyFont,
      notes: `${brand.typography.direction} · ${brand.typography.pairing} · ${brand.typography.scaleNotes}`,
    },
    spacingSystem: {
      unit: "4px",
      scale: ["0.25rem", "0.5rem", "1rem", "1.5rem", "2.5rem", "4rem"],
      sectionGap: brand.spacing.sectionY,
      containerMax: brand.spacing.containerMax,
      notes: brand.spacing.notes,
    },
    uiStyle: {
      density: brand.uiStyle.density,
      corners: brand.uiStyle.corners,
      elevation: brand.uiStyle.elevation,
      contrast: brand.uiStyle.contrast,
      notes: brand.uiStyle.notes,
    },
    componentStyle: {
      buttons: brand.uiStyle.buttons,
      cards: brand.uiStyle.cards,
      inputs: "Clean branded inputs with soft focus ring",
      navigation: brand.uiStyle.navigation,
      palette: design.componentStyle?.palette ?? design.componentPalette ?? [],
    },
    animationStyle: {
      motion:
        /none|barely/.test(brand.animationDirection.toLowerCase())
          ? "none"
          : /expressive|stagger|glow/.test(brand.animationDirection.toLowerCase())
            ? "expressive"
            : "subtle",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      duration: "700ms",
      entrances: brand.animationDirection
        .toLowerCase()
        .includes("slow")
        ? ["slow-reveal", "fade-up"]
        : ["fade-up", "scale-in"],
      notes: brand.animationDirection,
    },
    layoutRules: Array.from(
      new Set([
        ...brand.artDirectionNotes.slice(0, 6),
        `Brand voice: ${brand.strategy.brandVoice.tone}`,
        `Image direction: ${brand.imageDirection}`,
        `Logo: ${brand.logo.logoStyle}`,
        ...(design.layoutRules ?? []),
      ]),
    ).slice(0, 20),
    borderRadius:
      brand.uiStyle.corners === "sharp"
        ? "0.35rem"
        : brand.uiStyle.corners === "pill"
          ? "9999px"
          : "0.75rem",
    shadowStyle:
      brand.uiStyle.elevation === "flat"
        ? "none"
        : brand.uiStyle.elevation === "elevated"
          ? "elevated soft"
          : "soft",
  };
}

/** Enrich an approved VisualDesignPlan with brand identity tokens. */
export function applyBrandIdentityToDesignPlan(
  plan: VisualDesignPlan,
  brand: BrandIdentityBrief,
): VisualDesignPlan {
  return {
    ...plan,
    brandName: plan.brandName || brand.brandName,
    colorSystem: {
      ...plan.colorSystem,
      primary: brand.colors.primary,
      secondary: brand.colors.secondary,
      accent: brand.colors.accent,
      neutral: brand.colors.neutral,
      surface: brand.colors.surface,
      background: brand.colors.background,
      foreground: brand.colors.foreground,
      direction: brand.colors.direction,
    },
    typographySystem: {
      ...plan.typographySystem,
      displayFont: brand.typography.displayFont,
      headingFont: brand.typography.headingFont,
      bodyFont: brand.typography.bodyFont,
      direction: brand.typography.direction,
      scaleNotes: brand.typography.scaleNotes,
    },
    spacingNotes: brand.spacing.notes,
    websiteStyle: {
      ...plan.websiteStyle,
      premiumStyleId: brand.premiumStyleId || plan.websiteStyle.premiumStyleId,
      enginePreset: brand.enginePreset || plan.websiteStyle.enginePreset,
      animationStyle: brand.animationDirection,
      componentStyle: brand.componentStyle,
      density: brand.spacing.density,
    },
    imageRequirements: plan.imageRequirements.map((req) => ({
      ...req,
      style: `${brand.imageDirection}; ${req.style}`,
    })),
    artDirection: Array.from(
      new Set([
        ...brand.artDirectionNotes,
        `Logo direction: ${brand.logo.logoStyle} — ${brand.logo.iconConcept}`,
        ...plan.artDirection,
      ]),
    ).slice(0, 24),
    summary: `${plan.summary} · Brand: ${brand.presetId}`,
  };
}
