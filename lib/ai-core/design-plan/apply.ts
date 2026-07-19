/**
 * Apply an approved Visual Design Plan onto strategy + design system
 * so generation never falls back to generic layouts.
 */

import type { VisualDesignPlan } from "@/lib/ai-core/design-plan/types";
import type {
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

/** Push plan section structure + CTAs into strategy before invent/compose. */
export function applyDesignPlanToStrategy(
  strategy: CoreProductStrategy,
  plan: VisualDesignPlan,
): CoreProductStrategy {
  const contentStructure = plan.sectionStructure.map((s) => s.label);
  return {
    ...strategy,
    positioning: strategy.positioning || plan.intelligence.positioningInsight,
    contentStructure,
    // Keep existing pages; enrich home purpose from plan identity
    pages: (strategy.pages ?? []).map((page, index) =>
      index === 0
        ? {
            ...page,
            purpose:
              page.purpose ||
              `${plan.visualIdentity} — ${plan.sectionStructure[0]?.purpose || "Premium home experience"}`,
            keySections:
              page.keySections?.length
                ? page.keySections
                : contentStructure.slice(0, 6),
          }
        : page,
    ),
  };
}

/** Lock design system tokens to the approved plan (unique premium identity). */
export function applyDesignPlanToDesignSystem(
  design: CoreDesignSystem,
  plan: VisualDesignPlan,
): CoreDesignSystem {
  return {
    ...design,
    style: plan.visualIdentity,
    stylePreset: plan.websiteStyle.enginePreset,
    layoutStyle: plan.websiteStyle.layoutStyle,
    colors: {
      ...design.colors,
      primary: plan.colorSystem.primary,
      secondary: plan.colorSystem.secondary,
      accent: plan.colorSystem.accent,
      neutral: plan.colorSystem.neutral,
      surface: plan.colorSystem.surface,
      background: plan.colorSystem.background,
      foreground: plan.colorSystem.foreground,
    },
    typography: {
      ...design.typography,
      headingFont: plan.typographySystem.headingFont,
      bodyFont: plan.typographySystem.bodyFont,
      notes: `${plan.typographySystem.direction} · ${plan.typographySystem.scaleNotes}`,
    },
    layoutRules: Array.from(
      new Set([
        ...plan.artDirection.slice(0, 8),
        ...plan.antiPatterns.slice(0, 4),
        ...(design.layoutRules ?? []),
      ]),
    ).slice(0, 18),
    uiPatterns: Array.from(
      new Set([
        plan.websiteStyle.heroTreatment,
        plan.websiteStyle.sectionLayout,
        plan.websiteStyle.animationStyle,
        ...(design.uiPatterns ?? []),
      ]),
    ).slice(0, 12),
    componentPalette:
      design.componentPalette?.length
        ? design.componentPalette
        : plan.sectionStructure.map((s) => s.label),
  };
}

/** Labels for renderer / component selection from the approved plan. */
export function designPlanSectionLabels(plan: VisualDesignPlan): string[] {
  return plan.sectionStructure.map((s) => s.label);
}

export function designPlanRequiredImageRoles(
  plan: VisualDesignPlan,
): string[] {
  return plan.imageRequirements.filter((i) => i.required).map((i) => i.role);
}
