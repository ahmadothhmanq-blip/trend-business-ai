/**
 * Safe Parallel Repair Engine — feature flags (Performance Phase 2.4).
 *
 * WB_PARALLEL_REPAIR=0 (default) — legacy serial repair loops.
 * WB_PARALLEL_REPAIR=1           — dependency-aware parallel repair waves.
 * WB_REPAIR_CONCURRENCY=4        — max parallel repairs per wave (default 4).
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

export const repairEngineFlags = {
  parallelRepair: envTruthy("WB_PARALLEL_REPAIR"),
} as const;

export function isParallelRepairEnabled(): boolean {
  return repairEngineFlags.parallelRepair;
}

export function resolveRepairConcurrencyCap(): number {
  return envInt("WB_REPAIR_CONCURRENCY", 4, 1, 6);
}
