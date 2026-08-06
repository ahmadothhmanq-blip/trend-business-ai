import type { ImageSlotKind } from "@/lib/ai-core/image-engine/slots";

/** Canonical section kinds supported by the Variant Engine. */
export type SectionKind =
  | "hero"
  | "features"
  | "about"
  | "services"
  | "portfolio"
  | "pricing"
  | "testimonials"
  | "cta"
  | "contact"
  | "footer";

export type HeroVariantId =
  | "split-trust"
  | "centered-statement"
  | "editorial-stack"
  | "product-spotlight"
  | "metrics-rail"
  | "immersive-visual"
  | "minimal-type"
  | "dual-cta-band"
  | "video-frame"
  | "asymmetric-grid";

export type FeaturesVariantId =
  | "icon-grid"
  | "bento-mosaic"
  | "alternating-rows"
  | "numbered-steps"
  | "masonry-cards"
  | "comparison-columns"
  | "sticky-headline"
  | "horizontal-scroll"
  | "tiered-lanes"
  | "spotlight-list";

export type AboutVariantId =
  | "split-narrative"
  | "overlap-portrait"
  | "timeline-story"
  | "mission-pillars"
  | "full-bleed-quote"
  | "editorial-columns"
  | "stats-sidebar"
  | "image-duo";

export type ServicesVariantId =
  | "card-grid"
  | "tabbed-list"
  | "process-rail"
  | "pricing-teaser"
  | "icon-rows"
  | "featured-spotlight"
  | "category-columns"
  | "minimal-list";

export type PortfolioVariantId =
  | "masonry-grid"
  | "carousel-strip"
  | "case-studies"
  | "editorial-reel"
  | "filter-grid"
  | "full-bleed-showcase"
  | "split-feature"
  | "minimal-index";

export type PricingVariantId =
  | "tier-cards"
  | "comparison-table"
  | "toggle-annual"
  | "feature-matrix"
  | "minimal-single"
  | "enterprise-callout"
  | "slider-tiers"
  | "horizontal-scroll";

export type TestimonialsVariantId =
  | "grid-cards"
  | "featured-quote"
  | "logo-wall"
  | "carousel-strip"
  | "split-spotlight"
  | "masonry-quotes"
  | "video-style"
  | "minimal-list";

export type CtaVariantId =
  | "centered-band"
  | "split-offer"
  | "gradient-banner"
  | "inline-newsletter"
  | "floating-card"
  | "minimal-line";

export type ContactVariantId =
  | "split-form"
  | "centered-minimal"
  | "map-sidebar"
  | "cards-grid"
  | "stacked-inline"
  | "dark-panel";

export type FooterVariantId =
  | "four-column"
  | "minimal-centered"
  | "mega-sitemap"
  | "newsletter-band"
  | "compact-inline";

export type SectionVariantId =
  | HeroVariantId
  | FeaturesVariantId
  | AboutVariantId
  | ServicesVariantId
  | PortfolioVariantId
  | PricingVariantId
  | TestimonialsVariantId
  | CtaVariantId
  | ContactVariantId
  | FooterVariantId;

export type VariantComposition =
  | "split"
  | "centered"
  | "stacked"
  | "grid"
  | "bento"
  | "asymmetric"
  | "immersive"
  | "minimal"
  | "editorial"
  | "rail"
  | "band"
  | "mosaic"
  | "carousel"
  | "table"
  | "inline";

export type VariantDefinition<K extends SectionKind = SectionKind> = {
  id: SectionVariantId;
  sectionKind: K;
  label: string;
  description: string;
  composition: VariantComposition;
  hierarchy: string;
  rhythm: string;
  visualIdentity: string;
  imageSlots: ImageSlotKind[];
  responsiveStrategy: string;
  isDefault?: boolean;
};

export const SECTION_VARIANT_COUNTS: Record<SectionKind, number> = {
  hero: 10,
  features: 10,
  about: 8,
  services: 8,
  portfolio: 8,
  pricing: 8,
  testimonials: 8,
  cta: 6,
  contact: 6,
  footer: 5,
};
