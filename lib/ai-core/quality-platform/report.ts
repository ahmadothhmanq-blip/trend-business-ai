import { validateAccessibility } from "@/lib/ai-core/accessibility/validate";
import { computeUnifiedQualityScores } from "@/lib/ai-core/quality-authority";
import {
  collapseOverlappingMessages,
  dedupeStrings,
} from "@/lib/ai-core/quality-platform/heuristics";
import type {
  UnifiedQualityIssue,
  UnifiedQualityReport,
  UnifiedQualityTrace,
  UnifiedQualityTelemetry,
} from "@/lib/ai-core/quality-platform/types";
import { QUALITY_PLATFORM_VERSION } from "@/lib/ai-core/quality-platform/flags";
import type { QualityReport } from "@/lib/website/types/layers";
import type { SemanticContentQualityReport } from "@/lib/ai-core/semantic-content-quality";
import type { VisualDesignQualityReport } from "@/lib/ai-core/visual-design-quality";
import type { UnifiedRepairQueueItem } from "@/lib/ai-core/quality-platform/types";

function mapSemanticIssues(
  report?: SemanticContentQualityReport,
): UnifiedQualityIssue[] {
  if (!report) return [];
  return report.issues.map((issue) => ({
    id: `semantic-${issue.id}`,
    source: "semantic" as const,
    dimension: issue.dimension,
    severity: issue.severity === "error" ? "blocker" : "warning",
    message: issue.message,
    repairHint: issue.repairHint,
    filePath: issue.filePath,
  }));
}

function mapVisualIssues(
  report?: VisualDesignQualityReport,
): UnifiedQualityIssue[] {
  if (!report) return [];
  return report.issues.map((issue) => ({
    id: `visual-${issue.id}`,
    source: "visual" as const,
    dimension: issue.dimension,
    severity: issue.severity === "error" ? "blocker" : "warning",
    message: issue.message,
    repairHint: issue.repairHint,
    filePath: issue.filePath,
  }));
}

function mapStructuralIssues(report?: QualityReport): UnifiedQualityIssue[] {
  if (!report) return [];
  return report.issues.map((message, index) => ({
    id: `structural-${index}`,
    source: "structural" as const,
    dimension: "structure",
    severity: "warning",
    message,
  }));
}

function mapAccessibilityIssues(
  report: ReturnType<typeof validateAccessibility>,
): UnifiedQualityIssue[] {
  return report.issues.map((issue) => ({
    id: `a11y-${issue.id}`,
    source: "accessibility" as const,
    dimension: "accessibility",
    severity: issue.severity === "blocker" ? "blocker" : "warning",
    message: issue.detail,
    repairHint: issue.autoFixable ? "Auto-fixable accessibility issue." : undefined,
  }));
}

function dedupeUnifiedIssues(issues: UnifiedQualityIssue[]): UnifiedQualityIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    const key = `${issue.source}:${issue.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildQualityTrace(params: {
  durationMs: number;
  modules: UnifiedQualityTrace["modules"];
  scores: UnifiedQualityTrace["scores"];
  issueCounts: UnifiedQualityTrace["issueCounts"];
  phase?: UnifiedQualityTrace["phase"];
}): UnifiedQualityTrace {
  return {
    version: QUALITY_PLATFORM_VERSION,
    phase: params.phase ?? "generation",
    startedAt: new Date(Date.now() - params.durationMs).toISOString(),
    durationMs: params.durationMs,
    modules: params.modules,
    issueCounts: params.issueCounts,
    scores: params.scores,
  };
}

export function createQualityTelemetry(params: {
  durationMs: number;
  repairQueue: UnifiedRepairQueueItem[];
  dedupedCount: number;
  scores: UnifiedQualityTrace["scores"];
  llmCalls?: number;
  promptChars?: number;
}): UnifiedQualityTelemetry {
  const scorePayload = JSON.stringify(params.scores);
  let hash = 0;
  for (let i = 0; i < scorePayload.length; i += 1) {
    hash = (hash * 31 + scorePayload.charCodeAt(i)) >>> 0;
  }

  return {
    pipelineLatencyMs: params.durationMs,
    llmCalls: params.llmCalls ?? 0,
    promptChars: params.promptChars ?? 0,
    repairQueueSize: params.repairQueue.length,
    repairDedupedCount: params.dedupedCount,
    scoreStabilityHash: hash.toString(16).padStart(8, "0"),
  };
}

export function buildUnifiedQualityReport(params: {
  structural?: QualityReport;
  semantic?: SemanticContentQualityReport;
  visual?: VisualDesignQualityReport;
  files: Array<{ path: string; content: string }>;
  validationIssues?: string[];
  repairQueue: UnifiedRepairQueueItem[];
  repairInstruction: string;
  dedupedCount: number;
  durationMs: number;
  modules: UnifiedQualityTrace["modules"];
  llmCalls?: number;
  promptChars?: number;
}): UnifiedQualityReport {
  const accessibility = validateAccessibility(
    params.files as import("@/lib/ai/types").GeneratedProjectFile[],
  );

  const issues = dedupeUnifiedIssues([
    ...mapStructuralIssues(params.structural),
    ...mapSemanticIssues(params.semantic),
    ...mapVisualIssues(params.visual),
    ...mapAccessibilityIssues(accessibility),
  ]);

  const scores = computeUnifiedQualityScores({
    validationIssues: params.validationIssues,
    qualityReport: params.structural,
    accessibilityIssueCount: accessibility.issues.length,
    finalQualityScores: params.semantic
      ? {
          seo: params.semantic.scores.semanticSeo,
          conversion: params.semantic.scores.ctaQuality,
          ux: params.visual?.scores.ux,
          design: params.visual?.scores.overall,
        }
      : params.visual
        ? {
            ux: params.visual.scores.ux,
            design: params.visual.scores.overall,
          }
        : undefined,
  });

  if (params.semantic?.scores.overall) {
    scores.content = Math.round(
      scores.content * 0.6 + params.semantic.scores.overall * 0.4,
    );
  }
  if (params.visual?.scores.overall) {
    scores.ui = Math.round(scores.ui * 0.6 + params.visual.scores.overall * 0.4);
    scores.ux = Math.round(scores.ux * 0.6 + params.visual.scores.ux * 0.4);
  }

  const blockers = issues.filter((i) => i.severity === "blocker").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const weakSections = collapseOverlappingMessages(
    dedupeStrings([
      ...(params.structural?.weakSections ?? []),
      ...(params.semantic?.weakSections ?? []),
      ...(params.visual?.weakSections ?? []),
      ...issues.map((i) => i.message),
    ]),
  ).slice(0, 20);

  const trace = buildQualityTrace({
    durationMs: params.durationMs,
    modules: params.modules,
    scores,
    issueCounts: {
      total: issues.length,
      blockers,
      warnings,
      dedupedRepairs: params.dedupedCount,
    },
  });

  const telemetry = createQualityTelemetry({
    durationMs: params.durationMs,
    repairQueue: params.repairQueue,
    dedupedCount: params.dedupedCount,
    scores,
    llmCalls: params.llmCalls,
    promptChars: params.promptChars,
  });

  const passed =
    (params.structural?.passed ?? true) &&
    (params.semantic?.passed ?? true) &&
    (params.visual?.passed ?? true) &&
    accessibility.passed;

  return {
    passed,
    publishReady: passed && blockers === 0 && scores.overall >= 60,
    summary: `Unified quality ${scores.overall}/100 — ${blockers} blockers, ${warnings} warnings.`,
    scores,
    issues,
    weakSections,
    repairQueue: params.repairQueue,
    repairInstruction: params.repairInstruction,
    trace,
    telemetry,
    structural: params.structural,
    semantic: params.semantic,
    visual: params.visual,
    accessibility,
  };
}
