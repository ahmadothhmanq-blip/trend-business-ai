/**
 * Template Marketplace catalog — industry × premium style variations.
 * Catalog is empty until the new template architecture is installed.
 */

import type { MarketplaceCategory, MarketplaceStyleVariation, MarketplaceTemplate } from "@/lib/ai-core/template-marketplace/types";

export const MARKETPLACE_CATEGORIES: Array<{
  id: MarketplaceCategory;
  label: string;
  description: string;
}> = [];

export const MARKETPLACE_TEMPLATES: MarketplaceTemplate[] = [];

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
  const labels: Record<MarketplaceStyleVariation, string> = {
    luxury: "Luxury",
    modern: "Modern",
    corporate: "Corporate",
    creative: "Creative",
    minimal: "Minimal",
    "premium-saas": "Premium SaaS",
    technology: "Technology",
  };
  return labels[style] ?? style;
}

export const MARKETPLACE_STYLE_VARIATIONS = Object.keys({
  luxury: true,
  modern: true,
  corporate: true,
  creative: true,
  minimal: true,
  "premium-saas": true,
  technology: true,
}) as MarketplaceStyleVariation[];
