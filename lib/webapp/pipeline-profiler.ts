import { logger } from "@/lib/logger";

const LOG_CTX = "app-builder-pipeline";

export type PipelineStageId =
  | "universal-planner"
  | "planning"
  | "file-generation"
  | "hardener"
  | "validation"
  | "repair-loop"
  | "npm-install"
  | "prisma-generate"
  | "build"
  | "typescript"
  | "eslint"
  | "runtime";

export type PipelineStageRecord = {
  stage: PipelineStageId;
  startMs: number;
  endMs: number;
  durationMs: number;
  /** Extra diagnostic hints (LLM count, file count, etc.) */
  detail?: Record<string, unknown>;
};

type ActiveSpan = {
  stage: PipelineStageId;
  startMs: number;
  detail?: Record<string, unknown>;
};

/**
 * Diagnostics-only pipeline profiler for App Builder E2E.
 * Does not alter generation behavior.
 */
export class AppBuilderPipelineProfiler {
  readonly runId: string;
  private readonly origin = Date.now();
  private readonly stages: PipelineStageRecord[] = [];
  private readonly active = new Map<PipelineStageId, ActiveSpan>();
  /** Accumulated hardener/validation time inside overlapping calls. */
  private hardenerMs = 0;
  private validationMs = 0;
  private repairLlmMs = 0;
  private repairRounds = 0;
  private repairFiles = 0;
  private fileGenLlmCalls = 0;

  constructor(runId = `pipe-${Date.now().toString(36)}`) {
    this.runId = runId;
    logger.info("App Builder pipeline profiler started", LOG_CTX, {
      runId: this.runId,
    });
  }

  now(): number {
    return Date.now();
  }

  elapsed(): number {
    return Math.max(0, this.now() - this.origin);
  }

  start(stage: PipelineStageId, detail?: Record<string, unknown>): void {
    this.active.set(stage, { stage, startMs: this.now(), detail });
    logger.info(`Pipeline stage start: ${stage}`, LOG_CTX, {
      runId: this.runId,
      stage,
      elapsedMs: this.elapsed(),
      ...detail,
    });
  }

  end(stage: PipelineStageId, detail?: Record<string, unknown>): PipelineStageRecord | null {
    const span = this.active.get(stage);
    if (!span) {
      logger.warn(`Pipeline stage end without start: ${stage}`, LOG_CTX, {
        runId: this.runId,
      });
      return null;
    }
    this.active.delete(stage);
    const endMs = this.now();
    const record: PipelineStageRecord = {
      stage,
      startMs: span.startMs,
      endMs,
      durationMs: Math.max(0, endMs - span.startMs),
      detail: { ...span.detail, ...detail },
    };
    this.stages.push(record);
    logger.info(`Pipeline stage end: ${stage}`, LOG_CTX, {
      runId: this.runId,
      stage,
      durationMs: record.durationMs,
      elapsedMs: this.elapsed(),
      ...record.detail,
    });
    return record;
  }

  /** Measure a sync or async block and record it as a stage (replaces prior same-id). */
  async measure<T>(
    stage: PipelineStageId,
    fn: () => Promise<T> | T,
    detail?: Record<string, unknown>,
  ): Promise<T> {
    this.start(stage, detail);
    try {
      return await fn();
    } finally {
      this.end(stage);
    }
  }

  addHardenerMs(ms: number): void {
    this.hardenerMs += Math.max(0, ms);
  }

  addValidationMs(ms: number): void {
    this.validationMs += Math.max(0, ms);
  }

  addRepairLlmMs(ms: number, files = 1): void {
    this.repairLlmMs += Math.max(0, ms);
    this.repairFiles += files;
  }

  markRepairRound(): void {
    this.repairRounds += 1;
  }

  markFileGenLlmCall(): void {
    this.fileGenLlmCalls += 1;
  }

  /**
   * Push accumulated nested hardener / validation / repair-LLM timings.
   * These are exclusive CPU/LLM slices (may sit inside the post-file-gen phase).
   */
  flushNestedPostGenerationStages(): void {
    const now = this.now();
    if (this.hardenerMs > 0) {
      this.stages.push({
        stage: "hardener",
        startMs: now - this.hardenerMs,
        endMs: now,
        durationMs: this.hardenerMs,
        detail: { note: "accumulated hardenGeneratedWebApp CPU time" },
      });
      logger.info("Pipeline stage end: hardener", LOG_CTX, {
        runId: this.runId,
        durationMs: this.hardenerMs,
      });
    }
    if (this.validationMs > 0) {
      this.stages.push({
        stage: "validation",
        startMs: now - this.validationMs,
        endMs: now,
        durationMs: this.validationMs,
        detail: { note: "accumulated project/contract validation CPU time" },
      });
      logger.info("Pipeline stage end: validation", LOG_CTX, {
        runId: this.runId,
        durationMs: this.validationMs,
      });
    }
    this.stages.push({
      stage: "repair-loop",
      startMs: now - this.repairLlmMs,
      endMs: now,
      durationMs: this.repairLlmMs,
      detail: {
        rounds: this.repairRounds,
        repairedFiles: this.repairFiles,
        note: "LLM regenerate time inside validateAndRepairProject (0 if no repairs)",
      },
    });
    logger.info("Pipeline stage end: repair-loop", LOG_CTX, {
      runId: this.runId,
      durationMs: this.repairLlmMs,
      rounds: this.repairRounds,
      repairedFiles: this.repairFiles,
    });
  }

  getStages(): PipelineStageRecord[] {
    return [...this.stages];
  }

  report(totalMs?: number): {
    totalMs: number;
    rows: Array<{
      stage: PipelineStageId;
      startMs: number;
      endMs: number;
      durationMs: number;
      percent: number;
      detail?: Record<string, unknown>;
    }>;
  } {
    const total = totalMs ?? this.elapsed();
    const rows = this.stages.map((s) => ({
      stage: s.stage,
      startMs: s.startMs,
      endMs: s.endMs,
      durationMs: s.durationMs,
      percent: total > 0 ? Math.round((s.durationMs / total) * 1000) / 10 : 0,
      detail: s.detail,
    }));
    logger.info("App Builder pipeline report", LOG_CTX, {
      runId: this.runId,
      totalMs: total,
      stages: rows,
    });
    return { totalMs: total, rows };
  }
}

const storage: { current: AppBuilderPipelineProfiler | null } = {
  current: null,
};

export function beginAppBuilderPipelineProfiler(
  runId?: string,
): AppBuilderPipelineProfiler {
  const profiler = new AppBuilderPipelineProfiler(runId);
  storage.current = profiler;
  return profiler;
}

export function getActiveAppBuilderPipelineProfiler(): AppBuilderPipelineProfiler | null {
  return storage.current;
}

export function endAppBuilderPipelineProfiler(): AppBuilderPipelineProfiler | null {
  const current = storage.current;
  storage.current = null;
  return current;
}

export function timedHardener<T>(fn: () => T): T {
  const profiler = getActiveAppBuilderPipelineProfiler();
  if (!profiler) return fn();
  const start = profiler.now();
  try {
    return fn();
  } finally {
    profiler.addHardenerMs(profiler.now() - start);
  }
}

export function timedValidation<T>(fn: () => T): T {
  const profiler = getActiveAppBuilderPipelineProfiler();
  if (!profiler) return fn();
  const start = profiler.now();
  try {
    return fn();
  } finally {
    profiler.addValidationMs(profiler.now() - start);
  }
}
