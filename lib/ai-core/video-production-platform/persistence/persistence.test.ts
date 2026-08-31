import assert from "node:assert/strict";
import { test } from "node:test";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";
import type { ProviderJob, Scene, VideoArtifact } from "@/lib/ai-core/video-production-platform/domain";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain";
import {
  assertCanPersistArtifact,
  assertCanPersistProjectState,
  assertCanPersistProviderJob,
  buildProviderIdempotencyKey,
} from "@/lib/ai-core/video-production-platform/persistence/guards";
import {
  artifactFromMediaRow,
  planFromRow,
  projectFromGenerationRow,
  qualityReportFromRow,
  sceneFromRow,
  sceneToRow,
  scenesFromDomainOrLegacy,
  type VideoPlanRow,
  type VideoQualityReportRow,
  type VideoSceneRow,
} from "@/lib/ai-core/video-production-platform/persistence/mappers";
import { readProjectWithSceneRows } from "@/lib/ai-core/video-production-platform/persistence/legacy-read";

function validScene(over: Partial<Scene> = {}): Scene {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    projectId: "22222222-2222-4222-8222-222222222222",
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

function validArtifact(over: Partial<VideoArtifact> = {}): VideoArtifact {
  return {
    id: "art-1",
    projectId: "22222222-2222-4222-8222-222222222222",
    kind: "composite",
    mimeType: "video/mp4",
    url: "https://cdn.example/out.mp4",
    durationSec: 8,
    provider: "kling",
    ...over,
  };
}

function legacyGeneration(): VideoGeneration {
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
  return {
    id: "33333333-3333-4333-8333-333333333333",
    user_id: "44444444-4444-4444-8444-444444444444",
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
  };
}

test("create project maps video_generations as project root", () => {
  const generation = legacyGeneration();
  const project = projectFromGenerationRow({
    ...generation,
    domain_state: "planning",
    workflow: "ad",
    language: "ar",
    active_plan_id: "55555555-5555-4555-8555-555555555555",
  });
  assert.equal(project.id, generation.id);
  assert.equal(project.state, "planning");
  assert.equal(project.workflow, "ad");
  assert.equal(project.language, "ar");
  assert.equal(project.planId, "55555555-5555-4555-8555-555555555555");
});

test("create plan maps objective and version", () => {
  const row: VideoPlanRow = {
    id: "plan-1",
    user_id: "user-1",
    project_id: "proj-1",
    version: 2,
    objective: "Launch film",
    language: "en",
    aspect_ratio: "16:9",
    duration_sec: 30,
    style: "Cinematic",
    budget_credits: 12,
    pacing: "measured",
    preferred_provider: "auto",
    created_at: new Date().toISOString(),
  };
  const plan = planFromRow(row, ["scene-1"]);
  assert.equal(plan.narrativeArc, "Launch film");
  assert.equal(plan.version, 2);
  assert.equal(plan.durationSec, 30);
  assert.deepEqual(plan.sceneIds, ["scene-1"]);
});

test("create scenes round-trips schema", () => {
  const scene = validScene({ order: 2, status: "ready", artifactId: "art-1" });
  const row = sceneToRow(scene, "user-1", "plan-1");
  assert.equal(row.scene_order, 2);
  assert.equal(row.artifact_id, "art-1");
  const back = sceneFromRow({
    ...row,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  assert.equal(back.order, 2);
  assert.equal(back.prompt, scene.prompt);
  assert.equal(back.artifactId, "art-1");
});

test("reorder scenes keeps stable ids and new order", () => {
  const a = validScene({ id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa", order: 0, prompt: "Scene A product table" });
  const b = validScene({ id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb", order: 1, prompt: "Scene B studio lighting" });
  const rows: VideoSceneRow[] = [a, b].map((scene) => ({
    ...sceneToRow(scene, "user-1", null),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
  const reordered = [rows[1]!, { ...rows[0]!, scene_order: 1 }].map((row, index) => ({
    ...row,
    scene_order: index,
  }));
  const scenes = scenesFromDomainOrLegacy({
    generation: legacyGeneration(),
    sceneRows: reordered,
  });
  assert.equal(scenes[0]!.id, b.id);
  assert.equal(scenes[1]!.id, a.id);
  assert.equal(scenes[0]!.order, 0);
  assert.equal(scenes[1]!.order, 1);
});

test("create provider job idempotency key matches contract", () => {
  const key = buildProviderIdempotencyKey({
    projectId: "proj-1",
    sceneId: "scene-1",
    provider: "kling",
    promptHash: "hash-aa",
  });
  const job: ProviderJob = {
    id: "job-1",
    projectId: "proj-1",
    sceneId: "scene-1",
    provider: "kling",
    status: "queued",
    attempt: 1,
    idempotencyKey: key,
  };
  assert.equal(key, "proj-1:scene-1:kling:hash-aa");
  assertCanPersistProviderJob(job);
});

test("duplicate provider job key is the same contract key", () => {
  const a = buildProviderIdempotencyKey({
    projectId: "proj-1",
    sceneId: "scene-1",
    provider: "kling",
    promptHash: "same",
  });
  const b = buildProviderIdempotencyKey({
    projectId: "proj-1",
    sceneId: "scene-1",
    provider: "kling",
    promptHash: "same",
  });
  assert.equal(a, b);
});

test("create artifact from media row", () => {
  const artifact = artifactFromMediaRow({
    id: "media-1",
    user_id: "user-1",
    generation_id: "proj-1",
    scene_id: null,
    kind: "composite",
    mime_type: "video/mp4",
    storage_path: "user/proj/out.mp4",
    public_url: "https://cdn.example/out.mp4",
    size_bytes: 1200,
    duration_sec: 8,
    provider: "kling",
    sha256: "abc",
    width: 1920,
    height: 1080,
    fps: 24,
    codec: "h264",
    qc_score: 90,
    created_at: new Date().toISOString(),
  });
  assert.equal(artifact.mimeType, "video/mp4");
  assert.equal(artifact.durationSec, 8);
  assertCanPersistArtifact(artifact);
});

test("invalid MIME artifact rejected", () => {
  const svg = validArtifact({
    mimeType: "image/svg+xml",
    url: "https://cdn.example/board.svg",
  });
  assert.throws(() => assertCanPersistArtifact(svg), DomainValidationError);
});

test("quality report linked to artifact/scene", () => {
  const row: VideoQualityReportRow = {
    id: "qr-1",
    user_id: "user-1",
    project_id: "proj-1",
    scene_id: "scene-1",
    artifact_id: "art-1",
    score: 88,
    blockers: [],
    warnings: ["soft"],
    report: { summary: "Ready" },
    created_at: new Date().toISOString(),
  };
  const report = qualityReportFromRow(row);
  assert.equal(report.subject, "scene");
  assert.equal(report.subjectId, "scene-1");
  assert.equal(report.ready, true);
  assert.equal(report.score, 88);
});

test("foreign key enforcement is represented in persist guards", () => {
  const job: ProviderJob = {
    id: "job-1",
    projectId: "proj-1",
    sceneId: "scene-1",
    provider: "kling",
    status: "queued",
    attempt: 1,
    idempotencyKey: "proj-1:other-scene:kling:hash",
  };
  assert.throws(() => assertCanPersistProviderJob(job), DomainValidationError);
});

test("legacy read compatibility uses JSONB when domain scenes are empty", () => {
  const generation = legacyGeneration();
  const result = readProjectWithSceneRows(generation, []);
  assert.equal(result.source, "legacy_blueprint");
  assert.equal(result.project.state, "storyboard_ready");
  assert.equal(result.scenes.length, 1);
  assert.equal(result.scenes[0]!.status, "planned");
});

test("domain scenes win over legacy blueprint", () => {
  const generation = legacyGeneration();
  const scene = validScene({ projectId: generation.id, prompt: "Domain persisted scene prompt" });
  const result = readProjectWithSceneRows(generation, [
    {
      ...sceneToRow(scene, generation.user_id, null),
      created_at: generation.created_at,
      updated_at: generation.updated_at,
    },
  ]);
  assert.equal(result.source, "domain");
  assert.equal(result.scenes.length, 1);
  assert.equal(result.scenes[0]!.prompt, "Domain persisted scene prompt");
});

test("storyboard_ready cannot persist as video_rendered", () => {
  assert.throws(
    () => assertCanPersistProjectState("storyboard_ready", "video_rendered", validArtifact()),
    DomainValidationError,
  );
});

test("legacy completed cannot be persisted as a writable state", () => {
  assert.throws(
    () => assertCanPersistProjectState("storyboard_ready", "completed" as never),
    DomainValidationError,
  );
});
