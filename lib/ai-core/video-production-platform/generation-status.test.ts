import assert from "node:assert/strict";
import { test } from "node:test";
import {
  generationStatusAfterRenderJob,
  generationStatusAfterStoryboard,
} from "@/lib/ai-core/video-production-platform/generation-status";
import { resolveVideoProviderForMode } from "@/lib/ai-core/video-production-platform/providers/types";
import { fetchRemoteToBytes, fetchRemoteVideoToBytes } from "@/lib/ai-core/video-production-platform/media-storage";

test("storyboard generation is not video_rendered", () => {
  assert.equal(generationStatusAfterStoryboard(), "storyboard_ready");
});

test("preview jobs never become video_rendered", () => {
  const status = generationStatusAfterRenderJob({
    mode: "preview",
    status: "completed",
    provider: "preview",
    composite: {
      mimeType: "image/svg+xml",
      url: "data:image/svg+xml;base64,PHN2Zz4=",
    },
  });
  assert.equal(status, "storyboard_ready");
});

test("full render without playable video stays storyboard_ready", () => {
  const status = generationStatusAfterRenderJob({
    mode: "full",
    status: "failed",
    provider: "kling",
    composite: null,
    clips: [],
  });
  assert.equal(status, "storyboard_ready");
});

test("full render with playable clips only stays storyboard_ready", () => {
  const status = generationStatusAfterRenderJob({
    mode: "full",
    status: "completed",
    provider: "kling",
    composite: null,
    clips: [
      {
        mimeType: "video/mp4",
        url: "https://cdn.example/clip.mp4",
        durationSec: 8,
      },
    ],
  });
  assert.equal(status, "storyboard_ready");
});

test("full render with playable mp4 becomes video_rendered", () => {
  const status = generationStatusAfterRenderJob({
    mode: "full",
    status: "completed",
    provider: "kling",
    composite: {
      mimeType: "video/mp4",
      url: "https://cdn.example/out.mp4",
      durationSec: 8,
    },
  });
  assert.equal(status, "video_rendered");
});

test("zero-duration mp4 does not become video_rendered", () => {
  const status = generationStatusAfterRenderJob({
    mode: "full",
    status: "completed",
    provider: "kling",
    composite: {
      mimeType: "video/mp4",
      url: "https://cdn.example/out.mp4",
      durationSec: 0,
    },
  });
  assert.equal(status, "storyboard_ready");
});

test("svg composite never becomes video_rendered", () => {
  const status = generationStatusAfterRenderJob({
    mode: "full",
    status: "completed",
    provider: "kling",
    composite: {
      mimeType: "image/svg+xml",
      url: "https://cdn.example/board.svg",
      durationSec: 8,
    },
  });
  assert.equal(status, "storyboard_ready");
});

test("full render does not fall back to preview provider", () => {
  const prevKling = process.env.KLING_API_KEY;
  const prevRunway = process.env.RUNWAY_API_KEY;
  const prevExternal = process.env.VIDEO_PROVIDER_API_KEY;
  delete process.env.KLING_API_KEY;
  delete process.env.RUNWAY_API_KEY;
  delete process.env.VIDEO_PROVIDER_API_KEY;
  try {
    const resolved = resolveVideoProviderForMode("full");
    assert.notEqual(resolved.providerId === "preview" && !resolved.error, true);
    assert.ok(resolved.error);
    assert.notEqual(resolved.providerId, "preview");
  } finally {
    if (prevKling) process.env.KLING_API_KEY = prevKling;
    if (prevRunway) process.env.RUNWAY_API_KEY = prevRunway;
    if (prevExternal) process.env.VIDEO_PROVIDER_API_KEY = prevExternal;
  }
});

test("fetchRemoteToBytes blocks SSRF targets", async () => {
  assert.equal(await fetchRemoteToBytes("https://localhost/latest/meta-data"), null);
  assert.equal(await fetchRemoteToBytes("https://127.0.0.1/"), null);
  assert.equal(await fetchRemoteToBytes("https://192.168.0.5/x"), null);
  assert.equal(await fetchRemoteToBytes("https://169.254.169.254/latest/meta-data"), null);
  assert.equal(await fetchRemoteToBytes("not-a-url"), null);
  assert.equal(await fetchRemoteToBytes("http://example.com/video.mp4"), null);
  assert.equal(await fetchRemoteVideoToBytes("https://127.0.0.1/"), null);
  assert.equal(await fetchRemoteVideoToBytes("https://169.254.169.254/latest/meta-data"), null);
});
