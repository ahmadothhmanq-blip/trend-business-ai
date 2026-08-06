import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import {
  BRAND_PALETTE_AFFINITY,
  BRAND_TYPOGRAPHY_AFFINITY,
  STYLE_MOTION_COMPAT,
} from "@/lib/website/template-v2/design-director/weights";
import type { DesignIssue } from "@/lib/website/template-v2/design-director/types";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

let issueCounter = 0;

function issue(
  category: DesignIssue["category"],
  severity: DesignIssue["severity"],
  message: string,
  opts: { sectionKind?: SectionKind; field?: string; optimizable?: boolean } = {},
): DesignIssue {
  issueCounter += 1;
  return {
    id: `issue-${category}-${issueCounter}`,
    category,
    severity,
    message,
    sectionKind: opts.sectionKind,
    field: opts.field,
    optimizable: opts.optimizable ?? severity !== "info",
  };
}

function countCompositions(blueprint: WebsiteBlueprint): Map<string, SectionKind[]> {
  const map = new Map<string, SectionKind[]>();
  for (const section of blueprint.sectionVariants) {
    const list = map.get(section.composition) ?? [];
    list.push(section.sectionKind);
    map.set(section.composition, list);
  }
  return map;
}

function consecutiveDenseSections(
  blueprint: WebsiteBlueprint,
): SectionKind[][] {
  const runs: SectionKind[][] = [];
  let current: SectionKind[] = [];

  for (const kind of blueprint.sectionOrder) {
    const density = blueprint.sectionDensity[kind];
    if (density === "dense") {
      current.push(kind);
    } else {
      if (current.length >= 2) runs.push([...current]);
      current = [];
    }
  }
  if (current.length >= 2) runs.push(current);
  return runs;
}

/**
 * Run all design validation rules against a blueprint.
 */
export function runValidationRules(blueprint: WebsiteBlueprint): DesignIssue[] {
  issueCounter = 0;
  const issues: DesignIssue[] = [];

  // --- Visual quality ---
  if (blueprint.premiumLevel === "luxury" && blueprint.gridStrategy.gutter === "tight") {
    issues.push(
      issue("visual-quality", "warning", "Luxury tier with tight grid gutters reduces perceived quality", {
        field: "gridStrategy.gutter",
      }),
    );
  }

  // --- Conflicts ---
  if (
    blueprint.accessibilityProfile.level === "strict" &&
    blueprint.motionStrategy.intensity !== "none"
  ) {
    issues.push(
      issue("conflict", "critical", "Strict accessibility conflicts with non-none motion intensity", {
        field: "motionStrategy.intensity",
      }),
    );
  }

  if (
    blueprint.imageStrategy.availability === "none" &&
    blueprint.heroComposition.mediaPosition !== "none"
  ) {
    issues.push(
      issue("conflict", "critical", "No images available but hero has media position", {
        field: "heroComposition.mediaPosition",
      }),
    );
  }

  if (
    blueprint.visualStyle === "minimal" &&
    blueprint.motionStrategy.intensity === "expressive"
  ) {
    issues.push(
      issue("conflict", "warning", "Minimal visual style conflicts with expressive motion", {
        field: "motionStrategy.intensity",
      }),
    );
  }

  const motionCompat = STYLE_MOTION_COMPAT[blueprint.visualStyle];
  if (motionCompat && !motionCompat.includes(blueprint.motionStrategy.intensity)) {
    issues.push(
      issue("conflict", "warning", `Motion intensity "${blueprint.motionStrategy.intensity}" atypical for style "${blueprint.visualStyle}"`, {
        field: "motionStrategy.intensity",
      }),
    );
  }

  // --- Hierarchy ---
  const hero = blueprint.sectionVariants.find((s) => s.sectionKind === "hero");
  const cta = blueprint.sectionVariants.find((s) => s.sectionKind === "cta");
  if (hero && cta && cta.score > hero.score + 10) {
    issues.push(
      issue("hierarchy", "warning", "CTA section scores higher than hero — hierarchy may be inverted", {
        sectionKind: "hero",
        field: "sectionVariants",
      }),
    );
  }

  if (blueprint.heroComposition.minHeight === "compact" && blueprint.premiumLevel === "luxury") {
    issues.push(
      issue("hierarchy", "warning", "Luxury sites benefit from a more prominent hero presence", {
        field: "heroComposition.minHeight",
      }),
    );
  }

  // --- Brand identity ---
  const paletteAffinity = BRAND_PALETTE_AFFINITY[blueprint.brandPersonality];
  if (paletteAffinity && !paletteAffinity.includes(blueprint.colorPalette.presetId)) {
    issues.push(
      issue("brand-identity", "warning", `Palette "${blueprint.colorPalette.presetId}" mismatches "${blueprint.brandPersonality}" personality`, {
        field: "colorPalette.presetId",
      }),
    );
  }

  const typoAffinity = BRAND_TYPOGRAPHY_AFFINITY[blueprint.brandPersonality];
  if (typoAffinity && !typoAffinity.includes(blueprint.typographyProfile.presetId)) {
    issues.push(
      issue("brand-identity", "warning", `Typography "${blueprint.typographyProfile.presetId}" mismatches "${blueprint.brandPersonality}" personality`, {
        field: "typographyProfile.presetId",
      }),
    );
  }

  if (blueprint.visualStyle === "luxury" && blueprint.colorPalette.mode === "mixed") {
    issues.push(
      issue("brand-identity", "info", "Mixed color mode may dilute luxury brand cohesion", {
        field: "colorPalette.mode",
        optimizable: false,
      }),
    );
  }

  // --- Density ---
  const denseCount = blueprint.sectionVariants.filter(
    (s) => blueprint.sectionDensity[s.sectionKind] === "dense",
  ).length;
  const sparseCount = blueprint.sectionVariants.filter(
    (s) => blueprint.sectionDensity[s.sectionKind] === "sparse",
  ).length;

  if (denseCount > blueprint.sectionVariants.length * 0.6) {
    issues.push(
      issue("density", "warning", "Over 60% of sections are dense — page may feel crowded", {
        field: "sectionDensity",
      }),
    );
  }

  if (sparseCount === blueprint.sectionVariants.length && blueprint.websiteGoal !== "portfolio") {
    issues.push(
      issue("density", "info", "All sections are sparse — may lack substance for conversion goals", {
        field: "sectionDensity",
        optimizable: true,
      }),
    );
  }

  if (
    blueprint.gridStrategy.rhythm === "dense" &&
    blueprint.typographyProfile.scale === "expressive"
  ) {
    issues.push(
      issue("density", "warning", "Dense grid rhythm conflicts with expressive typography scale", {
        field: "gridStrategy.rhythm",
      }),
    );
  }

  // --- Rhythm ---
  for (const run of consecutiveDenseSections(blueprint)) {
    issues.push(
      issue("rhythm", "warning", `Consecutive dense sections (${run.join(" → ")}) break visual rhythm`, {
        field: "sectionDensity",
        sectionKind: run[0],
      }),
    );
  }

  const compositions = blueprint.sectionVariants.map((s) => s.composition);
  let sameAdjacent = 0;
  for (let i = 1; i < compositions.length; i++) {
    if (compositions[i] === compositions[i - 1]) sameAdjacent += 1;
  }
  if (sameAdjacent >= 2) {
    issues.push(
      issue("rhythm", "warning", `${sameAdjacent} adjacent sections share the same composition — rhythm is monotonous`, {
        field: "sectionVariants",
      }),
    );
  }

  // --- Layout repetition ---
  const compMap = countCompositions(blueprint);
  for (const [composition, sections] of compMap) {
    if (sections.length >= 3) {
      issues.push(
        issue("layout-repetition", "warning", `Composition "${composition}" repeated ${sections.length} times (${sections.join(", ")})`, {
          field: "sectionVariants",
          sectionKind: sections[sections.length - 1],
        }),
      );
    }
  }

  // --- Color harmony ---
  if (
    blueprint.accessibilityProfile.colorContrastMinimum === "AAA" &&
    blueprint.colorPalette.contrast === "standard"
  ) {
    issues.push(
      issue("color-harmony", "critical", "AAA accessibility requires high-contrast palette", {
        field: "colorPalette.contrast",
      }),
    );
  }

  if (blueprint.colorPalette.colors.primary === blueprint.colorPalette.colors.accent) {
    issues.push(
      issue("color-harmony", "warning", "Primary and accent colors are identical — weak visual hierarchy", {
        field: "colorPalette.colors",
      }),
    );
  }

  // --- Typography ---
  if (
    blueprint.typographyProfile.display === blueprint.typographyProfile.body &&
    blueprint.typographyProfile.scale === "expressive"
  ) {
    issues.push(
      issue("typography", "info", "Single-font expressive scale may lack typographic contrast", {
        field: "typographyProfile",
        optimizable: false,
      }),
    );
  }

  if (
    blueprint.premiumLevel === "luxury" &&
    blueprint.typographyProfile.scale === "compact"
  ) {
    issues.push(
      issue("typography", "warning", "Compact typography scale underfits luxury positioning", {
        field: "typographyProfile.scale",
      }),
    );
  }

  // --- CTA ---
  const leadGoals = ["lead-generation", "sales", "saas", "ecommerce"];
  if (
    leadGoals.includes(blueprint.websiteGoal) &&
    blueprint.ctaStrategy.emphasis === "subtle"
  ) {
    issues.push(
      issue("cta", "warning", `Conversion goal "${blueprint.websiteGoal}" needs stronger CTA emphasis`, {
        field: "ctaStrategy.emphasis",
      }),
    );
  }

  if (
    blueprint.ctaStrategy.frequency === "single" &&
    blueprint.sectionOrder.length > 7 &&
    leadGoals.includes(blueprint.websiteGoal)
  ) {
    issues.push(
      issue("cta", "info", "Long page with single CTA may reduce conversion opportunities", {
        field: "ctaStrategy.frequency",
        optimizable: true,
      }),
    );
  }

  // --- Image ---
  if (
    blueprint.imageStrategy.availability === "rich" &&
    blueprint.imageStrategy.sectionImagery === "minimal"
  ) {
    issues.push(
      issue("image", "warning", "Rich image availability underutilized in section imagery", {
        field: "imageStrategy.sectionImagery",
      }),
    );
  }

  if (
    blueprint.imageStrategy.heroTreatment === "full-bleed" &&
    blueprint.imageStrategy.availability === "limited"
  ) {
    issues.push(
      issue("image", "warning", "Full-bleed hero risky with limited image availability", {
        field: "imageStrategy.heroTreatment",
      }),
    );
  }

  // --- Navigation ---
  if (
    blueprint.navigationStyle.density === "compact" &&
    blueprint.premiumLevel === "luxury"
  ) {
    issues.push(
      issue("navigation", "warning", "Compact navigation density underfits luxury tier", {
        field: "navigationStyle.density",
      }),
    );
  }

  if (
    blueprint.navigationStyle.layout === "transparent-overlay" &&
    blueprint.heroComposition.layout !== "full-bleed"
  ) {
    issues.push(
      issue("navigation", "warning", "Transparent overlay nav expects full-bleed hero", {
        field: "navigationStyle.layout",
      }),
    );
  }

  // --- Footer ---
  if (
    blueprint.footerStyle.layout === "inline" &&
    blueprint.premiumLevel === "enterprise"
  ) {
    issues.push(
      issue("footer", "info", "Inline footer may be insufficient for enterprise sites", {
        field: "footerStyle.layout",
        optimizable: false,
      }),
    );
  }

  if (
    blueprint.navigationStyle.density !== blueprint.footerStyle.layout &&
    blueprint.navigationStyle.density === "spacious" &&
    blueprint.footerStyle.layout === "inline"
  ) {
    issues.push(
      issue("footer", "warning", "Spacious navigation with inline footer lacks consistency", {
        field: "footerStyle.layout",
      }),
    );
  }

  // --- Responsive ---
  if (
    blueprint.responsiveStrategy.devicePriority === "mobile-first" &&
    blueprint.responsiveStrategy.stackOrder === "visual-first"
  ) {
    issues.push(
      issue("responsive", "warning", "Mobile-first strategy should prefer content-first stacking", {
        field: "responsiveStrategy.stackOrder",
      }),
    );
  }

  if (
    blueprint.responsiveStrategy.devicePriority === "desktop-first" &&
    !blueprint.responsiveStrategy.mobileNav
  ) {
    issues.push(
      issue("responsive", "critical", "Desktop-first layout requires mobile navigation", {
        field: "responsiveStrategy.mobileNav",
      }),
    );
  }

  // --- Accessibility ---
  if (blueprint.accessibilityProfile.motionSafe && blueprint.motionStrategy.parallax) {
    issues.push(
      issue("accessibility", "warning", "Motion-safe profile should disable parallax", {
        field: "motionStrategy.parallax",
      }),
    );
  }

  if (
    blueprint.accessibilityProfile.rtlSupport &&
    !blueprint.typographyProfile.rtlDisplay
  ) {
    issues.push(
      issue("accessibility", "critical", "RTL support enabled but no RTL display font defined", {
        field: "typographyProfile.rtlDisplay",
      }),
    );
  }

  if (!blueprint.accessibilityProfile.focusVisible) {
    issues.push(
      issue("accessibility", "critical", "Focus indicators must be visible for accessibility", {
        field: "accessibilityProfile.focusVisible",
      }),
    );
  }

  // --- SEO ---
  if (!blueprint.seoProfile.structuredData) {
    issues.push(
      issue("seo", "warning", "Structured data disabled — reduces search visibility", {
        field: "seoProfile.structuredData",
      }),
    );
  }

  if (
    blueprint.websiteGoal === "saas" &&
    !blueprint.seoProfile.schemaTypes.includes("SoftwareApplication")
  ) {
    issues.push(
      issue("seo", "warning", "SaaS goal missing SoftwareApplication schema type", {
        field: "seoProfile.schemaTypes",
      }),
    );
  }

  if (
    blueprint.websiteGoal === "booking" &&
    !blueprint.seoProfile.schemaTypes.includes("LocalBusiness")
  ) {
    issues.push(
      issue("seo", "warning", "Booking goal missing LocalBusiness schema type", {
        field: "seoProfile.schemaTypes",
      }),
    );
  }

  return issues;
}
