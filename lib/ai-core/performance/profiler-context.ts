import {
  getActiveWebsiteProfilerSlot,
  runWithWebsiteProfilerSlot,
} from "@/lib/ai/profiler-slot";
import type { WebsitePipelineProfiler } from "@/lib/ai-core/performance/website-profiler";

export function runWithWebsiteProfiler<T>(
  profiler: WebsitePipelineProfiler,
  fn: () => Promise<T>,
): Promise<T> {
  return runWithWebsiteProfilerSlot(profiler, fn);
}

export function getActiveWebsiteProfiler(): WebsitePipelineProfiler | null {
  return getActiveWebsiteProfilerSlot() as WebsitePipelineProfiler | null;
}