import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import {
  createProviderRegistry,
  type ProviderJobRequest,
  type VideoProviderV2,
} from "@/lib/ai-core/video-production-platform/provider-router";
import { insertVideoScenes, loadSceneById, listProviderJobsForScene } from "@/lib/ai-core/video-production-platform/persistence";
import { regenerateScene, SceneRegenerationError } from "@/lib/ai-core/video-production-platform/scene-regeneration";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const PROJECT = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

function mockSuccessProvider(id: "veo" | "runway" = "veo"): VideoProviderV2 {
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  return {
    ...registry[id],
    status: () => "ready",
    health: () => ({ ok: true, status: "ready", reason: "mock" }),
    async createJob(request: ProviderJobRequest) {
      return {
        provider: id,
        status: "succeeded",
        idempotencyKey: request.idempotencyKey,
        mimeType: "video/mp4",
        bytes: contractMp4(),
        message: "mock succeeded",
      };
    },
    async pollJob(_externalJobId, idempotencyKey) {
      return {
        provider: id,
        status: "succeeded",
        idempotencyKey,
        mimeType: "video/mp4",
        bytes: contractMp4(),
        message: "mock polled",
      };
    },
    async cancelJob(_externalJobId, idempotencyKey) {
      return { provider: id, status: "cancelled", idempotencyKey, message: "cancelled" };
    },
  };
}

function mockRegistry(success = true) {
  const registry = createProviderRegistry({
    veo: true,
    kling: false,
    runway: false,
    heygen: false,
    external: false,
  });
  registry.veo = success ? mockSuccessProvider("veo") : mockFailingProvider();
  return registry;
}

function mockFailingProvider(): VideoProviderV2 {
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  return {
    ...registry.veo,
    async createJob(request: ProviderJobRequest) {
      return {
        provider: "veo",
        status: "failed",
        idempotencyKey: request.idempotencyKey,
        message: "provider failed",
        errorCode: "provider_failed",
      };
    },
    async pollJob(_externalJobId, idempotencyKey) {
      return {
        provider: "veo",
        status: "failed",
        idempotencyKey,
        message: "provider failed",
        errorCode: "provider_failed",
      };
    },
    async cancelJob(_externalJobId, idempotencyKey) {
      return { provider: "veo", status: "cancelled", idempotencyKey, message: "cancelled" };
    },
  };
}

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_generations: [],
    video_plans: [],
    video_scenes: [],
    video_provider_jobs: [],
    video_media: [],
    video_quality_reports: [],
  };
  let lastUpload = contractMp4();

  function matches(row: Record<string, unknown>, filters: Array<[string, string, unknown]>) {
    return filters.every(([op, key, value]) => {
      if (op === "eq") return row[key] === value;
      if (op === "in") return Array.isArray(value) && value.includes(row[key]);
      return true;
    });
  }

  function from(table: string) {
    const state: {
      action: string;
      payload: unknown;
      filters: Array<[string, string, unknown]>;
      orderCol: string | null;
      orderAsc: boolean;
      limitN: number | null;
    } = {
      action: "select",
      payload: null,
      filters: [],
      orderCol: null,
      orderAsc: true,
      limitN: null,
    };

    async function execute(shape: "single" | "maybe" | "many") {
      const rows = tables[table] || (tables[table] = []);
      let data: Record<string, unknown>[] = [];
      let error: { message: string; code?: string } | null = null;

      if (state.action === "insert") {
        const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
        for (const raw of incoming as Record<string, unknown>[]) {
          if (table === "video_provider_jobs" && rows.some((row) => row.idempotency_key === raw.idempotency_key)) {
            error = { code: "23505", message: "duplicate idempotency_key" };
            break;
          }
          const row: Record<string, unknown> = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ...raw,
          };
          if (!row.id) row.id = randomUUID();
          rows.push(row);
          data.push(row);
        }
      } else if (state.action === "update") {
        for (const row of rows) {
          if (matches(row, state.filters)) {
            Object.assign(row, state.payload as object, { updated_at: new Date().toISOString() });
            data.push(row);
          }
        }
      } else {
        data = rows.filter((row) => matches(row, state.filters));
        if (state.orderCol) {
          const col = state.orderCol;
          data.sort((a, b) => {
            const av = String(a[col] ?? "");
            const bv = String(b[col] ?? "");
            return state.orderAsc ? av.localeCompare(bv) : bv.localeCompare(av);
          });
        }
        if (state.limitN != null) data = data.slice(0, state.limitN);
      }

      if (error) return { data: null, error };
      if (shape === "single") {
        if (!data[0]) return { data: null, error: { message: "not found", code: "PGRST116" } };
        return { data: data[0], error: null };
      }
      if (shape === "maybe") return { data: data[0] ?? null, error: null };
      return { data, error: null };
    }

    const api: MemoryQueryBuilder = {
      insert(row: unknown) {
        state.action = "insert";
        state.payload = row;
        return api;
      },
      update(patch: unknown) {
        state.action = "update";
        state.payload = patch;
        return api;
      },
      select() {
        return api;
      },
      eq(key: string, value: unknown) {
        state.filters.push(["eq", key, value]);
        return api;
      },
      in(key: string, value: unknown) {
        state.filters.push(["in", key, value]);
        return api;
      },
      order(col: string, opts?: { ascending?: boolean }) {
        state.orderCol = col;
        state.orderAsc = opts?.ascending !== false;
        return api;
      },
      limit(n: number) {
        state.limitN = n;
        return api;
      },
      maybeSingle: () => execute("maybe"),
      single: () => execute("single"),
      then(resolve, reject?) {
        return execute("many").then(resolve, reject);
      },
    };
    return api;
  }

  return {
    from,
    storage: {
      from() {
        return {
          async upload(_path: string, bytes: Uint8Array) {
            lastUpload = bytes;
            return { error: null };
          },
          async createSignedUrl() {
            return { data: { signedUrl: `https://storage.example/clip.mp4` }, error: null };
          },
          getPublicUrl() {
            return { data: { publicUrl: `https://storage.example/clip.mp4` } };
          },
        };
      },
    },
    _tables: tables,
  };
}

function baseScene(planId: string, artifactId?: string): Scene {
  return {
    id: randomUUID(),
    projectId: PROJECT,
    planId,
    order: 0,
    duration: 6,
    prompt: "Premium product hero on marble",
    camera: { move: "slow dolly", shotSize: "medium" },
    visualStyle: "cinematic",
    references: [],
    characters: [],
    products: [],
    dialogue: { text: "", language: "en" },
    audio: {},
    transition: "cut",
    providerPreference: "veo",
    fallbackProvider: null,
    status: "ready",
    qualityScore: 90,
    artifactId,
  };
}

async function seedProject(supabase: ReturnType<typeof createMemorySupabase>, input?: { active?: boolean }) {
  const planId = randomUUID();
  const inactivePlanId = randomUUID();
  const scene = baseScene(planId);
  const otherScene = baseScene(inactivePlanId);
  otherScene.projectId = PROJECT;

  supabase._tables.video_generations.push({
    id: PROJECT,
    user_id: USER,
    active_plan_id: planId,
    domain_state: "storyboard_ready",
  });
  supabase._tables.video_plans.push(
    {
      id: planId,
      user_id: USER,
      project_id: PROJECT,
      version: 1,
      objective: "Hero",
      language: "en",
      aspect_ratio: "16:9",
      duration_sec: 8,
      style: "Cinematic",
      budget_credits: null,
      pacing: "balanced",
      preferred_provider: "veo",
      status: input?.active === false ? "inactive" : "active",
      is_active: input?.active === false ? false : true,
      created_at: new Date().toISOString(),
    },
    {
      id: inactivePlanId,
      user_id: USER,
      project_id: PROJECT,
      version: 2,
      objective: "V2",
      language: "en",
      aspect_ratio: "16:9",
      duration_sec: 8,
      style: "Cinematic",
      budget_credits: null,
      pacing: "balanced",
      preferred_provider: "veo",
      status: "inactive",
      is_active: false,
      created_at: new Date().toISOString(),
    },
  );

  const oldArtifactId = randomUUID();
  supabase._tables.video_media.push({
    id: oldArtifactId,
    user_id: USER,
    generation_id: PROJECT,
    scene_id: scene.id,
    kind: "clip",
    mime_type: "video/mp4",
    storage_path: "clips/old.mp4",
    public_url: "https://storage.example/old.mp4",
    size_bytes: 5000,
    duration_sec: 6,
    provider: "veo",
    width: 1280,
    height: 720,
    created_at: new Date().toISOString(),
  });
  scene.artifactId = oldArtifactId;

  await insertVideoScenes(supabase, { userId: USER, planId, scenes: [scene] });
  otherScene.status = "planned";
  otherScene.artifactId = undefined;
  await insertVideoScenes(supabase, { userId: USER, planId: inactivePlanId, scenes: [otherScene] });

  return { planId, inactivePlanId, scene, oldArtifactId, inactiveSceneId: otherScene.id };
}

test("regenerate active scene succeeds with mock provider", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene, oldArtifactId } = await seedProject(supabase);
  const registry = mockRegistry(true);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };

  const result = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: { registry, snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false } },
  });

  assert.equal(result.status, "ready");
  assert.notEqual(result.activeArtifactId, oldArtifactId);
  assert.equal(result.preservedArtifactId, oldArtifactId);
  const jobs = await listProviderJobsForScene(supabase, PROJECT, scene.id);
  assert.equal(jobs.length, 1);
  assert.equal(jobs[0]!.attempt, 1);
});

test("regenerate with prompt override does not change scene prompt on failure", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene, oldArtifactId } = await seedProject(supabase);
  const registry = mockRegistry(false);

  const result = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: {
      promptOverride: "New dramatic override prompt",
      registry,
      snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false },
    },
  });

  assert.equal(result.status, "failed");
  assert.equal(result.activeArtifactId, oldArtifactId);
  const reloaded = await loadSceneById(supabase, scene.id);
  assert.equal(reloaded?.prompt, "Premium product hero on marble");
  assert.equal(reloaded?.artifactId, oldArtifactId);
  assert.equal(reloaded?.status, "ready");
});

test("old artifact preserved in media table after successful regenerate", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene, oldArtifactId } = await seedProject(supabase);
  const registry = mockRegistry(true);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };

  await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: { registry, snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false } },
  });

  const oldRow = supabase._tables.video_media.find((row) => row.id === oldArtifactId);
  assert.ok(oldRow);
  assert.equal(supabase._tables.video_media.length, 2);
});

test("successful regenerate switches active artifact", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  const registry = mockRegistry(true);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };

  const result = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: { registry, snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false } },
  });

  const reloaded = await loadSceneById(supabase, scene.id);
  assert.equal(reloaded?.artifactId, result.activeArtifactId);
  assert.equal(reloaded?.status, "ready");
});

test("duplicate request reuses provider job", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  const registry = mockRegistry(true);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };
  const opts = {
    requestId: "req-duplicate-001",
    registry,
    snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false },
  };

  const first = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: opts,
  });
  const second = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: opts,
  });

  assert.equal(first.jobId, second.jobId);
  assert.equal(second.reused, true);
  assert.equal((await listProviderJobsForScene(supabase, PROJECT, scene.id)).length, 1);
});

test("retry creates a new attempt and job", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  const registry = mockRegistry(false);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };

  await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: { registry, snapshot },
  });
  const retry = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: { retry: true, registry, snapshot },
  });

  const jobs = await listProviderJobsForScene(supabase, PROJECT, scene.id);
  assert.equal(jobs.length, 2);
  assert.equal(retry.attempt, 2);
});

test("inactive plan rejected", async () => {
  const supabase = createMemorySupabase();
  const { inactivePlanId, inactiveSceneId } = await seedProject(supabase);

  await assert.rejects(
    () =>
      regenerateScene(supabase, {
        userId: USER,
        projectId: PROJECT,
        planId: inactivePlanId,
        sceneId: inactiveSceneId,
      }),
    (error: unknown) => error instanceof SceneRegenerationError && error.code === "inactive_plan",
  );
});

test("foreign project rejected", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  await assert.rejects(
    () =>
      regenerateScene(supabase, {
        userId: USER,
        projectId: randomUUID(),
        planId,
        sceneId: scene.id,
      }),
    (error: unknown) => error instanceof SceneRegenerationError && error.code === "foreign_plan",
  );
});

test("scene from another project rejected", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  const foreignProject = randomUUID();
  supabase._tables.video_generations.push({ id: foreignProject, user_id: USER, active_plan_id: planId });
  await assert.rejects(
    () =>
      regenerateScene(supabase, {
        userId: USER,
        projectId: foreignProject,
        planId,
        sceneId: scene.id,
      }),
    (error: unknown) => error instanceof SceneRegenerationError && error.code === "foreign_plan",
  );
});

test("idempotency prevents duplicate jobs for same requestId", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  const registry = mockRegistry(true);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };
  const opts = {
    requestId: "stable-request-id",
    registry,
    snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false },
  };
  await regenerateScene(supabase, { userId: USER, projectId: PROJECT, planId, sceneId: scene.id, options: opts });
  await regenerateScene(supabase, { userId: USER, projectId: PROJECT, planId, sceneId: scene.id, options: opts });
  assert.equal((await listProviderJobsForScene(supabase, PROJECT, scene.id)).length, 1);
});

test("no duplicate charge on reused job", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  const registry = mockRegistry(true);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };
  const opts = {
    requestId: "charge-dedupe",
    registry,
    snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false },
  };
  const first = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: opts,
  });
  const second = await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: opts,
  });
  assert.ok(first.estimatedCost);
  assert.equal(second.estimatedCost, null);
  assert.equal(second.reused, true);
});

test("history preserved across attempts", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene } = await seedProject(supabase);
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };
  await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: { registry: mockRegistry(false), snapshot },
  });
  await regenerateScene(supabase, {
    userId: USER,
    projectId: PROJECT,
    planId,
    sceneId: scene.id,
    options: { retry: true, registry: mockRegistry(true), snapshot },
  });
  const jobs = await listProviderJobsForScene(supabase, PROJECT, scene.id);
  assert.equal(jobs.length, 2);
  assert.deepEqual(jobs.map((job) => job.attempt), [1, 2]);
});

test("runtime unconfigured provider fails without corrupting scene", async () => {
  const supabase = createMemorySupabase();
  const { planId, scene, oldArtifactId } = await seedProject(supabase);
  const snapshot = { veo: false, kling: false, runway: false, heygen: false, external: false };

  await assert.rejects(
    () =>
      regenerateScene(supabase, {
        userId: USER,
        projectId: PROJECT,
        planId,
        sceneId: scene.id,
        options: { snapshot },
      }),
    (error: unknown) => error instanceof SceneRegenerationError && error.code === "provider_unconfigured",
  );

  const reloaded = await loadSceneById(supabase, scene.id);
  assert.equal(reloaded?.artifactId, oldArtifactId);
  assert.equal(reloaded?.status, "ready");
  assert.equal((await listProviderJobsForScene(supabase, PROJECT, scene.id)).length, 0);
});
