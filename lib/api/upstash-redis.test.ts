import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";
import {
  executeWithUpstashFallback,
  getUpstashEnv,
  getUpstashRedis,
  isUpstashRedisConfigured,
  pingUpstashRedis,
  resetUpstashRedisForTests,
} from "@/lib/api/upstash-redis";

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

describe("upstash-redis env loading", () => {
  afterEach(restoreEnv);

  it("returns null when credentials are unset", () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    assert.equal(getUpstashEnv(), null);
    assert.equal(isUpstashRedisConfigured(), false);
    assert.equal(getUpstashRedis(), null);
  });

  it("rejects non-https REST URLs", () => {
    process.env.UPSTASH_REDIS_REST_URL = "http://insecure.example";
    process.env.UPSTASH_REDIS_REST_TOKEN = "token";
    assert.throws(
      () => getUpstashEnv(),
      /UPSTASH_REDIS_REST_URL must be an https:\/\/ REST endpoint/,
    );
  });

  it("accepts trimmed https credentials without exposing values", () => {
    process.env.UPSTASH_REDIS_REST_URL = "  https://example.upstash.io  ";
    process.env.UPSTASH_REDIS_REST_TOKEN = "  secret-token  ";
    const env = getUpstashEnv();
    assert.ok(env);
    assert.equal(env.url, "https://example.upstash.io");
    assert.equal(env.token, "secret-token");
    assert.equal(isUpstashRedisConfigured(), true);
  });
});

describe("upstash-redis fallback", () => {
  it("returns primary result when operation succeeds", async () => {
    const result = await executeWithUpstashFallback(
      async () => "ok",
      () => "fallback",
      "test-op",
    );
    assert.equal(result, "ok");
  });

  it("falls back when operation throws", async () => {
    const result = await executeWithUpstashFallback(
      async () => {
        throw new Error("redis unavailable");
      },
      () => "memory",
      "test-op",
    );
    assert.equal(result, "memory");
  });
});

describe("upstash-redis connectivity", () => {
  afterEach(restoreEnv);

  it("reports unset credentials on ping", async () => {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    const ping = await pingUpstashRedis();
    assert.equal(ping.ok, false);
    assert.match(ping.error ?? "", /unset/i);
  });
});
