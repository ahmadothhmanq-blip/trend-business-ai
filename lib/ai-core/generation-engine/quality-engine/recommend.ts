import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";
import type {
  AwqeDimensionEvaluation,
  AwqeImprovementReport,
  AwqeRecommendation,
} from "@/lib/ai-core/generation-engine/quality-engine/types";

export function generateRecommendations(
  plan: MasterPlan,
  dimensions: AwqeDimensionEvaluation[],
): AwqeRecommendation[] {
  const recommendations: AwqeRecommendation[] = [];
  let id = 0;

  for (const dim of dimensions) {
    for (const issue of dim.issues) {
      recommendations.push({
        id: `rec-${++id}`,
        dimension: dim.dimension,
        priority: dim.score < 60 ? "high" : dim.score < 75 ? "medium" : "low",
        message: issue,
        actionable: true,
      });
    }
  }

  if (!plan.sections.some((s) => s.type === "testimonials")) {
    recommendations.push({
      id: `rec-${++id}`,
      dimension: "trust",
      priority: "medium",
      message: "Add testimonials section for social proof",
      actionable: true,
    });
  }

  if (!plan.sections.some((s) => s.type === "faq") && plan.websiteType === "saas") {
    recommendations.push({
      id: `rec-${++id}`,
      dimension: "content",
      priority: "medium",
      message: "Add FAQ section to address objections",
      actionable: true,
    });
  }

  if (plan.ctaStrategy.placement.length < 2) {
    recommendations.push({
      id: `rec-${++id}`,
      dimension: "conversion",
      priority: "high",
      message: "Add secondary CTA placement below the fold",
      actionable: true,
    });
  }

  return recommendations;
}

export function buildImprovementReport(input: {
  evaluation: AwqeDimensionEvaluation[];
  recommendations: AwqeRecommendation[];
  appliedImprovements: string[];
}): AwqeImprovementReport {
  const strengths = input.evaluation
    .filter((d) => d.score >= 75)
    .flatMap((d) => d.signals.map((s) => `${d.dimension}: ${s}`));

  const weaknesses = input.evaluation
    .filter((d) => d.score < 70)
    .flatMap((d) => d.issues.length ? d.issues : [`${d.dimension} score ${d.score}`]);

  return {
    strengths: strengths.length ? strengths : ["Solid foundation from Master Plan"],
    weaknesses,
    recommendations: input.recommendations,
    appliedImprovements: input.appliedImprovements,
  };
}
