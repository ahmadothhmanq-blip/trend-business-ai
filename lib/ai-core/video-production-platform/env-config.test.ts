import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isFfmpegPathConfigured,
  isFullRenderProviderConfigured,
  isVideoStudioStrictModeConfigured,
  validateVideoStudioProductionEnv,
  videoStudioProductionRenderBlockReason,
} from "@/lib/ai-core/video-production-platform/env-config";

const KEYS = [
  "VERCEL_ENV",
  "GEMINI_API_KEY",
  "VEO_API_KEY",
  "KLING_API_KEY",
  "RUNWAY_API_KEY",
  "VIDEO_PROVIDER_API_KEY",
  "VIDEO_PROVIDER_BASE_URL",
  "HEYGEN_API_KEY",
  "ELEVENLABS_API_KEY",
  "OPENAI_API_KEY",
  "FFMPEG_PATH",
  "FFMPEG_BINARY",
  "VIDEO_PROVIDER_STRICT",
  "VIDEO_STUDIO_STRICT",
  "VIDEO_STUDIO_CRON_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

function snapshotEnv(): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {};
  for (const key of KEYS) out[key] = process.env[key];
  return out;
}

function restoreEnv(prev: Record<string, string | undefined>) {
  for (const key of KEYS) {
    const value = prev[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function clearVideoStudioEnv() {
  for (const key of KEYS) delete process.env[key];
}

function setProductionReadyEnv() {
  process.env.KLING_API_KEY = "kling-test";
  process.env.ELEVENLABS_API_KEY = "eleven-test";
  process.env.FFMPEG_PATH = "/usr/bin/ffmpeg";
  process.env.VIDEO_PROVIDER_STRICT = "1";
  process.env.VIDEO_STUDIO_CRON_SECRET = "cron-secret";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role";
}

test("development missing config is warnings only — paid render is not blocked", () => {
  const prev = snapshotEnv();
  try {
    clearVideoStudioEnv();
    const env = validateVideoStudioProductionEnv();
    assert.equal(env.production, false);
    assert.equal(env.ok, true);
    assert.equal(env.blockers.length, 0);
    assert.ok(env.warnings.length > 0);
    assert.equal(videoStudioProductionRenderBlockReason(), null);
  } finally {
    restoreEnv(prev);
  }
});

test("production missing config fails closed with blockers", () => {
  const prev = snapshotEnv();
  try {
    clearVideoStudioEnv();
    const env = validateVideoStudioProductionEnv({ forceProduction: true });
    assert.equal(env.production, true);
    assert.equal(env.ok, false);
    assert.ok(env.blockers.some((b) => /full-render video provider/i.test(b)));
    assert.ok(env.blockers.some((b) => /FFMPEG_PATH/i.test(b)));
    assert.ok(env.blockers.some((b) => /VIDEO_PROVIDER_STRICT/i.test(b)));
    assert.ok(env.blockers.some((b) => /VIDEO_STUDIO_CRON_SECRET/i.test(b)));
    assert.ok(env.blockers.some((b) => /SUPABASE_SERVICE_ROLE_KEY/i.test(b)));
    assert.ok(env.blockers.some((b) => /TTS API key/i.test(b)));
    assert.match(videoStudioProductionRenderBlockReason({ forceProduction: true }) || "", /FFMPEG_PATH|provider|STRICT/);
  } finally {
    restoreEnv(prev);
  }
});

test("production ready env passes and does not block paid render", () => {
  const prev = snapshotEnv();
  try {
    clearVideoStudioEnv();
    setProductionReadyEnv();
    const env = validateVideoStudioProductionEnv({ forceProduction: true });
    assert.equal(env.ok, true);
    assert.equal(env.blockers.length, 0);
    assert.equal(isFullRenderProviderConfigured(), true);
    assert.equal(isFfmpegPathConfigured(), true);
    assert.equal(isVideoStudioStrictModeConfigured(), true);
    assert.equal(videoStudioProductionRenderBlockReason({ forceProduction: true }), null);
  } finally {
    restoreEnv(prev);
  }
});

test("HeyGen alone is not a full-render provider", () => {
  const prev = snapshotEnv();
  try {
    clearVideoStudioEnv();
    process.env.HEYGEN_API_KEY = "heygen";
    assert.equal(isFullRenderProviderConfigured(), false);
    const env = validateVideoStudioProductionEnv({ forceProduction: true });
    assert.equal(env.ok, false);
    assert.ok(env.blockers.some((b) => /full-render video provider/i.test(b)));
  } finally {
    restoreEnv(prev);
  }
});

test("VIDEO_PROVIDER_STRICT=1 is required in production even when other keys exist", () => {
  const prev = snapshotEnv();
  try {
    clearVideoStudioEnv();
    setProductionReadyEnv();
    delete process.env.VIDEO_PROVIDER_STRICT;
    const env = validateVideoStudioProductionEnv({ forceProduction: true });
    assert.equal(env.ok, false);
    assert.ok(env.blockers.some((b) => /VIDEO_PROVIDER_STRICT/i.test(b)));
  } finally {
    restoreEnv(prev);
  }
});
