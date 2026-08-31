import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { insertVideoScenes, loadSceneById } from "@/lib/ai-core/video-production-platform/persistence";
import {
  createEditorHistory,
  pushEditorCommand,
  redoEditorCommand,
  undoEditorCommand,
} from "@/lib/ai-core/video-production-platform/editor-mvp/history";
import { EditorMvpError } from "@/lib/ai-core/video-production-platform/editor-mvp/errors";
import {
  deleteEditorScene,
  duplicateEditorScene,
  loadEditorDocument,
  patchEditorScene,
  reorderEditorScenes,
  restoreEditorScene,
  saveEditorScenes,
  splitEditorScene,
  trimEditorScene,
} from "@/lib/ai-core/video-production-platform/editor-mvp/service";
import { editorStateOf } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
import { regenerateScene, SceneRegenerationError } from "@/lib/ai-core/video-production-platform/scene-regeneration";
import {
  createProviderRegistry,
  type ProviderJobRequest,
} from "@/lib/ai-core/video-production-platform/provider-router";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_generations: [],
    video_plans: [],
    video_scenes: [],
    video_provider_jobs: [],
    video_media: [],
    video_quality_reports: [],
    video_audio_plans: [],
    video_audio_tracks: [],
    video_audio_jobs: [],
  };

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
    } = { action: "select", payload: null, filters: [], orderCol: null, orderAsc: true, limitN: null };

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
          const row: Record<string, unknown> = { created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...raw };
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
      } else if (state.action === "delete") {
        const kept: Record<string, unknown>[] = [];
        for (const row of rows) {
          if (matches(row, state.filters)) data.push(row);
          else kept.push(row);
        }
        tables[table] = kept;
      } else {
        data = rows.filter((row) => matches(row, state.filters));
        if (state.orderCol) {
          const col = state.orderCol;
          data.sort((a, b) => {
            const av = Number(a[col] ?? 0);
            const bv = Number(b[col] ?? 0);
            if (Number.isFinite(av) && Number.isFinite(bv) && av !== bv) {
              return state.orderAsc ? av - bv : bv - av;
            }
            return state.orderAsc ? String(a[col] ?? "").localeCompare(String(b[col] ?? "")) : String(b[col] ?? "").localeCompare(String(a[col] ?? ""));
          });
        }
        if (state.limitN != null) data = data.slice(0, state.limitN);
      }
      if (error) return { data: null, error };
      if (shape === "single") return { data: data[0] || null, error: data[0] ? null : { message: "missing", code: "PGRST116" } };
      if (shape === "maybe") return { data: data[0] || null, error: null };
      return { data, error: null };
    }

    const api: MemoryQueryBuilder = {
      insert(payload: unknown) {
        state.action = "insert";
        state.payload = payload;
        return api;
      },
      update(payload: unknown) {
        state.action = "update";
        state.payload = payload;
        return api;
      },
      delete() {
        state.action = "delete";
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
          async upload() {
            return { error: null };
          },
          async createSignedUrl() {
            return { data: { signedUrl: "https://signed.example/media" } };
          },
          getPublicUrl() {
            return { data: { publicUrl: "https://signed.example/media" } };
          },
        };
      },
    },
    _tables: tables,
  };
}

function scene(over: Partial<Scene> & { projectId: string; planId: string; order: number }): Scene {
  return {
    id: over.id || randomUUID(),
    projectId: over.projectId,
    planId: over.planId,
    order: over.order,
    duration: over.duration ?? 8,
    prompt: over.prompt || "Controlled studio product table with cinematic lighting",
    camera: over.camera || { move: "Slow push-in" },
    visualStyle: over.visualStyle || "Cinematic",
    references: over.references || [],
    characters: over.characters || [],
    products: over.products || ["widget"],
    dialogue: over.dialogue || { text: "Built for operators.", language: "en" },
    audio: over.audio || { sfx: [], voiceRequired: false },
    transition: over.transition || "cut",
    providerPreference: over.providerPreference || "auto",
    fallbackProvider: over.fallbackProvider ?? "kling",
    status: over.status || "planned",
    qualityScore: over.qualityScore ?? null,
    artifactId: over.artifactId,
  };
}

async function seed(supabase: ReturnType<typeof createMemorySupabase>, opts?: { inactiveExtra?: boolean; scenes?: number }) {
  const projectId = randomUUID();
  const planId = randomUUID();
  const inactiveId = randomUUID();
  await supabase.from("video_generations").insert({
    id: projectId,
    user_id: USER,
    video_name: "Studio film",
    domain_state: "storyboard_ready",
    active_plan_id: planId,
  });
  await supabase.from("video_plans").insert({
    id: planId,
    user_id: USER,
    project_id: projectId,
    version: 1,
    objective: "Launch",
    language: "en",
    aspect_ratio: "16:9",
    duration_sec: 16,
    style: "Cinematic",
    pacing: "medium",
    preferred_provider: "auto",
    is_active: true,
    status: "active",
  });
  if (opts?.inactiveExtra) {
    await supabase.from("video_plans").insert({
      id: inactiveId,
      user_id: USER,
      project_id: projectId,
      version: 2,
      objective: "Alt",
      language: "en",
      aspect_ratio: "16:9",
      duration_sec: 8,
      style: "Cinematic",
      pacing: "medium",
      preferred_provider: "auto",
      is_active: false,
      status: "inactive",
    });
  }
  const count = opts?.scenes ?? 2;
  const scenes = Array.from({ length: count }, (_, order) =>
    scene({ projectId, planId, order, prompt: `Scene ${order + 1} studio product hero` }),
  );
  await insertVideoScenes(supabase, { userId: USER, planId, scenes });
  return { projectId, planId, inactiveId, scenes };
}

function mockProvider(success: boolean) {
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  registry.veo = {
    ...registry.veo,
    status: () => "ready",
    async createJob(request: ProviderJobRequest) {
      if (!success) {
        return { provider: "veo", status: "failed", idempotencyKey: request.idempotencyKey, message: "down", errorCode: "unconfigured" };
      }
      return {
        provider: "veo",
        status: "succeeded",
        idempotencyKey: request.idempotencyKey,
        mimeType: "video/mp4",
        bytes: contractMp4(),
        message: "ok",
      };
    },
    async pollJob(_id, idempotencyKey) {
      return {
        provider: "veo",
        status: success ? "succeeded" : "failed",
        idempotencyKey,
        mimeType: "video/mp4",
        bytes: success ? contractMp4() : undefined,
        message: success ? "ok" : "down",
        errorCode: success ? undefined : "unconfigured",
      };
    },
    async cancelJob(_id, idempotencyKey) {
      return { provider: "veo", status: "cancelled", idempotencyKey, message: "cancelled" };
    },
  };
  return registry;
}

test("editor loads active plan only", async () => {
  const supabase = createMemorySupabase();
  const { projectId, planId, inactiveId } = await seed(supabase, { inactiveExtra: true });
  await insertVideoScenes(supabase, {
    userId: USER,
    planId: inactiveId,
    scenes: [scene({ projectId, planId: inactiveId, order: 0, prompt: "Inactive plan scene should not load" })],
  });
  const doc = await loadEditorDocument(supabase, { userId: USER, projectId });
  assert.equal(doc.plan.id, planId);
  assert.equal(doc.scenes.length, 2);
  assert.equal(doc.scenes.every((row) => row.planId === planId), true);
});

test("select scene stays on the active plan", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const loaded = await loadSceneById(supabase, scenes[1]!.id);
  assert.equal(loaded?.id, scenes[1]!.id);
  assert.equal(loaded?.projectId, projectId);
});

test("reorder persists new scene order", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const next = await reorderEditorScenes(supabase, {
    userId: USER,
    projectId,
    orderedSceneIds: [scenes[1]!.id, scenes[0]!.id],
  });
  assert.deepEqual(next.map((row) => row.id), [scenes[1]!.id, scenes[0]!.id]);
});

test("trim start and trim end update duration", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const start = await trimEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    edge: "start",
    seconds: 1,
  });
  assert.equal(start.duration, 7);
  assert.equal(editorStateOf(start).trimInSec, 1);
  const end = await trimEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    edge: "end",
    seconds: 2,
  });
  assert.equal(end.duration, 5);
});

test("split scene creates a sibling on the active plan", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes, planId } = await seed(supabase);
  const result = await splitEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    atSec: 3,
    requestId: "split-request-1",
  });
  assert.equal(result.scenes.length, 3);
  assert.equal(result.left.duration, 3);
  assert.equal(result.right.duration, 5);
  assert.equal(result.right.planId, planId);
  assert.equal(result.right.artifactId, undefined);
});

test("duplicate scene copies metadata without mixing plans", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const result = await duplicateEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    requestId: "dup-request-1",
  });
  assert.equal(result.scenes.length, 3);
  assert.equal(result.scene.prompt, scenes[0]!.prompt);
  assert.notEqual(result.scene.id, scenes[0]!.id);
});

test("delete scene keeps remaining order compact", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const result = await deleteEditorScene(supabase, { userId: USER, projectId, sceneId: scenes[0]!.id });
  assert.equal(result.scenes.length, 1);
  assert.equal(result.scenes[0]!.order, 0);
  assert.equal(result.scenes[0]!.id, scenes[1]!.id);
});

test("update prompt persists on the domain scene", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const updated = await patchEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    patch: { prompt: "Revised studio lighting with product-only table" },
  });
  assert.match(updated.prompt, /Revised studio lighting/);
});

test("update duration persists", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const updated = await patchEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    patch: { duration: 6 },
  });
  assert.equal(updated.duration, 6);
});

test("failed regeneration keeps the original artifact", async () => {
  const supabase = createMemorySupabase();
  const { projectId, planId, scenes } = await seed(supabase);
  const artifactId = randomUUID();
  await supabase.from("video_media").insert({
    id: artifactId,
    user_id: USER,
    generation_id: projectId,
    scene_id: scenes[0]!.id,
    kind: "clip",
    mime_type: "video/mp4",
    storage_path: "a.mp4",
    public_url: "https://signed.example/a.mp4",
    size_bytes: 5000,
    duration_sec: 8,
    provider: "kling",
  });
  await patchEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    patch: {},
  });
  await supabase
    .from("video_scenes")
    .update({ artifact_id: artifactId, status: "ready" })
    .eq("id", scenes[0]!.id);
  try {
    await regenerateScene(supabase, {
      userId: USER,
      projectId,
      planId,
      sceneId: scenes[0]!.id,
      options: { registry: mockProvider(false), requestId: "regen-fail-1" },
    });
  } catch (error) {
    assert.ok(error instanceof SceneRegenerationError || error instanceof Error);
  }
  const kept = await loadSceneById(supabase, scenes[0]!.id);
  assert.equal(kept?.artifactId, artifactId);
});

test("successful regeneration switches the active artifact", async () => {
  const supabase = createMemorySupabase();
  const { projectId, planId, scenes } = await seed(supabase);
  const oldId = randomUUID();
  await supabase.from("video_media").insert({
    id: oldId,
    user_id: USER,
    generation_id: projectId,
    scene_id: scenes[0]!.id,
    kind: "clip",
    mime_type: "video/mp4",
    storage_path: "old.mp4",
    public_url: "https://signed.example/old.mp4",
    size_bytes: 5000,
    duration_sec: 8,
    provider: "kling",
  });
  await supabase.from("video_scenes").update({ artifact_id: oldId, status: "ready" }).eq("id", scenes[0]!.id);
  const result = await regenerateScene(supabase, {
    userId: USER,
    projectId,
    planId,
    sceneId: scenes[0]!.id,
    options: { registry: mockProvider(true), requestId: "regen-ok-1" },
  });
  assert.ok(result.activeArtifactId);
  assert.notEqual(result.activeArtifactId, oldId);
});

test("undo and redo track local editor commands", () => {
  let history = createEditorHistory();
  history = pushEditorCommand(history, { type: "reorder", before: ["a", "b"], after: ["b", "a"] });
  history = pushEditorCommand(history, { type: "patch", sceneId: "a", before: { duration: 8 }, after: { duration: 5 } });
  const undone = undoEditorCommand(history);
  assert.equal(undone.command?.type, "patch");
  const redone = redoEditorCommand(undone.history);
  assert.equal(redone.command?.type, "patch");
});

test("save and reload persistence", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  await saveEditorScenes(supabase, {
    userId: USER,
    projectId,
    patches: [{ sceneId: scenes[0]!.id, patch: { prompt: "Saved studio product scene after reload" } }],
  });
  const doc = await loadEditorDocument(supabase, { userId: USER, projectId });
  assert.match(doc.scenes[0]!.prompt, /Saved studio product scene/);
});

test("foreign scene is rejected", async () => {
  const supabase = createMemorySupabase();
  const first = await seed(supabase);
  const second = await seed(supabase);
  await assert.rejects(
    () =>
      patchEditorScene(supabase, {
        userId: USER,
        projectId: first.projectId,
        sceneId: second.scenes[0]!.id,
        patch: { prompt: "Should not write across projects" },
      }),
    (error: unknown) => error instanceof EditorMvpError && error.code === "foreign_scene",
  );
});

test("inactive plan is rejected", async () => {
  const supabase = createMemorySupabase();
  const { projectId, inactiveId } = await seed(supabase, { inactiveExtra: true });
  const inactiveScene = scene({ projectId, planId: inactiveId, order: 0, prompt: "Inactive plan scene body copy" });
  await insertVideoScenes(supabase, { userId: USER, planId: inactiveId, scenes: [inactiveScene] });
  await assert.rejects(
    () =>
      patchEditorScene(supabase, {
        userId: USER,
        projectId,
        sceneId: inactiveScene.id,
        patch: { prompt: "Should not edit inactive plan scenes" },
      }),
    (error: unknown) => error instanceof EditorMvpError && (error.code === "plan_mixing" || error.code === "inactive_plan"),
  );
});

test("no plan mixing on reorder", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes, inactiveId } = await seed(supabase, { inactiveExtra: true });
  const foreign = scene({ projectId, planId: inactiveId, order: 0, prompt: "Foreign plan scene for reorder" });
  await insertVideoScenes(supabase, { userId: USER, planId: inactiveId, scenes: [foreign] });
  await assert.rejects(
    () =>
      reorderEditorScenes(supabase, {
        userId: USER,
        projectId,
        orderedSceneIds: [scenes[0]!.id, foreign.id],
      }),
    EditorMvpError,
  );
});

test("duplicate split request does not create a second scene", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  const first = await splitEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    atSec: 3,
    requestId: "same-split",
  });
  const second = await splitEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: scenes[0]!.id,
    atSec: 3,
    requestId: "same-split",
  });
  assert.equal(first.right.id, second.right.id);
  assert.equal(second.scenes.length, first.scenes.length);
});

test("delete then restore keeps the original scene on the active plan", async () => {
  const supabase = createMemorySupabase();
  const { projectId, planId, scenes } = await seed(supabase);
  const deleted = scenes[0]!;
  await deleteEditorScene(supabase, { userId: USER, projectId, sceneId: deleted.id });
  const restored = await restoreEditorScene(supabase, {
    userId: USER,
    projectId,
    sceneId: deleted.id,
    index: 0,
    scene: deleted,
  });
  assert.equal(restored.scenes.length, 2);
  assert.equal(restored.scene.id, deleted.id);
  assert.equal(restored.scene.planId, planId);
  assert.equal(restored.scenes[0]!.id, deleted.id);
});

test("restore rejects a scene from another project", async () => {
  const supabase = createMemorySupabase();
  const first = await seed(supabase);
  const second = await seed(supabase);
  await assert.rejects(
    () =>
      restoreEditorScene(supabase, {
        userId: USER,
        projectId: first.projectId,
        sceneId: second.scenes[0]!.id,
        index: 0,
        scene: second.scenes[0]!,
      }),
    (error: unknown) => error instanceof EditorMvpError && error.code === "foreign_scene",
  );
});

test("ownership rejects another user", async () => {
  const supabase = createMemorySupabase();
  const { projectId, scenes } = await seed(supabase);
  await assert.rejects(
    () =>
      patchEditorScene(supabase, {
        userId: OTHER,
        projectId,
        sceneId: scenes[0]!.id,
        patch: { prompt: "Stolen edit" },
      }),
    (error: unknown) => error instanceof EditorMvpError && (error.code === "not_found" || error.code === "ownership"),
  );
});
