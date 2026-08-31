import assert from "node:assert/strict";
import { test } from "node:test";
import { canTransition } from "@/lib/ai-core/video-production-platform/domain";
import {
  canAssembleAfterQuality,
  inspectArtifactQuality,
} from "@/lib/ai-core/video-production-platform/quality-control";

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

function playableVideo(over: Record<string, unknown> = {}) {
  return {
    id: "vid-1",
    mimeType: "video/mp4",
    url: "https://signed.example/out.mp4",
    durationSec: 8,
    width: 1280,
    height: 720,
    provider: "kling",
    isStub: false,
    bytes: contractMp4(),
    codec: "h264",
    ...over,
  };
}

test("QC PASS for a valid playable artifact", () => {
  const report = inspectArtifactQuality({
    video: playableVideo(),
    expectedDurationSec: 8,
    narrationRequired: false,
    probed: { durationSec: 8, width: 1280, height: 720, codec: "h264" },
    blackFrames: { available: true, blackRatio: 0, note: "No black frames." },
    scenes: [{ artifactId: "vid-1" }],
  });
  assert.equal(report.verdict, "PASS");
  assert.equal(report.ready, true);
  assert.equal(canAssembleAfterQuality(report.verdict), true);
  assert.equal(canTransition("quality_check", "assembling", { qcVerdict: report.verdict }), true);
});

test("QC WARNING for duration mismatch and unresolved codec", () => {
  const report = inspectArtifactQuality({
    video: playableVideo({ durationSec: 8, width: null, height: null, codec: null, bytes: contractMp4() }),
    expectedDurationSec: 20,
    audio: { durationSec: 8, mimeType: "audio/mpeg" },
    probed: { durationSec: 8, width: null, height: null, codec: null },
    scenes: [{ artifactId: "vid-1" }],
  });
  assert.equal(report.verdict, "WARNING");
  assert.equal(report.ready, true);
  assert.ok(report.warnings.length > 0);
  assert.equal(canAssembleAfterQuality("WARNING"), true);
  assert.equal(canTransition("quality_check", "assembling", { qcVerdict: "WARNING" }), true);
});

test("QC BLOCKED for invalid artifact", () => {
  const report = inspectArtifactQuality({
    video: {
      mimeType: "image/svg+xml",
      url: "https://signed.example/x.svg",
      durationSec: 8,
      provider: "preview",
      isStub: true,
    },
    requiredVideo: true,
  });
  assert.equal(report.verdict, "BLOCKED");
  assert.equal(report.ready, false);
  assert.ok(report.blockers.length > 0);
  assert.equal(canAssembleAfterQuality("BLOCKED"), false);
  assert.equal(canTransition("quality_check", "assembling", { qcVerdict: "BLOCKED" }), false);
});

test("duration mismatch is a warning when the artifact is otherwise valid", () => {
  const report = inspectArtifactQuality({
    video: playableVideo({ durationSec: 2 }),
    expectedDurationSec: 8,
    probed: { durationSec: 2, width: 1280, height: 720, codec: "h264" },
    scenes: [{ artifactId: "vid-1" }],
  });
  const duration = report.checks.find((check) => check.id === "duration_consistency");
  assert.equal(duration?.passed, false);
  assert.equal(duration?.severity, "warning");
  assert.equal(report.verdict, "WARNING");
});

test("audio/video sync check warns on large drift", () => {
  const report = inspectArtifactQuality({
    video: playableVideo(),
    audio: { durationSec: 1, mimeType: "audio/mpeg" },
    expectedDurationSec: 8,
    probed: { durationSec: 8, width: 1280, height: 720, codec: "h264" },
    scenes: [{ artifactId: "vid-1" }],
  });
  const sync = report.checks.find((check) => check.id === "audio_video_sync");
  assert.equal(sync?.passed, false);
  assert.equal(sync?.severity, "warning");
  assert.equal(report.verdict, "WARNING");
});

test("missing required video is BLOCKED", () => {
  const report = inspectArtifactQuality({
    video: null,
    requiredVideo: true,
    narrationRequired: true,
  });
  assert.equal(report.verdict, "BLOCKED");
  assert.ok(report.checks.some((check) => check.id === "missing_assets" && !check.passed && check.severity === "blocker"));
});

test("prompt adherence and consistency stay informational without capability", () => {
  const report = inspectArtifactQuality({
    video: playableVideo(),
    probed: { durationSec: 8, width: 1280, height: 720, codec: "h264" },
    scenes: [{ artifactId: "vid-1", prompt: "studio product", characters: [{ id: "c1" }], products: [] }],
    promptAdherence: { available: false, score: null },
    consistency: { available: false, score: null, hasReferences: true },
  });
  const prompt = report.checks.find((check) => check.id === "prompt_adherence");
  const consistency = report.checks.find((check) => check.id === "character_product_consistency");
  assert.equal(prompt?.severity, "info");
  assert.equal(prompt?.score, null);
  assert.equal(consistency?.severity, "info");
  assert.equal(consistency?.score, null);
  assert.notEqual(report.verdict, "BLOCKED");
});

test("prompt adherence score can block when the capability exists", () => {
  const report = inspectArtifactQuality({
    video: playableVideo(),
    probed: { durationSec: 8, width: 1280, height: 720, codec: "h264" },
    scenes: [{ artifactId: "vid-1" }],
    promptAdherence: { available: true, score: 12, note: "Looks unrelated to prompt." },
  });
  assert.equal(report.verdict, "BLOCKED");
});
