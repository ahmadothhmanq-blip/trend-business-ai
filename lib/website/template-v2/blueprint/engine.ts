import {
  inferBusinessSubtype,
  resolveBlueprintContext,
} from "@/lib/website/template-v2/blueprint/defaults";
import { resolveContainerWidths, resolveGridStrategy } from "@/lib/website/template-v2/blueprint/layout";
import { resolveColorPalette } from "@/lib/website/template-v2/blueprint/palettes";
import {
  resolveSectionDensity,
  resolveSectionOrder,
} from "@/lib/website/template-v2/blueprint/section-order";
import {
  buildSectionVariants,
  resolveAccessibilityProfile,
  resolveCtaStrategy,
  resolveFooterStyle,
  resolveHeroComposition,
  resolveImageStrategy,
  resolveMotionStrategy,
  resolveNavigationStyle,
  resolveResponsiveStrategy,
  resolveSeoProfile,
} from "@/lib/website/template-v2/blueprint/strategies";
import { resolveTypographyProfile } from "@/lib/website/template-v2/blueprint/typography";
import type {
  BlueprintInput,
  WebsiteBlueprint,
} from "@/lib/website/template-v2/blueprint/types";
import { BLUEPRINT_ENGINE_VERSION } from "@/lib/website/template-v2/blueprint/weights";
import { decideVariantPlan } from "@/lib/website/template-v2/variants/decision/engine";
import { DECISION_ENGINE_VERSION } from "@/lib/website/template-v2/variants/decision/weights";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

function generateBlueprintId(ctx: ReturnType<typeof resolveBlueprintContext>): string {
  if (ctx.blueprintId) return ctx.blueprintId;
  const parts = [
    ctx.industry,
    ctx.websiteGoal,
    ctx.premiumLevel,
    ctx.seed ?? "default",
  ].join("-");
  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = (hash << 5) - hash + parts.charCodeAt(i);
    hash |= 0;
  }
  return `bp-${Math.abs(hash).toString(36)}`;
}

/**
 * Build a complete Website Blueprint from business context.
 * Uses the Decision Engine internally for section variant selection.
 * Does not render HTML or connect to the generation pipeline.
 */
export function buildWebsiteBlueprint(input: BlueprintInput): WebsiteBlueprint {
  const ctx = resolveBlueprintContext(input);
  const businessSubtype =
    input.businessSubtype?.trim() ||
    inferBusinessSubtype(ctx.industry, ctx.websiteGoal);

  const sectionOrder = resolveSectionOrder(ctx);
  const sectionDensity = resolveSectionDensity(ctx, sectionOrder);

  const decisionPlan = decideVariantPlan({
    industry: ctx.industry,
    businessSubtype,
    brandPersonality: ctx.brandPersonality,
    businessSize: ctx.businessSize,
    targetAudience: ctx.targetAudience,
    websiteGoal: ctx.websiteGoal,
    languageDirection: ctx.languageDirection,
    contentDensity: ctx.contentDensity,
    imageAvailability: ctx.imageAvailability,
    businessModel: ctx.businessModel,
    premiumLevel: ctx.premiumLevel,
    visualStyle: ctx.visualStyle,
    devicePriority: ctx.devicePriority,
    accessibilityLevel: ctx.accessibilityLevel,
    sections: sectionOrder,
    seed: ctx.seed,
  });

  const containerWidths = resolveContainerWidths(ctx);
  const colorPalette = resolveColorPalette(ctx);
  const typographyProfile = resolveTypographyProfile(ctx);
  const gridStrategy = resolveGridStrategy(ctx);

  const heroSelection = decisionPlan.selections.hero!;
  const ctaSelection = decisionPlan.selections.cta!;
  const footerSelection = decisionPlan.selections.footer!;

  const heroComposition = resolveHeroComposition(ctx, heroSelection);
  const ctaStrategy = resolveCtaStrategy(ctx, ctaSelection);
  const imageStrategy = resolveImageStrategy(ctx, heroSelection.variantId);
  const motionStrategy = resolveMotionStrategy(ctx);
  const navigationStyle = resolveNavigationStyle(ctx);
  const footerStyle = resolveFooterStyle(ctx, footerSelection);
  const responsiveStrategy = resolveResponsiveStrategy(
    ctx,
    containerWidths.default,
  );
  const accessibilityProfile = resolveAccessibilityProfile(ctx);
  const seoProfile = resolveSeoProfile(ctx);

  const sectionVariants = buildSectionVariants(
    sectionOrder,
    decisionPlan.selections,
    sectionDensity,
  );

  return {
    meta: {
      version: BLUEPRINT_ENGINE_VERSION,
      blueprintId: generateBlueprintId(ctx),
      generatedAt: new Date().toISOString(),
      seed: ctx.seed,
      decisionEngineVersion: DECISION_ENGINE_VERSION,
    },
    industry: ctx.industry,
    businessSubtype,
    brandPersonality: ctx.brandPersonality,
    websiteGoal: ctx.websiteGoal,
    visualStyle: ctx.visualStyle,
    premiumLevel: ctx.premiumLevel,
    colorPalette,
    typographyProfile,
    sectionOrder,
    sectionVariants,
    sectionDensity,
    containerWidths,
    gridStrategy,
    heroComposition,
    ctaStrategy,
    imageStrategy,
    motionStrategy,
    navigationStyle,
    footerStyle,
    responsiveStrategy,
    accessibilityProfile,
    seoProfile,
    decisionPlan,
  };
}

/**
 * Decide variants for a single section via the blueprint context pipeline.
 */
export function buildSectionBlueprint(
  sectionKind: SectionKind,
  input: BlueprintInput,
): WebsiteBlueprint {
  const blueprint = buildWebsiteBlueprint({
    ...input,
    sectionOrder: [sectionKind, "hero", "cta", "footer"],
  });
  return blueprint;
}
