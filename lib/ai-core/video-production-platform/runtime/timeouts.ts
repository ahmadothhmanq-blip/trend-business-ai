/**
 * Provider job timeouts for async rendering.
 * Temporary poll misses are not failures until the job is eligible and stale.
 */

export const PROVIDER_SUBMISSION_TIMEOUT_MS = 30_000;
export const PROVIDER_POLL_INTERVAL_MS = 5_000;
export const PROVIDER_POLL_TIMEOUT_MS = 8 * 60_000;
export const PROVIDER_MAX_RENDER_DURATION_MS = 15 * 60_000;
export const PROVIDER_STALE_JOB_TIMEOUT_MS = 12 * 60_000;
export const PROVIDER_MAX_RETRY_COUNT = 2;
export const VEO_QUOTA_COOLDOWN_MS = 15 * 60_000;

export function nextPollAt(fromMs = Date.now(), intervalMs = PROVIDER_POLL_INTERVAL_MS): string {
  return new Date(fromMs + intervalMs).toISOString();
}

export function isJobPollDue(input: { nextPollAt?: string | null; nowMs?: number }): boolean {
  if (!input.nextPollAt) return true;
  const due = Date.parse(input.nextPollAt);
  if (!Number.isFinite(due)) return true;
  return (input.nowMs ?? Date.now()) >= due;
}

export function isProviderJobStale(input: {
  startedAt?: string | null;
  submittedAt?: string | null;
  createdAt?: string | null;
  nextPollAt?: string | null;
  nowMs?: number;
  staleAfterMs?: number;
}): boolean {
  const now = input.nowMs ?? Date.now();
  if (!isJobPollDue({ nextPollAt: input.nextPollAt, nowMs: now })) return false;
  const start = Date.parse(input.startedAt || input.submittedAt || input.createdAt || "");
  if (!Number.isFinite(start)) return false;
  return now - start >= (input.staleAfterMs ?? PROVIDER_STALE_JOB_TIMEOUT_MS);
}
