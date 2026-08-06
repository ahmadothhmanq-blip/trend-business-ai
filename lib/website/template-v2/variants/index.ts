export type {
  AboutContent,
  ContactContent,
  CtaContent,
  FeatureItem,
  FeaturesContent,
  FooterContent,
  FooterLink,
  HeroContent,
  PortfolioContent,
  PortfolioItem,
  PricingContent,
  PricingTier,
  ServiceItem,
  ServicesContent,
  TestimonialItem,
  TestimonialsContent,
  VariantSectionBase,
} from "@/lib/website/template-v2/variants/content-types";

export {
  SECTION_DEFAULT_VARIANTS,
  SECTION_VARIANT_REGISTRY,
  getDefaultVariantId,
  getVariantDefinition,
  listSectionVariants,
  validateVariantRegistry,
} from "@/lib/website/template-v2/variants/registry";

export {
  resolveSectionVariant,
  isValidSectionVariant,
  type ResolveVariantResult,
  type SectionVariantContentMap,
  type SectionVariantIdMap,
} from "@/lib/website/template-v2/variants/resolve";

export {
  SectionVariantRenderer,
  type SectionVariantRendererProps,
} from "@/lib/website/template-v2/variants/render";

export { SectionVariantShell } from "@/lib/website/template-v2/variants/shell";

export type {
  SectionKind,
  SectionVariantId,
  VariantDefinition,
  VariantComposition,
  HeroVariantId,
  FeaturesVariantId,
  AboutVariantId,
  ServicesVariantId,
  PortfolioVariantId,
  PricingVariantId,
  TestimonialsVariantId,
  CtaVariantId,
  ContactVariantId,
  FooterVariantId,
} from "@/lib/website/template-v2/variants/types";

export { SECTION_VARIANT_COUNTS } from "@/lib/website/template-v2/variants/types";

export { renderHeroVariant, HERO_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/hero";
export { renderFeaturesVariant, FEATURES_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/features";
export { renderAboutVariant, ABOUT_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/about";
export { renderServicesVariant, SERVICES_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/services";
export { renderPortfolioVariant, PORTFOLIO_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/portfolio";
export { renderPricingVariant, PRICING_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/pricing";
export { renderTestimonialsVariant, TESTIMONIALS_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/testimonials";
export { renderCtaVariant, CTA_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/cta";
export { renderContactVariant, CONTACT_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/contact";
export { renderFooterVariant, FOOTER_DEFAULT_VARIANT } from "@/lib/website/template-v2/variants/sections/footer";

export * from "@/lib/website/template-v2/variants/decision";
