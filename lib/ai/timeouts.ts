/**
 * Shared AI / generation timeout defaults.
 * Website Builder runs many sequential model calls — keep these generous.
 */

/** Per-request DeepSeek/OpenAI SDK timeout (ms). Override with DEEPSEEK_TIMEOUT_MS. */
export function getDeepSeekTimeoutMs(): number {
  const fromEnv = Number(process.env.DEEPSEEK_TIMEOUT_MS);
  if (Number.isFinite(fromEnv) && fromEnv >= 30_000) {
    return Math.min(fromEnv, 900_000);
  }
  // 10 minutes — large website file generation regularly exceeds 2 minutes.
  return 600_000;
}

/** Next.js / Vercel route maxDuration (seconds) for Website Builder generation. */
export const WEBSITE_BUILDER_MAX_DURATION_SEC = 800;

/** SSE keep-alive interval so proxies do not idle-close long generations. */
export const SSE_HEARTBEAT_INTERVAL_MS = 15_000;
