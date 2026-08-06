"use client";

import type { ReactNode } from "react";
import type { SectionVariantContentMap } from "@/lib/website/template-v2/variants/resolve";
import { resolveSectionVariant } from "@/lib/website/template-v2/variants/resolve";
import { renderAboutVariant } from "@/lib/website/template-v2/variants/sections/about";
import { renderContactVariant } from "@/lib/website/template-v2/variants/sections/contact";
import { renderCtaVariant } from "@/lib/website/template-v2/variants/sections/cta";
import { renderFeaturesVariant } from "@/lib/website/template-v2/variants/sections/features";
import { renderFooterVariant } from "@/lib/website/template-v2/variants/sections/footer";
import { renderHeroVariant } from "@/lib/website/template-v2/variants/sections/hero";
import { renderPortfolioVariant } from "@/lib/website/template-v2/variants/sections/portfolio";
import { renderPricingVariant } from "@/lib/website/template-v2/variants/sections/pricing";
import { renderServicesVariant } from "@/lib/website/template-v2/variants/sections/services";
import { renderTestimonialsVariant } from "@/lib/website/template-v2/variants/sections/testimonials";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

export type SectionVariantRendererProps<K extends SectionKind> = {
  sectionKind: K;
  variantId?: string | null;
  content: SectionVariantContentMap[K];
};

/**
 * Render a registered section variant. Falls back to the section default when variantId is omitted.
 * Returns null when an invalid variantId is provided.
 */
export function SectionVariantRenderer<K extends SectionKind>(
  props: SectionVariantRendererProps<K>,
): ReactNode {
  const resolved = resolveSectionVariant(props.sectionKind, props.variantId);
  if (!resolved) return null;

  switch (props.sectionKind) {
    case "hero":
      return renderHeroVariant(resolved.variantId as Parameters<typeof renderHeroVariant>[0], props.content as SectionVariantContentMap["hero"]);
    case "features":
      return renderFeaturesVariant(resolved.variantId as Parameters<typeof renderFeaturesVariant>[0], props.content as SectionVariantContentMap["features"]);
    case "about":
      return renderAboutVariant(resolved.variantId as Parameters<typeof renderAboutVariant>[0], props.content as SectionVariantContentMap["about"]);
    case "services":
      return renderServicesVariant(resolved.variantId as Parameters<typeof renderServicesVariant>[0], props.content as SectionVariantContentMap["services"]);
    case "portfolio":
      return renderPortfolioVariant(resolved.variantId as Parameters<typeof renderPortfolioVariant>[0], props.content as SectionVariantContentMap["portfolio"]);
    case "pricing":
      return renderPricingVariant(resolved.variantId as Parameters<typeof renderPricingVariant>[0], props.content as SectionVariantContentMap["pricing"]);
    case "testimonials":
      return renderTestimonialsVariant(resolved.variantId as Parameters<typeof renderTestimonialsVariant>[0], props.content as SectionVariantContentMap["testimonials"]);
    case "cta":
      return renderCtaVariant(resolved.variantId as Parameters<typeof renderCtaVariant>[0], props.content as SectionVariantContentMap["cta"]);
    case "contact":
      return renderContactVariant(resolved.variantId as Parameters<typeof renderContactVariant>[0], props.content as SectionVariantContentMap["contact"]);
    case "footer":
      return renderFooterVariant(resolved.variantId as Parameters<typeof renderFooterVariant>[0], props.content as SectionVariantContentMap["footer"]);
    default:
      return null;
  }
}
