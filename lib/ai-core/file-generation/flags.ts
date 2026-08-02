/**
 * Wave Scheduler feature flags (Performance Phase 2.x).
 *
 * WB_WAVE_SCHEDULER=0 (default) — serial loop in plugins; scheduler not invoked.
 * WB_WAVE_SCHEDULER=1           — wave planner + scheduler (W2 sections parallel in 2.2).
 */

function envTruthy(name: string): boolean {
  const value = process.env[name];
  return value === "true" || value === "1";
}

function envInt(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

export const fileGenerationFlags = {
  /** Master gate — off by default; production uses legacy serial loop. */
  waveScheduler: envTruthy("WB_WAVE_SCHEDULER"),
  /** Force strict-serial context for every wave (disables W2 snapshot parallelism). */
  strictSerialContext: envTruthy("WB_WAVE_STRICT_CONTEXT"),
} as const;

/** Global LLM concurrency cap for W2 components/sections parallel pool. */
export function resolveLlmConcurrencyCap(): number {
  return envInt("WB_LLM_CONCURRENCY", 4, 1, 6);
}

export function isWaveSchedulerEnabled(): boolean {
  return fileGenerationFlags.waveScheduler;
}

/** @deprecated Use resolveLlmConcurrencyCap — Phase 2.1 serial cap removed in 2.2. */
export function resolvePhase21MaxConcurrency(): number {
  return 1;
}
