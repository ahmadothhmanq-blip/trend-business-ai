/**
 * Design Studio template foundation.
 */

import type { DesignTemplateDefinition } from "@/lib/ai-core/image-design-platform/types";

export const DESIGN_STUDIO_TEMPLATES: DesignTemplateDefinition[] = [
  {
    id: "instagram-post",
    label: "Instagram Post",
    category: "social-media",
    description: "Square social post with bold composition and brand-ready negative space.",
    imageType: "social-media",
    style: "Modern",
    aspectRatio: "1:1",
    mood: "Energetic",
    deliverables: ["branded", "text-overlay"],
    previewColors: ["#7C3AED", "#06B6D4", "#FFFFFF"],
    recommended: true,
  },
  {
    id: "instagram-story",
    label: "Instagram Story",
    category: "social-media",
    description: "Vertical story visual optimized for mobile engagement.",
    imageType: "social-media",
    style: "Cinematic",
    aspectRatio: "9:16",
    mood: "Bold",
    deliverables: ["text-overlay", "branded"],
    previewColors: ["#0F172A", "#F59E0B", "#FFFFFF"],
    recommended: true,
  },
  {
    id: "facebook-ad",
    label: "Facebook Ad",
    category: "advertising",
    description: "Conversion-focused ad creative with CTA space.",
    imageType: "ad-creative",
    style: "Photorealistic",
    aspectRatio: "16:9",
    mood: "Professional",
    deliverables: ["cta-space", "branded"],
    previewColors: ["#2563EB", "#FFFFFF", "#0F172A"],
  },
  {
    id: "product-hero",
    label: "Product Hero",
    category: "product",
    description: "E-commerce hero product shot on clean background.",
    imageType: "product-photo",
    style: "Photorealistic",
    aspectRatio: "4:3",
    mood: "Professional",
    deliverables: ["white-bg", "high-res"],
    previewColors: ["#FFFFFF", "#E5E7EB", "#111827"],
    recommended: true,
  },
  {
    id: "linkedin-banner",
    label: "LinkedIn Banner",
    category: "business",
    description: "Professional business banner with text-safe zones.",
    imageType: "hero-banner",
    style: "Corporate",
    aspectRatio: "16:9",
    mood: "Professional",
    deliverables: ["wide-format", "text-space"],
    previewColors: ["#0F172A", "#3B82F6", "#F8FAFC"],
  },
  {
    id: "pitch-deck",
    label: "Pitch Deck Cover",
    category: "presentation",
    description: "Presentation cover visual with premium business aesthetic.",
    imageType: "presentation",
    style: "Minimalist",
    aspectRatio: "16:9",
    mood: "Luxurious",
    deliverables: ["clean", "wide-format"],
    previewColors: ["#1A1410", "#C9A227", "#F5F0E8"],
  },
];

export function listDesignTemplates(category?: DesignTemplateDefinition["category"]) {
  return DESIGN_STUDIO_TEMPLATES.filter((t) => !category || t.category === category);
}

export function getDesignTemplate(id: string) {
  return DESIGN_STUDIO_TEMPLATES.find((t) => t.id === id);
}

export function recommendDesignTemplates(input: {
  prompt: string;
  imageType?: string;
}): DesignTemplateDefinition[] {
  const text = `${input.prompt} ${input.imageType ?? ""}`.toLowerCase();
  return DESIGN_STUDIO_TEMPLATES.map((t) => {
    let score = t.recommended ? 2 : 0;
    if (input.imageType && t.imageType === input.imageType) score += 4;
    if (text.includes(t.category.replace("-", " "))) score += 2;
    if (text.includes(t.id.replace("-", " "))) score += 3;
    return { t, score };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((s) => s.t);
}
