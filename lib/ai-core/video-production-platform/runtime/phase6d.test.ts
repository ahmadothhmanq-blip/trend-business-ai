import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { classifyProviderHttpError, isRetryableProviderError } from "@/lib/ai-core/video-production-platform/providers/provider-errors";
import {
  extractVeoOperationName,
  getVeoGenerationAvailability,
  markVeoQuotaExhausted,
  resetVeoQuotaState,
  veoConfigured,
} from "@/lib/ai-core/video-production-platform/providers/veo";
import { runwayVideoProvider } from "@/lib/ai-core/video-production-platform/providers/runway";
import { mapV1ResultToHandle, createProviderRegistry } from "@/lib/ai-core/video-production-platform/provider-router";
import { persistRoutedProviderJob, createSupabaseProviderJobStore } from "@/lib/ai-core/video-production-platform/provider-router/jobs";
import type { ProviderJobHandle, ProviderJobRequest, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";
import { processDueProviderJobs } from "@/lib/ai-core/video-production-platform/runtime/provider-job-worker";
import { isJobPollDue, isProviderJobStale, PROVIDER_STALE_JOB_TIMEOUT_MS } from "@/lib/ai-core/video-production-platform/runtime/timeouts";
import { listProviderJobsForProject } from "@/lib/ai-core/video-production-platform/persistence";

const PROJECT = randomUUID();
const SCENE = randomUUID();
const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_provider_jobs: [],
    video_scenes: [],
    video_media: [],
    video_quality_reports: [],
    video_generations: [],
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
          const row: Record<string, unknown> = { created_at: new Date().toISOString(), retry_count: 0, ...raw };
          if (!row.id) row.id = randomUUID();
          rows.push(row);
          data.push(row);
        }
      } else if (state.action === "update") {
        for (const row of rows) {
          if (matches(row, state.filters)) {
            Object.assign(row, state.payload as object);
            data.push(row);
          }
        }
      } else {
        data = rows.filter((row) => matches(row, state.filters));
        if (state.orderCol) {
          const col = state.orderCol;
          data.sort((a, b) => String(a[col] ?? "").localeCompare(String(b[col] ?? "")));
        }
        if (state.limitN != null) data = data.slice(0, state.limitN);
      }
      if (error) return { data: null, error };
      if (shape === "single") return { data: data[0] || null, error: data[0] ? null : { message: "missing" } };
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
            return {
              data: { signedUrl: `data:video/mp4;base64,${Buffer.from(lastUpload).toString("base64")}` },
            };
          },
          getPublicUrl() {
            return {
              data: { publicUrl: `data:video/mp4;base64,${Buffer.from(lastUpload).toString("base64")}` },
            };
          },
        };
      },
    },
    _tables: tables,
  };
}

function mockProvider(behavior: {
  poll?: ProviderJobHandle["status"];
  errorCode?: string;
}): VideoProviderV2 {
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  return {
    ...registry.veo,
    status: () => "ready",
    health: () => ({ ok: true, status: "ready", reason: "mock" }),
    async createJob(request: ProviderJobRequest): Promise<ProviderJobHandle> {
      return {
        provider: "veo",
        status: "processing",
        externalJobId: "models/veo-3.1-generate-preview/operations/abc",
        idempotencyKey: request.idempotencyKey,
        message: "accepted",
      };
    },
    async pollJob(externalJobId, idempotencyKey): Promise<ProviderJobHandle> {
      const status = behavior.poll || "succeeded";
      return {
        provider: "veo",
        status,
        externalJobId,
        idempotencyKey,
        mimeType: "video/mp4",
        bytes: status === "succeeded" ? contractMp4() : undefined,
        errorCode: status === "failed" ? behavior.errorCode || "provider_degraded" : undefined,
        message: status === "succeeded" ? "ok" : "failed",
      };
    },
    async cancelJob(_id, idempotencyKey) {
      return { provider: "veo", status: "cancelled", idempotencyKey, message: "cancelled" };
    },
  };
}

test("Veo 429 RESOURCE_EXHAUSTED maps to quota_exhausted and is not retryable", () => {
  const classified = classifyProviderHttpError({
    httpStatus: 429,
    body: JSON.stringify({
      error: { code: 429, message: "You exceeded your current quota", status: "RESOURCE_EXHAUSTED" },
    }),
  });
  assert.equal(classified.errorCode, "quota_exhausted");
  assert.equal(classified.retryable, false);
  assert.equal(isRetryableProviderError(classified.errorCode), false);
});

test("Veo error mapping preserves HTTP status and provider status", () => {
  const classified = classifyProviderHttpError({
    httpStatus: 400,
    body: JSON.stringify({ error: { code: 400, message: "Invalid durationSeconds", status: "INVALID_ARGUMENT" } }),
  });
  assert.equal(classified.httpStatus, 400);
  assert.equal(classified.providerStatus, "INVALID_ARGUMENT");
  assert.equal(classified.errorCode, "invalid_request");
});

test("extractVeoOperationName accepts models/*/operations/* names", () => {
  assert.equal(
    extractVeoOperationName({ name: "models/veo-3.1-generate-preview/operations/abc123" }),
    "models/veo-3.1-generate-preview/operations/abc123",
  );
  assert.equal(extractVeoOperationName({ name: "operations/abc123" }), "operations/abc123");
  assert.equal(extractVeoOperationName({ name: "models/veo-3.1-generate-preview" }), undefined);
});

test("quota cache marks Veo degraded without treating it as ready", () => {
  resetVeoQuotaState();
  try {
    markVeoQuotaExhausted("Veo quota exhausted (HTTP 429).");
    const availability = getVeoGenerationAvailability();
    if (veoConfigured()) {
      assert.equal(availability.status, "degraded");
    }
    const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
    assert.equal(registry.veo.status(), "degraded");
    assert.equal(registry.veo.health().ok, false);
  } finally {
    resetVeoQuotaState();
  }
});

test("mapV1ResultToHandle surfaces quota error instead of generic provider_failed", () => {
  const handle = mapV1ResultToHandle("veo", "idem", {
    provider: "veo",
    status: "failed",
    mimeType: "video/mp4",
    error: "HTTP 429 RESOURCE_EXHAUSTED: You exceeded your current quota",
    errorCode: "quota_exhausted",
    httpStatus: 429,
    message: "Veo quota/billing exhausted. Provider is not ready.",
  });
  assert.equal(handle.status, "failed");
  assert.equal(handle.errorCode, "quota_exhausted");
  assert.match(handle.message, /429|quota/i);
});

test("queued due job is poll-eligible and not-yet-due jobs are skipped", async () => {
  const supabase = createMemorySupabase();
  const dueProject = randomUUID();
  const skippedProject = randomUUID();
  const dueScene = randomUUID();
  await supabase.from("video_scenes").insert({
    id: dueScene,
    project_id: dueProject,
    scene_order: 0,
    duration_sec: 8,
    prompt: "scene",
    visual_style: "cinematic",
    dialogue: { text: "", language: "en" },
    transition: "cut",
    provider_preference: "auto",
    camera: { move: "dolly" },
    status: "processing",
  });
  await supabase.from("video_provider_jobs").insert({
    id: randomUUID(),
    user_id: USER,
    project_id: dueProject,
    scene_id: dueScene,
    provider: "veo",
    status: "queued",
    attempt: 1,
    retry_count: 0,
    idempotency_key: `${dueProject}:${dueScene}:veo:queued-due`,
    external_job_id: "models/veo-3.1-generate-preview/operations/queued-due",
    next_poll_at: new Date(Date.now() - 1000).toISOString(),
    started_at: new Date().toISOString(),
  });
  await supabase.from("video_provider_jobs").insert({
    id: randomUUID(),
    user_id: USER,
    project_id: skippedProject,
    scene_id: randomUUID(),
    provider: "veo",
    status: "processing",
    attempt: 1,
    retry_count: 0,
    idempotency_key: `${skippedProject}:scene:veo:not-due`,
    external_job_id: "models/veo-3.1-generate-preview/operations/not-due",
    next_poll_at: new Date(Date.now() + 60_000).toISOString(),
    started_at: new Date().toISOString(),
  });
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  registry.veo = mockProvider({ poll: "succeeded" });
  const result = await processDueProviderJobs({ supabase, registry });
  assert.equal(result.processed, 1);
  assert.equal(result.succeeded, 1);
  const skipped = await listProviderJobsForProject(supabase, skippedProject);
  assert.equal(skipped[0]?.status, "processing");
});

test("timeout helpers: due jobs vs future nextPollAt, stale only after eligibility", () => {
  const now = Date.parse("2026-08-18T10:00:00.000Z");
  assert.equal(isJobPollDue({ nextPollAt: null, nowMs: now }), true);
  assert.equal(isJobPollDue({ nextPollAt: "2026-08-18T10:01:00.000Z", nowMs: now }), false);
  assert.equal(
    isProviderJobStale({
      startedAt: "2026-08-18T09:00:00.000Z",
      nextPollAt: "2026-08-18T10:01:00.000Z",
      nowMs: now,
      staleAfterMs: PROVIDER_STALE_JOB_TIMEOUT_MS,
    }),
    false,
  );
  assert.equal(
    isProviderJobStale({
      startedAt: "2026-08-18T09:00:00.000Z",
      nextPollAt: "2026-08-18T09:50:00.000Z",
      nowMs: now,
      staleAfterMs: PROVIDER_STALE_JOB_TIMEOUT_MS,
    }),
    true,
  );
});

test("async submission persists processing ProviderJob without waiting for artifact", async () => {
  const supabase = createMemorySupabase();
  const provider = mockProvider({ poll: "processing" });
  const store = createSupabaseProviderJobStore(supabase);
  const routed = await persistRoutedProviderJob({
    userId: USER,
    routeInput: {
      task: "text-to-video",
      quality: "standard",
      duration: 8,
      projectId: PROJECT,
      sceneId: SCENE,
      prompt: "luxury car night",
    },
    store,
    snapshot: { veo: true, kling: false, runway: false, heygen: false, external: false },
    registry: { ...createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false }), veo: provider },
  });
  assert.equal(routed.reused, false);
  const handle = await provider.createJob({
    projectId: PROJECT,
    sceneId: SCENE,
    prompt: "luxury car night",
    promptHash: "hashhashhashhashhashhash",
    durationSec: 8,
    idempotencyKey: routed.job.idempotencyKey,
  });
  assert.equal(handle.status, "processing");
  assert.ok(handle.externalJobId);
});

test("poll success ingests artifact; poll failure keeps history", async () => {
  const supabase = createMemorySupabase();
  const sceneId = SCENE;
  await supabase.from("video_scenes").insert({
    id: sceneId,
    project_id: PROJECT,
    scene_order: 0,
    duration_sec: 8,
    prompt: "scene",
    visual_style: "cinematic",
    dialogue: { text: "", language: "en" },
    transition: "cut",
    provider_preference: "auto",
    camera: { move: "dolly" },
    status: "processing",
  });
  await supabase.from("video_provider_jobs").insert({
    id: randomUUID(),
    user_id: USER,
    project_id: PROJECT,
    scene_id: SCENE,
    provider: "veo",
    status: "processing",
    attempt: 1,
    retry_count: 0,
    idempotency_key: `${PROJECT}:${SCENE}:veo:poll-success`,
    external_job_id: "models/veo-3.1-generate-preview/operations/ok",
    next_poll_at: new Date(Date.now() - 1000).toISOString(),
    started_at: new Date().toISOString(),
  });
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  registry.veo = mockProvider({ poll: "succeeded" });
  const result = await processDueProviderJobs({ supabase, registry });
  assert.equal(result.succeeded, 1);
  const jobs = await listProviderJobsForProject(supabase, PROJECT);
  assert.equal(jobs[0]?.status, "succeeded");
});

test("poll failure is honest and does not fake success", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  await supabase.from("video_provider_jobs").insert({
    id: randomUUID(),
    user_id: USER,
    project_id: projectId,
    scene_id: randomUUID(),
    provider: "veo",
    status: "processing",
    attempt: 1,
    retry_count: 0,
    idempotency_key: `${projectId}:scene:veo:poll-fail`,
    external_job_id: "models/veo-3.1-generate-preview/operations/fail",
    next_poll_at: new Date(Date.now() - 1000).toISOString(),
    started_at: new Date().toISOString(),
  });
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  registry.veo = mockProvider({ poll: "failed", errorCode: "quota_exhausted" });
  const result = await processDueProviderJobs({ supabase, registry });
  assert.equal(result.failed, 1);
  assert.equal(result.retried, 0);
});

test("provider retry uses a new attempt and does not retry quota", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const sceneId = randomUUID();
  await supabase.from("video_scenes").insert({
    id: sceneId,
    project_id: projectId,
    scene_order: 0,
    duration_sec: 8,
    prompt: "scene",
    visual_style: "cinematic",
    dialogue: { text: "", language: "en" },
    transition: "cut",
    provider_preference: "auto",
    camera: { move: "dolly" },
    status: "processing",
  });
  await supabase.from("video_provider_jobs").insert({
    id: randomUUID(),
    user_id: USER,
    project_id: projectId,
    scene_id: sceneId,
    provider: "veo",
    status: "processing",
    attempt: 1,
    retry_count: 0,
    idempotency_key: `${projectId}:${sceneId}:veo:retryable`,
    external_job_id: "models/veo-3.1-generate-preview/operations/retry",
    next_poll_at: new Date(Date.now() - 1000).toISOString(),
    started_at: new Date().toISOString(),
  });
  const registry = createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false });
  registry.veo = mockProvider({ poll: "failed", errorCode: "provider_degraded" });
  const result = await processDueProviderJobs({ supabase, registry });
  assert.equal(result.retried, 1);
  const jobs = await listProviderJobsForProject(supabase, projectId);
  assert.ok(jobs.length >= 2);
  assert.notEqual(jobs[0]?.idempotencyKey, jobs[1]?.idempotencyKey);
});

test("stale job fails only after poll eligibility", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  await supabase.from("video_provider_jobs").insert({
    id: randomUUID(),
    user_id: USER,
    project_id: projectId,
    scene_id: randomUUID(),
    provider: "veo",
    status: "processing",
    attempt: 1,
    retry_count: 0,
    idempotency_key: `${projectId}:scene:veo:stale`,
    external_job_id: "models/veo-3.1-generate-preview/operations/stale",
    next_poll_at: new Date(Date.now() - 1000).toISOString(),
    started_at: new Date(Date.now() - PROVIDER_STALE_JOB_TIMEOUT_MS - 1000).toISOString(),
  });
  const result = await processDueProviderJobs({
    supabase,
    registry: { ...createProviderRegistry({ veo: true, kling: false, runway: false, heygen: false, external: false }), veo: mockProvider({}) },
  });
  assert.equal(result.stale, 1);
  assert.equal(result.failed, 1);
});

test("idempotent persist does not duplicate provider jobs", async () => {
  const supabase = createMemorySupabase();
  const store = createSupabaseProviderJobStore(supabase);
  const routeInput = {
    task: "text-to-video" as const,
    quality: "standard" as const,
    duration: 8,
    projectId: PROJECT,
    sceneId: SCENE,
    prompt: "same prompt",
  };
  const snapshot = { veo: true, kling: false, runway: false, heygen: false, external: false };
  const a = await persistRoutedProviderJob({ userId: USER, routeInput, store, snapshot });
  const b = await persistRoutedProviderJob({ userId: USER, routeInput, store, snapshot });
  assert.equal(b.reused, true);
  assert.equal(a.job.id, b.job.id);
});

test("provider unavailable is honest", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  await supabase.from("video_provider_jobs").insert({
    id: randomUUID(),
    user_id: USER,
    project_id: projectId,
    scene_id: randomUUID(),
    provider: "veo",
    status: "processing",
    attempt: 1,
    idempotency_key: `${projectId}:scene:veo:none`,
    external_job_id: "operations/x",
    next_poll_at: new Date(Date.now() - 1000).toISOString(),
  });
  const result = await processDueProviderJobs({
    supabase,
    registry: createProviderRegistry({ veo: false, kling: false, runway: false, heygen: false, external: false }),
  });
  assert.ok(result.failed >= 1);
});

test("Runway adapter is honest when unconfigured", async () => {
  const original = process.env.RUNWAY_API_KEY;
  delete process.env.RUNWAY_API_KEY;
  const clip = await runwayVideoProvider.generateClip({
    prompt: "test",
    durationSec: 4,
    aspectRatio: "16:9",
  });
  assert.equal(clip.status, "failed");
  assert.equal(clip.errorCode, "unconfigured");
  const poll = await runwayVideoProvider.pollJob!("task-1");
  assert.equal(poll.status, "failed");
  if (original) process.env.RUNWAY_API_KEY = original;
});
