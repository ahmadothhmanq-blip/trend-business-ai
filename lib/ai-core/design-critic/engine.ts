import { analyzeDesignCritic } from "@/lib/ai-core/design-critic/analyze";
import type { DesignCriticReport } from "@/lib/ai-core/design-critic/types";
import type {
  WebsiteAuditIssue,
  WebsiteOptimizationReport,
} from "@/lib/ai-core/optimizer/types";
import type { GeneratedProjectFile } from "@/lib/ai/types";

export type RunDesignCriticParams = {
  files: GeneratedProjectFile[];
  onProgress?: (message: string) => void;
};

export function runDesignCritic(
  params: RunDesignCriticParams,
): DesignCriticReport {
  params.onProgress?.(
    "Design Critic: reviewing layout, spacing, typography, and premium feel…",
  );
  const report = analyzeDesignCritic({ files: params.files });
  params.onProgress?.(
    `[design-critic] score=${report.score} premium=${report.premiumFeel} ready=${report.designReady}`,
  );
  return report;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function mergeDesignCriticIntoOptimizerReport(
  optimization: WebsiteOptimizationReport,
  critic: DesignCriticReport,
): WebsiteOptimizationReport {
  const issues: WebsiteAuditIssue[] = critic.findings
    .filter((f) => f.severity === "critical" || f.severity === "major")
    .slice(0, 10)
    .map((f) => ({
      id: `design-critic-${f.id}`,
      category: "design" as const,
      severity: f.severity === "critical" ? "critical" : "major",
      title: f.title,
      detail: f.detail,
      suggestion: f.action,
    }));

  const existingIds = new Set(optimization.audit.issues.map((i) => i.id));
  const mergedIssues = [
    ...optimization.audit.issues,
    ...issues.filter((i) => !existingIds.has(i.id)),
  ];

  const designBoost = critic.designReady ? 4 : -8;
  const scores = {
    ...optimization.scores,
    design: clamp(
      Math.round(
        optimization.scores.design * 0.45 + critic.score * 0.35 + critic.premiumFeel * 0.2,
      ) + designBoost,
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
    summary: `${optimization.summary} ${critic.summary}`.trim(),
    scores,
    audit: {
      ...optimization.audit,
      scores,
      issues: mergedIssues,
      suggestions: Array.from(
        new Set([
          ...optimization.audit.suggestions,
          ...critic.findings.slice(0, 5).map((f) => f.action),
        ]),
      ),
    },
    improvements: [
      ...optimization.improvements,
      ...critic.findings.slice(0, 8).map((f, index) => ({
        id: `design-critic-imp-${index}`,
        category: "design" as const,
        title: f.title,
        description: f.action,
        applied: false,
      })),
    ],
    improveInstruction: [
      optimization.improveInstruction,
      critic.improveThemes.length
        ? `Design Critic focus:\n${critic.improveThemes.map((t) => `- ${t}`).join("\n")}`
        : "",
    ]
      .filter(Boolean)
      .join("\n\n"),
    publishReady: optimization.publishReady && critic.designReady && scores.overall >= 60,
  };
}
