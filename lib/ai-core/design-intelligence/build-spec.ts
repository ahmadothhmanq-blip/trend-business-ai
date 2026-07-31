import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";
import type {
  DesignPolicy,
  DesignSystemSpec,
} from "@/lib/ai-core/design-intelligence/die-types";
import { VARIATION_DEFAULTS } from "@/lib/ai-core/design-intelligence/layout-selection";

const DEFAULT_COLORS = {
  primary: "#1a1a2e",
  secondary: "#16213e",
  accent: "#e94560",
  neutral: "#6b7280",
  surface: "#f8fafc",
  background: "#ffffff",
  foreground: "#0f172a",
};

const DEFAULT_FONTS = {
  displayFont: "Inter",
  headingFont: "Inter",
  bodyFont: "Inter",
};

/**
 * Build the authoritative DesignSystemSpec — visual system definition only (no assets).
 */
export function buildDesignSystemSpec(params: {
  intelligence: DesignIntelligenceBrief;
  policy: DesignPolicy;
  brandDna?: DesignDNAPrinciples | null;
}): DesignSystemSpec {
  const { intelligence, policy, brandDna } = params;
  const variationDefaults =
    VARIATION_DEFAULTS[intelligence.layoutVariationId] ??
    VARIATION_DEFAULTS["split-hero"];

  const locked = policy.lockedColors;
  const lockedType = policy.lockedTypography;

  return {
    version: "1",
    industryId: policy.industryId,
    layoutFamily: policy.layoutFamily,
    premiumStyleId: intelligence.premiumStyleId,
    layoutVariationId: intelligence.layoutVariationId,
    brandDna: brandDna ?? null,
    colorSystem: {
      primary: locked?.primary ?? DEFAULT_COLORS.primary,
      secondary: locked?.secondary ?? DEFAULT_COLORS.secondary,
      accent: locked?.accent ?? DEFAULT_COLORS.accent,
      neutral: DEFAULT_COLORS.neutral,
      surface: locked?.surface ?? DEFAULT_COLORS.surface,
      background: locked?.background ?? DEFAULT_COLORS.background,
      foreground: locked?.foreground ?? DEFAULT_COLORS.foreground,
      direction: policy.colorStrategy,
    },
    typographySystem: {
      displayFont: lockedType?.display ?? DEFAULT_FONTS.displayFont,
      headingFont: lockedType?.heading ?? DEFAULT_FONTS.headingFont,
      bodyFont: lockedType?.body ?? DEFAULT_FONTS.bodyFont,
      direction: policy.typographyStrategy,
      scaleNotes: brandDna?.typography.scale ?? "modular scale 1.25",
    },
    spacing: {
      density: policy.spacingDensity,
      rhythm: brandDna?.spacing.rhythm ?? "8px base grid",
      sectionPadding: brandDna?.spacing.sectionPadding ?? "py-20 md:py-28",
      notes: intelligence.spacingDirection,
    },
    layoutComposition: {
      heroTreatment: intelligence.heroTreatment,
      sectionLayout: intelligence.sectionLayout,
      cardStyle: intelligence.cardStyle || policy.componentCardStyle,
      navigationStyle: intelligence.navigationStyle || policy.navigationStyle,
      compositionMode: variationDefaults.compositionMode,
    },
    componentStyling: {
      cards: brandDna?.components.cards ?? policy.componentCardStyle,
      buttons: brandDna?.components.buttons ?? "polished primary CTA + ghost secondary",
      forms: brandDna?.components.forms ?? "accessible labeled inputs",
      navigation: policy.navigationStyle,
    },
    visualHierarchy: {
      heroEmphasis: "dominant H1 + supporting subhead + single primary CTA",
      ctaEmphasis: "high-contrast accent on primary action",
      sectionRhythm: policy.spacingDensity === "airy" ? "wide bands" : "structured grid",
      notes: policy.visualHierarchyNotes,
    },
    responsive: {
      strategy: policy.responsiveStrategy,
      breakpoints: ["640px", "768px", "1024px", "1280px"],
      tapTargetMinPx: 44,
    },
    accessibility: {
      minContrastRatio: policy.minContrastRatio,
      policies: policy.accessibilityPolicies,
      motionReduce: true,
    },
    intelligence,
  };
}
