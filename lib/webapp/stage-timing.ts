import { logger } from "@/lib/logger";

const LOG_CTX = "app-builder-timing";
const STAGE2_SLOW_MS = 60_000;
const STAGE2_HEARTBEAT_MS = 5_000;

/** What Stage 2 (strategy) is blocked on while elapsed > 60s. */
export type AppBuilderWaitReason =
  | "llm_response"
  | "retry"
  | "json_validation"
  | "repair"
  | "design_engine"
  | "idle";

export type AppBuilderStageId =
  | "template"
  | "idea"
  | "strategy"
  | "design"
  | "assets"
  | "generation"
  | "quality"
  | "seo"
  | "performance"
  | "finalize"
  | "universal-planner"
  | "persist"
  | "done";

/** User-facing stage numbers (Stage 2 = strategy). */
const STAGE_NUMBER: Partial<Record<AppBuilderStageId, number>> = {
  idea: 1,
  strategy: 2,
  design: 3,
  assets: 4,
  generation: 5,
  quality: 6,
  finalize: 7,
};

const PROGRESS_LAYER_TO_STAGE: Record<string, AppBuilderStageId> = {
  template: "template",
  idea: "idea",
  strategy: "strategy",
  design: "design",
  assets: "assets",
  generation: "generation",
  quality: "quality",
  seo: "seo",
  performance: "performance",
  finalize: "finalize",
  done: "done",
  start: "idea",
  planner: "universal-planner",
};

function nowMs() {
  return Date.now();
}

function formatStage(stage: AppBuilderStageId): string {
  const num = STAGE_NUMBER[stage];
  return num != null ? `Stage ${num} (${stage})` : `Stage (${stage})`;
}

/**
 * Diagnostics-only timing tracker for App Builder LayerRunner stages.
 * Does not alter generation behavior.
 */
export class AppBuilderStageTiming {
  readonly runId: string;
  private readonly origin = nowMs();
  private currentStage: AppBuilderStageId | null = null;
  private stageStartedAt = 0;
  private waitingFor: AppBuilderWaitReason = "idle";
  private waitingDetail = "";
  private stage2Heartbeat: ReturnType<typeof setInterval> | null = null;
  private stage2SlowLogged = false;
  private readonly stageDurations = new Map<AppBuilderStageId, number>();
  private strategyLlmRequestCount = 0;
  private strategyPromptChars = 0;
  private strategyResponseChars = 0;

  constructor(runId = `app-${Date.now().toString(36)}`) {
    this.runId = runId;
    logger.info("App Builder timing run started", LOG_CTX, {
      runId: this.runId,
    });
  }

  elapsedMs(from = this.origin): number {
    return Math.max(0, nowMs() - from);
  }

  getCurrentStage(): AppBuilderStageId | null {
    return this.currentStage;
  }

  getWaitingFor(): AppBuilderWaitReason {
    return this.waitingFor;
  }

  getStrategyLlmRequestCount(): number {
    return this.strategyLlmRequestCount;
  }

  /** Observe LayerRunner / API progress lines like `[strategy] Building strategy...`. */
  observeProgress(message: string): void {
    const match = message.match(/^\[([a-z0-9-]+)\]/i);
    if (!match) return;
    const layer = match[1].toLowerCase();
    const stage = PROGRESS_LAYER_TO_STAGE[layer];
    if (!stage) return;
    if (stage === this.currentStage) return;
    this.beginStage(stage, message);
  }

  beginStage(stage: AppBuilderStageId, detail?: string): void {
    if (this.currentStage && this.currentStage !== stage) {
      this.endStage(this.currentStage);
    }
    if (this.currentStage === stage) return;

    this.currentStage = stage;
    this.stageStartedAt = nowMs();
    this.waitingFor = "idle";
    this.waitingDetail = "";
    this.stage2SlowLogged = false;

    logger.info(`${formatStage(stage)} started`, LOG_CTX, {
      runId: this.runId,
      stage,
      stageNumber: STAGE_NUMBER[stage] ?? null,
      elapsedMs: this.elapsedMs(),
      detail: detail ?? null,
    });

    if (stage === "strategy") {
      this.strategyLlmRequestCount = 0;
      this.strategyPromptChars = 0;
      this.strategyResponseChars = 0;
      this.startStage2Watchdog();
    } else {
      this.stopStage2Watchdog();
    }
  }

  endStage(stage: AppBuilderStageId = this.currentStage ?? "done"): void {
    if (this.currentStage !== stage && stage !== "done") {
      // Still allow explicit complete for the named stage.
    }
    const startedAt =
      this.currentStage === stage ? this.stageStartedAt : this.stageStartedAt;
    const durationMs = this.currentStage === stage ? this.elapsedMs(startedAt) : 0;
    if (this.currentStage === stage) {
      this.stageDurations.set(
        stage,
        (this.stageDurations.get(stage) ?? 0) + durationMs,
      );
    }

    logger.info(`${formatStage(stage)} completed`, LOG_CTX, {
      runId: this.runId,
      stage,
      stageNumber: STAGE_NUMBER[stage] ?? null,
      durationMs,
      elapsedMs: this.elapsedMs(),
      lastWaitingFor: this.waitingFor,
      lastWaitingDetail: this.waitingDetail || null,
      ...(stage === "strategy"
        ? {
            strategyLlmRequestCount: this.strategyLlmRequestCount,
            strategyPromptChars: this.strategyPromptChars,
            strategyResponseChars: this.strategyResponseChars,
          }
        : {}),
    });

    if (stage === "strategy") {
      this.stopStage2Watchdog();
    }

    if (this.currentStage === stage) {
      this.currentStage = null;
      this.waitingFor = "idle";
      this.waitingDetail = "";
    }
  }

  setWaitingFor(reason: AppBuilderWaitReason, detail?: string): void {
    const changed =
      reason !== this.waitingFor || (detail ?? "") !== this.waitingDetail;
    this.waitingFor = reason;
    this.waitingDetail = detail ?? "";
    if (this.currentStage === "strategy" && changed) {
      logger.info("Stage 2 (strategy) waiting", LOG_CTX, {
        runId: this.runId,
        waitingFor: reason,
        detail: detail ?? null,
        stageElapsedMs: this.elapsedMs(this.stageStartedAt),
        elapsedMs: this.elapsedMs(),
      });
    }
  }

  markLlmRequestSent(detail?: string): void {
    if (this.currentStage === "strategy") {
      this.strategyLlmRequestCount += 1;
      const match = detail?.match(/promptChars=(\d+)/);
      if (match) {
        this.strategyPromptChars += Number(match[1]) || 0;
      }
    }
    logger.info(
      `${formatStage(this.currentStage ?? "strategy")} LLM request sent`,
      LOG_CTX,
      {
        runId: this.runId,
        stage: this.currentStage,
        stageNumber: this.currentStage
          ? (STAGE_NUMBER[this.currentStage] ?? null)
          : null,
        stageElapsedMs: this.stageStartedAt
          ? this.elapsedMs(this.stageStartedAt)
          : null,
        detail: detail ?? null,
        strategyLlmRequestCount: this.strategyLlmRequestCount,
      },
    );
    this.setWaitingFor("llm_response", detail);
  }

  /** First token (stream) or first full response body (non-stream JSON). */
  markFirstResponseReceived(detail?: string): void {
    if (this.currentStage === "strategy") {
      const match = detail?.match(/chars=(\d+)/);
      if (match) {
        this.strategyResponseChars += Number(match[1]) || 0;
      }
    }
    logger.info(
      `${formatStage(this.currentStage ?? "strategy")} first token/response received`,
      LOG_CTX,
      {
        runId: this.runId,
        stage: this.currentStage,
        stageNumber: this.currentStage
          ? (STAGE_NUMBER[this.currentStage] ?? null)
          : null,
        stageElapsedMs: this.stageStartedAt
          ? this.elapsedMs(this.stageStartedAt)
          : null,
        detail: detail ?? null,
        previousWaitingFor: this.waitingFor,
        strategyLlmRequestCount: this.strategyLlmRequestCount,
      },
    );
  }

  finish(extra?: Record<string, unknown>): void {
    if (this.currentStage) {
      this.endStage(this.currentStage);
    }
    this.stopStage2Watchdog();
    logger.info("App Builder timing run finished", LOG_CTX, {
      runId: this.runId,
      totalMs: this.elapsedMs(),
      stageDurationsMs: Object.fromEntries(this.stageDurations),
      ...extra,
    });
  }

  private startStage2Watchdog(): void {
    this.stopStage2Watchdog();
    this.stage2Heartbeat = setInterval(() => {
      if (this.currentStage !== "strategy") {
        this.stopStage2Watchdog();
        return;
      }
      const stageElapsedMs = this.elapsedMs(this.stageStartedAt);
      if (stageElapsedMs < STAGE2_SLOW_MS) return;

      const payload = {
        runId: this.runId,
        stageElapsedMs,
        waitingFor: this.waitingFor,
        waitingDetail: this.waitingDetail || null,
        /** Exact blocker for Stage 2 when > 60s */
        blockedOn:
          this.waitingFor === "idle"
            ? "unknown (idle — check prior log for last phase)"
            : this.waitingFor,
      };

      if (!this.stage2SlowLogged) {
        this.stage2SlowLogged = true;
        logger.warn(
          "Stage 2 (strategy) exceeded 60s — generator is waiting",
          LOG_CTX,
          payload,
        );
      } else {
        logger.warn(
          "Stage 2 (strategy) still slow — still waiting",
          LOG_CTX,
          payload,
        );
      }
    }, STAGE2_HEARTBEAT_MS);
    // Avoid keeping the process alive solely for diagnostics.
    if (typeof this.stage2Heartbeat.unref === "function") {
      this.stage2Heartbeat.unref();
    }
  }

  private stopStage2Watchdog(): void {
    if (this.stage2Heartbeat) {
      clearInterval(this.stage2Heartbeat);
      this.stage2Heartbeat = null;
    }
  }
}
