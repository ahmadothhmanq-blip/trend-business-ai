import { resolveWebsiteStreamMaxDurationSec } from "@/lib/website/route-limits";

/** Seconds before route maxDuration to emit SSE handoff (client switches to durable polling). */
const MIN_HANDOFF_LEAD_SEC = 45;
const MAX_HANDOFF_LEAD_SEC = 90;

/** Minimum client recovery window (25 minutes). */
const MIN_CLIENT_RECOVERY_MS = 25 * 60 * 1000;

/** Buffer after server max duration before giving up client-side recovery. */
const CLIENT_RECOVERY_BUFFER_MS = 10 * 60 * 1000;

function parseClientRecoveryEnv(): number | null {
  const raw = process.env.WEBSITE_STREAM_RECOVERY_POLL_MS?.trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 60_000) return null;
  return Math.min(parsed, 3_600_000);
}

/** Resolved maxDuration (seconds) for the Website Builder SSE route. */
export function getWebsiteStreamMaxDurationSec(): number {
  return resolveWebsiteStreamMaxDurationSec();
}

/**
 * Lead time (seconds) before route timeout when the server emits a handoff event.
 * Gives the client time to switch to DB polling before the platform kills the function.
 */
export function getStreamHandoffLeadSec(maxDurationSec = getWebsiteStreamMaxDurationSec()): number {
  const proportional = Math.floor(maxDurationSec * 0.2);
  return Math.min(MAX_HANDOFF_LEAD_SEC, Math.max(MIN_HANDOFF_LEAD_SEC, proportional));
}

/** Milliseconds from stream start until handoff should fire. */
export function getStreamHandoffDelayMs(maxDurationSec = getWebsiteStreamMaxDurationSec()): number {
  const leadSec = getStreamHandoffLeadSec(maxDurationSec);
  return Math.max(30_000, (maxDurationSec - leadSec) * 1000);
}

/**
 * Client poll window after SSE disconnect or handoff.
 * Defaults to server max duration + 10 min buffer, minimum 25 minutes.
 */
export function getClientStreamRecoveryPollMs(
  maxDurationSec = getWebsiteStreamMaxDurationSec(),
): number {
  const fromEnv = parseClientRecoveryEnv();
  if (fromEnv) return fromEnv;
  const serverMs = maxDurationSec * 1000;
  return Math.max(MIN_CLIENT_RECOVERY_MS, serverMs + CLIENT_RECOVERY_BUFFER_MS);
}
