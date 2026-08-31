import type {
  BlueprintAccessibilityProfile,
  BlueprintCtaStrategy,
  BlueprintFooterStyle,
  BlueprintHeroComposition,
  BlueprintImageStrategy,
  BlueprintMotionStrategy,
  BlueprintNavigationStyle,
  BlueprintResponsiveStrategy,
  BlueprintSeoProfile,
} from "@/lib/website/template-v2/blueprint/types";
import type { ResolvedBlueprintContext } from "@/lib/website/template-v2/blueprint/defaults";
import type { VariantSelection } from "@/lib/website/template-v2/variants/decision/types";
import type { SectionKind, VariantComposition } from "@/lib/website/template-v2/variants/types";

const HERO_LAYOUT_MAP: Record<
  VariantComposition,
  BlueprintHeroComposition["layout"]
> = {
  split: "split",
  centered: "centered",
  stacked: "stacked",
  grid: "asymmetric",
  bento: "asymmetric",
  asymmetric: "asymmetric",
  immersive: "full-bleed",
  minimal: "centered",
  editorial: "stacked",
  rail: "split",
  band: "centered",
  mosaic: "asymmetric",
  carousel: "full-bleed",
  table: "stacked",
  inline: "centered",
};

const HERO_MEDIA_MAP: Record<string, BlueprintHeroComposition["mediaPosition"]> = {
  "split-trust": "right",
  "product-spotlight": "right",
  "immersive-visual": "background",
  "video-frame": "background",
  "minimal-type": "none",
  "metrics-rail": "none",
  "centered-statement": "none",
  "editorial-stack": "none",
  "dual-cta-band": "none",
  "asymmetric-grid": "left",
};

export function resolveHeroComposition(
  ctx: ResolvedBlueprintContext,
  heroSelection: VariantSelection,
): BlueprintHeroComposition {
  const composition = heroSelection.composition;
  const variantId = heroSelection.variantId;

  let mediaPosition =
    HERO_MEDIA_MAP[variantId] ??
    (ctx.imageAvailability === "none" ? "none" : "right");

  if (ctx.imageAvailability === "none") mediaPosition = "none";
  if (composition === "immersive") mediaPosition = "background";

  const minHeight: BlueprintHeroComposition["minHeight"] =
    composition === "immersive" || composition === "editorial"
      ? "viewport"
      : composition === "minimal"
        ? "compact"
        : "content";

  const ctaPlacement: BlueprintHeroComposition["ctaPlacement"] =
    variantId === "dual-cta-band" ? "floating" : "below";

  return {
    variantId,
    composition,
    layout: HERO_LAYOUT_MAP[composition] ?? "centered",
    mediaPosition,
    ctaPlacement,
    minHeight,
  };
}

export function resolveCtaStrategy(
  ctx: ResolvedBlueprintContext,
  ctaSelection: VariantSelection,
): BlueprintCtaStrategy {
  const frequency: BlueprintCtaStrategy["frequency"] =
    ctx.websiteGoal === "lead-generation" || ctx.websiteGoal === "sales"
      ? "dual"
      : "single";

  let emphasis: BlueprintCtaStrategy["emphasis"] = "standard";
  if (ctx.premiumLevel === "luxury") emphasis = "subtle";
  if (ctx.websiteGoal === "sales" || ctx.websiteGoal === "lead-generation") {
    emphasis = "bold";
  }

  return {
    variantId: ctaSelection.variantId,
    placement: "pre-footer",
    frequency,
    emphasis,
    conversionGoal: ctx.websiteGoal,
  };
}

export function resolveImageStrategy(
  ctx: ResolvedBlueprintContext,
  heroVariantId: string,
): BlueprintImageStrategy {
  const availability = ctx.imageAvailability;

  let heroTreatment: BlueprintImageStrategy["heroTreatment"] = "contained";
  if (availability === "none") heroTreatment = "typography-only";
  else if (
    heroVariantId === "immersive-visual" ||
    heroVariantId === "video-frame"
  ) {
    heroTreatment = "full-bleed";
  } else if (heroVariantId === "minimal-type" || heroVariantId === "metrics-rail") {
    heroTreatment = "icon-only";
  }

  const sectionImagery: BlueprintImageStrategy["sectionImagery"] =
    availability === "rich"
      ? "rich"
      : availability === "moderate"
        ? "selective"
        : availability === "limited"
          ? "minimal"
          : "none";

  const stockPreference: BlueprintImageStrategy["stockPreference"] =
    ctx.websiteGoal === "saas" || ctx.brandPersonality === "technical"
      ? "abstract"
      : ctx.industry === "creative-agency"
        ? "illustration"
        : ctx.premiumLevel === "luxury"
          ? "photography"
          : "mixed";

  return {
    availability,
    heroTreatment,
    sectionImagery,
    stockPreference,
    lazyLoadBelowFold: availability !== "none",
  };
}

export function resolveMotionStrategy(
  ctx: ResolvedBlueprintContext,
): BlueprintMotionStrategy {
  const a11y = ctx.accessibilityLevel;
  const style = ctx.visualStyle;

  if (a11y === "strict") {
    return {
      preset: "reduced-safe",
      intensity: "none",
      reducedMotionFallback: "instant",
      heroEntrance: "fade",
      sectionEntrance: "fade",
      microInteractions: false,
      parallax: false,
    };
  }

  let intensity: BlueprintMotionStrategy["intensity"] = "subtle";
  if (style === "cinematic" || style === "bold") intensity = "expressive";
  else if (style === "modern" || ctx.websiteGoal === "saas") intensity = "moderate";

  if (a11y === "enhanced") intensity = "subtle";

  const presetMap: Record<string, string> = {
    luxury: "atlas-reveal",
    corporate: "corporate-fade",
    minimal: "minimal-instant",
    cinematic: "cinematic-parallax",
    bold: "kinetic-snap",
    modern: "modern-slide",
    editorial: "editorial-reveal",
  };

  return {
    preset: presetMap[style] ?? "corporate-fade",
    intensity,
    reducedMotionFallback: "fade",
    heroEntrance: intensity === "expressive" ? "slide-up" : "fade",
    sectionEntrance: "slide-up",
    microInteractions: true,
    parallax: style === "cinematic" && a11y === "standard",
  };
}

export function resolveNavigationStyle(
  ctx: ResolvedBlueprintContext,
): BlueprintNavigationStyle {
  const layout: BlueprintNavigationStyle["layout"] =
    ctx.premiumLevel === "luxury"
      ? "centered-logo"
      : ctx.visualStyle === "cinematic"
        ? "transparent-overlay"
        : ctx.targetAudience === "enterprise"
          ? "split-nav"
          : "top-bar";

  const mobilePattern: BlueprintNavigationStyle["mobilePattern"] =
    ctx.devicePriority === "mobile-first" ? "drawer" : "hamburger";

  const density: BlueprintNavigationStyle["density"] =
    ctx.contentDensity === "dense"
      ? "compact"
      : ctx.premiumLevel === "luxury"
        ? "spacious"
        : "standard";

  return {
    layout,
    sticky: ctx.websiteGoal !== "portfolio",
    mobilePattern,
    density,
  };
}

export function resolveFooterStyle(
  ctx: ResolvedBlueprintContext,
  footerSelection: VariantSelection,
): BlueprintFooterStyle {
  const variantId = footerSelection.variantId;

  const layoutMap: Record<string, BlueprintFooterStyle["layout"]> = {
    "four-column": "columns",
    "minimal-centered": "centered",
    "mega-sitemap": "mega",
    "newsletter-band": "columns",
    "compact-inline": "inline",
  };

  return {
    variantId,
    layout: layoutMap[variantId] ?? "columns",
    newsletter:
      variantId === "newsletter-band" ||
      ctx.websiteGoal === "lead-generation",
    socialLinks: ctx.targetAudience !== "enterprise",
    legalLinks: true,
  };
}

export function resolveResponsiveStrategy(
  ctx: ResolvedBlueprintContext,
  containerMaxWidth: string,
): BlueprintResponsiveStrategy {
  const breakpoints = [
    { name: "sm", minWidth: 640 },
    { name: "md", minWidth: 768 },
    { name: "lg", minWidth: 1024 },
    { name: "xl", minWidth: 1280 },
    { name: "2xl", minWidth: 1536 },
  ];

  return {
    devicePriority: ctx.devicePriority,
    breakpoints,
    containerMaxWidth,
    mobileNav: true,
    stackOrder:
      ctx.devicePriority === "mobile-first" ? "content-first" : "visual-first",
    imageScaling:
      ctx.visualStyle === "cinematic" ? "cover" : "responsive",
  };
}

export function resolveAccessibilityProfile(
  ctx: ResolvedBlueprintContext,
): BlueprintAccessibilityProfile {
  const level = ctx.accessibilityLevel;
  return {
    level,
    focusVisible: true,
    skipLink: true,
    ariaLandmarks: true,
    colorContrastMinimum: level === "strict" ? "AAA" : "AA",
    motionSafe: level !== "standard",
    rtlSupport: ctx.languageDirection === "rtl",
  };
}

const GOAL_SCHEMA_TYPES: Record<string, string[]> = {
  saas: ["SoftwareApplication", "Organization"],
  booking: ["LocalBusiness", "Organization"],
  portfolio: ["CreativeWork", "Person", "Organization"],
  ecommerce: ["Store", "Product", "Organization"],
  "lead-generation": ["Organization", "WebSite"],
  sales: ["Product", "Organization"],
  trust: ["Organization", "MedicalBusiness", "FinancialService"],
  "brand-awareness": ["Organization", "Brand"],
};

export function resolveSeoProfile(
  ctx: ResolvedBlueprintContext,
): BlueprintSeoProfile {
  const schemaTypes = GOAL_SCHEMA_TYPES[ctx.websiteGoal] ?? ["Organization", "WebSite"];

  const metaDescriptionTone: BlueprintSeoProfile["metaDescriptionTone"] =
    ctx.websiteGoal === "lead-generation" || ctx.websiteGoal === "sales"
      ? "conversion"
      : ctx.websiteGoal === "brand-awareness"
        ? "brand"
        : "informational";

  return {
    primaryGoal: ctx.websiteGoal,
    schemaTypes,
    openGraph: true,
    structuredData: true,
    headingHierarchy: ctx.accessibilityLevel === "strict" ? "strict" : "flexible",
    metaDescriptionTone,
  };
}

export function buildSectionVariants(
  sectionOrder: SectionKind[],
  selections: Partial<Record<SectionKind, VariantSelection>>,
  sectionDensity: Partial<Record<SectionKind, import("@/lib/website/template-v2/variants/decision/types").ContentDensity>>,
): import("@/lib/website/template-v2/blueprint/types").BlueprintSectionVariant[] {
  return sectionOrder
    .filter((kind) => selections[kind])
    .map((sectionKind) => {
      const selection = selections[sectionKind]!;
      return {
        sectionKind,
        variantId: selection.variantId,
        composition: selection.composition,
        score: selection.score,
        density: sectionDensity[sectionKind] ?? "medium",
      };
    });
}
