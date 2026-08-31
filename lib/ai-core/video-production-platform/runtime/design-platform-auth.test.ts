import assert from "node:assert/strict";
import { test } from "node:test";
import {
  authorizeVideoStudioDesignPlatform,
} from "@/lib/ai-core/video-production-platform/runtime/design-platform-auth";
import { GET } from "@/app/api/video-studio/design-platform/route";

function requestWith(headers: Record<string, string> = {}, url = "http://localhost/api/video-studio/design-platform") {
  return new Request(url, { method: "GET", headers });
}

test("anonymous design-platform GET is unauthorized before FFmpeg probe", async () => {
  const previous = process.env.VIDEO_STUDIO_CRON_SECRET;
  delete process.env.VIDEO_STUDIO_CRON_SECRET;
  try {
    const access = await authorizeVideoStudioDesignPlatform(requestWith());
    assert.ok(access.response);
    assert.equal(access.response.status, 401);
    const res = await GET(requestWith());
    assert.equal(res.status, 401);
    const body = (await res.json()) as { code?: string };
    assert.equal(body.code, "UNAUTHORIZED");
  } finally {
    if (previous === undefined) delete process.env.VIDEO_STUDIO_CRON_SECRET;
    else process.env.VIDEO_STUDIO_CRON_SECRET = previous;
  }
});

test("wrong service secret is not enough; still requires a user session", async () => {
  const previous = process.env.VIDEO_STUDIO_CRON_SECRET;
  process.env.VIDEO_STUDIO_CRON_SECRET = "unit-test-design-platform-secret";
  try {
    const access = await authorizeVideoStudioDesignPlatform(
      requestWith({ authorization: "Bearer wrong-secret" }),
    );
    assert.ok(access.response);
    assert.equal(access.response.status, 401);
  } finally {
    if (previous === undefined) delete process.env.VIDEO_STUDIO_CRON_SECRET;
    else process.env.VIDEO_STUDIO_CRON_SECRET = previous;
  }
});

test("VIDEO_STUDIO_CRON_SECRET authorizes design-platform without a user session", async () => {
  const previous = process.env.VIDEO_STUDIO_CRON_SECRET;
  process.env.VIDEO_STUDIO_CRON_SECRET = "unit-test-design-platform-secret";
  try {
    const access = await authorizeVideoStudioDesignPlatform(
      requestWith({ authorization: "Bearer unit-test-design-platform-secret" }),
    );
    assert.equal(access.response, null);
    const res = await GET(
      requestWith(
        { authorization: "Bearer unit-test-design-platform-secret" },
        "http://localhost/api/video-studio/design-platform?templateId=missing-template-id",
      ),
    );
    assert.equal(res.status, 404);
  } finally {
    if (previous === undefined) delete process.env.VIDEO_STUDIO_CRON_SECRET;
    else process.env.VIDEO_STUDIO_CRON_SECRET = previous;
  }
});

test("authorized service request can load catalog including FFmpeg capabilities", async () => {
  const previous = process.env.VIDEO_STUDIO_CRON_SECRET;
  process.env.VIDEO_STUDIO_CRON_SECRET = "unit-test-design-platform-secret";
  try {
    const res = await GET(
      requestWith({ authorization: "Bearer unit-test-design-platform-secret" }),
    );
    assert.equal(res.status, 200);
    const body = (await res.json()) as {
      capabilities?: { ffmpegAssembly?: boolean; subtitleBurnIn?: boolean };
    };
    assert.equal(typeof body.capabilities?.ffmpegAssembly, "boolean");
    assert.equal(typeof body.capabilities?.subtitleBurnIn, "boolean");
  } finally {
    if (previous === undefined) delete process.env.VIDEO_STUDIO_CRON_SECRET;
    else process.env.VIDEO_STUDIO_CRON_SECRET = previous;
  }
});
