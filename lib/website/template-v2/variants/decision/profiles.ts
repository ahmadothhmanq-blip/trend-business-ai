import { SECTION_VARIANT_REGISTRY } from "@/lib/website/template-v2/variants/registry";
import type {
  VariantDecisionProfile,
  WebsiteGoal,
  VisualStyle,
} from "@/lib/website/template-v2/variants/decision/types";
import type { SectionKind, VariantComposition } from "@/lib/website/template-v2/variants/types";

const COMPOSITION_TRAITS: Record<
  VariantComposition,
  Partial<VariantDecisionProfile["traits"]>
> = {
  split: { visualWeight: 0.55, mobileFirst: 0.7, rtlFriendly: 0.75, accessibility: 0.8 },
  centered: { visualWeight: 0.5, mobileFirst: 0.85, rtlFriendly: 0.95, accessibility: 0.9 },
  stacked: { visualWeight: 0.45, mobileFirst: 0.9, rtlFriendly: 0.9, accessibility: 0.85 },
  grid: { visualWeight: 0.6, mobileFirst: 0.75, density: 0.65, accessibility: 0.8 },
  bento: { visualWeight: 0.7, mobileFirst: 0.65, density: 0.7, startup: 0.8, product: 0.75 },
  asymmetric: { visualWeight: 0.75, mobileFirst: 0.55, rtlFriendly: 0.55, accessibility: 0.65 },
  immersive: { visualWeight: 0.9, mobileFirst: 0.5, imageIntensity: 3, premiumFit: 0.85, luxury: 0.8 },
  minimal: { visualWeight: 0.25, mobileFirst: 0.95, density: 0.2, accessibility: 0.95, premiumFit: 0.7 },
  editorial: { visualWeight: 0.7, premiumFit: 0.8, luxury: 0.75, b2c: 0.6 },
  rail: { visualWeight: 0.55, mobileFirst: 0.7, b2b: 0.75, enterprise: 0.7 },
  band: { visualWeight: 0.5, conversionFocus: 0.85, mobileFirst: 0.8 },
  mosaic: { visualWeight: 0.65, density: 0.75, imageIntensity: 2 },
  carousel: { visualWeight: 0.6, mobileFirst: 0.6, accessibility: 0.55 },
  table: { visualWeight: 0.45, density: 0.85, b2b: 0.85, enterprise: 0.9, accessibility: 0.7 },
  inline: { visualWeight: 0.35, mobileFirst: 0.85, density: 0.4, conversionFocus: 0.75 },
};

const VARIANT_OVERRIDES: Partial<
  Record<string, Partial<VariantDecisionProfile["traits"]> & { tags?: string[] }>
> = {
  "hero:split-trust": { b2b: 0.9, enterprise: 0.85, goals: { trust: 0.95, "lead-generation": 0.85 }, styles: { corporate: 0.9 } },
  "hero:product-spotlight": { product: 0.95, startup: 0.85, goals: { saas: 0.95, sales: 0.8 }, styles: { modern: 0.9 } },
  "hero:metrics-rail": { b2b: 0.9, enterprise: 0.9, goals: { saas: 0.85, trust: 0.8 }, industries: { corporate: 0.9, finance: 0.85, saas: 0.9 } },
  "hero:immersive-visual": { luxury: 0.9, goals: { "brand-awareness": 0.9, booking: 0.85 }, styles: { cinematic: 0.95, luxury: 0.9 }, industries: { "hotel-resort": 0.95, "real-estate": 0.9 } },
  "hero:minimal-type": { startup: 0.85, goals: { saas: 0.8 }, styles: { minimal: 0.95 } },
  "hero:dual-cta-band": { conversionFocus: 0.95, goals: { "lead-generation": 0.95, sales: 0.9 } },
  "features:bento-mosaic": { product: 0.9, startup: 0.85, goals: { saas: 0.9 } },
  "features:comparison-columns": { b2b: 0.85, goals: { sales: 0.85, saas: 0.8 } },
  "about:timeline-story": { service: 0.85, goals: { trust: 0.9 }, industries: { education: 0.85 } },
  "about:full-bleed-quote": { luxury: 0.9, styles: { editorial: 0.9, cinematic: 0.85 } },
  "services:process-rail": { service: 0.95, goals: { booking: 0.85 } },
  "portfolio:masonry-grid": { goals: { portfolio: 0.98 }, industries: { "creative-agency": 0.95 } },
  "portfolio:case-studies": { b2b: 0.9, goals: { portfolio: 0.95, trust: 0.85 } },
  "pricing:tier-cards": { goals: { saas: 0.95, sales: 0.9 }, startup: 0.85 },
  "pricing:enterprise-callout": { enterprise: 0.95, b2b: 0.9 },
  "testimonials:logo-wall": { enterprise: 0.9, b2b: 0.85, goals: { trust: 0.9 } },
  "cta:inline-newsletter": { goals: { "lead-generation": 0.95 }, conversionFocus: 0.9 },
  "contact:dark-panel": { luxury: 0.9, premiumFit: 0.9, styles: { luxury: 0.9 } },
  "footer:mega-sitemap": { enterprise: 0.95, density: 0.9 },
  "footer:minimal-centered": { startup: 0.85, density: 0.2, styles: { minimal: 0.9 } },
};

function baseTraits(composition: VariantComposition, imageSlotCount: number): VariantDecisionProfile["traits"] {
  const comp = COMPOSITION_TRAITS[composition] ?? {};
  return {
    requiresImages: imageSlotCount > 0,
    imageIntensity: (imageSlotCount >= 2 ? 3 : imageSlotCount === 1 ? 2 : 0) as 0 | 1 | 2 | 3,
    visualWeight: comp.visualWeight ?? 0.5,
    conversionFocus: comp.conversionFocus ?? 0.5,
    premiumFit: comp.premiumFit ?? 0.5,
    rtlFriendly: comp.rtlFriendly ?? 0.8,
    accessibility: comp.accessibility ?? 0.75,
    mobileFirst: comp.mobileFirst ?? 0.75,
    density: comp.density ?? 0.5,
    b2b: comp.b2b ?? 0.5,
    b2c: comp.b2c ?? 0.5,
    enterprise: comp.enterprise ?? 0.5,
    luxury: comp.luxury ?? 0.5,
    startup: comp.startup ?? 0.5,
    product: comp.product ?? 0.5,
    service: comp.service ?? 0.5,
    goals: {},
    styles: {},
    industries: {},
  };
}

function mergeTraits(
  base: VariantDecisionProfile["traits"],
  override?: Partial<VariantDecisionProfile["traits"]>,
): VariantDecisionProfile["traits"] {
  if (!override) return base;
  return {
    ...base,
    ...override,
    goals: { ...base.goals, ...override.goals },
    styles: { ...base.styles, ...override.styles },
    industries: { ...base.industries, ...override.industries },
  };
}

function buildProfile(
  sectionKind: SectionKind,
  variantId: string,
  composition: VariantComposition,
  imageSlots: VariantDecisionProfile["imageSlots"],
  tags: string[] = [],
): VariantDecisionProfile {
  const key = `${sectionKind}:${variantId}`;
  const override = VARIANT_OVERRIDES[key];
  const traits = mergeTraits(
    baseTraits(composition, imageSlots.length),
    override,
  );
  return {
    sectionKind,
    variantId,
    composition,
    imageSlots,
    tags: [...tags, ...(override?.tags ?? [])],
    traits,
  };
}

/** Decision profiles for every registered variant — keyed by `sectionKind:variantId`. */
export const VARIANT_DECISION_PROFILES: Record<string, VariantDecisionProfile> =
  Object.fromEntries(
    SECTION_VARIANT_REGISTRY.map((v) => {
      const profile = buildProfile(
        v.sectionKind,
        v.id,
        v.composition,
        v.imageSlots,
        [v.composition, v.visualIdentity.toLowerCase().split(" ")[0] ?? ""].filter(Boolean),
      );
      return [`${v.sectionKind}:${v.id}`, profile];
    }),
  );

export function getVariantDecisionProfile(
  sectionKind: SectionKind,
  variantId: string,
): VariantDecisionProfile | undefined {
  return VARIANT_DECISION_PROFILES[`${sectionKind}:${variantId}`];
}

export function goalAffinity(
  profile: VariantDecisionProfile,
  goal?: WebsiteGoal,
): number {
  if (!goal) return 0.5;
  return profile.traits.goals[goal] ?? 0.45;
}

export function styleAffinity(
  profile: VariantDecisionProfile,
  style?: VisualStyle,
): number {
  if (!style) return 0.5;
  return profile.traits.styles[style] ?? 0.45;
}

export function industryAffinity(
  profile: VariantDecisionProfile,
  industry: string,
): number {
  return profile.traits.industries[industry] ?? 0.45;
}
