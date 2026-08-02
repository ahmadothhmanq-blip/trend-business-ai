import { performance } from "node:perf_hooks";
import type { PerformanceProfilingReport } from "@/lib/ai-core/performance/website-profiler";

export type E2EStageId =
  | "browser-request"
  | "api-route"
  | "stream-initialization"
  | "ai-core"
  | "pre"
  | "template-selection"
  | "business-analysis"
  | "strategy"
  | "brand"
  | "design-system"
  | "assets"
  | "page-planning"
  | "file-generation"
  | "validation"
  | "finalization"
  | "supabase-writes"
  | "streaming-updates"
  | "api-response"
  | "ui-rendering";

export type E2EStageRecord = {
  id: E2EStageId;
  label: string;
  startMs: number;
  endMs: number;
  durationMs: number;
  sharePercent: number;
  source: "server" | "client" | "derived";
};

export type E2ESseEventRecord = {
  event: string;
  atMs: number;
  bytes: number;
  generationId?: string;
};

export type E2ERetryRecord = {
  label: string;
  atMs: number;
  attempt: number;
};

export type E2EPerformanceReport = {
  runId: string;
  profile?: string;
  promptChars?: number;
  serverStartedAt: number;
  serverWallMs: number;
  clientWallMs?: number;
  stages: E2EStageRecord[];
  sseEvents: E2ESseEventRecord[];
  retries: E2ERetryRecord[];
  pipelineReport?: PerformanceProfilingReport;
  llmCalls: PerformanceProfilingReport["llmCalls"];
  supabaseOperations: PerformanceProfilingReport["supabaseOperations"];
  duplicateExecutions: PerformanceProfilingReport["duplicateExecutions"];
  anomalies: string[];
  recommendations: Array<{
    stage: string;
    durationMs: number;
    sharePercent: number;
    recommendation: string;
  }>;
};

const STAGE_LABELS: Record<E2EStageId, string> = {
  "browser-request": "Browser request",
  "api-route": "API route (auth, validation, stream open)",
  "stream-initialization": "Stream initialization + session",
  "ai-core": "AI Core (layerRunner total)",
  pre: "PRE / Planning & Reasoning Engine",
  "template-selection": "Template selection",
  "business-analysis": "Business analysis",
  strategy: "Strategy",
  brand: "Brand generation",
  "design-system": "Design system",
  assets: "Assets",
  "page-planning": "Page planning",
  "file-generation": "File generation",
  validation: "Validation / quality",
  finalization: "Finalization",
  "supabase-writes": "Supabase writes (persist + checkpoints)",
  "streaming-updates": "Streaming updates (SSE)",
  "api-response": "API response (complete event)",
  "ui-rendering": "UI rendering complete",
};

const PROGRESS_STAGE_MAP: Record<string, E2EStageId> = {
  template: "template-selection",
  "master-planner": "pre",
  "template-intelligence": "template-selection",
  "auto-design": "brand",
  idea: "business-analysis",
  strategy: "strategy",
  design: "design-system",
  assets: "assets",
  generation: "file-generation",
  quality: "validation",
  seo: "validation",
  performance: "validation",
  finalize: "finalization",
};

export class E2EWebsiteProfiler {
  private readonly origin = performance.now();
  private readonly stageStarts = new Map<E2EStageId, number>();
  private readonly stageDurations = new Map<E2EStageId, number>();
  private currentLayerStage: E2EStageId | null = null;
  private layerStageStartedAt = 0;
  readonly sseEvents: E2ESseEventRecord[] = [];
  readonly retries: E2ERetryRecord[] = [];

  constructor(
    readonly runId: string,
    readonly serverStartedAt = Date.now(),
  ) {}

  elapsedMs(): number {
    return Math.round(performance.now() - this.origin);
  }

  recordDuration(id: E2EStageId, durationMs: number) {
    this.stageDurations.set(id, (this.stageDurations.get(id) ?? 0) + durationMs);
  }

  markStart(id: E2EStageId) {
    if (!this.stageStarts.has(id)) {
      this.stageStarts.set(id, this.elapsedMs());
    }
  }

  markEnd(id: E2EStageId) {
    const start = this.stageStarts.get(id);
    if (start === undefined) return;
    const duration = Math.max(0, this.elapsedMs() - start);
    this.stageDurations.set(id, (this.stageDurations.get(id) ?? 0) + duration);
  }

  recordRetry(label: string, attempt: number) {
    this.retries.push({ label, attempt, atMs: this.elapsedMs() });
  }

  recordSseEvent(event: string, bytes: number, generationId?: string) {
    this.sseEvents.push({
      event,
      atMs: this.elapsedMs(),
      bytes,
      generationId,
    });
    if (event !== "ping") {
      this.markStart("streaming-updates");
    }
  }

  /** Parse `[layer] message` progress lines from generateWebsite. */
  handleProgressMessage(message: string) {
    const match = message.match(/^\[([^\]]+)\]/);
    if (!match) return;
    const layer = match[1]!;
    const mapped = PROGRESS_STAGE_MAP[layer];
    if (!mapped) return;

    if (this.currentLayerStage && this.currentLayerStage !== mapped) {
      const elapsed = Math.max(0, this.elapsedMs() - this.layerStageStartedAt);
      this.stageDurations.set(
        this.currentLayerStage,
        (this.stageDurations.get(this.currentLayerStage) ?? 0) + elapsed,
      );
    }

    if (this.currentLayerStage !== mapped) {
      this.currentLayerStage = mapped;
      this.layerStageStartedAt = this.elapsedMs();
      this.markStart(mapped);
    }

    if (layer === "master-planner" || layer === "template") {
      this.markStart("pre");
    }
    if (layer === "template" || layer === "template-intelligence") {
      this.markStart("template-selection");
    }
  }

  finalizeLayerStages() {
    if (!this.currentLayerStage) return;
    const elapsed = Math.max(0, this.elapsedMs() - this.layerStageStartedAt);
    this.stageDurations.set(
      this.currentLayerStage,
      (this.stageDurations.get(this.currentLayerStage) ?? 0) + elapsed,
    );
    this.currentLayerStage = null;
  }

  mergePipelineReport(report: PerformanceProfilingReport) {
    const planningMs =
      (report.llmByStage["dynamic-plan"]?.durationMs ?? 0) +
      (report.llmByStage["blueprint"]?.durationMs ?? 0) +
      (report.llmByStage["generateJson"]?.durationMs ?? 0);
    if (planningMs > 0) {
      this.stageDurations.set(
        "page-planning",
        Math.max(this.stageDurations.get("page-planning") ?? 0, planningMs),
      );
    }
    const fileGenMs = report.llmByStage["file-generation"]?.durationMs ?? 0;
    if (fileGenMs > 0) {
      this.stageDurations.set(
        "file-generation",
        Math.max(this.stageDurations.get("file-generation") ?? 0, fileGenMs),
      );
    }
    const supaTotal = report.supabaseOperations.reduce((s, e) => s + e.durationMs, 0);
    if (supaTotal > 0) {
      this.stageDurations.set("supabase-writes", supaTotal);
    }
  }

  toReport(input: {
    pipelineReport?: PerformanceProfilingReport;
    clientStages?: Partial<Record<E2EStageId, number>>;
    profile?: string;
    promptChars?: number;
  }): E2EPerformanceReport {
    if (input.pipelineReport) {
      this.mergePipelineReport(input.pipelineReport);
    }
    this.finalizeLayerStages();
    this.markEnd("streaming-updates");

    const wallMs =
      input.clientStages?.["browser-request"] ??
      input.clientStages?.["ui-rendering"] ??
      this.elapsedMs();

    const stageIds = Object.keys(STAGE_LABELS) as E2EStageId[];
    let cursor = 0;
    const stages: E2EStageRecord[] = stageIds.map((id) => {
      const durationMs =
        input.clientStages?.[id] ?? this.stageDurations.get(id) ?? 0;
      const startMs = cursor;
      const endMs = cursor + durationMs;
      cursor = endMs;
      return {
        id,
        label: STAGE_LABELS[id],
        startMs,
        endMs,
        durationMs,
        sharePercent: wallMs > 0 ? Math.round((durationMs / wallMs) * 1000) / 10 : 0,
        source: input.clientStages?.[id] !== undefined ? "client" : "server",
      };
    });

    const anomalies: string[] = [];
    const pipeline = input.pipelineReport;

    if (pipeline) {
      for (const dup of pipeline.duplicateExecutions.filter((d) => d.count > 1).slice(0, 10)) {
        anomalies.push(`Repeated operation: \`${dup.label}\` ×${dup.count} (${dup.totalMs}ms)`);
      }
      const fileGen = pipeline.llmByStage["file-generation"];
      if (fileGen && fileGen.count > 1) {
        anomalies.push(
          `Sequential file LLM: ${fileGen.count} calls, ${fileGen.durationMs}ms, ${fileGen.promptChars} prompt chars`,
        );
      }
      if (pipeline.unaccountedMs > wallMs * 0.1) {
        anomalies.push(
          `Untracked server time: ${pipeline.unaccountedMs}ms (JSON parse, prompt build, network gaps)`,
        );
      }
    }

    for (const retry of this.retries) {
      anomalies.push(`Retry: ${retry.label} attempt ${retry.attempt} at ${retry.atMs}ms`);
    }

    const sseProgress = this.sseEvents.filter((e) => e.event === "progress").length;
    if (sseProgress > 20) {
      anomalies.push(`${sseProgress} SSE progress events — client re-renders on each message`);
    }

    const recommendations = stages
      .filter((s) => s.durationMs > 0)
      .sort((a, b) => b.durationMs - a.durationMs)
      .slice(0, 12)
      .map((s) => ({
        stage: s.label,
        durationMs: s.durationMs,
        sharePercent: s.sharePercent,
        recommendation: recommendationFor(s.id),
      }));

    return {
      runId: this.runId,
      profile: input.profile,
      promptChars: input.promptChars,
      serverStartedAt: this.serverStartedAt,
      serverWallMs: this.elapsedMs(),
      clientWallMs: input.clientStages?.["ui-rendering"],
      stages,
      sseEvents: this.sseEvents,
      retries: this.retries,
      pipelineReport: pipeline,
      llmCalls: pipeline?.llmCalls ?? [],
      supabaseOperations: pipeline?.supabaseOperations ?? [],
      duplicateExecutions: pipeline?.duplicateExecutions ?? [],
      anomalies,
      recommendations,
    };
  }
}

function recommendationFor(id: E2EStageId): string {
  switch (id) {
    case "file-generation":
      return "CRITICAL — batch or parallelize per-file LLM calls";
    case "page-planning":
      return "Skip redundant blueprint when PRE plan + upstream artifacts exist";
    case "strategy":
      return "Cache strategy for continue/regenerate modes";
    case "supabase-writes":
      return "Reduce checkpoint frequency; batch writes";
    case "streaming-updates":
      return "Throttle client preview bumps (already 4s in UI)";
    case "api-route":
      return "Auth + rate limit + parent context load — cache user settings";
    case "ui-rendering":
      return "Defer heavy preview rebuild until complete event";
    default:
      return "Monitor — no optimization applied in this profiling pass";
  }
}

export function formatE2EMarkdownReport(report: E2EPerformanceReport): string {
  const wall =
    report.clientWallMs ?? report.serverWallMs;
  const lines = [
    "# Website Builder — End-to-End Performance Report",
    "",
    `**Run ID:** ${report.runId}`,
    `**Profile:** ${report.profile ?? "default"}`,
    `**Total wall time:** ${wall}ms (${(wall / 1000).toFixed(1)}s)`,
    `**Server time:** ${report.serverWallMs}ms`,
    report.clientWallMs
      ? `**Client time (fetch → UI apply):** ${report.clientWallMs}ms`
      : "",
    `**LLM calls:** ${report.llmCalls.length}`,
    `**Supabase ops:** ${report.supabaseOperations.length}`,
    `**SSE events:** ${report.sseEvents.length}`,
    "",
    "## Stage Timeline",
    "",
    "| Stage | Start (ms) | End (ms) | Duration (ms) | % | Source |",
    "|-------|-----------|---------|---------------|---|--------|",
  ].filter(Boolean);

  for (const s of report.stages) {
    if (s.durationMs === 0 && s.id !== "browser-request") continue;
    lines.push(
      `| ${s.label} | ${s.startMs} | ${s.endMs} | ${s.durationMs} | ${s.sharePercent}% | ${s.source} |`,
    );
  }

  lines.push("", "## Stage | Duration | % of Total | Recommendation", "");
  for (const r of report.recommendations) {
    lines.push(
      `| ${r.stage} | ${r.durationMs}ms | ${r.sharePercent}% | ${r.recommendation} |`,
    );
  }

  if (report.llmCalls.length) {
    lines.push("", "## Every LLM Call", "");
    for (const call of report.llmCalls) {
      lines.push(
        `- **${call.stage}**${call.filePath ? ` · ${call.filePath}` : ""}: ${call.durationMs}ms · attempt ${call.attempt} · ${call.promptChars ?? 0} chars`,
      );
    }
  }

  if (report.supabaseOperations.length) {
    lines.push("", "## Every Database Operation", "");
    for (const op of report.supabaseOperations) {
      lines.push(`- **${op.label}**: ${op.durationMs}ms`);
    }
  }

  if (report.sseEvents.length) {
    lines.push("", "## SSE Events (sample)", "");
    for (const evt of report.sseEvents.filter((e) => e.event !== "ping").slice(0, 30)) {
      lines.push(`- \`${evt.event}\` @ ${evt.atMs}ms (${evt.bytes} bytes)`);
    }
    if (report.sseEvents.length > 30) {
      lines.push(`- … and ${report.sseEvents.length - 30} more events`);
    }
  }

  if (report.anomalies.length) {
    lines.push("", "## Anomalies", "");
    for (const a of report.anomalies) {
      lines.push(`- ${a}`);
    }
  }

  return lines.join("\n");
}
