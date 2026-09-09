import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextResponse } from "next/server";
import { authorizeDesignPlatformRequest } from "@/lib/webapp/design-platform-api-access";
import { API_ERROR_CODES } from "@/lib/i18n/api-errors";

function unauthorizedAuth() {
  return {
    supabase: {} as never,
    user: null,
    response: NextResponse.json(
      { error: "Unauthorized", code: API_ERROR_CODES.UNAUTHORIZED },
      { status: 401 },
    ),
  };
}

function authenticatedAuth(userId = "user-design-1") {
  return {
    supabase: {} as never,
    user: { id: userId } as never,
    response: null,
  };
}

describe("design-platform API access", () => {
  it("returns 401 when the caller is unauthenticated", async () => {
    const result = await authorizeDesignPlatformRequest({
      requireUser: async () => unauthorizedAuth(),
      enforceRateLimit: async () => null,
    });

    assert.equal(result.ok, false);
    assert.equal(result.response.status, 401);
    const body = (await result.response.json()) as { code?: string };
    assert.equal(body.code, API_ERROR_CODES.UNAUTHORIZED);
  });

  it("does not call the rate limiter when unauthenticated", async () => {
    let rateLimitCalls = 0;
    const result = await authorizeDesignPlatformRequest({
      requireUser: async () => unauthorizedAuth(),
      enforceRateLimit: async () => {
        rateLimitCalls += 1;
        return null;
      },
    });

    assert.equal(result.ok, false);
    assert.equal(result.response.status, 401);
    assert.equal(rateLimitCalls, 0);
  });

  it("returns the rate-limit response when authenticated but limited", async () => {
    const limited = NextResponse.json(
      { error: "Too many requests. Please slow down." },
      { status: 429 },
    );
    const result = await authorizeDesignPlatformRequest({
      requireUser: async () => authenticatedAuth("user-rl-1"),
      enforceRateLimit: async (userId) => {
        assert.equal(userId, "user-rl-1");
        return limited;
      },
    });

    assert.equal(result.ok, false);
    assert.equal(result.user?.id, "user-rl-1");
    assert.equal(result.response.status, 429);
  });

  it("allows authenticated callers that pass the rate limiter", async () => {
    const result = await authorizeDesignPlatformRequest({
      requireUser: async () => authenticatedAuth("user-ok-1"),
      enforceRateLimit: async () => null,
    });

    assert.equal(result.ok, true);
    assert.equal(result.user.id, "user-ok-1");
    assert.equal(result.response, null);
  });

  it("propagates 403 authorization failures from the rate-limit layer when provided", async () => {
    const forbidden = NextResponse.json(
      { error: "Forbidden", code: API_ERROR_CODES.FORBIDDEN },
      { status: 403 },
    );
    const result = await authorizeDesignPlatformRequest({
      requireUser: async () => authenticatedAuth("user-forbid-1"),
      enforceRateLimit: async () => forbidden,
    });

    assert.equal(result.ok, false);
    assert.equal(result.response.status, 403);
  });

  it("wires GET and POST handlers behind authorizeDesignPlatformRequest", async () => {
    const { readFileSync } = await import("node:fs");
    const { join, dirname } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
    const routeSrc = readFileSync(
      join(root, "app/api/webapp-builder/design-platform/route.ts"),
      "utf8",
    );
    assert.match(routeSrc, /authorizeDesignPlatformRequest/);
    const getBlock = routeSrc.slice(routeSrc.indexOf("export async function GET"));
    const postBlock = routeSrc.slice(routeSrc.indexOf("export async function POST"));
    assert.match(getBlock, /authorizeDesignPlatformRequest\(\)/);
    assert.match(postBlock, /authorizeDesignPlatformRequest\(\)/);
    assert.match(getBlock, /if\s*\(\s*!access\.ok\s*\)\s*return\s+access\.response/);
    assert.match(postBlock, /if\s*\(\s*!access\.ok\s*\)\s*return\s+access\.response/);
  });
});
