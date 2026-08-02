/**
 * Adaptive Smart Context Engine — feature flags (Performance Phase 2.5).
 *
 * WB_SMART_CONTEXT=0 (default) — legacy full-context prompts.
 * WB_SMART_CONTEXT=1           — dependency-aware minimal context resolution.
 * WB_CONTEXT_CHAR_LIMIT=3500   — per-file char cap (default 3500, matches truncateForContext).
 * WB_CONTEXT_CHAR_BUDGET=0     — optional total char budget (0 = unlimited).
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

export const contextEngineFlags = {
  get smartContext() {
    return envTruthy("WB_SMART_CONTEXT");
  },
} as const;

export function isSmartContextEnabled(): boolean {
  return envTruthy("WB_SMART_CONTEXT");
}

export function resolveContextCharLimit(): number {
  return envInt("WB_CONTEXT_CHAR_LIMIT", 3500, 500, 12000);
}

export function resolveContextCharBudget(): number {
  return envInt("WB_CONTEXT_CHAR_BUDGET", 0, 0, 200_000);
}
