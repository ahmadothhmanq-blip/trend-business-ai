/**
 * Phase 2 — Advanced Template Architecture.
 * Every template exposes a full control surface (header → footer + mobile).
 */

import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence";
import type { TemplateControlSurface } from "@/lib/ai-core/website-design-platform/types";

export function buildControlSurfaceForTemplate(
  template: TemplateIntelligenceDefinition,
): TemplateControlSurface {
  const comps = template.components.map(String);
  const hasTransparent = comps.some((c) =>
    /Transparent|Cinematic|Luxury/i.test(c),
  );
  const hero =
    comps.find((c) => /Hero/i.test(c)) || "HeroSplit";
  const footer =
    comps.find((c) => /Footer/i.test(c)) || "SiteFooter";
  const header =
    comps.find((c) => /Header|Nav/i.test(c)) || "SiteHeader";

  return {
    header: hasTransparent
      ? `${header} · transparent over media`
      : `${header} · solid bar`,
    navigation: `${header} primary links + CTA`,
    heroLayout: `${hero} · ${template.layoutStructure}`,
    sectionsStructure: comps.filter(
      (c) => !/Header|Nav|Footer|Hero/i.test(c),
    ),
    cardsStyle:
      template.category === "Minimal"
        ? "Borderless editorial cards"
        : template.category === "Luxury"
          ? "Soft-shadow museum cards"
          : "Structured feature cards",
    buttons:
      template.category === "Luxury"
        ? "Ghost + gold primary"
        : template.category === "Technology" || template.category === "SaaS"
          ? "Solid primary + outline secondary"
          : "Filled primary CTA",
    typography: `${template.typography.display} / ${template.typography.body}`,
    colors: `${template.colors.primary} · ${template.colors.accent} on ${template.colors.background}`,
    spacing:
      template.designPreset === "luxury" || template.designPreset === "minimal"
        ? "Museum vertical rhythm"
        : "Compact SaaS rhythm",
    animations: `${template.animations.label} (${template.animations.id})`,
    footer: `${footer} · multi-column + legal`,
    mobileResponsive:
      "Fluid type · stacked sections · sticky mobile CTA · 44px targets",
  };
}
