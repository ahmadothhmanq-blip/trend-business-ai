import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  enforceAiRateLimit,
  enforceMutationRateLimit,
  enforceMutationRateLimitAsync,
} from "@/lib/api/rate-limit";
import { resetUpstashRedisForTests } from "@/lib/api/upstash-redis";

const ORIGINAL_ENV = { ...process.env };

function restoreEnv() {
  for (const key of Object.keys(process.env)) {
    if (!(key in ORIGINAL_ENV)) delete process.env[key];
  }
  for (const [key, value] of Object.entries(ORIGINAL_ENV)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  resetUpstashRedisForTests();
}

describe("rate-limit memory fallback", () => {
  afterEach(restoreEnv);

  it("allows AI requests without Upstash when not in production", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const blocked = await enforceAiRateLimit("user-dev-1", "website-builder");
    assert.equal(blocked, null);
  });

  it("enforces mutation limits in memory when Upstash is unset", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const userId = `memory-mutation-${Date.now()}`;
    let blocked: Response | null = null;

    for (let i = 0; i < 31; i++) {
      blocked = await enforceMutationRateLimitAsync(userId);
      if (blocked) break;
    }

    assert.ok(blocked);
    assert.equal(blocked!.status, 429);
  });

  it("uses memory path synchronously for mutation limits", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    const userId = `sync-mutation-${Date.now()}`;
    let blocked: Response | null = null;

    for (let i = 0; i < 31; i++) {
      blocked = enforceMutationRateLimit(userId);
      if (blocked) break;
    }

    assert.ok(blocked);
    assert.equal(blocked!.status, 429);
  });

  it("continues Website Builder mutations when Upstash env is invalid", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://invalid-host.example";
    process.env.UPSTASH_REDIS_REST_TOKEN = "invalid-token";

    const blocked = await enforceMutationRateLimitAsync(
      `wb-fallback-${Date.now()}`,
    );
    assert.equal(blocked, null);
  });
});
