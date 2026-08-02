/** Performance report types for composition-stage profiling (AI Core). */

export type CompositionStageTiming = {
  stage: string;
  durationMs: number;
  meta?: Record<string, string | number | boolean>;
};

export type CompositionLlmCallTiming = {
  stage: string;
  filePath?: string;
  durationMs: number;
  attempt?: number;
  success?: boolean;
};

export type CompositionPerformanceReport = {
  totalDurationMs: number;
  stages: CompositionStageTiming[];
  summary: {
    llmCallCount: number;
    llmTotalMs: number;
  };
  llmCalls: CompositionLlmCallTiming[];
};
