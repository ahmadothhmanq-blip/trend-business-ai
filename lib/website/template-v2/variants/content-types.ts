import type { FlagshipUi } from "@/lib/website/template-v2/flagship/themes";

export type VariantSectionBase = {
  ui: FlagshipUi;
  componentId: string;
  id?: string;
};

export type HeroContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  primaryHref?: string;
  secondaryHref?: string;
  imageUrl?: string | null;
  metrics?: Array<{ value: string; label: string }>;
};

export type FeatureItem = {
  title: string;
  description: string;
  icon?: string;
};

export type FeaturesContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: FeatureItem[];
};

export type AboutContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  body?: string;
  imageUrl?: string | null;
  imageUrlSecondary?: string | null;
  highlights?: string[];
  primaryCta?: string;
  primaryCtaHref?: string;
  quote?: string;
  stats?: Array<{ value: string; label: string }>;
};

export type ServiceItem = {
  title: string;
  description: string;
  icon?: string;
  price?: string;
};

export type ServicesContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: ServiceItem[];
  categories?: Array<{ name: string; items: ServiceItem[] }>;
};

export type PortfolioItem = {
  title: string;
  category?: string;
  description?: string;
  imageUrl?: string | null;
};

export type PortfolioContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: PortfolioItem[];
};

export type PricingTier = {
  name: string;
  price: string;
  period?: string;
  description?: string;
  features?: string[];
  featured?: boolean;
  cta?: string;
};

export type PricingContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  tiers?: PricingTier[];
};

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  company?: string;
  imageUrl?: string | null;
  rating?: number;
};

export type TestimonialsContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  items?: TestimonialItem[];
  logos?: string[];
};

export type CtaContent = VariantSectionBase & {
  title?: string;
  subtitle?: string;
  primaryCta?: string;
  secondaryCta?: string;
  primaryHref?: string;
  secondaryHref?: string;
  emailPlaceholder?: string;
};

export type ContactContent = VariantSectionBase & {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
  submitLabel?: string;
};

export type FooterLink = { label: string; href: string };

export type FooterContent = VariantSectionBase & {
  brandName?: string;
  tagline?: string;
  columns?: Array<{ title: string; links: FooterLink[] }>;
  links?: FooterLink[];
  copyright?: string;
  newsletterLabel?: string;
};
