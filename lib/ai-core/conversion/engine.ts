import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import { analyzeConversion } from "@/lib/ai-core/conversion/analyze";
import type { ConversionOptimizationReport } from "@/lib/ai-core/conversion/types";
import type {
  WebsiteAuditIssue,
  WebsiteOptimizationReport,
} from "@/lib/ai-core/optimizer/types";

export type RunConversionOptimizationParams = {
  files: GeneratedProjectFile[];
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string;
  explicitGoal?: string | null;
  websiteGoal?: string | null;
  onProgress?: (message: string) => void;
};

/**
 * AI Conversion Optimization Engine — goal detect + industry rules + recommendations.
 * Does not rewrite generation; produces actionable CRO guidance for optimizer/publish.
 */
export function runConversionOptimization(
  params: RunConversionOptimizationParams,
): ConversionOptimizationReport {
  params.onProgress?.(
    "Analyzing conversion goal and industry conversion rules…",
  );
  const report = analyzeConversion({
    files: params.files,
    strategy: params.strategy,
    profile: params.profile,
    industryId: params.industryId,
    explicitGoal: params.explicitGoal,
    websiteGoal: params.websiteGoal,
  });
  params.onProgress?.(
    `[conversion] ${report.goal.goal} · score=${report.score} · ready=${report.conversionReady} · ${report.recommendations.length} recommendations`,
  );
  return report;
}

/** Merge conversion findings into optimizer audit issues / improve themes. */
export function mergeConversionIntoOptimizerReport(
  optimization: WebsiteOptimizationReport,
  conversion: ConversionOptimizationReport,
): WebsiteOptimizationReport {
  const conversionIssues: WebsiteAuditIssue[] = conversion.recommendations
    .filter((r) => r.severity === "critical" || r.severity === "major")
    .slice(0, 8)
    .map((r) => ({
      id: `conv-${r.id}`,
      category: "conversion" as const,
      severity: r.severity === "critical" ? "critical" : "major",
      title: r.title,
      detail: r.detail,
      suggestion: r.action,
    }));

  const existingIds = new Set(optimization.audit.issues.map((i) => i.id));
  const mergedIssues = [
    ...optimization.audit.issues,
    ...conversionIssues.filter((i) => !existingIds.has(i.id)),
  ];

  const improvements = [
    ...optimization.improvements,
    ...conversion.recommendations.slice(0, 10).map((r, index) => ({
      id: `conv-imp-${index}`,
      category: "conversion" as const,
      title: r.title,
      description: r.action,
      target: r.target,
      applied: false,
    })),
  ];

  const improveThemes = Array.from(
    new Set([
      ...(optimization.improveInstruction
        ? []
        : []),
      ...conversion.improveThemes,
    ]),
  );

  const uxBoost = conversion.conversionReady ? 4 : -6;
  const scores = {
    ...optimization.scores,
    ux: clamp(optimization.scores.ux + uxBoost),
    overall: clamp(
      Math.round(
        (optimization.scores.design +
          optimization.scores.seo +
          clamp(optimization.scores.ux + uxBoost) +
          optimization.scores.performance) /
          4,
      ),
    ),
  };

  return {
    ...optimization,
    summary: `${optimization.summary} ${conversion.summary}`.trim(),
    scores,
    audit: {
      ...optimization.audit,
      scores,
      issues: mergedIssues,
      suggestions: Array.from(
        new Set([
          ...optimization.audit.suggestions,
          ...conversion.recommendations.slice(0, 6).map((r) => r.action),
        ]),
      ),
      conversionReady:
        optimization.audit.conversionReady && conversion.conversionReady,
      missingSections: Array.from(
        new Set([
          ...optimization.audit.missingSections,
          ...conversion.missingElements,
        ]),
      ),
    },
    improvements,
    improveInstruction: [
      optimization.improveInstruction,
      improveThemes.length
        ? `Conversion focus (${conversion.goal.goal}):\n${improveThemes.map((t) => `- ${t}`).join("\n")}`
        : "",
      `Suggested section order: ${conversion.suggestedSectionOrder.join(" → ")}`,
      `User journey: ${conversion.suggestedJourney.join(" → ")}`,
    ]
      .filter(Boolean)
      .join("\n\n"),
    publishReady:
      optimization.publishReady &&
      conversion.conversionReady &&
      scores.overall >= 60,
  };
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

/** Lightweight pre-publish recommendations payload. */
export function conversionPublishChecklist(
  report: ConversionOptimizationReport,
): {
  conversionReady: boolean;
  score: number;
  goal: string;
  blockers: string[];
  warnings: string[];
  opportunities: string[];
} {
  const blockers = report.recommendations
    .filter((r) => r.severity === "critical")
    .map((r) => r.title);
  const warnings = report.recommendations
    .filter((r) => r.severity === "major")
    .map((r) => r.title);
  const opportunities = report.recommendations
    .filter((r) => r.severity === "opportunity" || r.severity === "minor")
    .map((r) => r.title);
  return {
    conversionReady: report.conversionReady,
    score: report.score,
    goal: report.goal.goal,
    blockers,
    warnings,
    opportunities,
  };
}
