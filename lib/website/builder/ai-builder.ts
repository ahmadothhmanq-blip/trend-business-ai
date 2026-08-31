/**
 * Website Builder — AI generation action catalog (Phase 4).
 */

import type { WebsiteCapabilityId } from "@/lib/website/builder/capabilities/types";
import {
  filterItemsByCapabilities,
  type WebsiteCapabilityService,
} from "@/lib/website/builder/capabilities/service";

export type AiBuilderAction = {
  id: string;
  label: string;
  description: string;
  command: string;
  tier: "local" | "ai-continue";
  useStream?: boolean;
  alwaysVisible?: boolean;
  requiresAnyCapability?: WebsiteCapabilityId[];
};

export const AI_BUILDER_ACTIONS: AiBuilderAction[] = [
  {
    id: "full-modernize",
    label: "Modernize design",
    description: "Refresh the overall visual style",
    command: "Make the design more modern",
    tier: "ai-continue",
    useStream: true,
    alwaysVisible: true,
  },
  {
    id: "page-about",
    label: "Add About page",
    description: "Generate a new About page",
    command: "Add an About page",
    tier: "local",
    alwaysVisible: true,
  },
  {
    id: "section-testimonials",
    label: "Add testimonials",
    description: "Insert a social proof section",
    command: "Add a testimonials section",
    tier: "ai-continue",
    useStream: true,
    requiresAnyCapability: ["testimonials", "reviews"],
  },
  {
    id: "section-hero",
    label: "Regenerate hero",
    description: "Rewrite the hero for higher conversion",
    command: "Regenerate only the hero section",
    tier: "ai-continue",
    useStream: true,
    alwaysVisible: true,
  },
  {
    id: "content-home",
    label: "Rewrite homepage copy",
    description: "Improve homepage messaging",
    command: "Rewrite the homepage copy",
    tier: "ai-continue",
    useStream: true,
    alwaysVisible: true,
  },
  {
    id: "images-fresh",
    label: "Refresh images",
    description: "Replace images with new photography",
    command: "Replace all images with fresh photos",
    tier: "ai-continue",
    useStream: true,
    requiresAnyCapability: ["gallery", "portfolio", "products", "team"],
  },
  {
    id: "seo-improve",
    label: "Improve SEO",
    description: "Apply SEO recommendations",
    command: "Improve SEO for this site",
    tier: "ai-continue",
    useStream: true,
    requiresAnyCapability: ["seo"],
  },
];

export function getAiBuilderAction(id: string): AiBuilderAction | undefined {
  return AI_BUILDER_ACTIONS.find((action) => action.id === id);
}

export function listAiBuilderActionsForCapabilities(
  service: WebsiteCapabilityService,
): AiBuilderAction[] {
  return filterItemsByCapabilities(AI_BUILDER_ACTIONS, service);
}
