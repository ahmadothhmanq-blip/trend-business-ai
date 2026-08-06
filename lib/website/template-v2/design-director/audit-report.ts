import { APPROVAL_THRESHOLD } from "@/lib/website/template-v2/design-director/weights";
import {
  DESIGN_DIRECTOR_VERSION,
  type DesignImprovement,
  type DesignIssue,
  type DesignQualityReport,
  type DesignQualityScore,
  type DesignWarning,
} from "@/lib/website/template-v2/design-director/types";
import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";

export function buildDesignWarnings(issues: DesignIssue[]): DesignWarning[] {
  return issues.map((issue) => ({
    code: issue.id,
    message: issue.message,
    category: issue.category,
    severity: issue.severity,
  }));
}

export function buildQualityReport(params: {
  blueprint: WebsiteBlueprint;
  initialScore: DesignQualityScore;
  finalScore: DesignQualityScore;
  issuesFound: DesignIssue[];
  issuesRemaining: DesignIssue[];
  improvements: DesignImprovement[];
}): DesignQualityReport {
  const {
    blueprint,
    initialScore,
    finalScore,
    issuesFound,
    issuesRemaining,
    improvements,
  } = params;

  const resolvedCount = issuesFound.length - issuesRemaining.length;
  const categorySummary: DesignQualityReport["categorySummary"] = {};

  for (const issue of issuesFound) {
    const entry = categorySummary[issue.category] ?? { found: 0, resolved: 0 };
    entry.found += 1;
    categorySummary[issue.category] = entry;
  }

  const remainingIds = new Set(issuesRemaining.map((i) => i.id));
  for (const issue of issuesFound) {
    if (!remainingIds.has(issue.id)) {
      const entry = categorySummary[issue.category]!;
      entry.resolved += 1;
    }
  }

  const criticalRemaining = issuesRemaining.filter(
    (i) => i.severity === "critical",
  ).length;

  return {
    blueprintId: blueprint.meta.blueprintId,
    reviewedAt: new Date().toISOString(),
    directorVersion: DESIGN_DIRECTOR_VERSION,
    initialScore,
    finalScore,
    issuesFound: issuesFound.length,
    issuesResolved: Math.max(0, resolvedCount),
    improvementsApplied: improvements.length,
    approved:
      finalScore.overall >= APPROVAL_THRESHOLD && criticalRemaining === 0,
    categorySummary,
  };
}

export function formatAuditSummary(report: DesignQualityReport): string {
  const lines = [
    `Design Audit — ${report.blueprintId}`,
    `Director v${report.directorVersion}`,
    `Initial score: ${report.initialScore.overall} (${report.initialScore.grade})`,
    `Final score: ${report.finalScore.overall} (${report.finalScore.grade})`,
    `Issues: ${report.issuesFound} found, ${report.issuesResolved} resolved`,
    `Improvements applied: ${report.improvementsApplied}`,
    `Approved: ${report.approved ? "yes" : "no"}`,
  ];
  return lines.join("\n");
}
