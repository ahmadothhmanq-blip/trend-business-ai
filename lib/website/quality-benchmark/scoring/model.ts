import { WQBS_CATEGORY_WEIGHTS } from "@/lib/website/quality-benchmark/constants";
import type {
  WqbsBenchmarkMode,
  WqbsCategory,
  WqbsCategoryEvaluation,
  WqbsCategoryScores,
} from "@/lib/website/quality-benchmark/types";
import { WQBS_MODE_CATEGORIES } from "@/lib/website/quality-benchmark/constants";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function categoryEvaluationsToScores(
  evaluations: WqbsCategoryEvaluation[],
): WqbsCategoryScores {
  const map = Object.fromEntries(
    evaluations.map((e) => [e.category, e.score]),
  ) as Record<WqbsCategory, number>;

  return {
    overall: 0,
    visualDesign: map.visualDesign ?? 0,
    userExperience: map.userExperience ?? 0,
    business: map.business ?? 0,
    seo: map.seo ?? 0,
    performance: map.performance ?? 0,
    accessibility: map.accessibility ?? 0,
    content: map.content ?? 0,
    localization: map.localization ?? 0,
  };
}

export function computeOverallScore(
  scores: WqbsCategoryScores,
  mode: WqbsBenchmarkMode,
): number {
  const activeCategories = WQBS_MODE_CATEGORIES[mode];
  let weighted = 0;
  let totalWeight = 0;

  for (const category of activeCategories) {
    const weight = WQBS_CATEGORY_WEIGHTS[category];
    const score = scores[category];
    weighted += score * weight;
    totalWeight += weight;
  }

  return totalWeight === 0 ? 0 : clamp(weighted / totalWeight);
}

export function finalizeScores(
  evaluations: WqbsCategoryEvaluation[],
  mode: WqbsBenchmarkMode,
): WqbsCategoryScores {
  const scores = categoryEvaluationsToScores(evaluations);
  scores.overall = computeOverallScore(scores, mode);
  return scores;
}

export function resolveGateStatus(
  overallScore: number,
  threshold: number,
): "pass" | "fail" | "review" {
  if (overallScore >= threshold) return "pass";
  if (overallScore >= threshold - 10) return "review";
  return "fail";
}

export function filterEvaluationsByMode(
  evaluations: WqbsCategoryEvaluation[],
  mode: WqbsBenchmarkMode,
): WqbsCategoryEvaluation[] {
  const allowed = new Set(WQBS_MODE_CATEGORIES[mode]);
  return evaluations.filter((e) => allowed.has(e.category));
}

export function collectStrengthsWeaknesses(
  evaluations: WqbsCategoryEvaluation[],
): { strengths: string[]; weaknesses: string[] } {
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  for (const cat of evaluations) {
    if (cat.score >= 80) {
      strengths.push(`${formatCategory(cat.category)}: strong (${cat.score}/100)`);
    } else if (cat.score < 65) {
      weaknesses.push(`${formatCategory(cat.category)}: needs improvement (${cat.score}/100)`);
    }

    for (const sub of cat.subDimensions) {
      if (sub.score >= 85 && sub.signals.length > 0) {
        strengths.push(`${sub.label}: ${sub.signals[0]}`);
      }
      if (sub.score < 60 && sub.issues.length > 0) {
        weaknesses.push(`${sub.label}: ${sub.issues[0]}`);
      }
    }
  }

  return {
    strengths: strengths.slice(0, 12),
    weaknesses: weaknesses.slice(0, 12),
  };
}

function formatCategory(category: WqbsCategory): string {
  const labels: Record<WqbsCategory, string> = {
    visualDesign: "Visual Design",
    userExperience: "User Experience",
    business: "Business",
    seo: "SEO",
    performance: "Performance",
    accessibility: "Accessibility",
    content: "Content",
    localization: "Localization",
  };
  return labels[category];
}
