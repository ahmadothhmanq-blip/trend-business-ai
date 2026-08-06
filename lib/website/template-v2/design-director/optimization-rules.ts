import { resolveColorPalette } from "@/lib/website/template-v2/blueprint/palettes";
import { resolveBlueprintContext } from "@/lib/website/template-v2/blueprint/defaults";
import { resolveTypographyProfile } from "@/lib/website/template-v2/blueprint/typography";
import {
  resolveHeroComposition,
  resolveFooterStyle,
  resolveCtaStrategy,
} from "@/lib/website/template-v2/blueprint/strategies";
import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import {
  BRAND_PALETTE_AFFINITY,
} from "@/lib/website/template-v2/design-director/weights";
import type {
  DesignImprovement,
  DesignIssue,
} from "@/lib/website/template-v2/design-director/types";
import { getVariantDefinition } from "@/lib/website/template-v2/variants/registry";
import type { SectionKind, VariantComposition } from "@/lib/website/template-v2/variants/types";

export type OptimizationResult = {
  blueprint: WebsiteBlueprint;
  improvements: DesignImprovement[];
  resolvedIssueIds: string[];
};

function cloneBlueprint(blueprint: WebsiteBlueprint): WebsiteBlueprint {
  return structuredClone(blueprint);
}

function improvement(
  issue: DesignIssue,
  description: string,
  field: string,
  before: string,
  after: string,
): DesignImprovement {
  return {
    id: `opt-${issue.id}`,
    category: issue.category,
    description,
    field,
    before,
    after,
    issueId: issue.id,
  };
}

function updateSectionVariant(
  blueprint: WebsiteBlueprint,
  sectionKind: SectionKind,
  variantId: string,
  composition: VariantComposition,
): void {
  const idx = blueprint.sectionVariants.findIndex(
    (s) => s.sectionKind === sectionKind,
  );
  if (idx >= 0) {
    blueprint.sectionVariants[idx] = {
      ...blueprint.sectionVariants[idx]!,
      variantId,
      composition,
    };
  }

  const selection = blueprint.decisionPlan.selections[sectionKind];
  if (selection) {
    blueprint.decisionPlan.selections[sectionKind] = {
      ...selection,
      variantId,
      composition,
    };
  }
}

function findAlternativeComposition(
  blueprint: WebsiteBlueprint,
  avoid: VariantComposition,
  sectionKind: SectionKind,
): { variantId: string; composition: VariantComposition } | null {
  const selection = blueprint.decisionPlan.selections[sectionKind];
  if (selection?.runnerUp) {
    const runnerDef = getVariantDefinition(
      sectionKind,
      selection.runnerUp.variantId,
    );
    if (runnerDef && runnerDef.composition !== avoid) {
      return {
        variantId: selection.runnerUp.variantId,
        composition: runnerDef.composition,
      };
    }
  }

  const scored = blueprint.decisionPlan.scored[sectionKind];
  if (scored) {
    for (const entry of scored) {
      if (!entry.compatible) continue;
      const def = getVariantDefinition(sectionKind, entry.variantId);
      if (def && def.composition !== avoid) {
        return { variantId: entry.variantId, composition: def.composition };
      }
    }
  }

  return null;
}

/**
 * Apply automatic optimizations to resolve detected design issues.
 */
export function applyOptimizationRules(
  blueprint: WebsiteBlueprint,
  issues: DesignIssue[],
): OptimizationResult {
  const optimized = cloneBlueprint(blueprint);
  const improvements: DesignImprovement[] = [];
  const resolvedIssueIds: string[] = [];

  const optimizable = issues.filter((i) => i.optimizable);

  for (const issue of optimizable) {
    let resolved = false;

    // Motion / accessibility conflicts
    if (
      issue.field === "motionStrategy.intensity" &&
      optimized.accessibilityProfile.level === "strict"
    ) {
      const before = optimized.motionStrategy.intensity;
      optimized.motionStrategy = {
        ...optimized.motionStrategy,
        intensity: "none",
        parallax: false,
        microInteractions: false,
        heroEntrance: "fade",
        sectionEntrance: "fade",
        reducedMotionFallback: "instant",
        preset: "reduced-safe",
      };
      improvements.push(
        improvement(
          issue,
          "Reduced motion intensity for strict accessibility",
          "motionStrategy.intensity",
          before,
          "none",
        ),
      );
      resolved = true;
    }

    if (
      issue.field === "motionStrategy.intensity" &&
      optimized.visualStyle === "minimal" &&
      optimized.motionStrategy.intensity === "expressive"
    ) {
      const before = optimized.motionStrategy.intensity;
      optimized.motionStrategy.intensity = "subtle";
      improvements.push(
        improvement(
          issue,
          "Aligned motion with minimal visual style",
          "motionStrategy.intensity",
          before,
          "subtle",
        ),
      );
      resolved = true;
    }

    if (issue.field === "motionStrategy.parallax") {
      const before = String(optimized.motionStrategy.parallax);
      optimized.motionStrategy.parallax = false;
      improvements.push(
        improvement(
          issue,
          "Disabled parallax for motion-safe profile",
          "motionStrategy.parallax",
          before,
          "false",
        ),
      );
      resolved = true;
    }

    // Image / hero conflicts
    if (issue.field === "heroComposition.mediaPosition") {
      const before = optimized.heroComposition.mediaPosition;
      optimized.heroComposition = {
        ...optimized.heroComposition,
        mediaPosition: "none",
      };
      optimized.imageStrategy = {
        ...optimized.imageStrategy,
        heroTreatment: "typography-only",
        sectionImagery: "none",
      };
      improvements.push(
        improvement(
          issue,
          "Removed hero media when images unavailable",
          "heroComposition.mediaPosition",
          before,
          "none",
        ),
      );
      resolved = true;
    }

    // Color contrast
    if (issue.field === "colorPalette.contrast") {
      const before = optimized.colorPalette.contrast;
      optimized.colorPalette = {
        ...optimized.colorPalette,
        contrast: "high",
      };
      improvements.push(
        improvement(
          issue,
          "Elevated palette contrast for AAA accessibility",
          "colorPalette.contrast",
          before,
          "high",
        ),
      );
      resolved = true;
    }

    // Brand palette mismatch
    if (issue.field === "colorPalette.presetId") {
      const affinity = BRAND_PALETTE_AFFINITY[optimized.brandPersonality];
      if (affinity?.length) {
        const ctx = resolveBlueprintContext({
          industry: optimized.industry,
          brandPersonality: optimized.brandPersonality,
          websiteGoal: optimized.websiteGoal,
          premiumLevel: optimized.premiumLevel,
          visualStyle: optimized.visualStyle,
        });
        const palette = resolveColorPalette(ctx);
        const before = optimized.colorPalette.presetId;
        optimized.colorPalette = palette;
        improvements.push(
          improvement(
            issue,
            "Realigned color palette with brand personality",
            "colorPalette.presetId",
            before,
            palette.presetId,
          ),
        );
        resolved = true;
      }
    }

    // Typography mismatch
    if (issue.field === "typographyProfile.presetId") {
      const ctx = resolveBlueprintContext({
        industry: optimized.industry,
        brandPersonality: optimized.brandPersonality,
        websiteGoal: optimized.websiteGoal,
        premiumLevel: optimized.premiumLevel,
        visualStyle: optimized.visualStyle,
        contentDensity: optimized.sectionDensity.features ?? "medium",
      });
      const typo = resolveTypographyProfile(ctx);
      const before = optimized.typographyProfile.presetId;
      optimized.typographyProfile = typo;
      improvements.push(
        improvement(
          issue,
          "Realigned typography with brand personality",
          "typographyProfile.presetId",
          before,
          typo.presetId,
        ),
      );
      resolved = true;
    }

    if (issue.field === "typographyProfile.scale" && optimized.premiumLevel === "luxury") {
      const before = optimized.typographyProfile.scale;
      optimized.typographyProfile = {
        ...optimized.typographyProfile,
        scale: "expressive",
      };
      improvements.push(
        improvement(
          issue,
          "Upgraded typography scale for luxury tier",
          "typographyProfile.scale",
          before,
          "expressive",
        ),
      );
      resolved = true;
    }

    // CTA emphasis
    if (issue.field === "ctaStrategy.emphasis") {
      const before = optimized.ctaStrategy.emphasis;
      optimized.ctaStrategy = {
        ...optimized.ctaStrategy,
        emphasis: "bold",
        frequency: "dual",
      };
      improvements.push(
        improvement(
          issue,
          "Strengthened CTA emphasis for conversion goal",
          "ctaStrategy.emphasis",
          before,
          "bold",
        ),
      );
      resolved = true;
    }

    if (issue.field === "ctaStrategy.frequency") {
      const before = optimized.ctaStrategy.frequency;
      optimized.ctaStrategy.frequency = "dual";
      improvements.push(
        improvement(
          issue,
          "Added dual CTA frequency for long conversion page",
          "ctaStrategy.frequency",
          before,
          "dual",
        ),
      );
      resolved = true;
    }

    // Image strategy
    if (issue.field === "imageStrategy.sectionImagery") {
      const before = optimized.imageStrategy.sectionImagery;
      optimized.imageStrategy.sectionImagery = "rich";
      improvements.push(
        improvement(
          issue,
          "Increased section imagery to match availability",
          "imageStrategy.sectionImagery",
          before,
          "rich",
        ),
      );
      resolved = true;
    }

    if (issue.field === "imageStrategy.heroTreatment") {
      const before = optimized.imageStrategy.heroTreatment;
      optimized.imageStrategy.heroTreatment = "contained";
      improvements.push(
        improvement(
          issue,
          "Reduced hero treatment for limited image availability",
          "imageStrategy.heroTreatment",
          before,
          "contained",
        ),
      );
      resolved = true;
    }

    // Navigation
    if (issue.field === "navigationStyle.density" && optimized.premiumLevel === "luxury") {
      const before = optimized.navigationStyle.density;
      optimized.navigationStyle.density = "spacious";
      improvements.push(
        improvement(
          issue,
          "Expanded navigation density for luxury tier",
          "navigationStyle.density",
          before,
          "spacious",
        ),
      );
      resolved = true;
    }

    if (issue.field === "navigationStyle.layout") {
      const before = optimized.navigationStyle.layout;
      optimized.navigationStyle.layout = "top-bar";
      improvements.push(
        improvement(
          issue,
          "Switched to top-bar nav for non-full-bleed hero",
          "navigationStyle.layout",
          before,
          "top-bar",
        ),
      );
      resolved = true;
    }

    // Footer consistency
    if (issue.field === "footerStyle.layout") {
      const before = optimized.footerStyle.layout;
      optimized.footerStyle = {
        ...optimized.footerStyle,
        layout: "columns",
      };
      improvements.push(
        improvement(
          issue,
          "Upgraded footer layout for navigation consistency",
          "footerStyle.layout",
          before,
          "columns",
        ),
      );
      resolved = true;
    }

    // Responsive
    if (issue.field === "responsiveStrategy.stackOrder") {
      const before = optimized.responsiveStrategy.stackOrder;
      optimized.responsiveStrategy.stackOrder = "content-first";
      improvements.push(
        improvement(
          issue,
          "Aligned stack order with mobile-first priority",
          "responsiveStrategy.stackOrder",
          before,
          "content-first",
        ),
      );
      resolved = true;
    }

    if (issue.field === "responsiveStrategy.mobileNav") {
      optimized.responsiveStrategy.mobileNav = true;
      improvements.push(
        improvement(
          issue,
          "Enabled mobile navigation",
          "responsiveStrategy.mobileNav",
          "false",
          "true",
        ),
      );
      resolved = true;
    }

    // Grid / density
    if (issue.field === "gridStrategy.gutter" && optimized.premiumLevel === "luxury") {
      const before = optimized.gridStrategy.gutter;
      optimized.gridStrategy.gutter = "relaxed";
      improvements.push(
        improvement(
          issue,
          "Relaxed grid gutters for luxury visual quality",
          "gridStrategy.gutter",
          before,
          "relaxed",
        ),
      );
      resolved = true;
    }

    if (issue.field === "gridStrategy.rhythm") {
      const before = optimized.gridStrategy.rhythm;
      optimized.gridStrategy.rhythm = "balanced";
      improvements.push(
        improvement(
          issue,
          "Balanced grid rhythm with typography scale",
          "gridStrategy.rhythm",
          before,
          "balanced",
        ),
      );
      resolved = true;
    }

    // Section density rhythm
    if (issue.field === "sectionDensity" && issue.category === "rhythm") {
      const run = issue.sectionKind;
      if (run && optimized.sectionDensity[run] === "dense") {
        const before = optimized.sectionDensity[run]!;
        optimized.sectionDensity[run] = "medium";
        const svIdx = optimized.sectionVariants.findIndex(
          (s) => s.sectionKind === run,
        );
        if (svIdx >= 0) {
          optimized.sectionVariants[svIdx]!.density = "medium";
        }
        improvements.push(
          improvement(
            issue,
            `Reduced density of ${run} to break consecutive dense run`,
            `sectionDensity.${run}`,
            before,
            "medium",
          ),
        );
        resolved = true;
      }
    }

    if (issue.field === "sectionDensity" && issue.category === "density") {
      let changed = false;
      for (const section of optimized.sectionVariants) {
        if (optimized.sectionDensity[section.sectionKind] === "dense") {
          optimized.sectionDensity[section.sectionKind] = "medium";
          section.density = "medium";
          changed = true;
        }
      }
      if (changed) {
        improvements.push(
          improvement(
            issue,
            "Reduced overall section density for balance",
            "sectionDensity",
            "majority-dense",
            "balanced",
          ),
        );
        resolved = true;
      }
    }

    // Hero hierarchy
    if (issue.field === "heroComposition.minHeight") {
      const before = optimized.heroComposition.minHeight;
      optimized.heroComposition.minHeight = "viewport";
      improvements.push(
        improvement(
          issue,
          "Expanded hero height for luxury hierarchy",
          "heroComposition.minHeight",
          before,
          "viewport",
        ),
      );
      resolved = true;
    }

    // Layout repetition — swap last repeated section
    if (
      issue.category === "layout-repetition" &&
      issue.sectionKind
    ) {
      const section = issue.sectionKind;
      const current = optimized.sectionVariants.find(
        (s) => s.sectionKind === section,
      );
      if (current) {
        const alt = findAlternativeComposition(
          optimized,
          current.composition,
          section,
        );
        if (alt) {
          updateSectionVariant(
            optimized,
            section,
            alt.variantId,
            alt.composition,
          );

          if (section === "hero") {
            const ctx = resolveBlueprintContext({
              industry: optimized.industry,
              websiteGoal: optimized.websiteGoal,
              imageAvailability: optimized.imageStrategy.availability,
              premiumLevel: optimized.premiumLevel,
            });
            const heroSel = optimized.decisionPlan.selections.hero!;
            optimized.heroComposition = resolveHeroComposition(ctx, {
              ...heroSel,
              variantId: alt.variantId,
              composition: alt.composition,
            });
          }
          if (section === "cta") {
            const ctx = resolveBlueprintContext({
              websiteGoal: optimized.websiteGoal,
              premiumLevel: optimized.premiumLevel,
            });
            const ctaSel = optimized.decisionPlan.selections.cta!;
            optimized.ctaStrategy = resolveCtaStrategy(ctx, {
              ...ctaSel,
              variantId: alt.variantId,
              composition: alt.composition,
            });
          }
          if (section === "footer") {
            const ctx = resolveBlueprintContext({
              websiteGoal: optimized.websiteGoal,
              targetAudience: optimized.decisionPlan.context.targetAudience,
            });
            const footerSel = optimized.decisionPlan.selections.footer!;
            optimized.footerStyle = resolveFooterStyle(ctx, {
              ...footerSel,
              variantId: alt.variantId,
              composition: alt.composition,
            });
          }

          improvements.push(
            improvement(
              issue,
              `Swapped ${section} variant to diversify composition`,
              `sectionVariants.${section}`,
              current.variantId,
              alt.variantId,
            ),
          );
          resolved = true;
        }
      }
    }

    // SEO schema
    if (issue.field === "seoProfile.schemaTypes") {
      const before = optimized.seoProfile.schemaTypes.join(", ");
      const types = new Set(optimized.seoProfile.schemaTypes);
      if (optimized.websiteGoal === "saas") types.add("SoftwareApplication");
      if (optimized.websiteGoal === "booking") types.add("LocalBusiness");
      types.add("Organization");
      types.add("WebSite");
      optimized.seoProfile = {
        ...optimized.seoProfile,
        schemaTypes: [...types],
        structuredData: true,
      };
      improvements.push(
        improvement(
          issue,
          "Added goal-aligned schema types",
          "seoProfile.schemaTypes",
          before,
          optimized.seoProfile.schemaTypes.join(", "),
        ),
      );
      resolved = true;
    }

    if (issue.field === "seoProfile.structuredData") {
      optimized.seoProfile.structuredData = true;
      improvements.push(
        improvement(
          issue,
          "Enabled structured data for SEO",
          "seoProfile.structuredData",
          "false",
          "true",
        ),
      );
      resolved = true;
    }

    // Accessibility focus
    if (issue.field === "accessibilityProfile.focusVisible") {
      optimized.accessibilityProfile.focusVisible = true;
      improvements.push(
        improvement(
          issue,
          "Enabled focus indicators",
          "accessibilityProfile.focusVisible",
          "false",
          "true",
        ),
      );
      resolved = true;
    }

    if (issue.field === "typographyProfile.rtlDisplay") {
      optimized.typographyProfile.rtlDisplay =
        optimized.typographyProfile.rtlDisplay ?? "Noto Sans Arabic";
      optimized.typographyProfile.rtlBody =
        optimized.typographyProfile.rtlBody ?? "Noto Sans Arabic";
      improvements.push(
        improvement(
          issue,
          "Added RTL typography fallbacks",
          "typographyProfile.rtlDisplay",
          "undefined",
          optimized.typographyProfile.rtlDisplay,
        ),
      );
      resolved = true;
    }

    if (resolved) {
      resolvedIssueIds.push(issue.id);
    }
  }

  return { blueprint: optimized, improvements, resolvedIssueIds };
}
