import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";
import { ProviderNotConfiguredError } from "@/lib/ai-core/video-production-platform/providers";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain";
import { readProjectWithScenes } from "@/lib/ai-core/video-production-platform/persistence";
import { listProviderJobsForProject } from "@/lib/ai-core/video-production-platform/persistence/repository";
import {
  createProviderRegistry,
  persistRoutedProviderJob,
  routeModel,
  createSupabaseProviderJobStore,
} from "@/lib/ai-core/video-production-platform/provider-router";
import type { ProviderJobRequest, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { seedDomainProject } from "@/lib/ai-core/video-production-platform/runtime/seed";
import { ingestProviderArtifact, ArtifactIngestError } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import { runDomainRenderPipeline } from "@/lib/ai-core/video-production-platform/runtime/render-pipeline";
import { currentDomainState } from "@/lib/ai-core/video-production-platform/runtime/seed";
import type { AssemblyInput, AssemblyResult } from "@/lib/ai-core/video-production-platform/assemble";
import {
  getMemoryCreditBalance,
  resetMemoryCreditLedger,
  seedMemoryCreditBalance,
} from "@/lib/billing/credit-ledger-memory";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

async function ffmpegAssemble(input: AssemblyInput): Promise<AssemblyResult> {
  const bytes = contractMp4();
  return {
    method: "ffmpeg",
    bytes,
    mimeType: "video/mp4",
    note: "test ffmpeg assemble",
    manifest: {
      clipUrls: input.clips.map((clip) => clip.url),
      method: "ffmpeg",
      note: "test ffmpeg assemble",
    },
    assetStub: {
      id: "composite-test",
      kind: "composite",
      mimeType: "video/mp4",
      url: "",
      durationSec: input.clips.reduce((sum, clip) => sum + clip.durationSec, 0) || 8,
      width: 1280,
      height: 720,
      provider: "ffmpeg",
      createdAt: new Date().toISOString(),
    },
  };
}

async function manifestOnlyAssemble(input: AssemblyInput): Promise<AssemblyResult> {
  return {
    method: "manifest-only",
    mimeType: "video/mp4",
    note: "FFmpeg did not produce a playable export.",
    manifest: {
      clipUrls: input.clips.map((clip) => clip.url),
      method: "manifest-only",
      note: "FFmpeg write/verify did not complete.",
    },
    assetStub: {
      id: "manifest-only-test",
      kind: "composite",
      mimeType: "video/mp4",
      url: "",
      durationSec: 0,
      provider: "external",
      createdAt: new Date().toISOString(),
    },
  };
}

async function firstClipAssemble(input: AssemblyInput): Promise<AssemblyResult> {
  return {
    method: "first-clip",
    bytes: contractMp4(),
    mimeType: "video/mp4",
    note: "FFmpeg unavailable — first clip passthrough.",
    manifest: {
      clipUrls: input.clips.map((clip) => clip.url),
      method: "first-clip",
      note: "passthrough",
    },
    assetStub: {
      id: "first-clip-test",
      kind: "composite",
      mimeType: "video/mp4",
      url: input.clips[0]?.url || "",
      durationSec: 8,
      provider: "external",
      createdAt: new Date().toISOString(),
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
    video_render_jobs: [],
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
          if (
            table === "video_provider_jobs" &&
            rows.some((row) => row.idempotency_key === raw.idempotency_key)
          ) {
            error = { code: "23505", message: "duplicate idempotency_key" };
            break;
          }
          const row: Record<string, unknown> = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            estimated_cost: raw.estimated_cost ?? null,
            actual_cost: raw.actual_cost ?? null,
            error_code: raw.error_code ?? null,
            error_message: raw.error_message ?? null,
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
      } else if (state.action === "upsert") {
        const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
        for (const raw of incoming as Record<string, unknown>[]) {
          const existing = rows.find((row) => row.id === raw.id);
          if (existing) Object.assign(existing, raw);
          else rows.push({ id: raw.id || randomUUID(), ...raw });
          data.push((existing || rows[rows.length - 1]) as Record<string, unknown>);
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
      upsert(row: unknown) {
        state.action = "upsert";
        state.payload = row;
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

function blueprint(): VideoBlueprint {
  return {
    title: "Studio film",
    description: "Product hero",
    videoType: "product-demo",
    style: "Cinematic",
    aspectRatio: "16:9",
    totalDuration: "8s",
    scenes: [
      {
        id: "s1",
        name: "Hero",
        description: "Open",
        duration: "8s",
        visualPrompt: "Controlled studio product table with cinematic lighting",
        cameraMove: "Slow push-in",
        mood: "Professional",
        narration: "",
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
    prompt: "studio product film",
    language: "en",
    generatedAt: new Date().toISOString(),
  };
}

function generation(over: Partial<VideoGeneration> = {}): VideoGeneration {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    user_id: USER,
    video_name: "Studio film",
    video_type: "product-demo",
    description: "Product hero",
    style: "Cinematic",
    aspect_ratio: "16:9",
    duration: "8s",
    options: [],
    prompt: "studio product film",
    blueprint: blueprint(),
    status: "pending",
    mode: "generate",
    provider: null,
    token_usage: null,
    generation_time_ms: null,
    parent_generation_id: null,
    project_id: null,
    is_favorite: false,
    created_at: now,
    updated_at: now,
    domain_state: "draft",
    workflow: "product",
    language: "en",
    ...over,
  };
}

function modelFor(gen: VideoGeneration): VideoProductionModel {
  const now = new Date().toISOString();
  return {
    version: 1,
    title: gen.video_name,
    videoType: gen.video_type,
    aspectRatio: gen.aspect_ratio,
    targetDurationSec: 8,
    durationTier: "short",
    language: "en",
    style: gen.style,
    mood: "Professional",
    scenes: [
      {
        id: "s1",
        name: "Hero",
        order: 0,
        durationSec: 8,
        script: "",
        visualPrompt: "Controlled studio product table with cinematic lighting",
        cameraMove: "Slow push-in",
        transition: "cut",
      },
    ],
    chapters: [],
    voiceTracks: [],
    audioBeds: [],
    subtitles: [],
    jobs: [],
    assets: [],
    createdAt: now,
    updatedAt: now,
  };
}

function successKling(): VideoProviderV2 {
  const registry = createProviderRegistry({ veo: false, kling: true, runway: false, heygen: false, external: false });
  return {
    ...registry.kling,
    status: () => "ready",
    health: () => ({ ok: true, status: "ready", reason: "test adapter ready" }),
    async createJob(request: ProviderJobRequest) {
      return {
        provider: "kling",
        status: "succeeded",
        idempotencyKey: request.idempotencyKey,
        mimeType: "video/mp4",
        bytes: contractMp4(),
        message: "adapter contract succeeded",
      };
    },
    async pollJob(externalJobId, idempotencyKey) {
      return {
        provider: "kling",
        status: "succeeded",
        externalJobId,
        idempotencyKey,
        mimeType: "video/mp4",
        bytes: contractMp4(),
        message: "adapter contract polled",
      };
    },
    async cancelJob(_id, idempotencyKey) {
      return { provider: "kling", status: "cancelled", idempotencyKey, message: "cancelled" };
    },
  };
}

function failingKling(): VideoProviderV2 {
  const ready = successKling();
  return {
    ...ready,
    async createJob(request) {
      return {
        provider: "kling",
        status: "failed",
        idempotencyKey: request.idempotencyKey,
        errorCode: "provider_failed",
        message: "provider exploded",
      };
    },
  };
}

function processingKling(): VideoProviderV2 {
  const ready = successKling();
  return {
    ...ready,
    async createJob(request) {
      return {
        provider: "kling",
        status: "processing",
        externalJobId: "kling-job-1",
        idempotencyKey: request.idempotencyKey,
        message: "accepted async",
      };
    },
    async pollJob(externalJobId, idempotencyKey) {
      return {
        provider: "kling",
        status: "processing",
        externalJobId,
        idempotencyKey,
        message: "still processing",
      };
    },
  };
}

function registryWith(kling: VideoProviderV2) {
  const snapshot = { veo: false, kling: true, runway: true, heygen: false, external: false };
  const registry = createProviderRegistry(snapshot);
  return { snapshot, registry: { ...registry, kling } };
}

async function insertGeneration(supabase: ReturnType<typeof createMemorySupabase>, gen: VideoGeneration) {
  await supabase.from("video_generations").insert(gen).select("*").single();
}

test("create project + plan + scenes walk draft → planning → storyboard_ready", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  const seeded = await seedDomainProject(supabase, { userId: USER, generation: gen });
  assert.equal(seeded.seeded, true);
  assert.ok(seeded.planId);
  assert.equal(seeded.sceneIds.length, 1);
  assert.equal(seeded.state, "storyboard_ready");
  const row = supabase._tables.video_generations[0]!;
  assert.equal(row.domain_state, "storyboard_ready");
  assert.equal(row.status, "storyboard_ready");
  assert.equal(supabase._tables.video_plans.length, 1);
  assert.equal(supabase._tables.video_scenes.length, 1);
});

test("legacy project remains readable without destructive rewrite", async () => {
  const supabase = createMemorySupabase();
  const gen = generation({
    status: "completed",
    domain_state: null,
  });
  await insertGeneration(supabase, gen);
  const read = await readProjectWithScenes(supabase, gen);
  assert.equal(read.source, "legacy_blueprint");
  assert.equal(read.scenes[0]?.id, "s1");
  assert.equal(read.scenes[0]?.prompt.includes("studio product"), true);
  assert.equal(supabase._tables.video_scenes.length, 0);
  assert.deepEqual(gen.blueprint?.scenes[0]?.id, "s1");
});

test("router selection prefers kling for text-to-video", () => {
  const decision = routeModel(
    {
      task: "text-to-video",
      quality: "standard",
      duration: 8,
      projectId: randomUUID(),
      sceneId: randomUUID(),
      prompt: "Cinematic studio product hero shot",
    },
    { snapshot: { veo: false, kling: true, runway: true, heygen: false, external: false } },
  );
  assert.equal(decision.primaryProvider, "kling");
  assert.equal(decision.fallbackProvider, "runway");
});

test("provider unconfigured fails the project clearly", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  await assert.rejects(
    () =>
      runDomainRenderPipeline({
        model: modelFor(gen),
        supabase,
        userId: USER,
        generationId: gen.id,
        snapshot: { kling: false, runway: false, heygen: false, external: false },
      }),
    (error: unknown) => error instanceof ProviderNotConfiguredError,
  );
  assert.equal(supabase._tables.video_generations[0]?.domain_state, "failed");
  assert.equal(supabase._tables.video_generations[0]?.status, "failed");
});

test("successful provider adapter contract + job persistence + artifact + video_rendered", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const { snapshot, registry } = registryWith(successKling());
  const result = await runDomainRenderPipeline({
    model: modelFor(gen),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    assemble: ffmpegAssemble,
  });
  assert.equal(result.domainState, "video_rendered");
  assert.ok(result.artifact && isValidVideoArtifact(result.artifact));
  assert.equal(result.artifact?.mimeType, "video/mp4");
  assert.ok((result.artifact?.durationSec ?? 0) > 0);
  assert.ok((result.artifact?.width ?? 0) > 0);
  assert.ok((result.artifact?.height ?? 0) > 0);
  assert.equal(result.job.assemblyManifest?.method, "ffmpeg");
  assert.equal(result.providerJobs.length, 1);
  assert.equal(result.providerJobs[0]?.provider, "kling");
  assert.equal(result.providerJobs[0]?.status, "succeeded");
  assert.ok((result.providerJobs[0]?.estimatedCost ?? 0) > 0);
  assert.equal(result.providerJobs[0]?.actualCost, null);
  assert.equal(result.job.costCreditsEstimate, result.providerJobs[0]?.estimatedCost);
  assert.equal(supabase._tables.video_media.length >= 1, true);
  assert.equal(supabase._tables.video_generations[0]?.domain_state, "video_rendered");
});

test("idempotency reuses the job and does not rewrite a successful artifact", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const { snapshot, registry } = registryWith(successKling());
  const first = await runDomainRenderPipeline({
    model: modelFor(gen),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    assemble: ffmpegAssemble,
  });
  const artifactId = first.artifact?.id;
  const sceneMedia = supabase._tables.video_media.filter((row) => row.kind === "clip").map((row) => row.id);
  const second = await runDomainRenderPipeline({
    model: first.model,
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    assemble: ffmpegAssemble,
  });
  const jobs = await listProviderJobsForProject(supabase, gen.id);
  assert.equal(jobs.length, 1);
  assert.equal(second.artifact?.id, artifactId);
  assert.deepEqual(
    supabase._tables.video_media.filter((row) => row.kind === "clip").map((row) => row.id),
    sceneMedia,
  );
  assert.equal(jobs[0]?.actualCost, first.providerJobs[0]?.actualCost);
});

test("provider job persistRoutedProviderJob is idempotent for the same key", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  const seeded = await seedDomainProject(supabase, { userId: USER, generation: gen });
  const store = createSupabaseProviderJobStore(supabase);
  const routeInput = {
    task: "text-to-video" as const,
    quality: "standard" as const,
    duration: 8,
    projectId: gen.id,
    sceneId: seeded.sceneIds[0]!,
    prompt: "Cinematic studio product hero shot",
  };
  const snapshot = { veo: false, kling: true, runway: false, heygen: false, external: false };
  const a = await persistRoutedProviderJob({ userId: USER, routeInput, store, snapshot });
  const b = await persistRoutedProviderJob({ userId: USER, routeInput, store, snapshot });
  assert.equal(a.reused, false);
  assert.equal(b.reused, true);
  assert.equal(a.job.id, b.job.id);
  assert.equal(a.job.idempotencyKey, b.job.idempotencyKey);
});

test("artifact validation rejects svg bytes", async () => {
  const supabase = createMemorySupabase();
  await assert.rejects(
    () =>
      ingestProviderArtifact({
        supabase,
        userId: USER,
        projectId: randomUUID(),
        sceneId: randomUUID(),
        handle: {
          provider: "kling",
          status: "succeeded",
          idempotencyKey: "p:s:kling:hashhashhashhashhash",
          mimeType: "video/mp4",
          bytes: new TextEncoder().encode("<svg xmlns='http://www.w3.org/2000/svg'></svg>"),
          message: "svg",
        },
        declaredDurationSec: 8,
        aspectRatio: "16:9",
        kind: "scene_clip",
      }),
    ArtifactIngestError,
  );
});

test("render failure records errorCode and retry uses a new idempotency key", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const failed = registryWith(failingKling());
  const first = await runDomainRenderPipeline({
    model: modelFor(gen),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot: failed.snapshot,
    registry: failed.registry,
  });
  assert.equal(first.domainState, "failed");
  assert.equal(first.errorCode, "provider_failed");
  assert.ok(first.errorMessage);
  assert.equal(first.providerJobs[0]?.status, "failed");
  assert.equal(first.providerJobs[0]?.actualCost, 0);
  const failedKey = first.providerJobs[0]?.idempotencyKey;

  const ok = registryWith(successKling());
  const retried = await runDomainRenderPipeline({
    model: modelFor(gen),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot: ok.snapshot,
    registry: ok.registry,
    retry: true,
    assemble: ffmpegAssemble,
  });
  assert.equal(retried.domainState, "video_rendered");
  const jobs = await listProviderJobsForProject(supabase, gen.id);
  assert.equal(jobs.length, 2);
  assert.notEqual(jobs[1]?.idempotencyKey, failedKey);
  assert.equal(jobs.filter((job) => job.status === "succeeded").length, 1);
  assert.ok(retried.artifact && isValidVideoArtifact(retried.artifact));
});

test("state transitions never jump storyboard_ready → video_rendered", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  const seeded = await seedDomainProject(supabase, { userId: USER, generation: gen });
  assert.equal(seeded.state, "storyboard_ready");
  const { snapshot, registry } = registryWith(successKling());
  const result = await runDomainRenderPipeline({
    model: modelFor(gen),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    assemble: ffmpegAssemble,
  });
  assert.equal(result.domainState, "video_rendered");
  assert.equal(currentDomainState(supabase._tables.video_generations[0] as never), "video_rendered");
});

test("async submit returns processing without blocking on provider completion", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await insertGeneration(supabase, gen);
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const { snapshot, registry } = registryWith(processingKling());
  const result = await runDomainRenderPipeline({
    model: modelFor(gen),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    skipAudio: true,
  });
  assert.equal(result.job.status, "processing");
  assert.equal(result.providerJobs[0]?.status, "processing");
  assert.ok(result.providerJobs[0]?.externalJobId);
  assert.equal(result.artifact, null);
});

test("production render cannot complete as first-clip and does not charge credits", async () => {
  process.env.BILLING_CREDIT_TEST_HARNESS = "1";
  resetMemoryCreditLedger();
  seedMemoryCreditBalance(USER, 10);
  try {
    const supabase = createMemorySupabase();
    const gen = generation();
    await insertGeneration(supabase, gen);
    await seedDomainProject(supabase, { userId: USER, generation: gen });
    const { snapshot, registry } = registryWith(successKling());
    const result = await runDomainRenderPipeline({
      model: modelFor(gen),
      supabase,
      userId: USER,
      generationId: gen.id,
      snapshot,
      registry,
      assemble: firstClipAssemble,
    });
    assert.equal(result.domainState, "failed");
    assert.equal(result.job.status, "failed");
    assert.equal(result.errorCode, "ffmpeg_failed");
    assert.notEqual(result.job.assemblyManifest?.method, "ffmpeg");
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
  } finally {
    resetMemoryCreditLedger();
    delete process.env.BILLING_CREDIT_TEST_HARNESS;
  }
});

test("production render cannot complete as manifest-only when FFmpeg fails", async () => {
  process.env.BILLING_CREDIT_TEST_HARNESS = "1";
  resetMemoryCreditLedger();
  seedMemoryCreditBalance(USER, 10);
  try {
    const supabase = createMemorySupabase();
    const gen = generation();
    await insertGeneration(supabase, gen);
    await seedDomainProject(supabase, { userId: USER, generation: gen });
    const { snapshot, registry } = registryWith(successKling());
    const result = await runDomainRenderPipeline({
      model: modelFor(gen),
      supabase,
      userId: USER,
      generationId: gen.id,
      snapshot,
      registry,
      assemble: manifestOnlyAssemble,
    });
    assert.equal(result.domainState, "failed");
    assert.equal(result.job.status, "failed");
    assert.equal(result.errorCode, "ffmpeg_failed");
    assert.equal(result.job.assemblyManifest?.method, "manifest-only");
    assert.equal(getMemoryCreditBalance(USER).balance, 10);
  } finally {
    resetMemoryCreditLedger();
    delete process.env.BILLING_CREDIT_TEST_HARNESS;
  }
});

test("production render charges only after FFmpeg MP4 assembly", async () => {
  process.env.BILLING_CREDIT_TEST_HARNESS = "1";
  resetMemoryCreditLedger();
  seedMemoryCreditBalance(USER, 10);
  try {
    const supabase = createMemorySupabase();
    const gen = generation();
    await insertGeneration(supabase, gen);
    await seedDomainProject(supabase, { userId: USER, generation: gen });
    const { snapshot, registry } = registryWith(successKling());
    const result = await runDomainRenderPipeline({
      model: modelFor(gen),
      supabase,
      userId: USER,
      generationId: gen.id,
      snapshot,
      registry,
      assemble: ffmpegAssemble,
    });
    assert.equal(result.domainState, "video_rendered");
    assert.equal(result.job.status, "completed");
    assert.equal(result.job.assemblyManifest?.method, "ffmpeg");
    assert.ok(result.artifact && isValidVideoArtifact(result.artifact));
    assert.equal(result.artifact?.kind, "composite");
    assert.equal(getMemoryCreditBalance(USER).balance, 9);
  } finally {
    resetMemoryCreditLedger();
    delete process.env.BILLING_CREDIT_TEST_HARNESS;
  }
});
