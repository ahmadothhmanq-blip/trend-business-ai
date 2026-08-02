import { performance } from "node:perf_hooks";
import { PIPELINE_PROFILER_KEY } from "@/lib/ai-core/performance/pipeline-profiler";

export type ProfilerCategory =
  | "ai-planning"
  | "prompt-generation"
  | "ai-request"
  | "website-builder"
  | "plugin"
  | "file-generation"
  | "file-writing"
  | "supabase"
  | "seo"
  | "image-generation"
  | "validation"
  | "build-preparation"
  | "layer-runner"
  | "api";

export type ProfilerEvent = {
  category: ProfilerCategory;
  label: string;
  durationMs: number;
  meta?: Record<string, string | number | boolean>;
};

export type LlmProfilerEvent = {
  stage: string;
  filePath?: string;
  durationMs: number;
  attempt: number;
  success: boolean;
  promptChars?: number;
};

export type MemorySnapshot = {
  label: string;
  heapUsedMb: number;
  heapTotalMb: number;
  rssMb: number;
  externalMb: number;
};

export type PerformanceProfilingReport = {
  totalGenerationMs: number;
  measuredWallMs: number;
  unaccountedMs: number;
  stageTimings: Array<{
    category: ProfilerCategory;
    label: string;
    totalMs: number;
    count: number;
    avgMs: number;
    sharePercent: number;
  }>;
  categoryTotals: Array<{
    category: ProfilerCategory;
    totalMs: number;
    sharePercent: number;
  }>;
  slowestFunctions: ProfilerEvent[];
  duplicateExecutions: Array<{ label: string; count: number; totalMs: number }>;
  llmCalls: LlmProfilerEvent[];
  llmByStage: Record<
    string,
    { count: number; durationMs: number; promptChars: number }
  >;
  supabaseOperations: ProfilerEvent[];
  fileSystemOperations: ProfilerEvent[];
  memorySnapshots: MemorySnapshot[];
  sequentialParallelAnalysis: Array<{
    observation: string;
    impact: "high" | "medium" | "low";
    candidates: string[];
  }>;
  bottlenecks: {
    ai: ProfilerEvent[];
    database: ProfilerEvent[];
    filesystem: ProfilerEvent[];
  };
  recommendations: Array<{
    priority: number;
    impact: "critical" | "high" | "medium" | "low";
    title: string;
    detail: string;
  }>;
};

function memorySnapshot(label: string): MemorySnapshot {
  const mem = process.memoryUsage();
  return {
    label,
    heapUsedMb: Math.round((mem.heapUsed / 1024 / 1024) * 10) / 10,
    heapTotalMb: Math.round((mem.heapTotal / 1024 / 1024) * 10) / 10,
    rssMb: Math.round((mem.rss / 1024 / 1024) * 10) / 10,
    externalMb: Math.round((mem.external / 1024 / 1024) * 10) / 10,
  };
}

export class WebsitePipelineProfiler {
  private readonly startedAt = performance.now();
  private readonly events: ProfilerEvent[] = [];
  private readonly llmCalls: LlmProfilerEvent[] = [];
  private readonly callCounts = new Map<string, number>();
  private readonly memorySnapshots: MemorySnapshot[] = [];

  snapshotMemory(label: string) {
    this.memorySnapshots.push(memorySnapshot(label));
  }

  async measure<T>(
    category: ProfilerCategory,
    label: string,
    fn: () => Promise<T>,
    meta?: Record<string, string | number | boolean>,
  ): Promise<T> {
    const key = `${category}::${label}`;
    this.callCounts.set(key, (this.callCounts.get(key) ?? 0) + 1);
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const durationMs = Math.max(0, Math.round(performance.now() - start));
      this.events.push({ category, label, durationMs, meta });
    }
  }

  record(
    category: ProfilerCategory,
    label: string,
    durationMs: number,
    meta?: Record<string, string | number | boolean>,
  ) {
    const key = `${category}::${label}`;
    this.callCounts.set(key, (this.callCounts.get(key) ?? 0) + 1);
    this.events.push({
      category,
      label,
      durationMs: Math.max(0, Math.round(durationMs)),
      meta,
    });
  }

  recordLlm(event: LlmProfilerEvent) {
    this.llmCalls.push(event);
    this.record("ai-request", `${event.stage}${event.filePath ? ` · ${event.filePath}` : ""}`, event.durationMs, {
      attempt: event.attempt,
      success: event.success,
      promptChars: event.promptChars ?? 0,
    });
  }

  elapsedMs(): number {
    return Math.round(performance.now() - this.startedAt);
  }

  attachToBrief<T extends { metadata?: Record<string, unknown> }>(brief: T): T {
    return {
      ...brief,
      metadata: {
        ...(brief.metadata ?? {}),
        [PIPELINE_PROFILER_KEY]: this,
      },
    };
  }

  toReport(): PerformanceProfilingReport {
    const measuredWallMs = this.elapsedMs();
    const totalMeasuredMs = this.events.reduce((sum, e) => sum + e.durationMs, 0);
    const unaccountedMs = Math.max(0, measuredWallMs - totalMeasuredMs);

    const byLabel = new Map<string, { totalMs: number; count: number; category: ProfilerCategory }>();
    for (const event of this.events) {
      const key = `${event.category}::${event.label}`;
      const existing = byLabel.get(key);
      if (!existing) {
        byLabel.set(key, {
          totalMs: event.durationMs,
          count: 1,
          category: event.category,
        });
        continue;
      }
      existing.totalMs += event.durationMs;
      existing.count += 1;
    }

    const stageTimings = [...byLabel.entries()]
      .map(([key, value]) => {
        const label = key.split("::").slice(1).join("::");
        return {
          category: value.category,
          label,
          totalMs: value.totalMs,
          count: value.count,
          avgMs: Math.round(value.totalMs / value.count),
          sharePercent:
            measuredWallMs > 0
              ? Math.round((value.totalMs / measuredWallMs) * 1000) / 10
              : 0,
        };
      })
      .sort((a, b) => b.totalMs - a.totalMs);

    const categoryMap = new Map<ProfilerCategory, number>();
    for (const row of stageTimings) {
      categoryMap.set(row.category, (categoryMap.get(row.category) ?? 0) + row.totalMs);
    }
    const categoryTotals = [...categoryMap.entries()]
      .map(([category, totalMs]) => ({
        category,
        totalMs,
        sharePercent:
          measuredWallMs > 0
            ? Math.round((totalMs / measuredWallMs) * 1000) / 10
            : 0,
      }))
      .sort((a, b) => b.totalMs - a.totalMs);

    const slowestFunctions = [...this.events]
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 25);

    const duplicateExecutions = [...this.callCounts.entries()]
      .filter(([, count]) => count > 1)
      .map(([key, count]) => {
        const totalMs =
          byLabel.get(key)?.totalMs ??
          this.events
            .filter((e) => `${e.category}::${e.label}` === key)
            .reduce((sum, e) => sum + e.durationMs, 0);
        return {
          label: key,
          count,
          totalMs,
        };
      })
      .sort((a, b) => b.totalMs - a.totalMs);

    const llmByStage: PerformanceProfilingReport["llmByStage"] = {};
    for (const call of this.llmCalls) {
      const bucket = llmByStage[call.stage] ?? {
        count: 0,
        durationMs: 0,
        promptChars: 0,
      };
      bucket.count += 1;
      bucket.durationMs += call.durationMs;
      bucket.promptChars += call.promptChars ?? 0;
      llmByStage[call.stage] = bucket;
    }

    const supabaseOperations = this.events
      .filter((e) => e.category === "supabase")
      .sort((a, b) => b.durationMs - a.durationMs);

    const fileSystemOperations = this.events
      .filter((e) => e.category === "file-writing" || e.category === "build-preparation")
      .sort((a, b) => b.durationMs - a.durationMs);

    const aiBottlenecks = this.events
      .filter((e) => e.category === "ai-request" || e.category === "ai-planning")
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 10);

    const sequentialParallelAnalysis = buildParallelAnalysis(stageTimings, this.llmCalls);

    const recommendations = buildRecommendations({
      measuredWallMs,
      stageTimings,
      categoryTotals,
      duplicateExecutions,
      llmByStage,
      supabaseOperations,
      unaccountedMs,
      memorySnapshots: this.memorySnapshots,
    });

    return {
      totalGenerationMs: measuredWallMs,
      measuredWallMs,
      unaccountedMs,
      stageTimings,
      categoryTotals,
      slowestFunctions,
      duplicateExecutions,
      llmCalls: this.llmCalls,
      llmByStage,
      supabaseOperations,
      fileSystemOperations,
      memorySnapshots: this.memorySnapshots,
      sequentialParallelAnalysis,
      bottlenecks: {
        ai: aiBottlenecks,
        database: supabaseOperations.slice(0, 10),
        filesystem: fileSystemOperations.slice(0, 10),
      },
      recommendations,
    };
  }

  formatMarkdownReport(): string {
    const report = this.toReport();
    const lines: string[] = [
      "# Website Builder — Performance Profiling Report",
      "",
      `**Total generation time:** ${report.totalGenerationMs}ms (${(report.totalGenerationMs / 1000).toFixed(1)}s)`,
      `**Measured stage time:** ${report.measuredWallMs - report.unaccountedMs}ms`,
      `**Unaccounted (gaps / untracked):** ${report.unaccountedMs}ms`,
      "",
      "## Time by Category",
      "",
      "| Category | Total (ms) | Share |",
      "|----------|-----------|-------|",
    ];

    for (const row of report.categoryTotals) {
      lines.push(`| ${row.category} | ${row.totalMs} | ${row.sharePercent}% |`);
    }

    lines.push("", "## Slowest Stages (Top 20)", "");
    for (const row of report.stageTimings.slice(0, 20)) {
      lines.push(
        `- **${row.label}** (${row.category}): ${row.totalMs}ms · ${row.count}× · avg ${row.avgMs}ms · ${row.sharePercent}%`,
      );
    }

    lines.push("", "## AI Requests by Stage", "");
    for (const [stage, stats] of Object.entries(report.llmByStage)) {
      lines.push(
        `- **${stage}**: ${stats.count} calls · ${stats.durationMs}ms · ${stats.promptChars} prompt chars`,
      );
    }

    if (report.duplicateExecutions.length) {
      lines.push("", "## Duplicate Executions", "");
      for (const dup of report.duplicateExecutions.slice(0, 15)) {
        lines.push(`- \`${dup.label}\`: ${dup.count}× (${dup.totalMs}ms total)`);
      }
    }

    if (report.sequentialParallelAnalysis.length) {
      lines.push("", "## Sequential → Parallel Opportunities", "");
      for (const item of report.sequentialParallelAnalysis) {
        lines.push(`- **[${item.impact}]** ${item.observation}`);
        lines.push(`  - Candidates: ${item.candidates.join(", ")}`);
      }
    }

    if (report.memorySnapshots.length) {
      lines.push("", "## Memory Snapshots", "");
      for (const snap of report.memorySnapshots) {
        lines.push(
          `- **${snap.label}**: heap ${snap.heapUsedMb}/${snap.heapTotalMb} MB · RSS ${snap.rssMb} MB`,
        );
      }
    }

    lines.push("", "## Recommendations (by impact)", "");
    for (const rec of report.recommendations) {
      lines.push(`### ${rec.priority}. [${rec.impact}] ${rec.title}`);
      lines.push(rec.detail);
      lines.push("");
    }

    return lines.join("\n");
  }
}

function buildParallelAnalysis(
  stages: PerformanceProfilingReport["stageTimings"],
  llmCalls: LlmProfilerEvent[],
): PerformanceProfilingReport["sequentialParallelAnalysis"] {
  const items: PerformanceProfilingReport["sequentialParallelAnalysis"] = [];

  const fileGenCalls = llmCalls.filter((c) => c.stage === "file-generation");
  if (fileGenCalls.length > 2) {
    const total = fileGenCalls.reduce((s, c) => s + c.durationMs, 0);
    items.push({
      observation: `${fileGenCalls.length} sequential per-file LLM calls account for ~${total}ms; independent files could be batched or parallelized.`,
      impact: "high",
      candidates: fileGenCalls.slice(0, 5).map((c) => c.filePath ?? "file-generation"),
    });
  }

  const preGenStages = stages.filter((s) =>
    ["ai-planning", "layer-runner", "website-builder"].includes(s.category),
  );
  const preGenMs = preGenStages.reduce((s, r) => s + r.totalMs, 0);
  if (preGenMs > 30_000) {
    items.push({
      observation: `Pre-generation intelligence layers total ~${preGenMs}ms before file loop; some template/planning steps may be independent.`,
      impact: "medium",
      candidates: preGenStages.slice(0, 6).map((s) => s.label),
    });
  }

  const imageStage = stages.find((s) => s.label.includes("image") || s.category === "image-generation");
  if (imageStage && imageStage.totalMs > 5_000) {
    items.push({
      observation: `Image generation (${imageStage.totalMs}ms) runs sequentially; multi-slot images could be requested in parallel.`,
      impact: "medium",
      candidates: ["runAiImageEngine", "generateWebsiteAssets"],
    });
  }

  const validationRounds = stages.filter((s) => s.label.includes("validate"));
  if (validationRounds.length > 1) {
    items.push({
      observation: `Validation/repair ran ${validationRounds.length} measured passes; each pass may re-invoke LLM for failed files.`,
      impact: "high",
      candidates: validationRounds.map((s) => s.label),
    });
  }

  return items;
}

function buildRecommendations(input: {
  measuredWallMs: number;
  stageTimings: PerformanceProfilingReport["stageTimings"];
  categoryTotals: PerformanceProfilingReport["categoryTotals"];
  duplicateExecutions: PerformanceProfilingReport["duplicateExecutions"];
  llmByStage: PerformanceProfilingReport["llmByStage"];
  supabaseOperations: ProfilerEvent[];
  unaccountedMs: number;
  memorySnapshots: MemorySnapshot[];
}): PerformanceProfilingReport["recommendations"] {
  const recs: PerformanceProfilingReport["recommendations"] = [];
  let priority = 1;

  const fileGen = input.llmByStage["file-generation"];
  if (fileGen && fileGen.durationMs > input.measuredWallMs * 0.4) {
    recs.push({
      priority: priority++,
      impact: "critical",
      title: "Per-file LLM generation dominates wall time",
      detail: `file-generation stage: ${fileGen.durationMs}ms (${fileGen.count} calls). This is the primary bottleneck. Batching modules or parallel file generation would have the largest impact.`,
    });
  }

  const strategy = input.llmByStage.strategy;
  if (strategy && strategy.durationMs > 20_000) {
    recs.push({
      priority: priority++,
      impact: "high",
      title: "Strategy LLM call is slow",
      detail: `Strategy stage took ${strategy.durationMs}ms (${strategy.promptChars} prompt chars). Consider caching strategy for similar prompts or using deterministic blueprint mode.`,
    });
  }

  const supabaseTotal = input.supabaseOperations.reduce((s, e) => s + e.durationMs, 0);
  if (supabaseTotal > 3_000) {
    recs.push({
      priority: priority++,
      impact: "high",
      title: "Supabase checkpoint/persist overhead",
      detail: `Measured Supabase operations: ${supabaseTotal}ms across ${input.supabaseOperations.length} calls. Stream checkpoints every 4s add write amplification during generation.`,
    });
  }

  if (input.duplicateExecutions.some((d) => d.count > 3)) {
    const top = input.duplicateExecutions[0];
    recs.push({
      priority: priority++,
      impact: "medium",
      title: "Repeated stage executions detected",
      detail: `\`${top.label}\` ran ${top.count} times (${top.totalMs}ms). Review for redundant work or repair loops.`,
    });
  }

  if (input.unaccountedMs > input.measuredWallMs * 0.15) {
    recs.push({
      priority: priority++,
      impact: "medium",
      title: "Significant untracked time",
      detail: `${input.unaccountedMs}ms (${Math.round((input.unaccountedMs / input.measuredWallMs) * 100)}%) is unaccounted — likely JSON parsing, prompt assembly, or network latency between instrumented boundaries.`,
    });
  }

  const heapPeak = input.memorySnapshots.reduce(
    (max, s) => (s.heapUsedMb > max ? s.heapUsedMb : max),
    0,
  );
  if (heapPeak > 512) {
    recs.push({
      priority: priority++,
      impact: "medium",
      title: "High heap usage during generation",
      detail: `Peak heap ~${heapPeak} MB. Large project files and prompt context accumulation may pressure GC during long runs.`,
    });
  }

  if (recs.length === 0) {
    recs.push({
      priority: 1,
      impact: "low",
      title: "No critical bottlenecks detected in this run",
      detail: "Run additional profiles (professional vs ultra) to compare stage distributions.",
    });
  }

  return recs;
}

export function getWebsiteProfilerFromBrief(
  brief?: { metadata?: Record<string, unknown> },
): WebsitePipelineProfiler | null {
  const raw = brief?.metadata?.[PIPELINE_PROFILER_KEY];
  return raw instanceof WebsitePipelineProfiler ? raw : null;
}
