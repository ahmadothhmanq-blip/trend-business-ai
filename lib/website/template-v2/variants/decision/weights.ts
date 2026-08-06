import type { VariantDecisionContext } from "@/lib/website/template-v2/variants/decision/types";

/** Relative importance of each decision factor (sums to 1.0). */
export const DECISION_WEIGHTS: Record<string, number> = {
  websiteGoal: 0.15,
  targetAudience: 0.12,
  industry: 0.1,
  imageAvailability: 0.1,
  visualStyle: 0.1,
  brandPersonality: 0.09,
  businessModel: 0.08,
  premiumLevel: 0.08,
  accessibilityLevel: 0.07,
  languageDirection: 0.06,
  businessSize: 0.05,
  contentDensity: 0.05,
  devicePriority: 0.05,
};

export const DIVERSITY_CONFIG = {
  /** Score gap (0–100 scale) within which diversity tie-breaking applies. */
  similarityThreshold: 4,
  /** Penalty applied when composition family already used. */
  compositionRepeatPenalty: 6,
  /** Penalty when visual weight band already saturated. */
  visualWeightRepeatPenalty: 3,
};

export const SCORE_BANDS = {
  excellent: 80,
  good: 65,
  acceptable: 50,
};

export const DECISION_ENGINE_VERSION = "1.0.0";

export function normalizeIndustry(industry?: string): string {
  return (industry ?? "general")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || "general";
}

export function resolveDecisionSections(
  context: VariantDecisionContext,
): import("@/lib/website/template-v2/variants/types").SectionKind[] {
  if (context.sections?.length) return context.sections;
  return [
    "hero",
    "features",
    "about",
    "services",
    "portfolio",
    "pricing",
    "testimonials",
    "cta",
    "contact",
    "footer",
  ];
}
