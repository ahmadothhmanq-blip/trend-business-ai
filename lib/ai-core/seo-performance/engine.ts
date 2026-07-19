import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import { analyzeSeoPerformance } from "@/lib/ai-core/seo-performance/analyze";
import type { SeoPerformanceReport } from "@/lib/ai-core/seo-performance/types";
import type {
  AuditCategory,
  WebsiteAuditIssue,
  WebsiteOptimizationReport,
} from "@/lib/ai-core/optimizer/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { SeoPerformanceRecommendationArea } from "@/lib/ai-core/seo-performance/types";

function areaToAuditCategory(
  area: SeoPerformanceRecommendationArea,
): AuditCategory {
  if (area === "mobile") return "mobile";
  if (
    area === "images" ||
    area === "lazy-loading" ||
    area === "core-web-vitals"
  ) {
    return "performance";
  }
  return "seo";
}

export type RunSeoPerformanceParams = {
  files: GeneratedProjectFile[];
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string | null;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  assetManifest?: CoreAssetManifest;
  premiumSeoTopics?: string[];
  premiumKeywords?: string[];
  conversionScore?: number | null;
  onProgress?: (message: string) => void;
};

/**
 * AI SEO + Performance Engine — technical SEO, headings, keywords, CWV/mobile.
 * Advisory/report-first; does not rewrite the invent/generation loop.
 */
export function runSeoPerformanceEngine(
  params: RunSeoPerformanceParams,
): SeoPerformanceReport {
  params.onProgress?.(
    "Running SEO + Performance Engine (title/meta, headings, technical SEO, CWV)…",
  );
  const report = analyzeSeoPerformance({
    files: params.files,
    strategy: params.strategy,
    profile: params.profile,
    industryId: params.industryId,
    seoPackage: params.seoPackage,
    performanceReport: params.performanceReport,
    assetManifest: params.assetManifest,
    premiumSeoTopics: params.premiumSeoTopics,
    premiumKeywords: params.premiumKeywords,
    conversionScore: params.conversionScore,
  });
  params.onProgress?.(
    `[seo-performance] seo=${report.scores.seo} perf=${report.scores.performance} mobile=${report.scores.mobile} overall=${report.scores.overall} ready=${report.publishReady}`,
  );
  return report;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Merge SEO/performance findings into optimizer report scores + issues. */
export function mergeSeoPerformanceIntoOptimizerReport(
  optimization: WebsiteOptimizationReport,
  seoPerf: SeoPerformanceReport,
): WebsiteOptimizationReport {
  const seoIssues: WebsiteAuditIssue[] = seoPerf.recommendations
    .filter((r) => r.severity === "critical" || r.severity === "major")
    .slice(0, 10)
    .map((r) => ({
      id: `seo-perf-${r.id}`,
      category: areaToAuditCategory(r.area),
      severity: r.severity === "critical" ? "critical" : "major",
      title: r.title,
      detail: r.detail,
      suggestion: r.action,
    }));

  const existingIds = new Set(optimization.audit.issues.map((i) => i.id));
  const mergedIssues = [
    ...optimization.audit.issues,
    ...seoIssues.filter((i) => !existingIds.has(i.id)),
  ];

  const improvements = [
    ...optimization.improvements,
    ...seoPerf.recommendations.slice(0, 10).map((r, index) => ({
      id: `seo-perf-imp-${index}`,
      category: areaToAuditCategory(r.area),
      title: r.title,
      description: r.action,
      target: r.target,
      applied: false,
    })),
  ];

  const scores = {
    ...optimization.scores,
    seo: clamp(
      Math.round(optimization.scores.seo * 0.45 + seoPerf.scores.seo * 0.55),
    ),
    performance: clamp(
      Math.round(
        optimization.scores.performance * 0.45 +
          seoPerf.scores.performance * 0.55,
      ),
    ),
    overall: 0,
  };
  scores.overall = clamp(
    Math.round(
      (scores.design + scores.seo + scores.ux + scores.performance) / 4,
    ),
  );

  return {
    ...optimization,
    summary: `${optimization.summary} ${seoPerf.summary}`.trim(),
    scores,
    audit: {
      ...optimization.audit,
      scores,
      issues: mergedIssues,
      suggestions: Array.from(
        new Set([
          ...optimization.audit.suggestions,
          ...seoPerf.recommendations.slice(0, 6).map((r) => r.action),
        ]),
      ),
      mobileReady:
        optimization.audit.mobileReady && seoPerf.scores.mobile >= 65,
    },
    improvements,
    improveInstruction: [
      optimization.improveInstruction,
      seoPerf.improveThemes.length
        ? `SEO + Performance focus:\n${seoPerf.improveThemes.map((t) => `- ${t}`).join("\n")}`
        : "",
      `Suggested title: ${seoPerf.suggestedMeta.title}`,
      `Suggested description: ${seoPerf.suggestedMeta.description}`,
      `Primary keyword: ${seoPerf.keywordPlan.primary}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    publishReady:
      optimization.publishReady &&
      seoPerf.publishReady &&
      scores.overall >= 60,
  };
}

/** Pre-publish SEO / performance / mobile quality checklist. */
export function seoPerformancePublishChecklist(report: SeoPerformanceReport): {
  publishReady: boolean;
  seoScore: number;
  performanceScore: number;
  mobileScore: number;
  overallScore: number;
  blockers: string[];
  warnings: string[];
  opportunities: string[];
  suggestedTitle: string;
  suggestedDescription: string;
  primaryKeyword: string;
} {
  return {
    publishReady: report.publishReady,
    seoScore: report.scores.seo,
    performanceScore: report.scores.performance,
    mobileScore: report.scores.mobile,
    overallScore: report.scores.overall,
    blockers: report.recommendations
      .filter((r) => r.severity === "critical")
      .map((r) => r.title),
    warnings: report.recommendations
      .filter((r) => r.severity === "major")
      .map((r) => r.title),
    opportunities: report.recommendations
      .filter((r) => r.severity === "opportunity" || r.severity === "minor")
      .map((r) => r.title),
    suggestedTitle: report.suggestedMeta.title,
    suggestedDescription: report.suggestedMeta.description,
    primaryKeyword: report.keywordPlan.primary,
  };
}
