import assert from "node:assert/strict";
import { test } from "node:test";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";
import type { ProviderJob, Scene, VideoArtifact } from "@/lib/ai-core/video-production-platform/domain";
import {
  assertValidProviderJob,
  assertValidScene,
  assertValidVideoArtifact,
  assertWritableProjectState,
  canTransition,
  DomainValidationError,
  isValidVideoArtifact,
  isWritableProjectState,
  readProjectFromGeneration,
  readScenesFromBlueprint,
  toWritableGenerationStatus,
} from "@/lib/ai-core/video-production-platform/domain";

function mp4Bytes(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], 0);
  return bytes;
}

function webmBytes(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x1a, 0x45, 0xdf, 0xa3], 0);
  return bytes;
}

function validArtifact(over: Partial<VideoArtifact> = {}): VideoArtifact {
  return {
    id: "art-1",
    projectId: "proj-1",
    kind: "composite",
    mimeType: "video/mp4",
    url: "https://cdn.example/out.mp4",
    durationSec: 8,
    provider: "kling",
    ...over,
  };
}

function validScene(over: Partial<Scene> = {}): Scene {
  return {
    id: "scene-1",
    projectId: "proj-1",
    order: 0,
    duration: 5,
    prompt: "Cinematic product hero shot in a controlled studio",
    camera: { move: "Slow push-in", shotSize: "medium" },
    visualStyle: "Cinematic",
    references: [],
    characters: [],
    products: ["product-1"],
    dialogue: { text: "Built for operators.", language: "en" },
    audio: { sfx: [] },
    transition: "cut",
    providerPreference: "auto",
    fallbackProvider: "kling",
    status: "planned",
    qualityScore: null,
    ...over,
  };
}

test("valid MP4 artifact = PASS", () => {
  const artifact = validArtifact({ mimeType: "video/mp4", bytes: mp4Bytes() });
  assert.equal(isValidVideoArtifact(artifact), true);
  assertValidVideoArtifact(artifact);
});

test("valid WebM artifact = PASS", () => {
  const artifact = validArtifact({
    mimeType: "video/webm",
    url: "https://cdn.example/out.webm",
    bytes: webmBytes(),
  });
  assert.equal(isValidVideoArtifact(artifact), true);
  assertValidVideoArtifact(artifact);
});

test("SVG rejected = PASS", () => {
  const svg = validArtifact({
    mimeType: "image/svg+xml",
    url: "data:image/svg+xml;utf8,<svg></svg>",
    durationSec: 5,
  });
  assert.equal(isValidVideoArtifact(svg), false);
  assert.throws(() => assertValidVideoArtifact(svg), DomainValidationError);
});

test("zero-duration video rejected", () => {
  const zero = validArtifact({ durationSec: 0 });
  assert.equal(isValidVideoArtifact(zero), false);
  assert.throws(() => assertValidVideoArtifact(zero), DomainValidationError);
});

test("invalid state transition rejected", () => {
  assert.equal(canTransition("draft", "published"), false);
  assert.equal(canTransition("planning", "assembling"), false);
  assert.equal(canTransition("generating", "video_rendered"), false);
});

test("storyboard_ready → video_rendered rejected", () => {
  assert.equal(
    canTransition("storyboard_ready", "video_rendered", { artifact: validArtifact() }),
    false,
  );
});

test("video_rendered → published allowed only with artifact", () => {
  assert.equal(canTransition("video_rendered", "published"), false);
  assert.equal(
    canTransition("video_rendered", "published", {
      artifact: validArtifact({ mimeType: "image/svg+xml", url: "https://cdn.example/x.svg" }),
    }),
    false,
  );
  assert.equal(
    canTransition("video_rendered", "published", { artifact: validArtifact() }),
    true,
  );
});

test("published → video_rendered allowed for unpublish when artifact remains", () => {
  assert.equal(canTransition("published", "video_rendered", { artifact: validArtifact() }), true);
  assert.equal(canTransition("published", "storyboard_ready"), false);
});

test("legacy completed cannot be written", () => {
  assert.equal(isWritableProjectState("completed"), false);
  assert.equal(canTransition("completed", "generating"), false);
  assert.equal(canTransition("storyboard_ready", "completed"), false);
  assert.throws(() => assertWritableProjectState("completed"), DomainValidationError);
  assert.throws(() => toWritableGenerationStatus("completed" as never), DomainValidationError);
});

test("scene schema validation", () => {
  assertValidScene(validScene());
  assert.throws(() => assertValidScene(validScene({ duration: 0 })), DomainValidationError);
  assert.throws(() => assertValidScene(validScene({ prompt: "" })), DomainValidationError);
  assert.throws(
    () => assertValidScene(validScene({ status: "ready", artifactId: undefined })),
    DomainValidationError,
  );
  assertValidScene(validScene({ status: "ready", artifactId: "art-1" }));
});

test("provider job idempotency contract validation", () => {
  const job: ProviderJob = {
    id: "job-1",
    projectId: "proj-1",
    sceneId: "scene-1",
    provider: "kling",
    status: "queued",
    attempt: 1,
    idempotencyKey: "proj-1:scene-1:kling:prompt-hash-aa",
  };
  assertValidProviderJob(job);
  assert.throws(
    () => assertValidProviderJob({ ...job, idempotencyKey: "" }),
    DomainValidationError,
  );
  assert.throws(
    () => assertValidProviderJob({ ...job, idempotencyKey: "proj-1:scene-2:kling:hash" }),
    DomainValidationError,
  );
  assert.throws(
    () => assertValidProviderJob({ ...job, provider: "preview" as never }),
    DomainValidationError,
  );
});

test("assembling → video_rendered requires a real artifact", () => {
  assert.equal(canTransition("assembling", "video_rendered"), false);
  assert.equal(
    canTransition("assembling", "video_rendered", { artifact: validArtifact() }),
    true,
  );
});

test("quality_check → assembling is blocked by QC BLOCKED verdict", () => {
  assert.equal(canTransition("quality_check", "assembling"), true);
  assert.equal(canTransition("quality_check", "assembling", { qcVerdict: "PASS" }), true);
  assert.equal(canTransition("quality_check", "assembling", { qcVerdict: "WARNING" }), true);
  assert.equal(canTransition("quality_check", "assembling", { qcVerdict: "BLOCKED" }), false);
});

test("legacy blueprint is readable without becoming a video artifact", () => {
  const blueprint: VideoBlueprint = {
    title: "Legacy",
    description: "",
    videoType: "storyboard",
    style: "Cinematic",
    aspectRatio: "16:9",
    totalDuration: "10s",
    scenes: [
      {
        id: "s1",
        name: "Hero",
        description: "Open",
        duration: "10s",
        visualPrompt: "Studio product table",
        cameraMove: "Static",
        mood: "Professional",
        narration: "Hello",
        musicDirection: "Ambient",
        sfxNotes: "",
        transition: "cut",
        svgStoryboard: "<svg xmlns='http://www.w3.org/2000/svg'></svg>",
      },
    ],
    script: "",
    voiceoverScript: "",
    musicSuggestions: [],
    subtitles: [],
    thumbnailSvg: "<svg></svg>",
    colorGrade: "",
    exportPreset: "1080p",
    files: [],
    prompt: "legacy",
    generatedAt: new Date().toISOString(),
  };
  const scenes = readScenesFromBlueprint(blueprint, "proj-1");
  assert.equal(scenes.length, 1);
  assertValidScene(scenes[0]!);
  assert.equal(scenes[0]!.status, "planned");
  assert.equal(isValidVideoArtifact({
    id: "svg",
    projectId: "proj-1",
    kind: "composite",
    mimeType: "image/svg+xml",
    url: `data:image/svg+xml;utf8,${blueprint.thumbnailSvg}`,
    durationSec: 10,
    provider: "preview",
  }), false);

  const generation = {
    id: "gen-1",
    user_id: "user-1",
    video_name: "Legacy",
    video_type: "storyboard",
    description: "",
    style: "Cinematic",
    aspect_ratio: "16:9",
    duration: "10s",
    options: [],
    prompt: "legacy",
    blueprint,
    status: "completed",
    mode: "generate",
    provider: null,
    token_usage: null,
    generation_time_ms: null,
    parent_generation_id: null,
    project_id: null,
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as VideoGeneration;
  const project = readProjectFromGeneration(generation);
  assert.equal(project.state, "storyboard_ready");
  assert.equal(isWritableProjectState(project.state), true);
});
