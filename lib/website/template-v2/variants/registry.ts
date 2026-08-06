import {
  ABOUT_DEFAULT_VARIANT,
  ABOUT_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/about";
import {
  CONTACT_DEFAULT_VARIANT,
  CONTACT_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/contact";
import {
  CTA_DEFAULT_VARIANT,
  CTA_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/cta";
import {
  FEATURES_DEFAULT_VARIANT,
  FEATURES_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/features";
import {
  FOOTER_DEFAULT_VARIANT,
  FOOTER_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/footer";
import {
  HERO_DEFAULT_VARIANT,
  HERO_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/hero";
import {
  PORTFOLIO_DEFAULT_VARIANT,
  PORTFOLIO_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/portfolio";
import {
  PRICING_DEFAULT_VARIANT,
  PRICING_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/pricing";
import {
  SERVICES_DEFAULT_VARIANT,
  SERVICES_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/services";
import {
  TESTIMONIALS_DEFAULT_VARIANT,
  TESTIMONIALS_VARIANT_REGISTRY,
} from "@/lib/website/template-v2/variants/sections/testimonials";
import type {
  SectionKind,
  SectionVariantId,
  VariantDefinition,
} from "@/lib/website/template-v2/variants/types";
import { SECTION_VARIANT_COUNTS } from "@/lib/website/template-v2/variants/types";

/** Central registry of all section variants — consumed by AI selection in a future phase. */
export const SECTION_VARIANT_REGISTRY: VariantDefinition[] = [
  ...HERO_VARIANT_REGISTRY,
  ...FEATURES_VARIANT_REGISTRY,
  ...ABOUT_VARIANT_REGISTRY,
  ...SERVICES_VARIANT_REGISTRY,
  ...PORTFOLIO_VARIANT_REGISTRY,
  ...PRICING_VARIANT_REGISTRY,
  ...TESTIMONIALS_VARIANT_REGISTRY,
  ...CTA_VARIANT_REGISTRY,
  ...CONTACT_VARIANT_REGISTRY,
  ...FOOTER_VARIANT_REGISTRY,
];

export const SECTION_DEFAULT_VARIANTS: Record<SectionKind, SectionVariantId> = {
  hero: HERO_DEFAULT_VARIANT,
  features: FEATURES_DEFAULT_VARIANT,
  about: ABOUT_DEFAULT_VARIANT,
  services: SERVICES_DEFAULT_VARIANT,
  portfolio: PORTFOLIO_DEFAULT_VARIANT,
  pricing: PRICING_DEFAULT_VARIANT,
  testimonials: TESTIMONIALS_DEFAULT_VARIANT,
  cta: CTA_DEFAULT_VARIANT,
  contact: CONTACT_DEFAULT_VARIANT,
  footer: FOOTER_DEFAULT_VARIANT,
};

const REGISTRY_BY_SECTION = new Map<SectionKind, VariantDefinition[]>(
  (Object.keys(SECTION_VARIANT_COUNTS) as SectionKind[]).map((kind) => [
    kind,
    SECTION_VARIANT_REGISTRY.filter((v) => v.sectionKind === kind),
  ]),
);

const REGISTRY_BY_KEY = new Map<string, VariantDefinition>(
  SECTION_VARIANT_REGISTRY.map((v) => [`${v.sectionKind}:${v.id}`, v]),
);

export function listSectionVariants(sectionKind: SectionKind): VariantDefinition[] {
  return REGISTRY_BY_SECTION.get(sectionKind) ?? [];
}

export function getVariantDefinition(
  sectionKind: SectionKind,
  variantId: SectionVariantId,
): VariantDefinition | undefined {
  return REGISTRY_BY_KEY.get(`${sectionKind}:${variantId}`);
}

export function getDefaultVariantId(sectionKind: SectionKind): SectionVariantId {
  return SECTION_DEFAULT_VARIANTS[sectionKind];
}

export function validateVariantRegistry(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [kind, expected] of Object.entries(SECTION_VARIANT_COUNTS) as Array<
    [SectionKind, number]
  >) {
    const variants = listSectionVariants(kind);
    if (variants.length !== expected) {
      errors.push(`${kind}: expected ${expected} variants, found ${variants.length}`);
    }
    const defaults = variants.filter((v) => v.isDefault);
    if (defaults.length !== 1) {
      errors.push(`${kind}: expected exactly 1 default variant, found ${defaults.length}`);
    }
    const ids = new Set(variants.map((v) => v.id));
    if (ids.size !== variants.length) {
      errors.push(`${kind}: duplicate variant IDs detected`);
    }
  }

  if (SECTION_VARIANT_REGISTRY.length !== Object.values(SECTION_VARIANT_COUNTS).reduce((a, b) => a + b, 0)) {
    errors.push("Total registry count mismatch");
  }

  return { valid: errors.length === 0, errors };
}
