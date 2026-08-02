import { Redis } from "@upstash/redis";
import { isDistributedRateLimitConfigured } from "@/lib/env";

export type UpstashPingResult = {
  ok: boolean;
  latencyMs?: number;
  error?: string;
};

let redisClient: Redis | null = null;

/** Read Upstash credentials from env (never log values). */
export function getUpstashEnv(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim();
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim();
  if (!url || !token) return null;
  if (!url.startsWith("https://")) {
    throw new Error("UPSTASH_REDIS_REST_URL must be an https:// REST endpoint");
  }
  return { url, token };
}

export function isUpstashRedisConfigured(): boolean {
  return isDistributedRateLimitConfigured();
}

/**
 * Shared Upstash Redis client for Website Builder rate limiting.
 * Configures automatic retries for transient network errors.
 */
export function getUpstashRedis(): Redis | null {
  if (!isUpstashRedisConfigured()) return null;

  if (!redisClient) {
    const env = getUpstashEnv();
    if (!env) return null;

    redisClient = new Redis({
      url: env.url,
      token: env.token,
      retry: {
        retries: 3,
        backoff: (retryCount) => Math.min(Math.exp(retryCount) * 50, 2000),
      },
    });
  }

  return redisClient;
}

/** Reset client (tests only). */
export function resetUpstashRedisForTests(): void {
  redisClient = null;
}

/**
 * Execute an Upstash operation with graceful in-memory fallback on failure.
 * Website Builder routes continue when Redis is temporarily unavailable.
 */
export async function executeWithUpstashFallback<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  label: string,
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    console.warn(
      `[upstash] ${label} unavailable — using memory fallback`,
      error instanceof Error ? error.message : error,
    );
    return fallback();
  }
}

/** Lightweight connectivity probe — PING via SET/GET round-trip. */
export async function pingUpstashRedis(): Promise<UpstashPingResult> {
  const redis = getUpstashRedis();
  if (!redis) {
    return { ok: false, error: "UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN unset" };
  }

  const started = Date.now();
  const probeKey = `health:ping:${Date.now()}`;

  try {
    await redis.set(probeKey, "1", { ex: 10 });
    const value = await redis.get(probeKey);
    if (value !== "1") {
      return { ok: false, error: "Redis probe read mismatch" };
    }
    await redis.del(probeKey);
    return { ok: true, latencyMs: Date.now() - started };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}
