import { isRetryableError } from "@/lib/ai/retry";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isRateLimitError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const e = error as { status?: number; message?: string };
  if (e.status === 429) return true;
  const message = String(e.message ?? "").toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("too many requests") ||
    message.includes("429")
  );
}

export type LlmConcurrencyGateOptions = {
  maxConcurrency: number;
  onPause?: (pauseMs: number, reason: string) => void;
};

/**
 * Global in-flight LLM semaphore with adaptive backoff on rate limits.
 * Does not replace per-file validation retries — only gates concurrency.
 */
export class LlmConcurrencyGate {
  private readonly maxConcurrency: number;
  private effectiveConcurrency: number;
  private active = 0;
  private waiters: Array<() => void> = [];
  private pausedUntil = 0;
  private consecutiveRateLimits = 0;
  private readonly onPause?: (pauseMs: number, reason: string) => void;

  constructor(options: LlmConcurrencyGateOptions) {
    this.maxConcurrency = Math.max(1, options.maxConcurrency);
    this.effectiveConcurrency = this.maxConcurrency;
    this.onPause = options.onPause;
  }

  getEffectiveConcurrency(): number {
    return this.effectiveConcurrency;
  }

  private releaseOne(): void {
    this.active = Math.max(0, this.active - 1);
    const next = this.waiters.shift();
    if (next) {
      next();
    }
  }

  private async acquire(): Promise<() => void> {
    while (true) {
      const now = Date.now();
      if (now < this.pausedUntil) {
        await wait(this.pausedUntil - now);
        continue;
      }

      if (this.active < this.effectiveConcurrency) {
        this.active += 1;
        return () => this.releaseOne();
      }

      await new Promise<void>((resolve) => {
        this.waiters.push(resolve);
      });
    }
  }

  private async handleRateLimit(): Promise<void> {
    this.consecutiveRateLimits += 1;
    const pauseMs = Math.min(
      60_000,
      2_000 * 2 ** Math.min(this.consecutiveRateLimits - 1, 4),
    );
    this.pausedUntil = Date.now() + pauseMs;
    this.effectiveConcurrency = Math.max(
      1,
      this.effectiveConcurrency - 1,
    );
    this.onPause?.(pauseMs, "rate-limit");
    await wait(pauseMs);
  }

  private restoreConcurrencyGradually(): void {
    if (this.consecutiveRateLimits === 0) return;
    this.consecutiveRateLimits = 0;
    if (this.effectiveConcurrency < this.maxConcurrency) {
      this.effectiveConcurrency = Math.min(
        this.maxConcurrency,
        this.effectiveConcurrency + 1,
      );
    }
  }

  /**
   * Run an LLM task under the concurrency gate.
   * Re-throws after optional rate-limit cooldown; caller retries remain unchanged.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    const release = await this.acquire();
    try {
      const result = await fn();
      this.restoreConcurrencyGradually();
      return result;
    } catch (error) {
      if (isRateLimitError(error) || isRetryableError(error)) {
        await this.handleRateLimit();
      }
      throw error;
    } finally {
      release();
    }
  }
}
