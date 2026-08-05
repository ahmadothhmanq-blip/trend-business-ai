import type { TbdpExperienceProfileDefinition } from "@/lib/design-platform/sector-dna/core/types";

/** Official TBDP experience personality profiles. */
export const TBDP_EXPERIENCE_PROFILE_CATALOG: TbdpExperienceProfileDefinition[] = [
  {
    id: "luxury",
    label: "Luxury",
    description: "Refined restraint, generous whitespace, slow elegant motion.",
    motionBias: ["section-reveal", "hero-media", "card-lift"],
    interactionBias: ["card-hover", "nav-item-hover"],
    typographyBias: "display-serif",
    spacingBias: "generous",
    colorBias: "warm",
  },
  {
    id: "executive",
    label: "Executive",
    description: "Authoritative, structured, confidence-building clarity.",
    motionBias: ["page-enter", "focus-ring", "modal-enter"],
    interactionBias: ["btn-focus", "table-row-hover", "nav-item-active"],
    typographyBias: "corporate-sans",
    spacingBias: "balanced",
    colorBias: "cool",
  },
  {
    id: "technical",
    label: "Technical",
    description: "Precise, data-forward, minimal decorative motion.",
    motionBias: ["focus-ring", "grid-stagger", "tooltip-fade"],
    interactionBias: ["form-focus", "table-sort", "btn-press"],
    typographyBias: "mono-accent",
    spacingBias: "compact",
    colorBias: "cool",
  },
  {
    id: "healthcare",
    label: "Healthcare",
    description: "Calm, accessible, trust-first with gentle feedback.",
    motionBias: ["section-reveal", "focus-ring", "success-pulse"],
    interactionBias: ["form-focus", "form-success", "btn-focus"],
    typographyBias: "readable-sans",
    spacingBias: "generous",
    colorBias: "clinical",
  },
  {
    id: "hospitality",
    label: "Hospitality",
    description: "Warm immersion, imagery-led, inviting interactions.",
    motionBias: ["hero-headline", "scroll-reveal-up", "card-lift"],
    interactionBias: ["card-hover", "product-hover", "cta-pulse"],
    typographyBias: "warm-serif",
    spacingBias: "generous",
    colorBias: "warm",
  },
  {
    id: "editorial",
    label: "Editorial",
    description: "Typography-driven narrative, asymmetric rhythm.",
    motionBias: ["stagger-children", "scroll-reveal-up", "section-reveal"],
    interactionBias: ["nav-item-hover", "tab-switch"],
    typographyBias: "editorial-display",
    spacingBias: "editorial",
    colorBias: "neutral",
  },
  {
    id: "creative",
    label: "Creative",
    description: "Bold kinetic energy, asymmetric layouts, expressive motion.",
    motionBias: ["hero-headline", "grid-stagger", "error-shake"],
    interactionBias: ["card-hover", "hero-enter", "feature-stagger"],
    typographyBias: "display-bold",
    spacingBias: "editorial",
    colorBias: "bold",
  },
  {
    id: "corporate",
    label: "Corporate",
    description: "Stable, professional, conversion-optimized structure.",
    motionBias: ["page-enter", "modal-enter", "toast-enter"],
    interactionBias: ["btn-hover", "form-saving", "dropdown-open"],
    typographyBias: "corporate-sans",
    spacingBias: "balanced",
    colorBias: "cool",
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Essential elements only, near-zero decorative motion.",
    motionBias: ["tooltip-fade", "focus-ring"],
    interactionBias: ["btn-focus", "form-focus"],
    typographyBias: "neutral-sans",
    spacingBias: "balanced",
    colorBias: "neutral",
  },
  {
    id: "playful",
    label: "Playful",
    description: "Energetic, bouncy micro-interactions, approachable tone.",
    motionBias: ["success-pulse", "hover-lift", "stagger-children"],
    interactionBias: ["btn-press", "card-tap", "cta-pulse"],
    typographyBias: "rounded-sans",
    spacingBias: "balanced",
    colorBias: "bold",
  },
];

export const TBDP_EXPERIENCE_PROFILE_COUNT = TBDP_EXPERIENCE_PROFILE_CATALOG.length;

export function getExperienceProfile(
  id: TbdpExperienceProfileDefinition["id"],
): TbdpExperienceProfileDefinition | undefined {
  return TBDP_EXPERIENCE_PROFILE_CATALOG.find((p) => p.id === id);
}
