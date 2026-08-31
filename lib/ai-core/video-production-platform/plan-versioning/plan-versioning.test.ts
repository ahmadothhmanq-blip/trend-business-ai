import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { VideoBlueprint } from "@/types/video";
import { readScenesFromBlueprint } from "@/lib/ai-core/video-production-platform/domain/legacy";
import type { Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { directorInputFromGenerateRequest } from "@/lib/ai-core/video-production-platform/director/from-generate";
import { runDirector } from "@/lib/ai-core/video-production-platform/director/service";
import type { DirectorLlmDraft } from "@/lib/ai-core/video-production-platform/director/normalize";
import {
  loadDomainScenes,
  loadPlanForProject,
  loadScenesForPlan,
  resolveActivePlanId,
} from "@/lib/ai-core/video-production-platform/persistence";
import {
  activatePlan,
  archivePlan,
  listProjectPlanVersions,
  PlanVersioningError,
} from "@/lib/ai-core/video-production-platform/plan-versioning";
import { seedDomainProject } from "@/lib/ai-core/video-production-platform/runtime/seed";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_generations: [],
    video_plans: [],
    video_scenes: [],
  };

  function matches(row: Record<string, unknown>, filters: Array<[string, string, unknown]>) {
    return filters.every(([op, key, value]) => op === "eq" && row[key] === value);
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
          if (
            table === "video_plans" &&
            raw.is_active === true &&
            rows.some((row) => row.project_id === raw.project_id && row.is_active === true)
          ) {
            error = { code: "23505", message: "one active plan per project" };
            break;
          }
          if (
            table === "video_scenes" &&
            raw.plan_id &&
            rows.some((row) => row.plan_id === raw.plan_id && row.scene_order === raw.scene_order)
          ) {
            error = { code: "23505", message: "duplicate plan scene order" };
            break;
          }
          const row = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: raw.status ?? "inactive",
            is_active: raw.is_active ?? false,
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
            const av = a[col];
            const bv = b[col];
            if (typeof av === "number" && typeof bv === "number") {
              return state.orderAsc ? av - bv : bv - av;
            }
            return state.orderAsc
              ? String(av ?? "").localeCompare(String(bv ?? ""))
              : String(bv ?? "").localeCompare(String(av ?? ""));
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

    const api: Record<string, unknown> = {
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
      then(resolve: (value: unknown) => unknown, reject: (reason: unknown) => unknown) {
        return execute("many").then(resolve, reject);
      },
    };
    return api;
  }

  return { from, _tables: tables };
}

function sceneDraft(purpose: string, prompt: string): NonNullable<DirectorLlmDraft["scenes"]>[number] {
  return {
    purpose,
    duration: 4,
    prompt,
    cameraMove: "static",
    shotSize: "wide",
    environment: "studio",
    lighting: "controlled",
    transition: "cut",
  };
}

function draftFor(prompt: string): DirectorLlmDraft {
  return {
    objective: `Objective for ${prompt}`,
    narrative: `Narrative for ${prompt}`,
    visualStyle: "cinematic",
    scenes: [sceneDraft("establish", prompt), sceneDraft("develop", `${prompt} closer`)],
  };
}

function llmFor(prompt: string) {
  return {
    async generateJson() {
      return draftFor(prompt);
    },
  };
}

async function planProject(supabase: ReturnType<typeof createMemorySupabase>, prompt: string) {
  const projectId = randomUUID();
  supabase._tables.video_generations.push({
    id: projectId,
    user_id: USER,
    domain_state: "planning",
    active_plan_id: null,
  });
  const input = directorInputFromGenerateRequest({
    prompt,
    videoType: "trailer",
    duration: "8s",
    aspectRatio: "16:9",
    language: "en",
    style: "Cinematic",
    projectId,
  });
  const result = await runDirector({
    supabase,
    userId: USER,
    projectId,
    input,
    client: llmFor(prompt),
  });
  assert.equal(result.status === "ready" || result.status === "reused", true, result.errorMessage);
  assert.ok(result.plan);
  return { projectId, plan: result.plan!, input };
}

test("create Plan v1 on first Director run", async () => {
  const supabase = createMemorySupabase();
  const { projectId, plan } = await planProject(supabase, "Version one cinematic campus film.");
  const versions = await listProjectPlanVersions(supabase, projectId);
  assert.equal(versions.length, 1);
  assert.equal(versions[0]?.version, 1);
  assert.equal(versions[0]?.isActive, true);
  assert.equal(versions[0]?.status, "active");
  assert.equal(versions[0]?.id, plan.id);
});

test("create Plan v2 without deleting v1 or mixing scenes", async () => {
  const supabase = createMemorySupabase();
  const { projectId } = await planProject(supabase, "Version one cinematic campus film.");
  const v1Scenes = await loadDomainScenes(supabase, projectId);
  const v1Snapshot = v1Scenes.map((scene) => ({ ...scene }));

  const v2 = await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "Version two analytics headquarters night film.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      style: "Cinematic",
      projectId,
    }),
    client: llmFor("Version two analytics headquarters night film."),
  });
  assert.equal(v2.status, "ready");
  assert.notEqual(v2.plan?.id, v1Snapshot[0]?.planId);

  const versions = await listProjectPlanVersions(supabase, projectId);
  assert.equal(versions.length, 2);
  assert.equal(versions.find((row) => row.version === 1)?.status, "inactive");
  assert.equal(versions.find((row) => row.version === 2)?.status, "active");

  const activeScenes = await loadDomainScenes(supabase, projectId);
  assert.equal(activeScenes.length, 2);
  assert.ok(activeScenes.every((scene) => scene.planId === v2.plan?.id));
  assert.ok(activeScenes.every((scene) => scene.prompt.includes("Version two")));

  const oldScenes = await loadScenesForPlan(supabase, projectId, v1Snapshot[0]!.planId!);
  assert.equal(oldScenes.length, 2);
  assert.ok(oldScenes.every((scene) => scene.prompt.includes("Version one")));
  assert.deepEqual(
    oldScenes.map((scene) => scene.prompt),
    v1Snapshot.map((scene) => scene.prompt),
  );
});

test("v1 inactive after v2 activated and activePlanId is correct", async () => {
  const supabase = createMemorySupabase();
  const { projectId } = await planProject(supabase, "First pass.");
  const firstPlanId = (await loadPlanForProject(supabase, projectId))!.id;
  await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "Second pass with a new analytics angle.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      projectId,
    }),
    client: llmFor("Second pass with a new analytics angle."),
  });
  const activePlanId = await resolveActivePlanId(supabase, projectId);
  assert.notEqual(activePlanId, firstPlanId);
  const versions = await listProjectPlanVersions(supabase, projectId);
  const v1 = versions.find((row) => row.version === 1)!;
  const v2 = versions.find((row) => row.version === 2)!;
  assert.equal(v1.isActive, false);
  assert.equal(v2.isActive, true);
  assert.equal(activePlanId, v2.id);
});

test("loadDomainScenes uses active plan only", async () => {
  const supabase = createMemorySupabase();
  const { projectId } = await planProject(supabase, "Active plan scenes only.");
  await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "Replacement plan scenes only.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      projectId,
    }),
    client: llmFor("Replacement plan scenes only."),
  });
  const active = await loadDomainScenes(supabase, projectId);
  const allRows = supabase._tables.video_scenes;
  assert.equal(allRows.length, 4);
  assert.equal(active.length, 2);
  assert.ok(active.every((scene) => scene.prompt.includes("Replacement plan")));
});

test("re-plan does not mutate old scenes", async () => {
  const supabase = createMemorySupabase();
  const { projectId } = await planProject(supabase, "Immutable v1 prompt.");
  const before = await loadDomainScenes(supabase, projectId);
  const beforeIds = before.map((scene) => scene.id);
  await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "New v2 prompt with different wording.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      projectId,
    }),
    client: llmFor("New v2 prompt with different wording."),
  });
  const afterV1 = await loadScenesForPlan(supabase, projectId, before[0]!.planId!);
  assert.deepEqual(afterV1.map((scene) => scene.id), beforeIds);
  assert.deepEqual(afterV1.map((scene) => scene.prompt), before.map((scene) => scene.prompt));
});

test("activatePlan is idempotent", async () => {
  const supabase = createMemorySupabase();
  const { projectId } = await planProject(supabase, "Idempotent activation.");
  await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "Second plan for idempotent activation test.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      projectId,
    }),
    client: llmFor("Second plan for idempotent activation test."),
  });
  const v1 = (await listProjectPlanVersions(supabase, projectId)).find((row) => row.version === 1)!;
  const first = await activatePlan(supabase, { projectId, planId: v1.id });
  const second = await activatePlan(supabase, { projectId, planId: v1.id });
  assert.equal(first.reused, false);
  assert.equal(second.reused, true);
  assert.equal(first.planId, second.planId);
});

test("activatePlan rejects foreign project plan", async () => {
  const supabase = createMemorySupabase();
  const a = await planProject(supabase, "Project A.");
  const b = await planProject(supabase, "Project B.");
  await assert.rejects(
    () => activatePlan(supabase, { projectId: a.projectId, planId: b.plan.id }),
    (error: unknown) => error instanceof PlanVersioningError && error.code === "foreign_plan",
  );
});

test("archived plan cannot become implicit active", async () => {
  const supabase = createMemorySupabase();
  const { projectId, plan } = await planProject(supabase, "Archive me.");
  await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "New active plan.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      projectId,
    }),
    client: llmFor("New active plan."),
  });
  await archivePlan(supabase, { projectId, planId: plan.id });
  const archived = (await listProjectPlanVersions(supabase, projectId)).find((row) => row.id === plan.id)!;
  assert.equal(archived.status, "archived");
  assert.equal(archived.isActive, false);
  const active = await loadPlanForProject(supabase, projectId);
  assert.notEqual(active?.id, plan.id);
});

test("rollback via explicit activatePlan shows v1 scenes only", async () => {
  const supabase = createMemorySupabase();
  const { projectId } = await planProject(supabase, "Rollback v1 prompt.");
  const v1PlanId = (await loadPlanForProject(supabase, projectId))!.id;
  await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "Rollback v2 prompt.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      projectId,
    }),
    client: llmFor("Rollback v2 prompt."),
  });
  await activatePlan(supabase, { projectId, planId: v1PlanId });
  const scenes = await loadDomainScenes(supabase, projectId);
  assert.ok(scenes.every((scene) => scene.planId === v1PlanId));
  assert.ok(scenes.every((scene) => scene.prompt.includes("Rollback v1")));
});

test("legacy project remains readable without domain plans", () => {
  const projectId = randomUUID();
  const blueprint: VideoBlueprint = {
    title: "Legacy",
    description: "Old storyboard",
    videoType: "product-demo",
    style: "Cinematic",
    aspectRatio: "16:9",
    totalDuration: "8s",
    scenes: [
      {
        id: "legacy-1",
        name: "Hero",
        description: "Studio product",
        duration: "8s",
        visualPrompt: "Controlled studio product table",
        cameraMove: "Static",
        mood: "Professional",
        narration: "",
        musicDirection: "",
        sfxNotes: "",
        transition: "cut",
        svgStoryboard: "",
      },
    ],
    script: "",
    voiceoverScript: "",
    musicSuggestions: [],
    subtitles: [],
    thumbnailSvg: "",
    colorGrade: "",
    exportPreset: "1080p",
    files: [],
    prompt: "legacy",
    language: "en",
    generatedAt: new Date().toISOString(),
  };
  const scenes = readScenesFromBlueprint(blueprint, projectId);
  assert.equal(scenes.length, 1);
  assert.equal(scenes[0]?.prompt, "Controlled studio product table");
});

test("legacy seed creates Plan v1 without deleting blueprint source", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const generation = {
    id: projectId,
    user_id: USER,
    video_name: "Legacy",
    video_type: "storyboard",
    description: "Legacy seed",
    style: "Cinematic",
    aspect_ratio: "16:9",
    duration: "8s",
    options: [],
    prompt: "legacy prompt",
    blueprint: {
      title: "Legacy",
      description: "",
      videoType: "storyboard",
      style: "Cinematic",
      aspectRatio: "16:9",
      totalDuration: "8s",
      scenes: [
        {
          id: "legacy-1",
          name: "Hero",
          description: "Open",
          duration: "8s",
          visualPrompt: "Controlled studio product table",
          cameraMove: "Static",
          mood: "Professional",
          narration: "",
          musicDirection: "",
          sfxNotes: "",
          transition: "cut",
          svgStoryboard: "",
        },
      ],
      script: "",
      voiceoverScript: "",
      musicSuggestions: [],
      subtitles: [],
      thumbnailSvg: "",
      colorGrade: "",
      exportPreset: "1080p",
      files: [],
      prompt: "legacy prompt",
      language: "en",
      generatedAt: new Date().toISOString(),
    },
    status: "storyboard_ready" as const,
    mode: "generate" as const,
    provider: null,
    token_usage: null,
    generation_time_ms: null,
    parent_generation_id: null,
    project_id: null,
    is_favorite: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    domain_state: "planning",
  };
  supabase._tables.video_generations.push({
    id: projectId,
    user_id: USER,
    domain_state: "planning",
    active_plan_id: null,
  });
  const seeded = await seedDomainProject(supabase, { userId: USER, generation });
  assert.equal(seeded.seeded, true);
  assert.equal(seeded.planId != null, true);
  const versions = await listProjectPlanVersions(supabase, projectId);
  assert.equal(versions.length, 1);
  assert.equal(versions[0]?.version, 1);
  const scenes = await loadDomainScenes(supabase, projectId);
  assert.equal(scenes.length, 1);
});

test("render path reads active plan only", async () => {
  const supabase = createMemorySupabase();
  const { projectId } = await planProject(supabase, "Render active v1.");
  const v1PlanId = (await loadPlanForProject(supabase, projectId))!.id;
  await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: directorInputFromGenerateRequest({
      prompt: "Render active v2.",
      videoType: "trailer",
      duration: "8s",
      aspectRatio: "16:9",
      language: "en",
      projectId,
    }),
    client: llmFor("Render active v2."),
  });
  const renderScenes = await loadDomainScenes(supabase, projectId);
  assert.ok(renderScenes.every((scene: Scene) => scene.planId !== v1PlanId));
  assert.ok(renderScenes.every((scene) => scene.prompt.includes("Render active v2")));
});
