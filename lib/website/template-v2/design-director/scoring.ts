import {
  ALL_CATEGORIES,
  GRADE_THRESHOLDS,
  SCORE_WEIGHTS,
  SEVERITY_PENALTY,
} from "@/lib/website/template-v2/design-director/weights";
import type {
  DesignIssue,
  DesignQualityScore,
  DesignScoreBreakdown,
} from "@/lib/website/template-v2/design-director/types";
import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";

function scoreToGrade(score: number): DesignQualityScore["grade"] {
  if (score >= GRADE_THRESHOLDS.A) return "A";
  if (score >= GRADE_THRESHOLDS.B) return "B";
  if (score >= GRADE_THRESHOLDS.C) return "C";
  if (score >= GRADE_THRESHOLDS.D) return "D";
  return "F";
}

/**
 * Compute a weighted design quality score from blueprint state and detected issues.
 */
export function computeDesignScore(
  _blueprint: WebsiteBlueprint,
  issues: DesignIssue[],
): DesignQualityScore {
  const breakdown: DesignScoreBreakdown[] = [];
  let weightedTotal = 0;

  for (const category of ALL_CATEGORIES) {
    const weight = SCORE_WEIGHTS[category];
    const maxScore = 100;
    const categoryIssues = issues.filter((i) => i.category === category);

    let penalty = 0;
    for (const issue of categoryIssues) {
      penalty += SEVERITY_PENALTY[issue.severity] ?? 5;
    }
    penalty = Math.min(penalty, 90);

    const score = Math.max(10, maxScore - penalty);
    const weightedScore = Math.round(score * weight * 100) / 100;
    weightedTotal += weightedScore;

    breakdown.push({
      category,
      score,
      maxScore,
      weight,
      weightedScore,
      issueCount: categoryIssues.length,
    });
  }

  const overall = Math.round(weightedTotal);
  const clamped = Math.max(0, Math.min(100, overall));

  return {
    overall: clamped,
    grade: scoreToGrade(clamped),
    breakdown,
  };
}
