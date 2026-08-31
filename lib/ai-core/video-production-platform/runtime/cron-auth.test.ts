import assert from "node:assert/strict";
import { test } from "node:test";
import { authorizeVideoStudioCron } from "@/lib/ai-core/video-production-platform/runtime/cron-auth";
import { POST } from "@/app/api/video-studio/cron/route";

function requestWith(headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/video-studio/cron", {
    method: "POST",
    headers,
  });
}

test("cron authorization rejects when VIDEO_STUDIO_CRON_SECRET is unset", () => {
  const previous = process.env.VIDEO_STUDIO_CRON_SECRET;
  delete process.env.VIDEO_STUDIO_CRON_SECRET;
  try {
    assert.equal(authorizeVideoStudioCron(requestWith({ authorization: "Bearer anything" })), false);
    assert.equal(authorizeVideoStudioCron(requestWith()), false);
  } finally {
    if (previous === undefined) delete process.env.VIDEO_STUDIO_CRON_SECRET;
    else process.env.VIDEO_STUDIO_CRON_SECRET = previous;
  }
});

test("cron authorization rejects a wrong bearer even when a test secret is set", () => {
  const previous = process.env.VIDEO_STUDIO_CRON_SECRET;
  process.env.VIDEO_STUDIO_CRON_SECRET = "unit-test-cron-secret";
  try {
    assert.equal(authorizeVideoStudioCron(requestWith({ authorization: "Bearer wrong" })), false);
    assert.equal(authorizeVideoStudioCron(requestWith({ authorization: "Bearer unit-test-cron-secret" })), true);
    assert.equal(
      authorizeVideoStudioCron(requestWith({ "x-video-studio-cron-secret": "unit-test-cron-secret" })),
      true,
    );
  } finally {
    if (previous === undefined) delete process.env.VIDEO_STUDIO_CRON_SECRET;
    else process.env.VIDEO_STUDIO_CRON_SECRET = previous;
  }
});

test("POST /api/video-studio/cron returns 401 when secret is unset", async () => {
  const previous = process.env.VIDEO_STUDIO_CRON_SECRET;
  delete process.env.VIDEO_STUDIO_CRON_SECRET;
  try {
    const res = await POST(requestWith());
    assert.equal(res.status, 401);
  } finally {
    if (previous === undefined) delete process.env.VIDEO_STUDIO_CRON_SECRET;
    else process.env.VIDEO_STUDIO_CRON_SECRET = previous;
  }
});

