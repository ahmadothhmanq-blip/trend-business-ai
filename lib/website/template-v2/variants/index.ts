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
  HERO_DEFAULT_VARIANT,
  FEATURES_DEFAULT_VARIANT,
  ABOUT_DEFAULT_VARIANT,
  SERVICES_DEFAULT_VARIANT,
  PORTFOLIO_DEFAULT_VARIANT,
  PRICING_DEFAULT_VARIANT,
  TESTIMONIALS_DEFAULT_VARIANT,
  CTA_DEFAULT_VARIANT,
  CONTACT_DEFAULT_VARIANT,
  FOOTER_DEFAULT_VARIANT,
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

export * from "@/lib/website/template-v2/variants/decision";
