/**
 * Social post templates catalog.
 */

import type { SocialPostPlatform, SocialTemplateCategory, SocialTemplateVariable } from "@/types/social-media";

export type SocialTemplate = {
  id: string;
  name: string;
  category: SocialTemplateCategory;
  platform: SocialPostPlatform;
  description: string;
  structure: string;
  variables: SocialTemplateVariable[];
  preview: string;
};

export const SOCIAL_TEMPLATES: SocialTemplate[] = [
  {
    id: "product-launch-ig",
    name: "Product Launch",
    category: "Product promotion",
    platform: "instagram",
    description: "Announce a new product with hook and CTA",
    structure: "Launch post for {{product}}. Key benefit: {{benefit}}. Tone: {{tone}}. Include hook, benefits, and CTA.",
    variables: [
      { key: "product", label: "Product" },
      { key: "benefit", label: "Key Benefit" },
      { key: "tone", label: "Tone", default: "Marketing" },
    ],
    preview: "Eye-catching launch caption with product benefits and shop CTA.",
  },
  {
    id: "sale-fb",
    name: "Flash Sale",
    category: "Sales campaign",
    platform: "facebook",
    description: "Limited-time sale announcement",
    structure: "Flash sale for {{offer}}. Discount: {{discount}}. Urgency: {{deadline}}. Tone: {{tone}}.",
    variables: [
      { key: "offer", label: "Offer" },
      { key: "discount", label: "Discount" },
      { key: "deadline", label: "Deadline" },
      { key: "tone", label: "Tone", default: "Marketing" },
    ],
    preview: "Urgency-driven sale post with clear CTA.",
  },
  {
    id: "brand-story-li",
    name: "Brand Story",
    category: "Brand awareness",
    platform: "linkedin",
    description: "Thought leadership brand narrative",
    structure: "Brand story for {{brand}} about {{theme}}. Audience: {{audience}}. Tone: {{tone}}.",
    variables: [
      { key: "brand", label: "Brand" },
      { key: "theme", label: "Theme" },
      { key: "audience", label: "Audience" },
      { key: "tone", label: "Tone", default: "Professional" },
    ],
    preview: "Professional brand narrative for LinkedIn authority.",
  },
  {
    id: "edu-tip-x",
    name: "Quick Tip",
    category: "Educational posts",
    platform: "x",
    description: "Short educational tip thread opener",
    structure: "Educational tip about {{topic}} for {{audience}}. Tone: {{tone}}. Keep punchy.",
    variables: [
      { key: "topic", label: "Topic" },
      { key: "audience", label: "Audience" },
      { key: "tone", label: "Tone", default: "Friendly" },
    ],
    preview: "Concise tip formatted for X engagement.",
  },
  {
    id: "restaurant-special",
    name: "Daily Special",
    category: "Restaurant",
    platform: "instagram",
    description: "Restaurant daily special promo",
    structure: "Today's special: {{dish}} at {{restaurant}}. Price: {{price}}. Tone: {{tone}}.",
    variables: [
      { key: "dish", label: "Dish" },
      { key: "restaurant", label: "Restaurant" },
      { key: "price", label: "Price" },
      { key: "tone", label: "Tone", default: "Casual" },
    ],
    preview: "Mouth-watering special with reservation CTA.",
  },
  {
    id: "ecom-drop",
    name: "New Collection Drop",
    category: "E-commerce",
    platform: "instagram",
    description: "E-commerce collection launch",
    structure: "New collection drop: {{collection}} from {{brand}}. Highlight: {{highlight}}. Tone: {{tone}}.",
    variables: [
      { key: "collection", label: "Collection" },
      { key: "brand", label: "Brand" },
      { key: "highlight", label: "Highlight" },
      { key: "tone", label: "Tone", default: "Luxury" },
    ],
    preview: "Premium drop announcement with shop link CTA.",
  },
  {
    id: "realestate-listing",
    name: "Property Listing",
    category: "Real estate",
    platform: "facebook",
    description: "Property listing highlight",
    structure: "Property listing: {{property}} in {{location}}. Features: {{features}}. Tone: {{tone}}.",
    variables: [
      { key: "property", label: "Property" },
      { key: "location", label: "Location" },
      { key: "features", label: "Key Features" },
      { key: "tone", label: "Tone", default: "Professional" },
    ],
    preview: "Listing highlight with inquiry CTA.",
  },
  {
    id: "personal-brand-li",
    name: "Founder Insight",
    category: "Personal brand",
    platform: "linkedin",
    description: "Personal brand thought leadership",
    structure: "Founder insight from {{name}} about {{insight}}. Lesson: {{lesson}}. Tone: {{tone}}.",
    variables: [
      { key: "name", label: "Your Name" },
      { key: "insight", label: "Insight Topic" },
      { key: "lesson", label: "Key Lesson" },
      { key: "tone", label: "Tone", default: "Professional" },
    ],
    preview: "Authentic founder post for personal brand growth.",
  },
];

export function applyTemplateVariables(
  structure: string,
  values: Record<string, string>,
  variables: SocialTemplateVariable[] = [],
): string {
  let result = structure;
  for (const v of variables) {
    result = result.replaceAll(`{{${v.key}}}`, values[v.key]?.trim() || v.default || "");
  }
  return result.replace(/\{\{[^}]+\}\}/g, "").trim();
}

export function getSocialTemplate(id: string) {
  return SOCIAL_TEMPLATES.find((t) => t.id === id);
}

export function listTemplatesByCategory(category?: string) {
  if (!category) return SOCIAL_TEMPLATES;
  return SOCIAL_TEMPLATES.filter((t) => t.category === category);
}
