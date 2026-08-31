import { AsyncLocalStorage } from "node:async_hooks";
import {
  AppBuilderStageTiming,
  type AppBuilderWaitReason,
} from "@/lib/webapp/stage-timing";

const storage = new AsyncLocalStorage<AppBuilderStageTiming>();

export function runWithAppBuilderTiming<T>(
  fn: (timing: AppBuilderStageTiming) => Promise<T>,
  timing = new AppBuilderStageTiming(),
): Promise<T> {
  return storage.run(timing, () => fn(timing));
}

export function getActiveAppBuilderTiming(): AppBuilderStageTiming | null {
  return storage.getStore() ?? null;
}

/** No-op safe helpers for adapters (diagnostics only). */
export function appBuilderTimingMarkLlmSent(detail?: string): void {
  getActiveAppBuilderTiming()?.markLlmRequestSent(detail);
}

export function appBuilderTimingMarkFirstResponse(detail?: string): void {
  getActiveAppBuilderTiming()?.markFirstResponseReceived(detail);
}

export function appBuilderTimingSetWaiting(
  reason: AppBuilderWaitReason,
  detail?: string,
): void {
  getActiveAppBuilderTiming()?.setWaitingFor(reason, detail);
}
