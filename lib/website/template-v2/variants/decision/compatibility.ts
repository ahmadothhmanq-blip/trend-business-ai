import type { VariantDecisionContext } from "@/lib/website/template-v2/variants/decision/types";
import type { VariantDecisionProfile } from "@/lib/website/template-v2/variants/decision/types";
import { normalizeIndustry } from "@/lib/website/template-v2/variants/decision/weights";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

export type CompatibilityResult = {
  compatible: boolean;
  reasons: string[];
  hardBlock: boolean;
};

const CAROUSEL_COMPOSITIONS = new Set(["carousel"]);
const HIGH_MOTION_IDS = new Set([
  "horizontal-scroll",
  "carousel-strip",
  "slider-tiers",
  "filter-grid",
]);

/**
 * Hard and soft compatibility rules — incompatible variants are excluded from scoring.
 */
export function checkVariantCompatibility(
  profile: VariantDecisionProfile,
  context: VariantDecisionContext,
): CompatibilityResult {
  const reasons: string[] = [];
  let hardBlock = false;

  const images = context.imageAvailability ?? "moderate";
  if (images === "none" && profile.traits.requiresImages) {
    reasons.push("Requires images but imageAvailability is none");
    hardBlock = true;
  }
  if (images === "limited" && profile.traits.imageIntensity >= 3) {
    reasons.push("Image intensity too high for limited availability");
    hardBlock = true;
  }

  const a11y = context.accessibilityLevel ?? "standard";
  if (a11y === "strict") {
    if (CAROUSEL_COMPOSITIONS.has(profile.composition)) {
      reasons.push("Carousel composition not compatible with strict accessibility");
      hardBlock = true;
    }
    if (HIGH_MOTION_IDS.has(profile.variantId)) {
      reasons.push("High-motion variant not compatible with strict accessibility");
      hardBlock = true;
    }
    if (profile.traits.accessibility < 0.6) {
      reasons.push("Accessibility score below strict threshold");
      hardBlock = true;
    }
  }

  if (context.languageDirection === "rtl" && profile.traits.rtlFriendly < 0.5) {
    reasons.push("Low RTL compatibility");
    hardBlock = true;
  }

  if (context.websiteGoal === "portfolio" && profile.sectionKind === "portfolio") {
    return { compatible: true, reasons: [], hardBlock: false };
  }

  if (context.businessModel === "product" && profile.sectionKind === "services") {
    if (profile.variantId === "minimal-list" && context.premiumLevel === "luxury") {
      reasons.push("Minimal service list underfits luxury product positioning");
      hardBlock = true;
    }
  }

  if (context.targetAudience === "enterprise" && profile.sectionKind === "pricing") {
    if (profile.variantId === "minimal-single") {
      reasons.push("Single-tier pricing insufficient for enterprise audience");
      hardBlock = true;
    }
  }

  if (context.premiumLevel === "luxury" && profile.traits.premiumFit < 0.35) {
    reasons.push("Premium fit too low for luxury tier");
    hardBlock = true;
  }

  return {
    compatible: !hardBlock,
    reasons,
    hardBlock,
  };
}

export type SectionCompatibilityMatrix = Record<
  SectionKind,
  { requiredForGoals: Partial<Record<string, boolean>>; optional: boolean }
>;

/** Which sections are relevant per website goal. */
export const SECTION_GOAL_MATRIX: SectionCompatibilityMatrix = {
  hero: { requiredForGoals: { "*": true }, optional: false },
  features: {
    requiredForGoals: { saas: true, sales: true, ecommerce: true, trust: true },
    optional: true,
  },
  about: {
    requiredForGoals: { trust: true, "brand-awareness": true, portfolio: true },
    optional: true,
  },
  services: {
    requiredForGoals: { booking: true, trust: true, sales: true },
    optional: true,
  },
  portfolio: {
    requiredForGoals: { portfolio: true, "brand-awareness": true },
    optional: true,
  },
  pricing: {
    requiredForGoals: { saas: true, sales: true, ecommerce: true },
    optional: true,
  },
  testimonials: {
    requiredForGoals: { trust: true, "lead-generation": true, saas: true },
    optional: true,
  },
  cta: { requiredForGoals: { "*": true }, optional: false },
  contact: {
    requiredForGoals: { "lead-generation": true, booking: true, trust: true },
    optional: true,
  },
  footer: { requiredForGoals: { "*": true }, optional: false },
};

export function isSectionRelevantForGoal(
  sectionKind: SectionKind,
  goal?: string,
): boolean {
  const row = SECTION_GOAL_MATRIX[sectionKind];
  if (!row) return true;
  if (goal && row.requiredForGoals[goal]) return true;
  if (row.requiredForGoals["*"]) return true;
  return row.optional;
}
