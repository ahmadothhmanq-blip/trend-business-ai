/**
 * Website Builder — AI generation action catalog (Phase 4).
 */

export type AiBuilderAction = {
  id: string;
  label: string;
  description: string;
  command: string;
  tier: "local" | "ai-continue";
  useStream?: boolean;
};

export const AI_BUILDER_ACTIONS: AiBuilderAction[] = [
  {
    id: "full-modernize",
    label: "Modernize design",
    description: "Refresh the overall visual style",
    command: "Make the design more modern",
    tier: "ai-continue",
    useStream: true,
  },
  {
    id: "page-about",
    label: "Add About page",
    description: "Generate a new About page",
    command: "Add an About page",
    tier: "local",
  },
  {
    id: "section-testimonials",
    label: "Add testimonials",
    description: "Insert a social proof section",
    command: "Add a testimonials section",
    tier: "ai-continue",
    useStream: true,
  },
  {
    id: "section-hero",
    label: "Regenerate hero",
    description: "Rewrite the hero for higher conversion",
    command: "Regenerate only the hero section",
    tier: "ai-continue",
    useStream: true,
  },
  {
    id: "content-home",
    label: "Rewrite homepage copy",
    description: "Improve homepage messaging",
    command: "Rewrite the homepage copy",
    tier: "ai-continue",
    useStream: true,
  },
  {
    id: "images-fresh",
    label: "Refresh images",
    description: "Replace images with new photography",
    command: "Replace all images with fresh photos",
    tier: "ai-continue",
    useStream: true,
  },
  {
    id: "seo-improve",
    label: "Improve SEO",
    description: "Apply SEO recommendations",
    command: "Improve SEO for this site",
    tier: "ai-continue",
    useStream: true,
  },
];

export function getAiBuilderAction(id: string): AiBuilderAction | undefined {
  return AI_BUILDER_ACTIONS.find((action) => action.id === id);
}
