/**
 * Unified Final Website Scores — Design, UX, SEO, Conversion, Performance, Overall.
 */

import type { DesignCriticReport } from "@/lib/ai-core/design-critic/types";
import type { ConversionOptimizationReport } from "@/lib/ai-core/conversion/types";
import type { SeoPerformanceReport } from "@/lib/ai-core/seo-performance/types";
import type { WebsiteOptimizationReport } from "@/lib/ai-core/optimizer/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type {
  FinalQualityAuditorReport,
  FinalSeoReviewReport,
  FinalWebsiteScores,
} from "@/lib/ai-core/final-quality/types";

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function computeFinalWebsiteScores(params: {
  auditor: FinalQualityAuditorReport;
  seoReview: FinalSeoReviewReport;
  designCritic?: DesignCriticReport | null;
  conversion?: ConversionOptimizationReport | null;
  seoPerformance?: SeoPerformanceReport | null;
  optimization?: WebsiteOptimizationReport | null;
  performanceReport?: CorePerformanceReport | null;
}): FinalWebsiteScores {
  const design = clamp(
    (params.designCritic?.score ?? params.auditor.dimensions.visual) * 0.4 +
      params.auditor.dimensions.layout * 0.25 +
      params.auditor.dimensions.typography * 0.2 +
      params.auditor.dimensions.spacing * 0.15 +
      (params.optimization?.scores.design
        ? (params.optimization.scores.design - 70) * 0.05
        : 0),
  );

  const ux = clamp(
    params.auditor.dimensions.mobile * 0.35 +
      params.auditor.dimensions.journey * 0.35 +
      (params.optimization?.scores.ux ?? 78) * 0.3,
  );

  const seo = clamp(
    params.seoReview.score * 0.55 +
      (params.seoPerformance?.scores.seo ?? params.seoReview.score) * 0.45,
  );

  const conversion = clamp(
    params.conversion?.score ??
      (params.optimization?.audit.conversionReady ? 78 : 62),
  );

  const performance = clamp(
    params.seoPerformance?.scores.performance ??
      params.performanceReport?.score ??
      params.optimization?.scores.performance ??
      72,
  );

  const overall = clamp(
    design * 0.22 +
      ux * 0.2 +
      seo * 0.2 +
      conversion * 0.22 +
      performance * 0.16,
  );

  return { design, ux, seo, conversion, performance, overall };
}

/** Publish readiness thresholds for Final Quality Intelligence. */
export function isFinalPublishReady(params: {
  scores: FinalWebsiteScores;
  hasCriticalFindings: boolean;
  designReady?: boolean;
  conversionReady?: boolean;
  seoReady?: boolean;
}): boolean {
  if (params.hasCriticalFindings) return false;
  if (params.designReady === false) return false;
  if (params.conversionReady === false) return false;
  if (params.seoReady === false) return false;
  return (
    params.scores.overall >= 65 &&
    params.scores.design >= 55 &&
    params.scores.ux >= 55 &&
    params.scores.seo >= 50 &&
    params.scores.conversion >= 55 &&
    params.scores.performance >= 50
  );
}
