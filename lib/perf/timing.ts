/**
 * Performance timing helpers for slow-request detection.
 * Stateless and safe for horizontal scaling (logs only; no shared memory).
 */

import { logger } from "@/lib/logger";

export async function withTiming<T>(
  name: string,
  fn: () => Promise<T>,
  context = "perf",
  slowMs = 1000,
): Promise<T> {
  const start = performance.now();
  try {
    return await fn();
  } finally {
    const durationMs = Math.round(performance.now() - start);
    const data = { name, durationMs };
    if (durationMs >= slowMs) {
      logger.warn(`Slow operation: ${name}`, context, data);
    } else {
      logger.debug(`Timed: ${name}`, context, data);
    }
  }
}

export function startTimer() {
  const start = performance.now();
  return {
    ms() {
      return Math.round(performance.now() - start);
    },
  };
}
