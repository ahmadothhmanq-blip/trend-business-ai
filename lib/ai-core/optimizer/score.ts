import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreQualityReport } from "@/lib/ai-core/layers/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type {
  WebsiteAuditIssue,
  WebsiteQualityScore,
} from "@/lib/ai-core/optimizer/types";

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function deductForIssues(
  base: number,
  issues: WebsiteAuditIssue[],
  categories: WebsiteAuditIssue["category"][],
): number {
  let score = base;
  for (const issue of issues) {
    if (!categories.includes(issue.category)) continue;
    if (issue.severity === "critical") score -= 18;
    else if (issue.severity === "major") score -= 10;
    else score -= 4;
  }
  return clampScore(score);
}

export function computeWebsiteQualityScore(params: {
  issues: WebsiteAuditIssue[];
  qualityReport?: CoreQualityReport;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
}): WebsiteQualityScore {
  const { issues, qualityReport, seoPackage, performanceReport } = params;

  const design = deductForIssues(
    qualityReport?.designConsistencyPassed === false ? 62 : 88,
    issues,
    ["design", "brand"],
  );

  const seoBase =
    typeof seoPackage?.readiness?.score === "number"
      ? seoPackage.readiness.score
      : typeof qualityReport?.seoReadinessScore === "number"
        ? qualityReport.seoReadinessScore
        : 72;
  const seo = deductForIssues(seoBase, issues, ["seo", "content"]);

  const ux = deductForIssues(84, issues, ["ux", "sections", "mobile", "conversion"]);

  const performanceBase =
    typeof performanceReport?.score === "number"
      ? performanceReport.score
      : typeof qualityReport?.performanceScore === "number"
        ? qualityReport.performanceScore
        : 75;
  const performance = deductForIssues(performanceBase, issues, [
    "performance",
    "mobile",
  ]);

  const overall = clampScore(
    design * 0.25 + seo * 0.2 + ux * 0.3 + performance * 0.25,
  );

  return { design, seo, ux, performance, overall };
}

export function isPublishReadyFromScores(scores: WebsiteQualityScore): boolean {
  return (
    scores.overall >= 60 &&
    scores.design >= 50 &&
    scores.ux >= 50 &&
    scores.seo >= 45 &&
    scores.performance >= 50
  );
}
