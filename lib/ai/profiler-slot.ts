import { AsyncLocalStorage } from "node:async_hooks";

/** Minimal LLM profiler hook — implemented by AI Core `WebsitePipelineProfiler`. */
export type LlmProfilerRecord = {
  stage: string;
  filePath?: string;
  durationMs: number;
  attempt: number;
  success: boolean;
  promptChars?: number;
};

export type WebsiteProfilerSlot = {
  recordLlm(event: LlmProfilerRecord): void;
};

const profilerStorage = new AsyncLocalStorage<WebsiteProfilerSlot>();

export function runWithWebsiteProfilerSlot<T>(
  profiler: WebsiteProfilerSlot,
  fn: () => Promise<T>,
): Promise<T> {
  return profilerStorage.run(profiler, fn);
}

export function getActiveWebsiteProfilerSlot(): WebsiteProfilerSlot | null {
  return profilerStorage.getStore() ?? null;
}
