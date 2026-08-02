import type {
  SemanticContentQualityReport,
  SemanticQualityDimension,
  SemanticQualityIssue,
  SemanticQualityScores,
} from "@/lib/ai-core/semantic-content-quality/types";

const WEIGHTS: Record<Exclude<SemanticQualityDimension, "overall">, number> = {
  genericCopy: 0.16,
  industryRelevance: 0.18,
  ctaQuality: 0.14,
  headingHierarchy: 0.12,
  semanticSeo: 0.14,
  crossPageConsistency: 0.12,
  localization: 0.14,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreDimension(
  issues: SemanticQualityIssue[],
  dimension: Exclude<SemanticQualityDimension, "overall">,
): number {
  const dimIssues = issues.filter((issue) => issue.dimension === dimension);
  if (!dimIssues.length) return 92;
  let score = 92;
  for (const issue of dimIssues) {
    score -= issue.severity === "error" ? 18 : 8;
  }
  return clamp(score);
}

export function computeSemanticQualityScores(
  issues: SemanticQualityIssue[],
  llmBoost?: { genericScore?: number; industryScore?: number },
): SemanticQualityScores {
  const scores: SemanticQualityScores = {
    genericCopy: scoreDimension(issues, "genericCopy"),
    industryRelevance: scoreDimension(issues, "industryRelevance"),
    ctaQuality: scoreDimension(issues, "ctaQuality"),
    headingHierarchy: scoreDimension(issues, "headingHierarchy"),
    semanticSeo: scoreDimension(issues, "semanticSeo"),
    crossPageConsistency: scoreDimension(issues, "crossPageConsistency"),
    localization: scoreDimension(issues, "localization"),
    overall: 0,
  };

  if (typeof llmBoost?.genericScore === "number") {
    scores.genericCopy = clamp(
      scores.genericCopy * 0.7 + llmBoost.genericScore * 0.3,
    );
  }
  if (typeof llmBoost?.industryScore === "number") {
    scores.industryRelevance = clamp(
      scores.industryRelevance * 0.7 + llmBoost.industryScore * 0.3,
    );
  }

  scores.overall = clamp(
    scores.genericCopy * WEIGHTS.genericCopy +
      scores.industryRelevance * WEIGHTS.industryRelevance +
      scores.ctaQuality * WEIGHTS.ctaQuality +
      scores.headingHierarchy * WEIGHTS.headingHierarchy +
      scores.semanticSeo * WEIGHTS.semanticSeo +
      scores.crossPageConsistency * WEIGHTS.crossPageConsistency +
      scores.localization * WEIGHTS.localization,
  );

  return scores;
}

export function buildSemanticQualitySummary(
  report: Pick<SemanticContentQualityReport, "scores" | "issues">,
): string {
  const errorCount = report.issues.filter((i) => i.severity === "error").length;
  const warningCount = report.issues.filter((i) => i.severity === "warning").length;
  return `Semantic content quality ${report.scores.overall}/100 — ${errorCount} critical, ${warningCount} warnings.`;
}
