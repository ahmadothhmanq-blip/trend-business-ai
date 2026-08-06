import type { VariantDecisionProfile } from "@/lib/website/template-v2/variants/decision/types";
import { DIVERSITY_CONFIG } from "@/lib/website/template-v2/variants/decision/weights";
import type { VariantComposition } from "@/lib/website/template-v2/variants/types";

export type DiversityState = {
  compositions: Set<VariantComposition>;
  visualWeightBands: Set<"low" | "medium" | "high">;
  tags: Set<string>;
};

export function createDiversityState(): DiversityState {
  return {
    compositions: new Set(),
    visualWeightBands: new Set(),
    tags: new Set(),
  };
}

function visualWeightBand(weight: number): "low" | "medium" | "high" {
  if (weight < 0.4) return "low";
  if (weight < 0.7) return "medium";
  return "high";
}

/**
 * Penalize variants that repeat composition families or visual weight bands
 * already selected in prior sections.
 */
export function computeDiversityPenalty(
  profile: VariantDecisionProfile,
  state: DiversityState,
): number {
  let penalty = 0;

  if (state.compositions.has(profile.composition)) {
    penalty += DIVERSITY_CONFIG.compositionRepeatPenalty;
  }

  const band = visualWeightBand(profile.traits.visualWeight);
  if (state.visualWeightBands.has(band)) {
    penalty += DIVERSITY_CONFIG.visualWeightRepeatPenalty;
  }

  for (const tag of profile.tags) {
    if (state.tags.has(tag)) {
      penalty += 1;
    }
  }

  return penalty;
}

export function recordSelection(state: DiversityState, profile: VariantDecisionProfile): void {
  state.compositions.add(profile.composition);
  state.visualWeightBands.add(visualWeightBand(profile.traits.visualWeight));
  for (const tag of profile.tags) {
    state.tags.add(tag);
  }
}

/**
 * When top candidates are within similarityThreshold, prefer higher diversity (lower penalty).
 */
export function applyDiversityTieBreak<T extends { finalScore: number; diversityPenalty: number }>(
  candidates: T[],
): T {
  if (candidates.length === 0) {
    throw new Error("No candidates for diversity tie-break");
  }

  const sorted = [...candidates].sort((a, b) => b.finalScore - a.finalScore);
  const top = sorted[0]!;
  const threshold = DIVERSITY_CONFIG.similarityThreshold;

  const cluster = sorted.filter((c) => top.finalScore - c.finalScore <= threshold);
  if (cluster.length <= 1) return top;

  return [...cluster].sort((a, b) => {
    if (a.diversityPenalty !== b.diversityPenalty) {
      return a.diversityPenalty - b.diversityPenalty;
    }
    return b.finalScore - a.finalScore;
  })[0]!;
}

/** Deterministic hash for stable tie-breaking when scores are identical. */
export function seededTieBreak(seed: string, variantId: string): number {
  let hash = 0;
  const input = `${seed}:${variantId}`;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash / 0xffffffff;
}
