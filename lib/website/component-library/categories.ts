import type { WbComponentCategory } from "@/lib/website/component-library/types";

export type WbComponentCategoryDefinition = {
  id: WbComponentCategory;
  label: string;
  description: string;
};

/**
 * Capability-oriented categories — what a component DOES, not which industry it serves.
 */
export const WB_COMPONENT_CATEGORY_DEFINITIONS: WbComponentCategoryDefinition[] = [
  {
    id: "navigation",
    label: "Navigation",
    description: "Menus, links, breadcrumbs, and wayfinding chrome.",
  },
  {
    id: "content",
    label: "Content",
    description: "Headings, text, lists, quotes, and readable content primitives.",
  },
  {
    id: "media",
    label: "Media",
    description: "Images, video, galleries, and visual media primitives.",
  },
  {
    id: "marketing",
    label: "Marketing",
    description: "Composable marketing stacks such as hero, CTA, and feature areas.",
  },
  {
    id: "commerce",
    label: "Commerce",
    description: "Pricing, product cards, and transactional UI patterns.",
  },
  {
    id: "forms",
    label: "Forms",
    description: "Inputs, buttons, and form layout primitives.",
  },
  {
    id: "social",
    label: "Social",
    description: "Social links, share bars, and community-oriented UI.",
  },
  {
    id: "interactive",
    label: "Interactive",
    description: "Accordions, tabs, modals, carousels, and interactive patterns.",
  },
  {
    id: "layout",
    label: "Layout",
    description: "Grids, stacks, containers, dividers, and structural layout primitives.",
  },
  {
    id: "utility",
    label: "Utility",
    description: "Spacers, dividers, and low-level structural helpers.",
  },
  {
    id: "custom",
    label: "Custom",
    description: "Extension components outside the core catalog.",
  },
];

export function getComponentCategoryDefinition(
  category: WbComponentCategory,
): WbComponentCategoryDefinition {
  const found = WB_COMPONENT_CATEGORY_DEFINITIONS.find((item) => item.id === category);
  if (!found) {
    throw new Error(`Unknown component category: ${category}`);
  }
  return found;
}

export function listComponentCategories(): WbComponentCategoryDefinition[] {
  return [...WB_COMPONENT_CATEGORY_DEFINITIONS];
}
