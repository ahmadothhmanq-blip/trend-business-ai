/**
 * Template Marketplace catalog — industry × premium style variations.
 */

import { getPremiumTemplate } from "@/lib/ai-core/premium-templates/catalog";
import type { PremiumTemplateId } from "@/lib/ai-core/premium-templates/types";
import type { LayoutStyle, TemplateDesignPreset } from "@/lib/ai-core/templates/types";
import type {
  MarketplaceCategory,
  MarketplaceColorSystem,
  MarketplacePreviewSection,
  MarketplaceStyleVariation,
  MarketplaceTemplate,
} from "@/lib/ai-core/template-marketplace/types";

export const MARKETPLACE_CATEGORIES: Array<{
  id: MarketplaceCategory;
  label: string;
  description: string;
}> = [
  { id: "restaurant", label: "Restaurant", description: "Dining, cafés, hospitality" },
  { id: "automotive", label: "Automotive", description: "Dealers, showrooms, mobility" },
  { id: "real-estate", label: "Real Estate", description: "Property, brokerage, developments" },
  { id: "saas", label: "SaaS", description: "Product-led software brands" },
  { id: "ecommerce", label: "E-commerce", description: "Stores and product catalogs" },
  { id: "healthcare", label: "Healthcare / Clinic", description: "Clinics, wellness, care" },
  { id: "agency", label: "Agency", description: "Studios and creative firms" },
  { id: "finance", label: "Finance", description: "Advisory, fintech, wealth" },
  { id: "portfolio", label: "Portfolio", description: "Personal and studio showcases" },
  { id: "education", label: "Education", description: "Schools, courses, campuses" },
  { id: "technology", label: "Technology", description: "Tech brands and platforms" },
];

const STYLE_META: Record<
  MarketplaceStyleVariation,
  {
    label: string;
    designPreset: TemplateDesignPreset;
    colors: MarketplaceColorSystem;
    typography: { display: string; body: string };
  }
> = {
  luxury: {
    label: "Luxury",
    designPreset: "luxury",
    colors: {
      primary: "#1A1A1A",
      secondary: "#C6A75E",
      accent: "#8B7355",
      background: "#F7F3EC",
      foreground: "#141414",
    },
    typography: { display: "Playfair Display", body: "Source Sans 3" },
  },
  modern: {
    label: "Modern",
    designPreset: "modern",
    colors: {
      primary: "#0F172A",
      secondary: "#2563EB",
      accent: "#38BDF8",
      background: "#F8FAFC",
      foreground: "#0F172A",
    },
    typography: { display: "Space Grotesk", body: "Inter" },
  },
  corporate: {
    label: "Corporate",
    designPreset: "corporate",
    colors: {
      primary: "#0B1F33",
      secondary: "#1E4E79",
      accent: "#C9A227",
      background: "#F4F6F8",
      foreground: "#0B1F33",
    },
    typography: { display: "DM Sans", body: "Source Sans 3" },
  },
  creative: {
    label: "Creative",
    designPreset: "creative",
    colors: {
      primary: "#18181B",
      secondary: "#F43F5E",
      accent: "#FBBF24",
      background: "#FAFAF9",
      foreground: "#18181B",
    },
    typography: { display: "Syne", body: "Manrope" },
  },
  minimal: {
    label: "Minimal",
    designPreset: "minimal",
    colors: {
      primary: "#111111",
      secondary: "#525252",
      accent: "#A3A3A3",
      background: "#FFFFFF",
      foreground: "#111111",
    },
    typography: { display: "Instrument Sans", body: "IBM Plex Sans" },
  },
  "premium-saas": {
    label: "Premium SaaS",
    designPreset: "tech",
    colors: {
      primary: "#020617",
      secondary: "#6366F1",
      accent: "#22D3EE",
      background: "#F1F5F9",
      foreground: "#020617",
    },
    typography: { display: "Satoshi", body: "Inter" },
  },
  technology: {
    label: "Technology",
    designPreset: "tech",
    colors: {
      primary: "#030712",
      secondary: "#0EA5E9",
      accent: "#34D399",
      background: "#0B1220",
      foreground: "#E2E8F0",
    },
    typography: { display: "Space Grotesk", body: "IBM Plex Sans" },
  },
};

type CategorySeed = {
  category: MarketplaceCategory;
  premiumTemplateId: PremiumTemplateId;
  layoutType: LayoutStyle;
  audience: string;
  features: string[];
  styles: MarketplaceStyleVariation[];
  popularStyles?: MarketplaceStyleVariation[];
};

const CATEGORY_SEEDS: CategorySeed[] = [
  {
    category: "restaurant",
    premiumTemplateId: "restaurant",
    layoutType: "editorial-hero",
    audience: "Diners seeking atmosphere, menus, and reservations",
    features: ["Menu showcase", "Reservation CTA", "Atmosphere gallery", "Chef story"],
    styles: ["luxury", "modern", "creative", "minimal"],
    popularStyles: ["luxury", "modern"],
  },
  {
    category: "automotive",
    premiumTemplateId: "automotive",
    layoutType: "vehicle-showroom",
    audience: "Car buyers and enthusiasts comparing inventory",
    features: ["Vehicle gallery", "Specs highlights", "Test-drive CTA", "Finance trust"],
    styles: ["luxury", "modern", "technology", "corporate"],
    popularStyles: ["luxury", "technology"],
  },
  {
    category: "real-estate",
    premiumTemplateId: "real-estate",
    layoutType: "property-showcase",
    audience: "Home buyers, investors, and premium listings seekers",
    features: ["Property showcase", "Neighborhood story", "Inquiry form", "Agent trust"],
    styles: ["luxury", "corporate", "modern", "minimal"],
    popularStyles: ["luxury", "corporate"],
  },
  {
    category: "saas",
    premiumTemplateId: "saas",
    layoutType: "product-saas",
    audience: "B2B buyers evaluating product value and pricing",
    features: ["Product hero", "Feature storytelling", "Pricing clarity", "Trial CTA"],
    styles: ["premium-saas", "modern", "minimal", "technology"],
    popularStyles: ["premium-saas", "modern"],
  },
  {
    category: "ecommerce",
    premiumTemplateId: "ecommerce",
    layoutType: "commerce-grid",
    audience: "Shoppers browsing products and collections",
    features: ["Product grid", "Collection stories", "Trust badges", "Checkout path"],
    styles: ["modern", "minimal", "creative", "luxury"],
    popularStyles: ["modern", "minimal"],
  },
  {
    category: "healthcare",
    premiumTemplateId: "healthcare",
    layoutType: "corporate-trust",
    audience: "Patients seeking care, trust, and easy booking",
    features: ["Care services", "Doctor trust", "Booking CTA", "Clinic atmosphere"],
    styles: ["modern", "corporate", "minimal", "luxury"],
    popularStyles: ["modern", "corporate"],
  },
  {
    category: "agency",
    premiumTemplateId: "agency",
    layoutType: "studio-portfolio",
    audience: "Brands hiring creative and marketing partners",
    features: ["Case studies", "Services narrative", "Studio gallery", "Contact CTA"],
    styles: ["creative", "modern", "minimal", "luxury"],
    popularStyles: ["creative", "modern"],
  },
  {
    category: "finance",
    premiumTemplateId: "luxury-business",
    layoutType: "corporate-trust",
    audience: "Clients seeking advisory confidence and clarity",
    features: ["Trust metrics", "Service clarity", "Compliance tone", "Consultation CTA"],
    styles: ["corporate", "luxury", "minimal", "modern"],
    popularStyles: ["corporate", "luxury"],
  },
  {
    category: "portfolio",
    premiumTemplateId: "agency",
    layoutType: "studio-portfolio",
    audience: "Creatives and founders showcasing work",
    features: ["Project gallery", "Process story", "About band", "Hire CTA"],
    styles: ["creative", "minimal", "luxury", "modern"],
    popularStyles: ["creative", "minimal"],
  },
  {
    category: "education",
    premiumTemplateId: "education",
    layoutType: "campus-education",
    audience: "Students and parents evaluating programs",
    features: ["Programs grid", "Campus story", "Admissions CTA", "Outcomes proof"],
    styles: ["modern", "corporate", "minimal", "creative"],
    popularStyles: ["modern", "corporate"],
  },
  {
    category: "technology",
    premiumTemplateId: "saas",
    layoutType: "product-saas",
    audience: "Tech buyers and platform evaluators",
    features: ["Platform hero", "Capability bands", "Integration proof", "Demo CTA"],
    styles: ["technology", "premium-saas", "modern", "minimal"],
    popularStyles: ["technology", "premium-saas"],
  },
];

function previewFromPremium(premiumId: PremiumTemplateId): MarketplacePreviewSection[] {
  const tpl = getPremiumTemplate(premiumId);
  return tpl.sections.slice(0, 7).map((s) => {
    const kind: MarketplacePreviewSection["kind"] =
      s.key.includes("hero")
        ? "hero"
        : s.key.includes("pric")
          ? "pricing"
          : s.key.includes("contact") || s.key.includes("cta")
            ? "cta"
            : s.key.includes("testimonial") || s.key.includes("trust")
              ? "proof"
              : s.key.includes("gallery") || s.key.includes("showcase")
                ? "media"
                : "content";
    return { key: s.key, label: s.label, kind };
  });
}

function buildCatalog(): MarketplaceTemplate[] {
  const items: MarketplaceTemplate[] = [];
  for (const seed of CATEGORY_SEEDS) {
    const premium = getPremiumTemplate(seed.premiumTemplateId);
    const previewSections = previewFromPremium(seed.premiumTemplateId);
    for (const style of seed.styles) {
      const meta = STYLE_META[style];
      const categoryLabel =
        MARKETPLACE_CATEGORIES.find((c) => c.id === seed.category)?.label ||
        seed.category;
      items.push({
        id: `${seed.category}-${style}`,
        name: `${categoryLabel} · ${meta.label}`,
        tagline: `${meta.label} ${categoryLabel.toLowerCase()} website template`,
        description: `${premium.description} Tuned for a ${meta.label.toLowerCase()} visual system — agency-grade composition, not generic card grids.`,
        category: seed.category,
        premiumTemplateId: seed.premiumTemplateId,
        industry: premium.industryId,
        style,
        designPreset: meta.designPreset,
        layoutType: seed.layoutType,
        colorSystem: meta.colors,
        typography: meta.typography,
        recommendedAudience: seed.audience,
        features: seed.features,
        previewSections,
        connectsTo: [
          "design-intelligence",
          "brand-identity",
          "ai-assets",
          "website-editor",
          "final-quality",
        ],
        popular: seed.popularStyles?.includes(style),
        new: style === "premium-saas" || style === "technology",
      });
    }
  }
  return items;
}

export const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = buildCatalog();

export function listMarketplaceTemplates(filters?: {
  category?: MarketplaceCategory | "all";
  style?: MarketplaceStyleVariation | "all";
  query?: string;
}): MarketplaceTemplate[] {
  let items = MARKETPLACE_TEMPLATES;
  if (filters?.category && filters.category !== "all") {
    items = items.filter((t) => t.category === filters.category);
  }
  if (filters?.style && filters.style !== "all") {
    items = items.filter((t) => t.style === filters.style);
  }
  const q = filters?.query?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.features.some((f) => f.toLowerCase().includes(q)) ||
        t.recommendedAudience.toLowerCase().includes(q) ||
        t.category.includes(q),
    );
  }
  return items;
}

export function getMarketplaceTemplate(id: string): MarketplaceTemplate | null {
  return MARKETPLACE_TEMPLATES.find((t) => t.id === id) ?? null;
}

export function marketplaceStyleLabel(style: MarketplaceStyleVariation): string {
  return STYLE_META[style].label;
}

export const MARKETPLACE_STYLE_VARIATIONS = Object.keys(
  STYLE_META,
) as MarketplaceStyleVariation[];
