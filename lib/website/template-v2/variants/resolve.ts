import type {
  AboutContent,
  ContactContent,
  CtaContent,
  FeaturesContent,
  FooterContent,
  HeroContent,
  PortfolioContent,
  PricingContent,
  ServicesContent,
  TestimonialsContent,
} from "@/lib/website/template-v2/variants/content-types";
import {
  getDefaultVariantId,
  getVariantDefinition,
} from "@/lib/website/template-v2/variants/registry";
import type {
  AboutVariantId,
  ContactVariantId,
  CtaVariantId,
  FeaturesVariantId,
  FooterVariantId,
  HeroVariantId,
  PortfolioVariantId,
  PricingVariantId,
  SectionKind,
  SectionVariantId,
  ServicesVariantId,
  TestimonialsVariantId,
} from "@/lib/website/template-v2/variants/types";

export type ResolveVariantResult<K extends SectionKind> = {
  sectionKind: K;
  variantId: SectionVariantId;
  definition: NonNullable<ReturnType<typeof getVariantDefinition>>;
  resolvedFrom: "explicit" | "default";
};

/**
 * Resolve a section variant ID with fallback to the section default.
 * Returns null when an explicit ID is invalid for the section kind.
 */
export function resolveSectionVariant<K extends SectionKind>(
  sectionKind: K,
  variantId?: string | null,
): ResolveVariantResult<K> | null {
  const defaultId = getDefaultVariantId(sectionKind);

  if (!variantId?.trim()) {
    const def = getVariantDefinition(sectionKind, defaultId);
    if (!def) return null;
    return { sectionKind, variantId: defaultId, definition: def, resolvedFrom: "default" };
  }

  const normalized = variantId.trim() as SectionVariantId;
  const def = getVariantDefinition(sectionKind, normalized);
  if (!def) return null;

  return { sectionKind, variantId: normalized, definition: def, resolvedFrom: "explicit" };
}

export function isValidSectionVariant(
  sectionKind: SectionKind,
  variantId: string,
): boolean {
  return getVariantDefinition(sectionKind, variantId as SectionVariantId) !== undefined;
}

export type SectionVariantContentMap = {
  hero: HeroContent;
  features: FeaturesContent;
  about: AboutContent;
  services: ServicesContent;
  portfolio: PortfolioContent;
  pricing: PricingContent;
  testimonials: TestimonialsContent;
  cta: CtaContent;
  contact: ContactContent;
  footer: FooterContent;
};

export type SectionVariantIdMap = {
  hero: HeroVariantId;
  features: FeaturesVariantId;
  about: AboutVariantId;
  services: ServicesVariantId;
  portfolio: PortfolioVariantId;
  pricing: PricingVariantId;
  testimonials: TestimonialsVariantId;
  cta: CtaVariantId;
  contact: ContactVariantId;
  footer: FooterVariantId;
};
