import type {
  UnifiedQualityDashboardModel,
  UnifiedQualityReport,
} from "@/lib/ai-core/quality-platform/types";

const DIMENSION_LABELS: Record<string, string> = {
  build: "Build",
  validation: "Validation",
  content: "Content",
  seo: "SEO",
  accessibility: "Accessibility",
  ux: "UX",
  ui: "UI",
  overall: "Overall",
};

function dimensionStatus(score: number): "pass" | "warn" | "fail" {
  if (score >= 75) return "pass";
  if (score >= 55) return "warn";
  return "fail";
}

/** Dashboard-ready model — no UI; consumed by API and publish payloads. */
export function toQualityDashboardModel(
  report: UnifiedQualityReport,
): UnifiedQualityDashboardModel {
  const dimensions = Object.entries(report.scores)
    .filter(([key]) => key !== "overall")
    .map(([id, score]) => ({
      id,
      label: DIMENSION_LABELS[id] ?? id,
      score,
      status: dimensionStatus(score),
    }));

  return {
    overallScore: report.scores.overall,
    dimensions,
    issueSummary: {
      blockers: report.issues.filter((i) => i.severity === "blocker").length,
      warnings: report.issues.filter((i) => i.severity === "warning").length,
      topIssues: report.weakSections.slice(0, 8),
    },
    repairQueue: report.repairQueue.map((item) => ({
      id: item.id,
      title: item.title,
      priority: item.priority,
    })),
    publishReady: report.publishReady,
    lastUpdatedAt: report.trace.startedAt,
  };
}
