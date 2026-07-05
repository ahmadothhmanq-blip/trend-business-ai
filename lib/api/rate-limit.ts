import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

export type AiRateLimitResource = "ideas" | "market-analysis" | "reports" | "website-builder";

const AI_RATE_LIMITS: Record<
  AiRateLimitResource,
  { requests: number; window: "1 m" | "1 h" }
> = {
  ideas: { requests: 10, window: "1 m" },
  "market-analysis": { requests: 10, window: "1 m" },
  reports: { requests: 10, window: "1 m" },
  "website-builder": { requests: 10, window: "1 m" },
};

function isUpstashConfigured(): boolean {
  return Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN,
  );
}

function createLimiter(resource: AiRateLimitResource): Ratelimit {
  const { requests, window } = AI_RATE_LIMITS[resource];

  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: `ratelimit:ai:${resource}`,
    analytics: true,
  });
}

const limiterCache = new Map<AiRateLimitResource, Ratelimit>();
const memoryLimitStore = new Map<string, number[]>();

function getLimiter(resource: AiRateLimitResource): Ratelimit {
  let limiter = limiterCache.get(resource);
  if (!limiter) {
    limiter = createLimiter(resource);
    limiterCache.set(resource, limiter);
  }
  return limiter;
}

function rateLimitHeaders(limit: number, remaining: number, reset: number) {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(Math.max(0, remaining)),
    "X-RateLimit-Reset": String(reset),
    "Retry-After": String(Math.max(1, Math.ceil((reset - Date.now()) / 1000))),
  };
}

function windowMs(window: "1 m" | "1 h") {
  return window === "1 h" ? 60 * 60 * 1000 : 60 * 1000;
}

function enforceMemoryRateLimit(userId: string, resource: AiRateLimitResource) {
  const { requests, window } = AI_RATE_LIMITS[resource];
  const now = Date.now();
  const duration = windowMs(window);
  const key = `${resource}:${userId}`;
  const recent = (memoryLimitStore.get(key) ?? []).filter(
    (timestamp) => now - timestamp < duration,
  );

  if (recent.length >= requests) {
    const reset = recent[0] + duration;
    return NextResponse.json(
      {
        error: "Too many AI requests. Please try again later.",
        retryAfter: Math.max(1, Math.ceil((reset - now) / 1000)),
      },
      {
        status: 429,
        headers: rateLimitHeaders(requests, 0, reset),
      },
    );
  }

  recent.push(now);
  memoryLimitStore.set(key, recent);

  if (memoryLimitStore.size > 5000) {
    for (const [storeKey, timestamps] of memoryLimitStore) {
      const active = timestamps.filter((timestamp) => now - timestamp < duration);
      if (active.length) {
        memoryLimitStore.set(storeKey, active);
      } else {
        memoryLimitStore.delete(storeKey);
      }
    }
  }

  return null;
}

/**
 * Per-user rate limit for AI generation (POST) routes.
 * Uses Upstash when configured; production falls back to per-instance memory limits.
 */
export async function enforceAiRateLimit(
  userId: string,
  resource: AiRateLimitResource,
): Promise<NextResponse | null> {
  if (!isUpstashConfigured()) {
    return process.env.NODE_ENV === "production"
      ? enforceMemoryRateLimit(userId, resource)
      : null;
  }

  const { success, limit, remaining, reset } = await getLimiter(resource).limit(userId);

  if (!success) {
    return NextResponse.json(
      {
        error: "Too many AI requests. Please try again later.",
        retryAfter: Math.max(1, Math.ceil((reset - Date.now()) / 1000)),
      },
      {
        status: 429,
        headers: rateLimitHeaders(limit, remaining, reset),
      },
    );
  }

  return null;
}
