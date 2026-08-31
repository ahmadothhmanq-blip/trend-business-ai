import type { BuilderToolDefinition } from "@/lib/website/builder/tools/types";

/**
 * Tool registry — maps website capabilities to builder toolbar tools.
 * Append new tools here; the resolver picks them up automatically.
 */
export const BUILDER_TOOL_REGISTRY: BuilderToolDefinition[] = [
  {
    id: "structure",
    labelKey: "structure",
    icon: "Layers",
    tier: "core",
    order: 10,
    visibility: { mode: "always" },
  },
  {
    id: "design",
    labelKey: "design",
    icon: "Palette",
    tier: "core",
    order: 20,
    visibility: { mode: "always" },
  },
  {
    id: "blocks",
    labelKey: "blocks",
    icon: "Blocks",
    tier: "core",
    order: 30,
    visibility: { mode: "always" },
  },
  {
    id: "media",
    labelKey: "media",
    icon: "ImageIcon",
    tier: "standard",
    order: 40,
    visibility: {
      mode: "any",
      capabilities: ["gallery", "portfolio", "products", "team"],
    },
  },
  {
    id: "ai",
    labelKey: "ai",
    icon: "Wand2",
    tier: "core",
    order: 50,
    visibility: { mode: "always" },
  },
  {
    id: "professional",
    labelKey: "professional",
    icon: "Sparkles",
    tier: "standard",
    order: 60,
    visibility: {
      mode: "any",
      capabilities: [
        "testimonials",
        "faq",
        "pricing",
        "portfolio",
        "reviews",
        "team",
      ],
    },
  },
  {
    id: "business",
    labelKey: "business",
    icon: "Briefcase",
    tier: "standard",
    order: 70,
    visibility: {
      mode: "any",
      capabilities: [
        "products",
        "booking",
        "appointments",
        "orders",
        "inventory",
        "payments",
        "blog",
        "forms",
        "newsletter",
        "chat",
      ],
    },
  },
  {
    id: "publish",
    labelKey: "publish",
    icon: "Rocket",
    tier: "core",
    order: 80,
    visibility: { mode: "always" },
  },
  {
    id: "enterprise",
    labelKey: "enterprise",
    icon: "Shield",
    tier: "advanced",
    order: 90,
    visibility: {
      mode: "any",
      capabilities: [
        "authentication",
        "dashboard",
        "analytics",
        "multi-language",
        "search",
        "seo",
      ],
    },
  },
];

export function getBuilderToolRegistry(): BuilderToolDefinition[] {
  return BUILDER_TOOL_REGISTRY;
}
