/**
 * Component variant resolution — deterministic from spec + section context.
 */

import type { ComponentVariant, ComposerDensity, ComposerEmphasis } from "@/lib/tbge/composer/types";
import type { GenerationSpec } from "@/lib/tbge/spec/types";

const SECTION_TYPE_MAP: Record<string, string> = {
  hero: "hero",
  banner: "hero",
  games: "feature-grid",
  catalog: "feature-grid",
  features: "feature-grid",
  services: "feature-grid",
  story: "content-block",
  team: "team-grid",
  contact: "contact",
  cta: "cta",
  pricing: "pricing",
  testimonials: "testimonials",
  faq: "faq",
};

function normalizeSectionKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function resolveSectionComponentType(sectionName: string): string {
  const key = normalizeSectionKey(sectionName);
  return SECTION_TYPE_MAP[key] ?? "content-block";
}

export function resolveComponentVariant(input: {
  spec: GenerationSpec;
  sectionName: string;
  sectionIndex: number;
  patternDensity?: ComposerDensity;
}): ComponentVariant {
  const componentType = resolveSectionComponentType(input.sectionName);
  const density =
    input.patternDensity ??
    (input.spec.profile === "fast"
      ? "compact"
      : input.spec.profile === "ultra"
        ? "spacious"
        : "comfortable");

  const emphasis: ComposerEmphasis =
    input.sectionIndex === 0 ? "primary" : input.sectionIndex % 2 === 0 ? "secondary" : "neutral";

  return {
    id: `${componentType}-${density}-${emphasis}`,
    componentType,
    density,
    emphasis,
  };
}

export function slugifySectionId(sectionName: string, index: number): string {
  const slug = normalizeSectionKey(sectionName).replace(/[^a-z0-9-]/g, "");
  return `${slug || "section"}-${index}`;
}
