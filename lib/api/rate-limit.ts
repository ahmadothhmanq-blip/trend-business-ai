import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { SupabaseClient } from "@supabase/supabase-js";
import { consumeCreditsForUsage } from "@/lib/billing/credits";
import { NextResponse } from "next/server";

export type AiRateLimitResource =
  | "ideas"
  | "market-analysis"
  | "reports"
  | "website-builder"
  | "webapp-builder"
  | "landing-page-builder"
  | "logo-designer"
  | "brand-identity"
  | "image-generator"
  | "video-studio"
  | "content-studio"
  | "business-suite"
  | "ai-agents"
  | "workspace";

const AI_RATE_LIMITS: Record<
  AiRateLimitResource,
  { requests: number; window: "1 m" | "1 h" }
> = {
  ideas: { requests: 10, window: "1 m" },
  "market-analysis": { requests: 10, window: "1 m" },
  reports: { requests: 10, window: "1 m" },
  "website-builder": { requests: 10, window: "1 m" },
  "webapp-builder": { requests: 5, window: "1 m" },
  "landing-page-builder": { requests: 10, window: "1 m" },
  "logo-designer": { requests: 10, window: "1 m" },
  "brand-identity": { requests: 10, window: "1 m" },
  "image-generator": { requests: 10, window: "1 m" },
  "video-studio": { requests: 5, window: "1 m" },
  "content-studio": { requests: 15, window: "1 m" },
  "business-suite": { requests: 10, window: "1 m" },
  "ai-agents": { requests: 10, window: "1 m" },
  workspace: { requests: 10, window: "1 m" },
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

/**
 * Rate limit + usage-based credit deduction for AI generation routes.
 */
export async function enforceAiUsage(
  supabase: SupabaseClient,
  userId: string,
  resource: AiRateLimitResource,
): Promise<NextResponse | null> {
  const rateLimited = await enforceAiRateLimit(userId, resource);
  if (rateLimited) return rateLimited;

  const credits = await consumeCreditsForUsage(supabase, userId, resource, 1);
  if (!credits.ok) {
    const status = credits.code === "INSUFFICIENT_CREDITS" ? 402 : 503;
    return NextResponse.json(
      {
        error: credits.error,
        code: credits.code,
        balance: credits.balance.balance,
      },
      { status },
    );
  }

  return null;
}

const MUTATION_RATE = { requests: 30, window: "1 m" as const };
const mutationMemoryStore = new Map<string, number[]>();
const authMemoryStore = new Map<string, number[]>();
const AUTH_RATE = { requests: 10, window: "1 m" as const };
const WEBHOOK_RATE = { requests: 120, window: "1 m" as const };
const webhookMemoryStore = new Map<string, number[]>();

function enforceKeyedMemoryLimit(
  store: Map<string, number[]>,
  key: string,
  limit: number,
  window: "1 m" | "1 h",
  errorMessage: string,
): NextResponse | null {
  const now = Date.now();
  const duration = windowMs(window);
  const recent = (store.get(key) ?? []).filter((ts) => now - ts < duration);

  if (recent.length >= limit) {
    const reset = recent[0] + duration;
    return NextResponse.json(
      {
        error: errorMessage,
        retryAfter: Math.max(1, Math.ceil((reset - now) / 1000)),
      },
      { status: 429, headers: rateLimitHeaders(limit, 0, reset) },
    );
  }

  recent.push(now);
  store.set(key, recent);
  return null;
}

/**
 * Lightweight rate limiter for non-AI mutation endpoints.
 * 30 requests per minute per user — uses in-memory store (no Upstash needed).
 */
export function enforceMutationRateLimit(userId: string): NextResponse | null {
  return enforceKeyedMemoryLimit(
    mutationMemoryStore,
    userId,
    MUTATION_RATE.requests,
    MUTATION_RATE.window,
    "Too many requests. Please slow down.",
  );
}

/** Auth endpoints: 10 attempts per minute per email (or IP key). */
export function enforceAuthRateLimit(key: string): NextResponse | null {
  return enforceKeyedMemoryLimit(
    authMemoryStore,
    `auth:${key.toLowerCase()}`,
    AUTH_RATE.requests,
    AUTH_RATE.window,
    "Too many authentication attempts. Please try again later.",
  );
}

/** Billing webhook ingress: 120 requests per minute per provider. */
export function enforceWebhookRateLimit(provider: string): NextResponse | null {
  return enforceKeyedMemoryLimit(
    webhookMemoryStore,
    `webhook:${provider}`,
    WEBHOOK_RATE.requests,
    WEBHOOK_RATE.window,
    "Too many webhook requests.",
  );
}
