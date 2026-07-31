import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";
import type { LayoutVariationId } from "@/lib/ai-core/design-intelligence/layout-selection";

export type DesignKnowledgeEntry = {
  id: string;
  industryId: string;
  version: string;
  layoutFamily: string;
  allowedPremiumStyleIds: PremiumStyleId[];
  defaultPremiumStyleId: PremiumStyleId;
  defaultLayoutVariationId: LayoutVariationId;
  forbiddenLayoutVariationIds: LayoutVariationId[];
  spacingDensity: "airy" | "balanced" | "compact";
  colorStrategy: string;
  typographyStrategy: string;
  componentCardStyle: string;
  navigationStyle: string;
  minContrastRatio: number;
  responsiveStrategy: "mobile-first" | "fluid" | "adaptive";
  visualHierarchyNotes: string[];
  accessibilityPolicies: string[];
  aliases?: string[];
};

/** Design Knowledge Base — EDS-004 SSOT for industry design policies. */
export const DESIGN_KNOWLEDGE_ENTRIES: DesignKnowledgeEntry[] = [
  {
    id: "design-policy-furniture",
    industryId: "furniture",
    version: "1",
    layoutFamily: "commerce-grid",
    allowedPremiumStyleIds: ["luxury", "premium-brand", "modern", "minimal"],
    defaultPremiumStyleId: "luxury",
    defaultLayoutVariationId: "product-showcase",
    forbiddenLayoutVariationIds: ["editorial", "storytelling"],
    spacingDensity: "airy",
    colorStrategy: "warm premium neutrals with wood-metal accents",
    typographyStrategy: "refined sans display + readable body",
    componentCardStyle: "metallic-elevated",
    navigationStyle: "showroom-concierge",
    minContrastRatio: 4.5,
    responsiveStrategy: "mobile-first",
    visualHierarchyNotes: [
      "Hero showcases flagship product",
      "Collections grid dominates mid-page",
      "CTA drives showroom/browse intent",
    ],
    accessibilityPolicies: ["WCAG AA contrast", "focus-visible on all CTAs"],
  },
  {
    id: "design-policy-ecommerce",
    industryId: "ecommerce",
    version: "1",
    layoutFamily: "commerce-grid",
    allowedPremiumStyleIds: ["modern", "luxury", "minimal", "saas"],
    defaultPremiumStyleId: "modern",
    defaultLayoutVariationId: "product-showcase",
    forbiddenLayoutVariationIds: ["editorial"],
    spacingDensity: "balanced",
    colorStrategy: "high-contrast product surfaces with decisive CTA accent",
    typographyStrategy: "geometric sans hierarchy",
    componentCardStyle: "elevated-soft",
    navigationStyle: "sticky-product-cta",
    minContrastRatio: 4.5,
    responsiveStrategy: "mobile-first",
    visualHierarchyNotes: ["Product grid priority", "Trust strip before footer"],
    accessibilityPolicies: ["WCAG AA contrast", "44px min tap targets"],
    aliases: ["retail", "store"],
  },
  {
    id: "design-policy-restaurant",
    industryId: "restaurant",
    version: "1",
    layoutFamily: "hospitality",
    allowedPremiumStyleIds: ["luxury", "premium-brand", "creative"],
    defaultPremiumStyleId: "luxury",
    defaultLayoutVariationId: "image-focused-hero",
    forbiddenLayoutVariationIds: ["dashboard", "premium-saas"],
    spacingDensity: "airy",
    colorStrategy: "warm ambient palette with appetite-forward photography",
    typographyStrategy: "expressive display + elegant body",
    componentCardStyle: "borderless-editorial",
    navigationStyle: "transparent-overlay",
    minContrastRatio: 4.5,
    responsiveStrategy: "mobile-first",
    visualHierarchyNotes: ["Full-bleed food imagery", "Reservation CTA persistent"],
    accessibilityPolicies: ["WCAG AA contrast", "readable menu type scale"],
  },
  {
    id: "design-policy-law",
    industryId: "law",
    version: "1",
    layoutFamily: "corporate-trust",
    allowedPremiumStyleIds: ["corporate", "premium-brand", "modern"],
    defaultPremiumStyleId: "corporate",
    defaultLayoutVariationId: "split-hero",
    forbiddenLayoutVariationIds: ["editorial", "interactive-hero"],
    spacingDensity: "balanced",
    colorStrategy: "trust blues and authoritative neutrals",
    typographyStrategy: "professional serif/sans pairing",
    componentCardStyle: "elevated-trust",
    navigationStyle: "corporate-topbar",
    minContrastRatio: 4.5,
    responsiveStrategy: "mobile-first",
    visualHierarchyNotes: ["Authority-first hero", "Practice areas structured"],
    accessibilityPolicies: ["WCAG AA contrast", "clear legal disclaimers"],
    aliases: ["legal", "law-firm"],
  },
  {
    id: "design-policy-saas",
    industryId: "saas",
    version: "1",
    layoutFamily: "product-saas",
    allowedPremiumStyleIds: ["saas", "technology", "modern", "minimal"],
    defaultPremiumStyleId: "saas",
    defaultLayoutVariationId: "premium-saas",
    forbiddenLayoutVariationIds: ["editorial", "cinematic-hero"],
    spacingDensity: "balanced",
    colorStrategy: "bright surfaces with product accent gradient",
    typographyStrategy: "geometric product display + UI body",
    componentCardStyle: "elevated-soft",
    navigationStyle: "sticky-product-cta",
    minContrastRatio: 4.5,
    responsiveStrategy: "fluid",
    visualHierarchyNotes: ["Product screenshot hero", "Feature bento grid"],
    accessibilityPolicies: ["WCAG AA contrast", "reduced-motion support"],
  },
  {
    id: "design-policy-agency",
    industryId: "agency",
    version: "1",
    layoutFamily: "editorial-magazine",
    allowedPremiumStyleIds: ["creative", "premium-brand", "luxury", "modern"],
    defaultPremiumStyleId: "creative",
    defaultLayoutVariationId: "editorial",
    forbiddenLayoutVariationIds: ["dashboard"],
    spacingDensity: "airy",
    colorStrategy: "bold studio palette with editorial whitespace",
    typographyStrategy: "characterful display + disciplined body",
    componentCardStyle: "bold-media",
    navigationStyle: "studio-transparent",
    minContrastRatio: 4.5,
    responsiveStrategy: "fluid",
    visualHierarchyNotes: ["Portfolio mosaic", "Case study storytelling"],
    accessibilityPolicies: ["WCAG AA contrast", "focus-visible navigation"],
  },
  {
    id: "design-policy-default",
    industryId: "business",
    version: "1",
    layoutFamily: "classic-stack",
    allowedPremiumStyleIds: [
      "modern",
      "corporate",
      "minimal",
      "luxury",
      "creative",
    ],
    defaultPremiumStyleId: "modern",
    defaultLayoutVariationId: "split-hero",
    forbiddenLayoutVariationIds: [],
    spacingDensity: "balanced",
    colorStrategy: "harmonized brand palette with clear CTA contrast",
    typographyStrategy: "clean premium sans hierarchy",
    componentCardStyle: "elevated-soft",
    navigationStyle: "corporate-topbar",
    minContrastRatio: 4.5,
    responsiveStrategy: "mobile-first",
    visualHierarchyNotes: ["Clear hero value prop", "Structured section rhythm"],
    accessibilityPolicies: ["WCAG AA contrast"],
    aliases: ["corporate", "company"],
  },
];

const byIndustry = new Map<string, DesignKnowledgeEntry>();
const aliasToId = new Map<string, string>();

for (const entry of DESIGN_KNOWLEDGE_ENTRIES) {
  byIndustry.set(entry.industryId, entry);
  aliasToId.set(entry.industryId, entry.industryId);
  for (const alias of entry.aliases ?? []) {
    aliasToId.set(alias.toLowerCase(), entry.industryId);
  }
}

export function getDesignKnowledgeEntry(industryId: string): DesignKnowledgeEntry {
  const normalized = industryId.toLowerCase().trim().replace(/[_\s]+/g, "-");
  const resolved = aliasToId.get(normalized) ?? normalized;
  return byIndustry.get(resolved) ?? byIndustry.get("business")!;
}
