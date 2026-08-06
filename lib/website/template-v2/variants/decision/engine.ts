import { checkVariantCompatibility } from "@/lib/website/template-v2/variants/decision/compatibility";
import {
  applyDiversityTieBreak,
  computeDiversityPenalty,
  createDiversityState,
  recordSelection,
  seededTieBreak,
} from "@/lib/website/template-v2/variants/decision/diversity";
import { getVariantDecisionProfile } from "@/lib/website/template-v2/variants/decision/profiles";
import { scoreVariant, topScoringFactors } from "@/lib/website/template-v2/variants/decision/rules";
import type {
  ScoredVariant,
  VariantDecisionContext,
  VariantDecisionPlan,
  VariantSelection,
} from "@/lib/website/template-v2/variants/decision/types";
import {
  DECISION_ENGINE_VERSION,
  resolveDecisionSections,
} from "@/lib/website/template-v2/variants/decision/weights";
import { getDefaultVariantId, listSectionVariants } from "@/lib/website/template-v2/variants/registry";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

const SECTION_PRIORITY: SectionKind[] = [
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

function sortSections(sections: SectionKind[]): SectionKind[] {
  return [...sections].sort(
    (a, b) => SECTION_PRIORITY.indexOf(a) - SECTION_PRIORITY.indexOf(b),
  );
}

function scoreSectionVariants(
  sectionKind: SectionKind,
  context: VariantDecisionContext,
  diversityState: ReturnType<typeof createDiversityState>,
): ScoredVariant[] {
  const variants = listSectionVariants(sectionKind);
  const scored: ScoredVariant[] = [];

  for (const variant of variants) {
    const profile = getVariantDecisionProfile(sectionKind, variant.id);
    if (!profile) continue;

    const compatibility = checkVariantCompatibility(profile, context);
    const scoreResult = scoreVariant(sectionKind, variant.id, context);
    if (!scoreResult) continue;

    const diversityPenalty = compatibility.compatible
      ? computeDiversityPenalty(profile, diversityState)
      : 0;

    let finalScore = scoreResult.totalScore - diversityPenalty;
    if (!compatibility.compatible) {
      finalScore = 0;
    }

    if (context.seed) {
      finalScore += seededTieBreak(context.seed, variant.id) * 0.01;
    }

    scored.push({
      sectionKind,
      variantId: variant.id,
      totalScore: scoreResult.totalScore,
      compatible: compatibility.compatible,
      incompatibilityReasons: compatibility.reasons,
      breakdown: scoreResult.breakdown,
      diversityPenalty,
      finalScore: Math.round(finalScore * 100) / 100,
    });
  }

  return scored.sort((a, b) => b.finalScore - a.finalScore);
}

function selectBestVariant(
  scored: ScoredVariant[],
  sectionKind: SectionKind,
  context: VariantDecisionContext,
): VariantSelection {
  const compatible = scored.filter((s) => s.compatible);
  if (compatible.length === 0) {
    const fallbackId = getDefaultVariantId(sectionKind);
    const profile = getVariantDecisionProfile(sectionKind, fallbackId);
    return {
      sectionKind,
      variantId: fallbackId,
      score: 0,
      composition: profile?.composition ?? "centered",
      reasons: ["No compatible variants — fell back to section default"],
      breakdown: [],
    };
  }

  const winner = applyDiversityTieBreak(compatible);
  const profile = getVariantDecisionProfile(sectionKind, winner.variantId)!;
  const runnerUp = compatible.find((c) => c.variantId !== winner.variantId);

  return {
    sectionKind,
    variantId: winner.variantId,
    score: winner.finalScore,
    composition: profile.composition,
    runnerUp: runnerUp
      ? { variantId: runnerUp.variantId, score: runnerUp.finalScore }
      : undefined,
    reasons: [
      ...topScoringFactors(winner.breakdown),
      ...(winner.diversityPenalty > 0
        ? [`Diversity penalty: -${winner.diversityPenalty}`]
        : ["No diversity penalty"]),
    ],
    breakdown: winner.breakdown,
  };
}

/**
 * Decide optimal section variants for all requested sections using weighted scoring,
 * compatibility filtering, and cross-section diversity.
 */
export function decideVariantPlan(
  context: VariantDecisionContext,
): VariantDecisionPlan {
  const sections = sortSections(resolveDecisionSections(context));
  const diversityState = createDiversityState();
  let diversityApplied = false;

  const selections: Partial<Record<SectionKind, VariantSelection>> = {};
  const scoredMap: Partial<Record<SectionKind, ScoredVariant[]>> = {};

  for (const sectionKind of sections) {
    const scored = scoreSectionVariants(sectionKind, context, diversityState);
    scoredMap[sectionKind] = scored;

    const selection = selectBestVariant(scored, sectionKind, context);
    selections[sectionKind] = selection;

    const profile = getVariantDecisionProfile(sectionKind, selection.variantId);
    if (profile) {
      const penalty = computeDiversityPenalty(profile, diversityState);
      if (penalty > 0) diversityApplied = true;
      recordSelection(diversityState, profile);
    }
  }

  return {
    selections,
    scored: scoredMap,
    diversityApplied,
    context,
    engineVersion: DECISION_ENGINE_VERSION,
  };
}

/**
 * Decide a single section variant (no cross-section diversity state).
 */
export function decideSectionVariant(
  sectionKind: SectionKind,
  context: VariantDecisionContext,
): VariantSelection {
  const scored = scoreSectionVariants(sectionKind, context, createDiversityState());
  return selectBestVariant(scored, sectionKind, context);
}
