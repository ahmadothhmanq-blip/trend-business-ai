/**
 * Shared AI / generation timeout defaults.
 * Website Builder runs many sequential model + image calls — keep these generous.
 */

/** Per-request DeepSeek/OpenAI SDK timeout (ms). Override with DEEPSEEK_TIMEOUT_MS. */
export function getDeepSeekTimeoutMs(): number {
  const fromEnv = Number(process.env.DEEPSEEK_TIMEOUT_MS);
  if (Number.isFinite(fromEnv) && fromEnv >= 30_000) {
    return Math.min(fromEnv, 1_200_000);
  }
  // 12 minutes — large website file generation regularly exceeds several minutes.
  return 720_000;
}

/** Next.js / Vercel route maxDuration (seconds) for Website Builder generation. */
export const WEBSITE_BUILDER_MAX_DURATION_SEC = 900;

/** SSE keep-alive interval so proxies do not idle-close long generations. */
export const SSE_HEARTBEAT_INTERVAL_MS = 10_000;

/** Image provider HTTP timeout (ms). Override with IMAGE_GENERATION_TIMEOUT_MS. */
export function getImageGenerationTimeoutMs(): number {
  const fromEnv = Number(process.env.IMAGE_GENERATION_TIMEOUT_MS);
  if (Number.isFinite(fromEnv) && fromEnv >= 30_000) {
    return Math.min(fromEnv, 600_000);
  }
  return 180_000;
}

/** Max user prompt chars accepted by Website Builder APIs (longer prompts are clamped). */
export const MAX_WEBSITE_PROMPT_CHARS = 12_000;

/** Max continue-instruction chars. */
export const MAX_CONTINUE_INSTRUCTION_CHARS = 6_000;

/** Safe image prompt length for DALL·E / Stability / Replicate. */
export const MAX_IMAGE_PROMPT_CHARS = 3_500;

/** Client poll window after SSE disconnect (ms). */
export const CLIENT_STREAM_RECOVERY_POLL_MS = 90_000;

/** Delay between client recovery polls (ms). */
export const CLIENT_STREAM_RECOVERY_INTERVAL_MS = 2_500;

/** Clamp long Website Builder prompts without rejecting the request. */
export function clampWebsitePrompt(prompt: string, max = MAX_WEBSITE_PROMPT_CHARS): string {
  const trimmed = prompt.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max)}\n\n[Prompt truncated for safe generation length.]`;
}

/** Clamp image prompts so providers do not reject oversized requests. */
export function clampImagePrompt(prompt: string, max = MAX_IMAGE_PROMPT_CHARS): string {
  const trimmed = prompt.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max);
}
