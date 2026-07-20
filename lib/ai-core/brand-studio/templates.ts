/**
 * Industry and style templates for Brand Studio.
 */

import type { BrandTemplateDefinition } from "@/lib/ai-core/brand-studio/types";

export const BRAND_STUDIO_TEMPLATES: BrandTemplateDefinition[] = [
  {
    id: "luxury",
    label: "Luxury",
    category: "style",
    style: "luxury",
    description: "Refined, editorial identity with precious metals and serif typography.",
    brandType: "luxury",
    personality: "Elegant",
    deliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "stationery"],
    previewColors: ["#1A1410", "#C9A227", "#F5F0E8"],
    recommended: true,
  },
  {
    id: "corporate",
    label: "Corporate",
    category: "style",
    style: "corporate",
    description: "Trustworthy enterprise system with structured guidelines.",
    brandType: "corporate",
    personality: "Professional",
    deliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "presentation"],
    previewColors: ["#0F172A", "#2563EB", "#F8FAFC"],
    recommended: true,
  },
  {
    id: "startup",
    label: "Startup",
    category: "style",
    style: "startup",
    description: "Bold, energetic identity for new ventures.",
    brandType: "startup",
    personality: "Bold",
    deliverables: ["logo-guidelines", "color-palette", "typography", "voice-tone", "social-kit"],
    previewColors: ["#7C3AED", "#06B6D4", "#FFFFFF"],
  },
  {
    id: "saas",
    label: "SaaS",
    category: "industry",
    industry: "SaaS & Software",
    description: "Product-led software brand with UI-ready tokens.",
    brandType: "saas",
    personality: "Innovative",
    deliverables: ["logo-guidelines", "color-palette", "typography", "ui-kit", "voice-tone"],
    previewColors: ["#4F46E5", "#22D3EE", "#0F172A"],
    recommended: true,
  },
  {
    id: "restaurant",
    label: "Restaurant",
    category: "industry",
    industry: "Food & Beverage",
    description: "Warm hospitality identity with menu and packaging assets.",
    brandType: "restaurant",
    personality: "Warm",
    deliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "menu-design"],
    previewColors: ["#7F1D1D", "#F59E0B", "#FFFBEB"],
  },
  {
    id: "ecommerce",
    label: "E-commerce",
    category: "industry",
    industry: "E-commerce",
    description: "Conversion-focused retail brand with social templates.",
    brandType: "ecommerce",
    personality: "Friendly",
    deliverables: ["logo-guidelines", "color-palette", "typography", "packaging", "social-kit"],
    previewColors: ["#059669", "#F97316", "#FFFFFF"],
  },
];

export function listBrandTemplates(filter?: {
  category?: "industry" | "style";
  industry?: string;
  style?: string;
}): BrandTemplateDefinition[] {
  return BRAND_STUDIO_TEMPLATES.filter((t) => {
    if (filter?.category && t.category !== filter.category) return false;
    if (filter?.industry && t.industry !== filter.industry) return false;
    if (filter?.style && t.style !== filter.style) return false;
    return true;
  });
}

export function getBrandTemplate(id: string): BrandTemplateDefinition | undefined {
  return BRAND_STUDIO_TEMPLATES.find((t) => t.id === id);
}

export function recommendTemplates(input: {
  prompt: string;
  industry?: string;
  brandType?: string;
}): BrandTemplateDefinition[] {
  const text = `${input.prompt} ${input.industry ?? ""} ${input.brandType ?? ""}`.toLowerCase();
  const scored = BRAND_STUDIO_TEMPLATES.map((t) => {
    let score = t.recommended ? 2 : 0;
    if (input.brandType && t.brandType === input.brandType) score += 5;
    if (input.industry && t.industry === input.industry) score += 4;
    if (text.includes(t.id)) score += 3;
    if (text.includes(t.style ?? "")) score += 2;
    if (text.includes(t.label.toLowerCase())) score += 2;
    return { t, score };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.t);
}
