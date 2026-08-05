import type { Tbge2IntentCategory, Tbge2PageKind, Tbge2SectionType } from "@/lib/ai-core/generation-engine/core/types";

export type Tbge2SectionTemplate = {
  type: Tbge2SectionType;
  label: string;
  required: boolean;
};

const SECTION_CATALOG: Record<Tbge2SectionType, Tbge2SectionTemplate> = {
  hero: { type: "hero", label: "Hero", required: true },
  features: { type: "features", label: "Features", required: false },
  services: { type: "services", label: "Services", required: false },
  testimonials: { type: "testimonials", label: "Testimonials", required: false },
  gallery: { type: "gallery", label: "Gallery", required: false },
  pricing: { type: "pricing", label: "Pricing", required: false },
  faq: { type: "faq", label: "FAQ", required: false },
  cta: { type: "cta", label: "Call to Action", required: true },
  footer: { type: "footer", label: "Footer", required: true },
  about: { type: "about", label: "About", required: false },
  team: { type: "team", label: "Team", required: false },
  stats: { type: "stats", label: "Statistics", required: false },
  process: { type: "process", label: "Process", required: false },
  contact: { type: "contact", label: "Contact", required: false },
  "blog-preview": { type: "blog-preview", label: "Blog Preview", required: false },
  menu: { type: "menu", label: "Menu", required: false },
  locations: { type: "locations", label: "Locations", required: false },
  "portfolio-grid": { type: "portfolio-grid", label: "Portfolio Grid", required: false },
  integrations: { type: "integrations", label: "Integrations", required: false },
  comparison: { type: "comparison", label: "Comparison", required: false },
  "trust-badges": { type: "trust-badges", label: "Trust Badges", required: false },
  newsletter: { type: "newsletter", label: "Newsletter", required: false },
};

const PAGE_SECTIONS: Record<Tbge2PageKind, Tbge2SectionType[]> = {
  home: ["hero", "features", "testimonials", "cta", "footer"],
  about: ["about", "team", "stats", "cta", "footer"],
  services: ["services", "process", "testimonials", "cta", "footer"],
  pricing: ["pricing", "comparison", "faq", "cta", "footer"],
  faq: ["faq", "cta", "footer"],
  blog: ["blog-preview", "newsletter", "footer"],
  contact: ["contact", "locations", "footer"],
  gallery: ["gallery", "cta", "footer"],
  portfolio: ["portfolio-grid", "testimonials", "cta", "footer"],
  menu: ["menu", "gallery", "cta", "footer"],
  team: ["team", "about", "footer"],
  custom: ["hero", "features", "cta", "footer"],
};

const INTENT_SECTION_OVERRIDES: Partial<Record<Tbge2IntentCategory, Partial<Record<Tbge2PageKind, Tbge2SectionType[]>>>> = {
  restaurant: {
    home: ["hero", "menu", "gallery", "testimonials", "cta", "footer"],
  },
  saas: {
    home: ["hero", "features", "integrations", "pricing", "testimonials", "cta", "footer"],
  },
  medical: {
    home: ["hero", "services", "trust-badges", "testimonials", "faq", "cta", "footer"],
  },
  "real-estate": {
    home: ["hero", "gallery", "stats", "testimonials", "cta", "footer"],
  },
  "landing-page": {
    home: ["hero", "features", "testimonials", "pricing", "cta", "footer"],
  },
};

export function resolveSectionsForPage(
  pageKind: Tbge2PageKind,
  intent: Tbge2IntentCategory,
): Tbge2SectionTemplate[] {
  const override = INTENT_SECTION_OVERRIDES[intent]?.[pageKind];
  const types = override ?? PAGE_SECTIONS[pageKind] ?? PAGE_SECTIONS.custom;
  return types.map((type) => SECTION_CATALOG[type]);
}
