import type {
  Tbge2BusinessAnalysis,
  Tbge2ContentBlockPlan,
  Tbge2ContentPlan,
  Tbge2RequirementsAnalysis,
  Tbge2SectionPlan,
} from "@/lib/ai-core/generation-engine/core/types";

const TONE_BY_STYLE: Record<string, string> = {
  modern: "Clear, confident, and approachable",
  luxury: "Refined, aspirational, and exclusive",
  bold: "Energetic, direct, and memorable",
  professional: "Authoritative, trustworthy, and precise",
  playful: "Warm, conversational, and engaging",
  editorial: "Narrative-driven, thoughtful, and polished",
};

const SECTION_BLOCK_MAP: Record<string, Array<{ blockType: Tbge2ContentBlockPlan["blockType"]; length: Tbge2ContentBlockPlan["targetLength"] }>> = {
  hero: [
    { blockType: "headline", length: "short" },
    { blockType: "subheadline", length: "medium" },
    { blockType: "cta", length: "short" },
  ],
  features: [
    { blockType: "headline", length: "short" },
    { blockType: "list", length: "medium" },
  ],
  services: [
    { blockType: "headline", length: "short" },
    { blockType: "body", length: "medium" },
    { blockType: "list", length: "long" },
  ],
  testimonials: [
    { blockType: "headline", length: "short" },
    { blockType: "quote", length: "medium" },
  ],
  pricing: [
    { blockType: "headline", length: "short" },
    { blockType: "list", length: "medium" },
    { blockType: "cta", length: "short" },
  ],
  faq: [
    { blockType: "headline", length: "short" },
    { blockType: "list", length: "long" },
  ],
  contact: [
    { blockType: "headline", length: "short" },
    { blockType: "body", length: "short" },
  ],
  cta: [
    { blockType: "headline", length: "short" },
    { blockType: "cta", length: "short" },
  ],
  about: [
    { blockType: "headline", length: "short" },
    { blockType: "body", length: "long" },
  ],
};

const DEFAULT_BLOCKS = [
  { blockType: "headline" as const, length: "short" as const },
  { blockType: "body" as const, length: "medium" as const },
];

/**
 * Content Planner — defines content blocks, tone, length, SEO, localization.
 */
export function planContent(
  sections: Tbge2SectionPlan[],
  business: Tbge2BusinessAnalysis,
  requirements: Tbge2RequirementsAnalysis,
): Tbge2ContentPlan {
  const tone = TONE_BY_STYLE[business.brandStyle] ?? TONE_BY_STYLE.modern!;
  const blocks: Tbge2ContentBlockPlan[] = [];

  for (const section of sections) {
    const blockDefs = SECTION_BLOCK_MAP[section.type] ?? DEFAULT_BLOCKS;
    for (const def of blockDefs) {
      blocks.push({
        id: `block-${section.id}-${def.blockType}`,
        sectionId: section.id,
        blockType: def.blockType,
        tone,
        targetLength: def.length,
        seoPriority: section.type === "hero" ? "high" : section.required ? "medium" : "low",
      });
    }
  }

  const localizationStrategy = requirements.required.includes("multi-language")
    ? "multi"
    : business.language.toLowerCase() !== "english"
      ? "rtl-aware"
      : "single";

  return {
    tone,
    voice: `${business.brandStyle} · ${business.industry}`,
    blocks,
    localizationStrategy,
    seoPriority: requirements.required.includes("seo") ? "high" : "medium",
  };
}
