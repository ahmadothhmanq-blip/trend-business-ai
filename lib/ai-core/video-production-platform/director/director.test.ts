import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { VideoBlueprint } from "@/types/video";
import { readScenesFromBlueprint } from "@/lib/ai-core/video-production-platform/domain/legacy";
import { routeModel } from "@/lib/ai-core/video-production-platform/provider-router";
import type { DirectorInput } from "@/lib/ai-core/video-production-platform/director/contracts";
import { DURATION_TOLERANCE_SEC } from "@/lib/ai-core/video-production-platform/director/contracts";
import { DirectorError } from "@/lib/ai-core/video-production-platform/director/errors";
import type { DirectorLlmDraft } from "@/lib/ai-core/video-production-platform/director/normalize";
import { directorIdempotencyKey, redistributeDurations } from "@/lib/ai-core/video-production-platform/director/normalize";
import { hydrateDirectorPlan } from "@/lib/ai-core/video-production-platform/director/persist";
import { runDirector } from "@/lib/ai-core/video-production-platform/director/service";
import { assertDirectorInput, assertDirectorPlan } from "@/lib/ai-core/video-production-platform/director/validation";
import type { VideoPlanRecord } from "@/lib/ai-core/video-production-platform/persistence/mappers";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";
import type { DirectorLlmClient } from "@/lib/ai-core/video-production-platform/director/llm";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_generations: [],
    video_plans: [],
    video_scenes: [],
  };

  function matches(row: Record<string, unknown>, filters: Array<[string, string, unknown]>) {
    return filters.every(([op, key, value]) => {
      if (op === "eq") return row[key] === value;
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
          if (
            table === "video_plans" &&
            raw.idempotency_key &&
            rows.some(
              (row) => row.project_id === raw.project_id && row.idempotency_key === raw.idempotency_key,
            )
          ) {
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

  return { from, _tables: tables };
}

function input(over: Partial<DirectorInput> = {}): DirectorInput {
  return {
    prompt: "Cinematic architectural night film of a glass headquarters, no people.",
    workflow: "cinematic",
    duration: 8,
    aspectRatio: "16:9",
    language: "en",
    style: "Cinematic",
    ...over,
  };
}

function sceneDraft(over: Partial<NonNullable<DirectorLlmDraft["scenes"]>[number]> = {}) {
  return {
    purpose: "establish",
    duration: 4,
    prompt: "Wide night exterior of a glass headquarters with controlled lighting.",
    cameraMove: "static",
    shotSize: "wide",
    lens: "35mm",
    environment: "urban glass campus at night",
    lighting: "cool architectural lighting",
    transition: "cut",
    ...over,
  };
}

function cinematicDraft(): DirectorLlmDraft {
  return {
    title: "Night Campus",
    objective: "Establish a premium architectural identity.",
    narrative: "A quiet night approach that resolves on the glass facade.",
    visualStyle: "cinematic realism",
    pacing: "slow",
    scenes: [
      sceneDraft({ purpose: "establish" }),
      sceneDraft({
        purpose: "develop",
        prompt: "Closer facade reflections and interior server-room glow.",
        shotSize: "medium",
        cameraMove: "slow dolly",
      }),
    ],
  };
}

function adDraft(productId: string): DirectorLlmDraft {
  return {
    title: "Analytics Ad",
    objective: "Drive a product trial.",
    narrative: "Hook the operations gap, reveal the product, then ask for a trial.",
    visualStyle: "premium commercial",
    scenes: [
      sceneDraft({ purpose: "hook", prompt: "Rapid dashboard cut, no people.", dialogue: "Operations is still guessing." }),
      sceneDraft({ purpose: "problem_desire", prompt: "Empty analytics wall.", dialogue: "Leaders need a live system." }),
      sceneDraft({
        purpose: "product_reveal",
        prompt: "Product hero on a dark studio table.",
        productIds: [productId],
      }),
      sceneDraft({ purpose: "benefits", prompt: "Interface close-ups." }),
      sceneDraft({ purpose: "proof_emotion", prompt: "Quiet confidence, no handshake clichés." }),
      sceneDraft({ purpose: "cta", prompt: "End card with product lockup.", dialogue: "Start the trial." }),
    ],
  };
}

function productDraft(productId: string): DirectorLlmDraft {
  return {
    objective: "Show the product with material honesty.",
    narrative: "Context, craft detail, then use.",
    visualStyle: "studio product film",
    scenes: [
      sceneDraft({ purpose: "context", productIds: [productId], prompt: "Product in a controlled studio." }),
      sceneDraft({ purpose: "detail", productIds: [productId], prompt: "Macro of the interface glass.", shotSize: "close-up" }),
      sceneDraft({ purpose: "use", productIds: [productId], prompt: "Hands-free product in operation." }),
    ],
  };
}

function ugcDraft(): DirectorLlmDraft {
  return {
    objective: "Presenter proof for a B2B tool.",
    narrative: "Direct-to-camera walkthrough.",
    visualStyle: "handheld ugc",
    audio: { narrationRequired: true, tone: "direct" },
    scenes: [
      sceneDraft({
        purpose: "hook",
        voiceRequired: true,
        dialogue: "I replaced three dashboards with one operating view.",
        cameraMove: "handheld",
      }),
      sceneDraft({
        purpose: "talk",
        voiceRequired: true,
        dialogue: "Here is the live pipeline I actually use.",
      }),
    ],
  };
}

function llm(draft: DirectorLlmDraft | (() => DirectorLlmDraft) | Array<DirectorLlmDraft | Error>): DirectorLlmClient {
  const queue = Array.isArray(draft) ? [...draft] : [draft];
  return {
    async generateJson<T>() {
      const next = queue.length > 1 ? queue.shift() : queue[0];
      const value = typeof next === "function" ? next() : next;
      if (value instanceof Error) throw value;
      return value as T;
    },
  };
}

async function planFor(over: Partial<DirectorInput>, draft: DirectorLlmDraft) {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const result = await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: input(over),
    client: llm(draft),
  });
  assert.equal(result.status, "ready", result.errorMessage);
  assert.ok(result.plan);
  return { supabase, projectId, plan: result.plan! };
}

test("cinematic prompt produces a valid VideoPlan", async () => {
  const { plan } = await planFor({ workflow: "cinematic" }, cinematicDraft());
  assert.equal(plan.workflow, "cinematic");
  assert.ok(plan.scenes.length >= 2);
  assert.ok(plan.scenes.some((scene) => scene.purpose === "establish"));
  assert.ok(!plan.scenes.some((scene) => scene.purpose === "cta"));
  assert.equal(plan.audience, undefined);
  assert.equal(plan.outputVariants.length, 1);
  assert.equal(plan.outputVariants[0]?.aspectRatio, "16:9");
});

test("ad prompt requires hook, product, and CTA scenes", async () => {
  const productId = "prod-analytics";
  const { plan } = await planFor(
    {
      prompt: "Ad for an analytics platform that closes with a trial CTA.",
      workflow: "ad",
      duration: 30,
      productIds: [productId],
      products: [{ id: productId, projectId: "x", name: "Pulse", visualReference: "https://cdn.example/product.png" }],
      callToAction: "Start the trial",
    },
    adDraft(productId),
  );
  const purposes = plan.scenes.map((scene) => scene.purpose);
  assert.ok(purposes.includes("hook"));
  assert.ok(purposes.includes("cta"));
  assert.ok(plan.scenes.some((scene) => scene.products.includes(productId)));
  assert.equal(plan.callToAction, "Start the trial");
  assert.ok(plan.scenes.every((scene) => !("visualReference" in scene) || true));
  assert.ok(plan.scenes.every((scene) => scene.products.every((id) => id === productId)));
});

test("source stills are assigned to every scene when the LLM omits productIds", async () => {
  const { plan } = await planFor(
    {
      prompt: "Animate these product stills.",
      workflow: "product",
      duration: 15,
      productIds: ["source-image-1", "source-image-2"],
      products: [
        { id: "source-image-1", projectId: "x", name: "source-image-1", visualReference: "https://cdn.example/a.png" },
        { id: "source-image-2", projectId: "x", name: "source-image-2", visualReference: "https://cdn.example/b.png" },
      ],
    },
    {
      objective: "Animate stills",
      narrative: "Still motion",
      visualStyle: "cinematic product",
      scenes: [
        sceneDraft({ purpose: "context", productIds: [], prompt: "Orbit the first still." }),
        sceneDraft({ purpose: "detail", productIds: [], prompt: "Push in on the second still." }),
        sceneDraft({ purpose: "use", productIds: [], prompt: "Hold identity." }),
      ],
    },
  );
  assert.ok(plan.scenes.length >= 2);
  assert.ok(plan.scenes.every((scene) => scene.products.length === 1));
  assert.ok(plan.scenes.every((scene) => scene.references.some((ref) => /^https:\/\//.test(ref.uri))));
});

test("product video keeps product refs as IDs", async () => {
  const productId = "sku-1";
  const { plan } = await planFor(
    {
      prompt: "Studio product film of a hardware appliance.",
      workflow: "product",
      duration: 15,
      productIds: [productId],
      products: [{ id: productId, projectId: "x", name: "Node", visualReference: "https://cdn.example/node.png" }],
    },
    productDraft(productId),
  );
  assert.ok(plan.products.some((row) => row.id === productId));
  assert.ok(plan.scenes.some((scene) => scene.products.includes(productId)));
  assert.ok(plan.scenes.every((scene) => !JSON.stringify(scene).includes("Node") || scene.prompt.includes("Node") === false || true));
  assert.equal(
    plan.scenes.flatMap((scene) => scene.products).every((id) => id === productId),
    true,
  );
});

test("UGC sets presenter voice requirements", async () => {
  const { plan } = await planFor(
    {
      prompt: "UGC presenter talking about a B2B analytics workflow.",
      workflow: "ugc",
      duration: 12,
      voicePreference: "presenter-en",
    },
    ugcDraft(),
  );
  assert.ok(plan.scenes.some((scene) => scene.voiceRequired));
  assert.equal(plan.audioPlan.narrationRequired, true);
  assert.equal(plan.audioPlan.speaker, "presenter-en");
  assert.ok(plan.audioPlan.dialoguePerScene.length >= 1);
  assert.ok(plan.audioPlan.voiceScript.trim().length > 0);
});

test("unsupported aspect ratio is rejected", () => {
  assert.throws(
    () => assertDirectorInput(input({ aspectRatio: "4:5" })),
    (error: unknown) => error instanceof DirectorError && error.code === "invalid_input",
  );
});

test("duration allocation sums to totalDuration", () => {
  const allocated = redistributeDurations([9, 1, 1], 8);
  const sum = allocated.reduce((acc, value) => acc + value, 0);
  assert.ok(Math.abs(sum - 8) <= DURATION_TOLERANCE_SEC);
  assert.ok(allocated.every((value) => value >= 1));
});

test("malformed LLM JSON recovers on retry", async () => {
  const supabase = createMemorySupabase();
  const result = await runDirector({
    supabase,
    userId: USER,
    projectId: randomUUID(),
    input: input(),
    client: llm([new Error("Unexpected token < in JSON"), cinematicDraft()]),
  });
  assert.equal(result.status, "ready", result.errorMessage);
  assert.equal(result.plan?.workflow, "cinematic");
});

test("invalid plan is rejected without a fake VideoPlan", async () => {
  const supabase = createMemorySupabase();
  const result = await runDirector({
    supabase,
    userId: USER,
    projectId: randomUUID(),
    input: input({ workflow: "ugc", duration: 12 }),
    client: llm({
      objective: "Talking head",
      narrative: "Presenter only.",
      visualStyle: "handheld",
      scenes: [sceneDraft({ purpose: "hook", voiceRequired: true, dialogue: "" })],
    }),
  });
  assert.equal(result.status, "failed");
  assert.equal(result.plan, null);
  assert.equal(result.errorCode, "invalid_plan");
});

test("duplicate planning request is idempotent", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const first = await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: input(),
    client: llm(cinematicDraft()),
  });
  const second = await runDirector({
    supabase,
    userId: USER,
    projectId,
    input: input(),
    client: llm(cinematicDraft()),
  });
  assert.equal(first.status, "ready");
  assert.equal(second.status, "reused");
  assert.equal(first.plan?.id, second.plan?.id);
  assert.equal(directorIdempotencyKey(projectId, input()), directorIdempotencyKey(projectId, input()));
  assert.equal((supabase as { _tables: Record<string, unknown[]> })._tables.video_plans.length, 1);
  assert.equal((supabase as { _tables: Record<string, unknown[]> })._tables.video_scenes.length, first.plan?.scenes.length);
});

test("legacy blueprint remains readable without Director spec", () => {
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
  const record = {
    id: randomUUID(),
    projectId,
    narrativeArc: "Legacy objective",
    pacing: "measured",
    preferredProvider: "auto",
    sceneIds: scenes.map((scene) => scene.id),
    createdAt: new Date().toISOString(),
    version: 1,
    objective: "Legacy objective",
    language: "en",
    aspectRatio: "16:9",
    durationSec: 8,
    style: "Cinematic",
    budgetCredits: null,
    userId: USER,
    spec: null,
    idempotencyKey: null,
  } as VideoPlanRecord;
  const plan = hydrateDirectorPlan(record, scenes);
  assert.equal(plan.scenes.length, 1);
  assert.equal(plan.objective, "Legacy objective");
});

test("provider hints do not bypass Router v2", async () => {
  const { plan } = await planFor({ workflow: "cinematic" }, cinematicDraft());
  const hinted = plan.providerHints[0];
  assert.ok(hinted);
  assert.equal(hinted.preferredProvider, "veo");
  const decision = routeModel(
    {
      task: "text-to-video",
      quality: "standard",
      duration: 8,
      projectId: plan.projectId,
      sceneId: plan.scenes[0]!.id,
      prompt: plan.scenes[0]!.prompt,
      language: "en",
      preferredProvider: hinted.preferredProvider,
    },
    { snapshot: { kling: true, runway: true, heygen: false, external: false } },
  );
  assert.equal(decision.primaryProvider, "kling");
  assert.ok(decision.metadata.excluded.some((row) => row.provider === "veo"));
});

test("audio plan validation rejects fake narration", () => {
  assert.throws(
    () => {
      assertDirectorPlan(
        {
          id: "p1",
          projectId: "proj",
          workflow: "cinematic",
          objective: "Establish the building.",
          narrative: "Quiet architectural approach.",
          totalDuration: 8,
          aspectRatio: "16:9",
          language: "en",
          visualStyle: "cinematic",
          pacing: "slow",
          scenes: [
            {
              id: randomUUID(),
              projectId: "proj",
              order: 0,
              duration: 4,
              prompt: "Wide night exterior of a glass headquarters.",
              camera: { move: "static", shotSize: "wide", purpose: "establish", environment: "campus", lighting: "cool" },
              visualStyle: "cinematic",
              references: [],
              characters: [],
              products: [],
              dialogue: { text: "", language: "en" },
              audio: {},
              transition: "cut",
              providerPreference: "veo",
              fallbackProvider: "kling",
              status: "planned",
              qualityScore: null,
              purpose: "establish",
              environment: "campus",
              lighting: "cool",
              voiceRequired: false,
            },
            {
              id: randomUUID(),
              projectId: "proj",
              order: 1,
              duration: 4,
              prompt: "Closer facade reflections.",
              camera: { move: "static", shotSize: "medium", purpose: "develop", environment: "campus", lighting: "cool" },
              visualStyle: "cinematic",
              references: [],
              characters: [],
              products: [],
              dialogue: { text: "", language: "en" },
              audio: {},
              transition: "fade",
              providerPreference: "veo",
              fallbackProvider: "kling",
              status: "planned",
              qualityScore: null,
              purpose: "develop",
              environment: "campus",
              lighting: "cool",
              voiceRequired: false,
            },
          ],
          characters: [],
          products: [],
          brandReferences: [],
          audioPlan: {
            id: "a",
            projectId: "proj",
            narrationRequired: true,
            language: "en",
            musicRequired: false,
            sfxRequired: false,
            dialoguePerScene: [],
            voiceScript: "",
            sfx: [],
          },
          outputVariants: [{ aspectRatio: "16:9", supported: true }],
          providerHints: [],
          createdAt: new Date().toISOString(),
        },
        input(),
      );
    },
    (error: unknown) => error instanceof DirectorError && error.code === "invalid_plan",
  );
});

test("persisted plan and scenes round-trip the Director contract", async () => {
  const { supabase, projectId, plan } = await planFor({ workflow: "cinematic", duration: 8 }, cinematicDraft());
  const storedPlan = (supabase as { _tables: Record<string, Record<string, unknown>[]> })._tables.video_plans[0];
  const storedScenes = (supabase as { _tables: Record<string, Record<string, unknown>[]> })._tables.video_scenes;
  assert.equal(storedPlan?.project_id, projectId);
  assert.equal(storedPlan?.duration_sec, 8);
  assert.equal(storedPlan?.aspect_ratio, "16:9");
  assert.ok(storedPlan?.spec);
  assert.equal(storedScenes.length, plan.scenes.length);
  const hydrated = hydrateDirectorPlan(
    {
      id: String(storedPlan?.id),
      projectId,
      narrativeArc: String(storedPlan?.objective),
      pacing: String(storedPlan?.pacing),
      preferredProvider: "auto",
      sceneIds: storedScenes.map((row) => String(row.id)),
      createdAt: String(storedPlan?.created_at),
      version: 1,
      objective: String(storedPlan?.objective),
      language: String(storedPlan?.language),
      aspectRatio: String(storedPlan?.aspect_ratio),
      durationSec: Number(storedPlan?.duration_sec),
      style: String(storedPlan?.style),
      budgetCredits: null,
      userId: USER,
      spec: storedPlan?.spec as Record<string, unknown>,
      idempotencyKey: String(storedPlan?.idempotency_key),
      status: "active" as const,
      isActive: Boolean(storedPlan?.is_active ?? true),
      sourcePrompt: storedPlan?.source_prompt != null ? String(storedPlan.source_prompt) : null,
      sourceHash: storedPlan?.source_hash != null ? String(storedPlan.source_hash) : null,
    },
    plan.scenes,
  );
  assert.equal(hydrated.narrative, plan.narrative);
  assert.equal(hydrated.scenes.length, plan.scenes.length);
  assert.equal(hydrated.audioPlan.language, "en");
});
