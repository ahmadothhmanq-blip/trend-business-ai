import {
  THEME_COMPONENT_LIBRARIES,
  type ThemeComponentRole,
} from "@/lib/website/builder/theme-component-registry";
import type { DesignRendererComponentId } from "@/lib/ai-core/design-renderer/types";

type ThemeRendererSpec = {
  id: DesignRendererComponentId;
  exportName: string;
  path: string;
  pattern: string;
  description: string;
  defaultGoal: string;
};

function goalForRole(role: ThemeComponentRole): string {
  const goals: Record<ThemeComponentRole, string> = {
    nav: "Theme-exclusive navigation",
    hero: "Theme-exclusive hero",
    features: "Theme-exclusive features section",
    services: "Theme-exclusive services section",
    gallery: "Theme-exclusive gallery",
    story: "Theme-exclusive storytelling section",
    testimonials: "Theme-exclusive testimonials",
    pricing: "Theme-exclusive pricing",
    faq: "Theme-exclusive FAQ",
    cta: "Theme-exclusive CTA band",
    contact: "Theme-exclusive contact section",
    process: "Theme-exclusive process section",
    trust: "Theme-exclusive trust section",
    cases: "Theme-exclusive case studies",
    integrations: "Theme-exclusive integrations",
    blog: "Theme-exclusive magazine section",
    timeline: "Theme-exclusive timeline",
    portfolio: "Theme-exclusive portfolio masonry",
    footer: "Theme-exclusive footer",
    "floating-cta": "Theme-exclusive floating CTA",
  };
  return goals[role];
}

/** Renderer registry entries for theme-scoped components (isolated per theme). */
export const THEME_RENDERER_COMPONENTS: Record<string, ThemeRendererSpec> = Object.fromEntries(
  Object.values(THEME_COMPONENT_LIBRARIES).flatMap((lib) =>
    lib.map((c) => [
      c.id,
      {
        id: c.id,
        exportName: c.exportName,
        path: c.path,
        pattern: `theme-${c.themeId}-${c.role}`,
        description: `${c.themeId} theme · ${c.role} (exclusive)`,
        defaultGoal: goalForRole(c.role),
      } satisfies ThemeRendererSpec,
    ]),
  ),
);
