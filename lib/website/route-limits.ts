/**
 * Serverless route duration limits for Website Builder long-running routes.
 * Vercel Pro caps at 300s; self-hosted / Enterprise can allow longer runs.
 */

const VERCEL_DEFAULT_SEC = 300;
const SELF_HOSTED_DEFAULT_SEC = 900;
const MAX_ALLOWED_SEC = 900;

function parseDurationEnv(): number | null {
  const raw = process.env.WEBSITE_STREAM_MAX_DURATION_SEC?.trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 60) return null;
  return Math.min(parsed, MAX_ALLOWED_SEC);
}

/** Resolved maxDuration (seconds) for Website Builder SSE generation route. */
export function resolveWebsiteStreamMaxDurationSec(): number {
  const fromEnv = parseDurationEnv();
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL) return VERCEL_DEFAULT_SEC;
  return SELF_HOSTED_DEFAULT_SEC;
}
