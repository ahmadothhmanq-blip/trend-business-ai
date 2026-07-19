/**
 * Component Marketplace catalog — facade over Professional Components Library.
 */

import { PROFESSIONAL_COMPONENT_CATALOG } from "@/lib/ai-core/components/catalog";
import type { SectionKind } from "@/lib/ai-core/components/types";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import type {
  ComponentIndustryPack,
  ComponentMarketplaceCategory,
  ComponentMarketplaceFilters,
  ComponentStyleVariant,
  MarketplaceComponent,
} from "@/lib/ai-core/component-marketplace/types";

export const COMPONENT_MARKETPLACE_CATEGORIES: Array<{
  id: ComponentMarketplaceCategory;
  label: string;
  description: string;
}> = [
  { id: "hero", label: "Hero sections", description: "Full-bleed and editorial openers" },
  { id: "navigation", label: "Navigation bars", description: "Headers and nav systems" },
  { id: "footer", label: "Footers", description: "Site closers and link columns" },
  { id: "pricing", label: "Pricing sections", description: "Plans and packaging" },
  { id: "testimonials", label: "Testimonials", description: "Social proof and quotes" },
  { id: "faq", label: "FAQ", description: "Objection handling" },
  { id: "forms", label: "Forms", description: "Lead and booking forms" },
  { id: "galleries", label: "Galleries", description: "Image and media grids" },
  { id: "product-showcases", label: "Product showcases", description: "Product and inventory" },
  { id: "booking", label: "Booking sections", description: "Reservations and scheduling" },
  { id: "contact", label: "Contact sections", description: "Contact and inquiry CTAs" },
  { id: "services", label: "Services", description: "Offer and service bands" },
  { id: "features", label: "Features", description: "Capability storytelling" },
  { id: "trust", label: "Trust & proof", description: "Brand trust and case studies" },
  { id: "cta", label: "CTA bands", description: "Conversion closers" },
  { id: "other", label: "More", description: "Team, blog, maps, and extras" },
];

export const COMPONENT_INDUSTRY_PACKS: Array<{
  id: ComponentIndustryPack;
  label: string;
  industryIds: Array<IndustryId | "*">;
}> = [
  { id: "automotive", label: "Automotive", industryIds: ["automotive"] },
  { id: "restaurant", label: "Restaurant", industryIds: ["restaurant"] },
  { id: "saas", label: "SaaS", industryIds: ["saas"] },
  { id: "real-estate", label: "Real Estate", industryIds: ["real-estate"] },
  { id: "healthcare", label: "Healthcare", industryIds: ["clinic"] },
  { id: "ecommerce", label: "E-commerce", industryIds: ["ecommerce"] },
  { id: "agency", label: "Agency", industryIds: ["agency"] },
  { id: "finance", label: "Finance", industryIds: ["business"] },
  { id: "universal", label: "Universal", industryIds: ["*"] },
];

const KIND_TO_CATEGORY: Record<SectionKind, ComponentMarketplaceCategory> = {
  hero: "hero",
  header: "navigation",
  footer: "footer",
  pricing: "pricing",
  testimonials: "testimonials",
  faq: "faq",
  booking: "booking",
  contact: "contact",
  gallery: "galleries",
  "gallery-experience": "galleries",
  "product-showcase": "product-showcases",
  "interactive-product": "product-showcases",
  services: "services",
  features: "features",
  "feature-story": "features",
  "case-studies": "trust",
  "brand-trust": "trust",
  timeline: "other",
  comparison: "other",
  video: "galleries",
  maps: "other",
  team: "other",
  blog: "other",
  cta: "cta",
};

const GRADIENTS: Record<ComponentMarketplaceCategory, string> = {
  hero: "linear-gradient(135deg, #0f172a, #c6a75e 55%, #1a1a1a)",
  navigation: "linear-gradient(135deg, #111827, #374151)",
  footer: "linear-gradient(135deg, #0a0a0a, #1f2937)",
  pricing: "linear-gradient(135deg, #020617, #6366f1 50%, #22d3ee)",
  testimonials: "linear-gradient(135deg, #1e1b4b, #a78bfa)",
  faq: "linear-gradient(135deg, #14532d, #86efac)",
  forms: "linear-gradient(135deg, #422006, #fbbf24)",
  galleries: "linear-gradient(135deg, #831843, #f472b6 45%, #312e81)",
  "product-showcases": "linear-gradient(135deg, #082f49, #38bdf8)",
  booking: "linear-gradient(135deg, #7c2d12, #fb923c)",
  contact: "linear-gradient(135deg, #164e63, #67e8f9)",
  services: "linear-gradient(135deg, #1e3a8a, #93c5fd)",
  features: "linear-gradient(135deg, #312e81, #c4b5fd)",
  trust: "linear-gradient(135deg, #365314, #bef264)",
  cta: "linear-gradient(135deg, #450a0a, #f87171)",
  other: "linear-gradient(135deg, #18181b, #71717a)",
};

function mapIndustries(
  industries: Array<IndustryId | "*">,
): ComponentIndustryPack[] {
  const packs = new Set<ComponentIndustryPack>();
  for (const ind of industries) {
    if (ind === "*") {
      packs.add("universal");
      continue;
    }
    if (ind === "automotive") packs.add("automotive");
    else if (ind === "restaurant") packs.add("restaurant");
    else if (ind === "saas") packs.add("saas");
    else if (ind === "real-estate") packs.add("real-estate");
    else if (ind === "clinic") packs.add("healthcare");
    else if (ind === "ecommerce") packs.add("ecommerce");
    else if (ind === "agency") packs.add("agency");
    else if (ind === "business") packs.add("finance");
    else packs.add("universal");
  }
  if (!packs.size) packs.add("universal");
  return Array.from(packs);
}

function mapStyleVariant(
  variant: string | undefined,
  designStyles: string[],
): ComponentStyleVariant {
  const blob = `${variant || ""} ${designStyles.join(" ")}`.toLowerCase();
  if (/luxury|editorial|premium/.test(blob)) return "luxury";
  if (/cinematic|video|immersive/.test(blob)) return "cinematic";
  if (/corporate|trust/.test(blob)) return "corporate";
  if (/creative|bold/.test(blob)) return "creative";
  if (/minimal|clean/.test(blob)) return "minimal";
  if (/product|saas|tech/.test(blob)) return "product";
  if (/modern/.test(blob)) return "modern";
  return "default";
}

function humanName(id: string): string {
  return id.replace(/([a-z])([A-Z])/g, "$1 $2");
}

function buildMarketplaceCatalog(): MarketplaceComponent[] {
  return PROFESSIONAL_COMPONENT_CATALOG.map((entry) => {
    const category = KIND_TO_CATEGORY[entry.kind] || "other";
    // Forms: treat booking/contact form-like components specially
    const resolvedCategory: ComponentMarketplaceCategory =
      entry.id === "BookingForm" ||
      entry.id === "ContactSection" ||
      entry.id === "ReservationSection"
        ? entry.kind === "booking"
          ? "booking"
          : entry.kind === "contact"
            ? "forms"
            : category
        : category;

    const styleVariant = mapStyleVariant(entry.variant, entry.designStyles);
    const industries = mapIndustries(entry.industries);

    return {
      id: entry.id,
      name: humanName(entry.id),
      description: entry.description,
      category: resolvedCategory,
      sectionKind: entry.kind,
      styleVariant,
      industries,
      previewGradient: GRADIENTS[resolvedCategory],
      previewLabel: entry.pattern,
      responsive: {
        desktop: "Full multi-column / cinematic layout",
        tablet: "Stacked columns with preserved hierarchy",
        mobile: "Single column, larger tap targets, condensed nav",
      },
      configOptions: [
        {
          key: "headline",
          label: "Headline",
          type: "text",
          description: "Primary section title (editable on canvas)",
        },
        {
          key: "accent",
          label: "Accent color",
          type: "color",
          defaultValue: "#d4af37",
          description: "Uses site design tokens when saved",
        },
        {
          key: "spacing",
          label: "Section spacing",
          type: "select",
          options: ["compact", "balanced", "airy"],
          defaultValue: "balanced",
        },
        {
          key: "showMedia",
          label: "Show media",
          type: "boolean",
          defaultValue: true,
        },
      ],
      tags: entry.tags,
      path: entry.path,
      exportName: entry.exportName,
      dragType: "component-marketplace-item",
      popular:
        /HeroLuxury|HeroCinematic|PricingModern|TestimonialsModern|FaqAccordion|NavModern|SiteFooter|ProductShowcase|BookingSection|ContactSection/i.test(
          entry.id,
        ),
    };
  });
}

export const COMPONENT_MARKETPLACE_CATALOG: MarketplaceComponent[] =
  buildMarketplaceCatalog();

export function listMarketplaceComponents(
  filters?: ComponentMarketplaceFilters,
): MarketplaceComponent[] {
  let items = COMPONENT_MARKETPLACE_CATALOG;
  if (filters?.category && filters.category !== "all") {
    items = items.filter((c) => c.category === filters.category);
  }
  if (filters?.industry && filters.industry !== "all") {
    const pack = filters.industry;
    items = items.filter(
      (c) =>
        c.industries.includes(pack) || c.industries.includes("universal"),
    );
  }
  if (filters?.style && filters.style !== "all") {
    const style = filters.style;
    items = items.filter((c) => c.styleVariant === style);
  }
  const q = filters?.query?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.category.includes(q),
    );
  }
  return items;
}

export function getMarketplaceComponent(
  id: string,
): MarketplaceComponent | null {
  return COMPONENT_MARKETPLACE_CATALOG.find((c) => c.id === id) ?? null;
}

export function listComponentsByIndustry(
  pack: ComponentIndustryPack,
): MarketplaceComponent[] {
  return listMarketplaceComponents({ industry: pack });
}

export const COMPONENT_STYLE_VARIANTS: ComponentStyleVariant[] = [
  "luxury",
  "modern",
  "corporate",
  "creative",
  "minimal",
  "cinematic",
  "product",
  "default",
];
