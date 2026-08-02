import type { CompositionPerformanceReport } from "@/lib/ai-core/performance/composition-performance";

export const PIPELINE_PROFILER_KEY = "__pipelineProfiler";

export type PipelineStageTiming = {
  stage: string;
  durationMs: number;
  meta?: Record<string, string | number | boolean>;
};

export type PipelinePerformanceReport = {
  totalDurationMs: number;
  stages: PipelineStageTiming[];
  sortedStages: PipelineStageTiming[];
  bottleneck: {
    stage: string;
    durationMs: number;
    sharePercent: number;
  };
};

/** Canonical stage labels for the Website Builder pipeline report. */
export const PIPELINE_STAGE = {
  MAOE_INIT: "MAOE Init",
  BUSINESS_INTELLIGENCE: "Business Intelligence",
  AGENCY_ORCHESTRATOR: "Agency Orchestrator",
  AUTO_DESIGN: "Auto Design Heuristics",
  TEMPLATE_ROUTING: "Template Routing",
  VALIDATION: "Validation",
  MASTER_PLANNER: "Master Planner",
  PREMIUM_TEMPLATE: "Premium Template Apply",
  TEMPLATE_INTELLIGENCE: "Template Intelligence Apply",
  BUSINESS_IDEA: "Business Idea Analysis",
  STRATEGY: "Strategy",
  DESIGN_PLANNING: "Design Planning",
  DESIGN_RENDERER: "Design Renderer",
  IMAGE_ENGINE: "Image Engine",
  WEBSITE_PLAN: "Website Plan",
  WEBSITE_COMPOSITION: "Website Composition",
  PER_FILE_GENERATION: "Per-file Generation",
  QUALITY: "Quality Assurance",
  SEO: "SEO",
  PERFORMANCE_CHECKS: "Performance Checks",
  FINALIZE: "Finalize",
} as const;

export class PipelinePerformanceTracker {
  private readonly startedAt = performance.now();
  private readonly openStages = new Map<string, number>();
  private readonly stages: PipelineStageTiming[] = [];

  start(stage: string, meta?: Record<string, string | number | boolean>) {
    this.openStages.set(stage, performance.now());
    if (meta) {
      this.stages.push({
        stage,
        durationMs: 0,
        meta,
      });
    }
  }

  end(stage: string, meta?: Record<string, string | number | boolean>) {
    const started = this.openStages.get(stage);
    if (started == null) return;
    const durationMs = Math.round(performance.now() - started);
    this.openStages.delete(stage);
    this.record(stage, durationMs, meta);
  }

  record(
    stage: string,
    durationMs: number,
    meta?: Record<string, string | number | boolean>,
  ) {
    this.stages.push({
      stage,
      durationMs: Math.max(0, Math.round(durationMs)),
      ...(meta ? { meta } : {}),
    });
  }

  mergeCompositionReport(report: CompositionPerformanceReport) {
    for (const stage of report.stages) {
      if (stage.stage === "file-generation") {
        this.record("Per-file Generation", stage.durationMs, {
          ...stage.meta,
          mode: stage.meta?.mode ?? "per-file",
        });
        continue;
      }
      if (stage.stage === "validate-repair") {
        this.record(PIPELINE_STAGE.VALIDATION, stage.durationMs, {
          source: "composition",
          ...(stage.meta ?? {}),
        });
        continue;
      }
      this.record(
        `${PIPELINE_STAGE.WEBSITE_COMPOSITION} · ${stage.stage}`,
        stage.durationMs,
        stage.meta,
      );
    }

    this.record(PIPELINE_STAGE.WEBSITE_COMPOSITION, report.totalDurationMs, {
      llmCallCount: report.summary.llmCallCount,
      llmTotalMs: report.summary.llmTotalMs,
    });

    for (const llm of report.llmCalls) {
      const label =
        llm.stage === "batch-file-generation"
          ? `Batch Generation · ${llm.filePath ?? "module"}`
          : `${PIPELINE_STAGE.PER_FILE_GENERATION} · ${llm.filePath ?? "unknown"}`;
      this.record(label, llm.durationMs, {
        attempt: llm.attempt ?? 1,
        success: llm.success ?? false,
      });
    }
  }

  elapsed(): number {
    return Math.round(performance.now() - this.startedAt);
  }

  toReport(): PipelinePerformanceReport {
    const totalDurationMs = this.elapsed();
    const aggregated = aggregateStageTimings(this.stages);
    const sortedStages = [...aggregated].sort(
      (a, b) => b.durationMs - a.durationMs,
    );
    const bottleneck = sortedStages[0] ?? {
      stage: "n/a",
      durationMs: 0,
    };
    const sharePercent =
      totalDurationMs > 0
        ? Math.round((bottleneck.durationMs / totalDurationMs) * 1000) / 10
        : 0;

    return {
      totalDurationMs,
      stages: aggregated,
      sortedStages,
      bottleneck: {
        stage: bottleneck.stage,
        durationMs: bottleneck.durationMs,
        sharePercent,
      },
    };
  }

  formatReport(): string {
    const report = this.toReport();
    const lines: string[] = [
      "═══════════════════════════════════════════════════════════",
      "  WEBSITE BUILDER PIPELINE TIMING REPORT",
      "═══════════════════════════════════════════════════════════",
      `Total pipeline time: ${report.totalDurationMs}ms (${(report.totalDurationMs / 1000).toFixed(1)}s)`,
      "",
      "Stages (slowest → fastest):",
    ];

    for (const row of report.sortedStages) {
      const share =
        report.totalDurationMs > 0
          ? ((row.durationMs / report.totalDurationMs) * 100).toFixed(1)
          : "0.0";
      const meta =
        row.meta && Object.keys(row.meta).length
          ? ` · ${Object.entries(row.meta)
              .map(([k, v]) => `${k}=${v}`)
              .join(", ")}`
          : "";
      lines.push(
        `  ${String(row.durationMs).padStart(7)}ms  (${String(share).padStart(5)}%)  ${row.stage}${meta}`,
      );
    }

    lines.push(
      "",
      `▶ Bottleneck: ${report.bottleneck.stage} — ${report.bottleneck.durationMs}ms (${report.bottleneck.sharePercent}% of total)`,
      "═══════════════════════════════════════════════════════════",
    );

    return lines.join("\n");
  }

  formatProgressLine(): string {
    const report = this.toReport();
    return `[pipeline-perf] ${report.totalDurationMs}ms total · bottleneck: ${report.bottleneck.stage} (${report.bottleneck.durationMs}ms)`;
  }
}

function aggregateStageTimings(
  stages: PipelineStageTiming[],
): PipelineStageTiming[] {
  const byStage = new Map<string, PipelineStageTiming>();

  for (const row of stages) {
    const existing = byStage.get(row.stage);
    if (!existing) {
      byStage.set(row.stage, { ...row });
      continue;
    }
    existing.durationMs += row.durationMs;
    if (row.meta) {
      existing.meta = { ...(existing.meta ?? {}), ...row.meta };
    }
  }

  return [...byStage.values()];
}

export function getPipelineProfilerFromBrief(
  brief?: { metadata?: Record<string, unknown> },
): PipelinePerformanceTracker | null {
  const raw = brief?.metadata?.[PIPELINE_PROFILER_KEY];
  return raw instanceof PipelinePerformanceTracker ? raw : null;
}

export function attachPipelineProfilerToBrief<T extends { metadata?: Record<string, unknown> }>(
  brief: T,
  tracker: PipelinePerformanceTracker,
): T {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [PIPELINE_PROFILER_KEY]: tracker,
    },
  };
}
