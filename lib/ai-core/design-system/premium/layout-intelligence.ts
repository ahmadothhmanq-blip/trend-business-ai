import type {
  PremiumLayoutIntelligence,
  PremiumStyleId,
} from "@/lib/ai-core/design-system/premium/types";
import { getPremiumStyleBase } from "@/lib/ai-core/design-system/premium/styles";

/**
 * Industry + layout-variation aware layout intelligence layered on premium style defaults.
 */
export function resolveLayoutIntelligence(params: {
  styleId: PremiumStyleId;
  industryId?: string;
  designStyle?: string;
  layoutStyle?: string;
  layoutVariationId?: string;
  heroTreatment?: string;
  sectionLayout?: string;
}): PremiumLayoutIntelligence {
  const base = getPremiumStyleBase(params.styleId).layout;
  const industry = String(params.industryId || "").toLowerCase();
  const designStyle = String(params.designStyle || "").toLowerCase();
  const variation = String(params.layoutVariationId || "").toLowerCase();
  const layoutStyle = String(params.layoutStyle || "").toLowerCase();

  let heroStyle = params.heroTreatment || base.heroStyle;
  let sectionLayout = params.sectionLayout || base.sectionLayout;
  let cardStyle = base.cardStyle;
  let navigationStyle = base.navigationStyle;
  let footerStyle = base.footerStyle;
  let ctaStyle = base.ctaStyle;
  let density = base.density;

  // Layout variation tokens (from AI Layout Selection Engine).
  if (variation === "cinematic-hero") {
    heroStyle = params.heroTreatment || "cinematic-hero";
    sectionLayout = params.sectionLayout || "premium-storytelling";
    cardStyle = "borderless-editorial";
    navigationStyle = "transparent-overlay";
    density = "airy";
  } else if (variation === "full-screen-hero") {
    heroStyle = params.heroTreatment || "full-image-hero";
    sectionLayout = params.sectionLayout || "destination-mosaic";
    cardStyle = "borderless-editorial";
    navigationStyle = "transparent-overlay";
    density = "airy";
  } else if (variation === "split-hero") {
    heroStyle = params.heroTreatment || "split-hero";
    sectionLayout = params.sectionLayout || "trust-then-offer";
    cardStyle = "elevated-trust";
    navigationStyle = "corporate-topbar";
  } else if (variation === "image-focused-hero") {
    heroStyle = params.heroTreatment || "full-image-hero";
    sectionLayout = params.sectionLayout || "editorial-asymmetric";
    cardStyle = "borderless-editorial";
    navigationStyle = "minimal-logo-led";
    density = "airy";
  } else if (variation === "product-showcase") {
    heroStyle = params.heroTreatment || "product-showcase-hero";
    sectionLayout = params.sectionLayout || "showroom-experience";
    cardStyle = "metallic-elevated";
    navigationStyle = "dark-concierge";
  } else if (variation === "interactive-hero") {
    heroStyle = params.heroTreatment || "interactive-hero";
    sectionLayout = params.sectionLayout || "interactive-product-story";
    cardStyle = "elevated-soft";
    navigationStyle = "sticky-product-cta";
    footerStyle = "compact-product";
    ctaStyle = "trial-demo-pair";
    density = "balanced";
  } else if (variation === "storytelling") {
    heroStyle = params.heroTreatment || "flagship-manifesto";
    sectionLayout = params.sectionLayout || "premium-storytelling";
    cardStyle = "borderless-editorial";
    navigationStyle = "logo-led-reserved";
    density = "airy";
  } else if (variation === "editorial") {
    heroStyle = params.heroTreatment || "editorial-flagship";
    sectionLayout = params.sectionLayout || "portfolio-mosaic";
    cardStyle = "bold-media";
    navigationStyle = "studio-transparent";
  } else if (variation === "dashboard") {
    heroStyle = params.heroTreatment || "trust-split";
    sectionLayout = params.sectionLayout || "symmetric-metrics";
    cardStyle = "data-card";
    navigationStyle = "corporate-topbar";
    density = "balanced";
  } else if (variation === "premium-saas") {
    heroStyle = params.heroTreatment || "product-showcase-hero";
    sectionLayout = params.sectionLayout || "bento-capabilities";
    cardStyle = "elevated-soft";
    navigationStyle = "sticky-product-cta";
    footerStyle = "compact-product";
    ctaStyle = "trial-demo-pair";
    density = "balanced";
  }

  // Industry identity overrides (never let restaurant look like a car showroom).
  if (industry.includes("tourism") || designStyle.includes("travel")) {
    heroStyle = params.heroTreatment || "full-bleed-cinematic";
    sectionLayout = params.sectionLayout || "destination-mosaic";
    cardStyle = "media-first-soft";
    navigationStyle = "travel-sticky";
    footerStyle = "multi-column-explore";
    ctaStyle = "book-trip-pill";
  } else if (industry.includes("auto") || layoutStyle.includes("showroom")) {
    heroStyle = params.heroTreatment || "luxury-vehicle-stage";
    sectionLayout = params.sectionLayout || "showroom-grid";
    cardStyle = "metallic-elevated";
    navigationStyle = "dark-concierge";
    footerStyle = "dealership-columns";
    ctaStyle = "test-drive-solid";
  } else if (industry.includes("restaurant") || layoutStyle.includes("dining")) {
    heroStyle = params.heroTreatment || "image-led-appetite";
    sectionLayout = params.sectionLayout || "editorial-asymmetric";
    cardStyle = "media-first-soft";
    navigationStyle = "minimal-logo-led";
    footerStyle = "editorial-columns";
    ctaStyle = "reserve-table";
  } else if (industry.includes("real") || industry.includes("estate")) {
    heroStyle = params.heroTreatment || "property-search-hero";
    sectionLayout = params.sectionLayout || "listing-grid";
    cardStyle = "listing-photo-first";
    navigationStyle = "corporate-topbar";
    footerStyle = "multi-column-legal";
    ctaStyle = "inquire-solid";
  } else if (
    industry.includes("saas") ||
    industry.includes("software") ||
    params.styleId === "saas"
  ) {
    heroStyle = params.heroTreatment || "product-frame-cinematic";
    sectionLayout = params.sectionLayout || "bento-capabilities";
    cardStyle = "elevated-soft";
    navigationStyle = "sticky-product-cta";
    footerStyle = "compact-product";
    ctaStyle = "trial-demo-pair";
  } else if (
    industry.includes("financ") ||
    industry.includes("bank") ||
    layoutStyle.includes("finance")
  ) {
    heroStyle = params.heroTreatment || "trust-split";
    sectionLayout = params.sectionLayout || "symmetric-metrics";
    cardStyle = "data-card";
    navigationStyle = "corporate-topbar";
    footerStyle = "multi-column-legal";
    ctaStyle = "advisory-solid";
    density = "balanced";
  } else if (industry.includes("clinic") || industry.includes("health")) {
    heroStyle = params.heroTreatment || "trust-split";
    sectionLayout = params.sectionLayout || "symmetric-grid";
    cardStyle = "elevated-trust";
    navigationStyle = "corporate-topbar";
    footerStyle = "multi-column-legal";
    ctaStyle = "book-appointment";
  } else if (industry.includes("ecommerce") || industry.includes("e-com")) {
    heroStyle = params.heroTreatment || "offer-commerce";
    sectionLayout = params.sectionLayout || "commerce-grid";
    cardStyle = "product-tile";
    navigationStyle = "sticky-product-cta";
    footerStyle = "commerce-columns";
    ctaStyle = "shop-now";
  } else if (industry.includes("agency") || industry.includes("creative")) {
    heroStyle = params.heroTreatment || "asymmetric-studio";
    sectionLayout = params.sectionLayout || "portfolio-mosaic";
    cardStyle = "bold-media";
    navigationStyle = "studio-transparent";
    footerStyle = "editorial-columns";
    ctaStyle = "start-project";
  } else if (industry.includes("tech") || params.styleId === "technology") {
    heroStyle = params.heroTreatment || "product-frame-cinematic";
    sectionLayout = params.sectionLayout || "bento-capabilities";
    cardStyle = "dark-glass";
    navigationStyle = "compact-product";
    footerStyle = "dense-product";
    ctaStyle = "glow-pill";
  }

  if (layoutStyle.includes("travel")) {
    heroStyle = params.heroTreatment || "full-bleed-cinematic";
  }
  if (layoutStyle.includes("vehicle") || layoutStyle.includes("showroom")) {
    heroStyle = params.heroTreatment || "luxury-vehicle-stage";
  }

  return {
    ...base,
    heroStyle,
    sectionLayout,
    cardStyle,
    navigationStyle,
    footerStyle,
    ctaStyle,
    density,
    rules: [
      ...base.rules,
      variation ? `Layout variation: ${variation}` : null,
      `Hero style: ${heroStyle}`,
      `Section layout: ${sectionLayout}`,
      `Cards: ${cardStyle}`,
      `Nav: ${navigationStyle}`,
      `Footer: ${footerStyle}`,
    ].filter(Boolean) as string[],
  };
}
