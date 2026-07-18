import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { CoreAssetPlanItem } from "@/lib/ai-core/assets/types";

/**
 * Plan shared assets from Strategy + Design System.
 * Covers hero, product, background, brand, and realistic imagery.
 */
export function planCoreAssets(params: {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  maxItems?: number;
}): CoreAssetPlanItem[] {
  const { strategy, designSystem, profile } = params;
  const maxItems = params.maxItems ?? 5;
  const project = profile?.projectName || "Brand";
  const industry = profile?.industry || designSystem.industryPattern;
  const offer = profile?.offer || strategy.positioning;
  const style = designSystem.style;

  const planned: CoreAssetPlanItem[] = [
    {
      id: "hero",
      kind: "hero",
      role: "hero",
      name: "Hero image",
      prompt: `Photorealistic website hero image for ${industry}: ${offer}. Style: ${style}. Cinematic lighting, no text, no logos.`,
      alt: `${project} hero`,
      realistic: true,
    },
    {
      id: "product",
      kind: "product",
      role: "product",
      name: "Product visual",
      prompt: `Photorealistic product or service visual for ${offer}, ${style}, clean composition, no text.`,
      alt: `${project} product`,
      realistic: true,
    },
    {
      id: "background",
      kind: "background",
      role: "background",
      name: "Background atmosphere",
      prompt: `Abstract atmospheric background for ${industry} brand, colors near ${designSystem.colors.primary} and ${designSystem.colors.secondary}, no text.`,
      alt: "Background",
      realistic: true,
    },
    {
      id: "brand",
      kind: "brand",
      role: "brand",
      name: "Brand mood",
      prompt: `Brand mood board style photograph for ${project}, ${style}, premium, no text overlays.`,
      alt: `${project} brand mood`,
      realistic: true,
    },
  ];

  const section = strategy.sectionPlan[0] || strategy.pages[0];
  if (section) {
    const name = section.name;
    planned.push({
      id: "section-1",
      kind: "realistic",
      role: "section",
      name: `${name} visual`,
      prompt: `Supporting photorealistic image for section "${name}" in ${industry}, ${style}, no text.`,
      alt: name,
      realistic: true,
    });
  }

  return planned.slice(0, maxItems);
}
