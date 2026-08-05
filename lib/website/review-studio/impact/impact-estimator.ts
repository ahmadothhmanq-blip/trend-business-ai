import type {
  ImpactEstimate,
  ReviewArea,
  ReviewIssue,
} from "@/lib/website/review-studio/types";
import type { WqbsBenchmarkReport } from "@/lib/website/quality-benchmark";

const AREA_IMPACT_PROFILE: Record<
  ReviewArea,
  Pick<ImpactEstimate, "qualityGain" | "seoGain" | "conversionGain" | "accessibilityGain" | "performanceImpact">
> = {
  hero: { qualityGain: 12, seoGain: 5, conversionGain: 15, accessibilityGain: 3, performanceImpact: 0 },
  navigation: { qualityGain: 10, seoGain: 4, conversionGain: 8, accessibilityGain: 8, performanceImpact: 1 },
  cta: { qualityGain: 8, seoGain: 2, conversionGain: 18, accessibilityGain: 2, performanceImpact: 0 },
  trust: { qualityGain: 7, seoGain: 2, conversionGain: 12, accessibilityGain: 1, performanceImpact: 0 },
  testimonials: { qualityGain: 6, seoGain: 3, conversionGain: 10, accessibilityGain: 1, performanceImpact: 0 },
  pricing: { qualityGain: 8, seoGain: 5, conversionGain: 14, accessibilityGain: 2, performanceImpact: 0 },
  forms: { qualityGain: 6, seoGain: 1, conversionGain: 16, accessibilityGain: 5, performanceImpact: 0 },
  footer: { qualityGain: 5, seoGain: 4, conversionGain: 3, accessibilityGain: 4, performanceImpact: 0 },
  seo: { qualityGain: 6, seoGain: 18, conversionGain: 4, accessibilityGain: 2, performanceImpact: 2 },
  content: { qualityGain: 10, seoGain: 12, conversionGain: 6, accessibilityGain: 3, performanceImpact: 1 },
  accessibility: { qualityGain: 8, seoGain: 4, conversionGain: 2, accessibilityGain: 20, performanceImpact: 0 },
  performance: { qualityGain: 5, seoGain: 6, conversionGain: 2, accessibilityGain: 1, performanceImpact: 15 },
  localization: { qualityGain: 6, seoGain: 5, conversionGain: 2, accessibilityGain: 6, performanceImpact: 0 },
};

const RISK_BY_PATCH: Record<"deterministic" | "targeted-regen", ImpactEstimate["estimatedRisk"]> = {
  deterministic: "low",
  "targeted-regen": "medium",
};

/**
 * Estimate impact for every improvement — quality, SEO, conversion, a11y, performance, risk, time.
 */
export function estimateImprovementImpact(
  area: ReviewArea,
  issues: ReviewIssue[],
  benchmark: WqbsBenchmarkReport,
): ImpactEstimate {
  const profile = AREA_IMPACT_PROFILE[area];
  const issueMultiplier = Math.min(1.5, 1 + issues.length * 0.1);
  const gapMultiplier = benchmark.scores.overall < 60 ? 1.2 : 1;

  const scale = (n: number) => Math.round(n * issueMultiplier * gapMultiplier);

  const criticalCount = issues.filter((i) => i.priority === "critical").length;
  const estimatedRisk: ImpactEstimate["estimatedRisk"] =
    criticalCount > 2 ? "medium" : RISK_BY_PATCH.deterministic;

  const baseMinutes: Record<ReviewArea, number> = {
    hero: 15,
    navigation: 10,
    cta: 8,
    trust: 10,
    testimonials: 12,
    pricing: 15,
    forms: 12,
    footer: 5,
    seo: 8,
    content: 20,
    accessibility: 10,
    performance: 12,
    localization: 5,
  };

  return {
    qualityGain: scale(profile.qualityGain),
    seoGain: scale(profile.seoGain),
    conversionGain: scale(profile.conversionGain),
    accessibilityGain: scale(profile.accessibilityGain),
    performanceImpact: scale(profile.performanceImpact),
    estimatedRisk,
    estimatedTimeMinutes: baseMinutes[area] + issues.length * 2,
  };
}
