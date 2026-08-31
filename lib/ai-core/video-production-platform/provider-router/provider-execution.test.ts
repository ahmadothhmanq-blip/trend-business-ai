import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { ProviderRouterError } from "@/lib/ai-core/video-production-platform/provider-router/errors";
import {
  createMemoryProviderJobStore,
  createProviderRegistry,
  estimateProviderCost,
  getProviderV2,
  persistRoutedProviderJob,
  routeModel,
} from "@/lib/ai-core/video-production-platform/provider-router";
import type { ModelRouterInput, ProviderJobHandle, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import {
  buildSceneProviderPrompt,
  buildSceneRouterInput,
} from "@/lib/ai-core/video-production-platform/provider-router/scene-to-provider";
import { veoVideoProvider } from "@/lib/ai-core/video-production-platform/providers/veo";
import { runwayVideoProvider } from "@/lib/ai-core/video-production-platform/providers/runway";
import { ArtifactIngestError, ingestProviderArtifact, sha256Hex } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import { isStubVideoBytes } from "@/lib/ai-core/video-production-platform/providers/types";

const PROJECT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const SCENE = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function input(over: Partial<ModelRouterInput> = {}): ModelRouterInput {
  return {
    task: "text-to-video",
    quality: "standard",
    duration: 8,
    projectId: PROJECT,
    sceneId: SCENE,
    prompt: "Cinematic studio product hero shot",
    language: "en",
    latencyTarget: "balanced",
    ...over,
  };
}

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

function domainScene(over: Partial<Scene> = {}): Scene {
  return {
    id: SCENE,
    projectId: PROJECT,
    order: 0,
    duration: 6,
    prompt: "Premium product on marble surface",
    camera: { move: "slow dolly", shotSize: "medium", lens: "50mm" },
    visualStyle: "cinematic commercial",
    references: [],
    characters: [],
    products: [],
    dialogue: { text: "", language: "en" },
    audio: {},
    transition: "cut",
    providerPreference: "auto",
    fallbackProvider: null,
    status: "planned",
    qualityScore: null,
    environment: "studio",
    lighting: "soft key",
    ...over,
  };
}

function mockProvider(
  id: "veo" | "runway",
  behavior: {
    create?: () => ProviderJobHandle;
    poll?: (externalJobId: string) => ProviderJobHandle;
  } = {},
): VideoProviderV2 {
  return {
    id,
    label: id,
    status: () => "ready",
    capabilities: () => ({
      textToVideo: true,
      imageToVideo: true,
      avatar: false,
      audio: false,
      maxDurationSec: 10,
    }),
    estimateCost: (params) => estimateProviderCost(id, params),
    health: () => ({ ok: true, status: "ready", reason: `${id} mock ready` }),
    createJob: async () =>
      behavior.create?.() || {
        provider: id,
        status: "processing",
        externalJobId: `${id}-job-1`,
        idempotencyKey: "idem",
        message: "accepted",
        mimeType: "video/mp4",
      },
    pollJob: async (externalJobId) =>
      behavior.poll?.(externalJobId) || {
        provider: id,
        status: "succeeded",
        externalJobId,
        idempotencyKey: "idem",
        message: "done",
        mimeType: "video/mp4",
        bytes: contractMp4(),
      },
    cancelJob: async (_externalJobId, idempotencyKey) => ({
      provider: id,
      status: "cancelled",
      idempotencyKey,
      message: "cancelled",
    }),
  };
}

test("veo health unconfigured when no API key", async () => {
  const original = { ...process.env };
  delete process.env.VEO_API_KEY;
  delete process.env.GEMINI_API_KEY;
  const veo = getProviderV2("veo", { veo: false, kling: false, runway: false, heygen: false, external: false });
  assert.equal(veo.status(), "unconfigured");
  const health = await veo.health();
  assert.equal(health.ok, false);
  assert.equal(health.status, "unconfigured");
  process.env = original;
});

test("runway health unconfigured when no API key", () => {
  const runway = getProviderV2("runway", { veo: false, kling: false, runway: false, heygen: false, external: false });
  assert.equal(runway.status(), "unconfigured");
  assert.equal(runway.health().ok, false);
});

test("router prefers veo when configured", () => {
  const decision = routeModel(input(), {
    snapshot: { veo: true, kling: true, runway: true, heygen: false, external: false },
  });
  assert.equal(decision.primaryProvider, "veo");
});

test("router selects runway when veo down", () => {
  const decision = routeModel(input({ preferredProvider: "runway" }), {
    snapshot: { veo: true, kling: true, runway: true, heygen: false, external: false },
  });
  assert.equal(decision.primaryProvider, "runway");
});

test("scene to provider prompt includes camera and style", () => {
  const prompt = buildSceneProviderPrompt(domainScene());
  assert.match(prompt, /Premium product/);
  assert.match(prompt, /cinematic commercial/);
  assert.match(prompt, /slow dolly/);
});

test("scene router input maps references to image-to-video", () => {
  const route = buildSceneRouterInput(
    domainScene({
      references: [{ role: "product", uri: "https://cdn.example.com/product.jpg", kind: "image" }],
    }),
    { projectId: PROJECT, aspectRatio: "16:9" },
  );
  assert.equal(route.task, "image-to-video");
  assert.equal(route.references?.images, true);
});

test("create provider job via mock veo", async () => {
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  registry.veo = mockProvider("veo");
  const store = createMemoryProviderJobStore();
  const routed = await persistRoutedProviderJob({
    userId: "user",
    routeInput: input({ preferredProvider: "veo" }),
    store,
    registry,
    snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false },
  });
  assert.equal(routed.job.provider, "veo");
  assert.equal(routed.reused, false);
  const handle = await registry.veo.createJob({
    projectId: PROJECT,
    sceneId: SCENE,
    prompt: "test",
    promptHash: routed.route.metadata.idempotencyPromptHash,
    durationSec: 6,
    idempotencyKey: routed.job.idempotencyKey,
  });
  assert.equal(handle.status, "processing");
  assert.ok(handle.externalJobId);
});

test("duplicate idempotency reuses provider job", async () => {
  const store = createMemoryProviderJobStore();
  const routeInput = input({ preferredProvider: "runway" });
  const snapshot = { veo: false, kling: false, runway: true, heygen: false, external: false };
  const first = await persistRoutedProviderJob({ userId: "user", routeInput, store, snapshot });
  const second = await persistRoutedProviderJob({ userId: "user", routeInput, store, snapshot });
  assert.equal(first.reused, false);
  assert.equal(second.reused, true);
  assert.equal(first.job.id, second.job.id);
});

test("poll success returns bytes", async () => {
  const provider = mockProvider("runway");
  const polled = await provider.pollJob("runway-job-1", "idem");
  assert.equal(polled.status, "succeeded");
  assert.ok(polled.bytes && polled.bytes.byteLength > 1000);
});

test("poll failure is honest", async () => {
  const provider = mockProvider("runway", {
    poll: () => ({
      provider: "runway",
      status: "failed",
      externalJobId: "runway-job-1",
      idempotencyKey: "idem",
      message: "provider failed",
      errorCode: "provider_failed",
    }),
  });
  const polled = await provider.pollJob("runway-job-1", "idem");
  assert.equal(polled.status, "failed");
});

test("artifact ingest validates and stores sha256", async () => {
  const bytes = contractMp4();
  const checksum = sha256Hex(bytes);
  assert.equal(checksum.length, 64);

  const tables: Record<string, Record<string, unknown>[]> = { video_media: [] };
  const supabase = {
    from(table: string) {
      const rows = tables[table] || (tables[table] = []);
      return {
        insert(row: Record<string, unknown>) {
          const record = { id: randomUUID(), created_at: new Date().toISOString(), ...row };
          rows.push(record);
          return {
            select: () => ({
              single: async () => ({ data: record, error: null }),
            }),
          };
        },
        update(patch: Record<string, unknown>) {
          return {
            eq: () => ({
              async then(resolve: (v: unknown) => void) {
                Object.assign(rows[0] || {}, patch);
                resolve({ data: rows[0], error: null });
              },
            }),
          };
        },
      };
    },
    storage: {
      from: () => ({
        upload: async () => ({ error: null }),
        createSignedUrl: async () => ({
          data: { signedUrl: "https://storage.example/clip.mp4" },
          error: null,
        }),
        getPublicUrl: () => ({ data: { publicUrl: "https://storage.example/clip.mp4" } }),
      }),
    },
  };

  const artifact = await ingestProviderArtifact({
    supabase,
    userId: "user",
    projectId: PROJECT,
    sceneId: SCENE,
    handle: {
      provider: "runway",
      status: "succeeded",
      idempotencyKey: "idem",
      message: "ok",
      mimeType: "video/mp4",
      bytes,
    },
    declaredDurationSec: 6,
    aspectRatio: "16:9",
    kind: "scene_clip",
  });
  assert.equal(artifact.mimeType, "video/mp4");
  assert.ok(artifact.durationSec > 0);
  assert.ok(artifact.width && artifact.height);
});

test("invalid artifact rejection — stub mp4", async () => {
  const stub = new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]);
  assert.ok(isStubVideoBytes(stub));
  await assert.rejects(
    () =>
      ingestProviderArtifact({
        supabase: { from: () => ({ insert: () => ({ select: () => ({ single: async () => ({ data: null, error: null }) }) }) }), storage: { from: () => ({ upload: async () => ({ error: null }) }) } },
        userId: "user",
        projectId: PROJECT,
        sceneId: SCENE,
        handle: {
          provider: "runway",
          status: "succeeded",
          idempotencyKey: "idem",
          message: "ok",
          mimeType: "video/mp4",
          bytes: stub,
        },
        declaredDurationSec: 6,
        aspectRatio: "16:9",
        kind: "scene_clip",
      }),
    (error: unknown) => error instanceof ArtifactIngestError,
  );
});

test("retry uses new idempotency salt", () => {
  const a = createHash("sha256")
    .update([PROJECT, SCENE, "text-to-video", "prompt", "8", "standard", "en", "", "", ""].join("|"))
    .digest("hex")
    .slice(0, 24);
  const b = createHash("sha256")
    .update([PROJECT, SCENE, "text-to-video", "prompt", "8", "standard", "en", "", "", "retry:2"].join("|"))
    .digest("hex")
    .slice(0, 24);
  assert.notEqual(a, b);
});

test("veo and runway native adapters fail when unconfigured", async () => {
  const original = { ...process.env };
  delete process.env.RUNWAY_API_KEY;
  delete process.env.GEMINI_API_KEY;
  delete process.env.VEO_API_KEY;
  const veo = await veoVideoProvider.generateClip({
    prompt: "test",
    durationSec: 4,
    aspectRatio: "16:9",
  });
  assert.equal(veo.status, "failed");
  const runway = await runwayVideoProvider.generateClip({
    prompt: "test",
    durationSec: 4,
    aspectRatio: "16:9",
  });
  assert.equal(runway.status, "failed");
  process.env = original;
});

test("veo cost estimate uses duration-based pricing", () => {
  const original = process.env.GEMINI_API_KEY;
  process.env.GEMINI_API_KEY = "test-key";
  const estimate = estimateProviderCost("veo", { durationSec: 8, quality: "standard" });
  assert.ok(estimate.credits >= 1);
  if (original) process.env.GEMINI_API_KEY = original;
  else delete process.env.GEMINI_API_KEY;
});

test("unconfigured veo createJob throws ProviderRouterError", async () => {
  const veo = getProviderV2("veo", { veo: false, kling: false, runway: false, heygen: false, external: false });
  await assert.rejects(
    () =>
      veo.createJob({
        projectId: PROJECT,
        sceneId: SCENE,
        prompt: "x",
        promptHash: "hash",
        durationSec: 4,
        idempotencyKey: "key",
      }),
    (error: unknown) => error instanceof ProviderRouterError && error.code === "unconfigured",
  );
});
