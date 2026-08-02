import { AsyncLocalStorage } from "node:async_hooks";
import type { E2EWebsiteProfiler } from "@/lib/ai-core/performance/e2e-profiler";

const e2eStorage = new AsyncLocalStorage<E2EWebsiteProfiler>();

export function runWithE2EProfiler<T>(
  profiler: E2EWebsiteProfiler,
  fn: () => Promise<T>,
): Promise<T> {
  return e2eStorage.run(profiler, fn);
}

export function getActiveE2EProfiler(): E2EWebsiteProfiler | null {
  return e2eStorage.getStore() ?? null;
}
