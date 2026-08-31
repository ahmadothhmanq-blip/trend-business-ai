import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";
import type { LipSyncJobHandle, LipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/contract";
import { heygenLipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/heygen";
import { clearLipSyncJobCache } from "@/lib/ai-core/video-production-platform/lip-sync/job-cache";
import { resolveLipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/registry";
import { runLipSync } from "@/lib/ai-core/video-production-platform/lip-sync/service";
import { findLipSyncJobByIdempotencyKey, insertLipSyncJob, loadOwnedMedia } from "@/lib/ai-core/video-production-platform/lip-sync/persist";
import { buildLipSyncIdempotencyKey } from "@/lib/ai-core/video-production-platform/lip-sync/job-cache";
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
    video_lipsync_jobs: [],
    video_media: [],
  };
  let lastUpload = contractMp4();

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
    } = { action: "select", payload: null, filters: [] };

    async function execute(shape: "single" | "maybe" | "many") {
      const rows = tables[table] || (tables[table] = []);
      let data: Record<string, unknown>[] = [];
      let error: { message: string; code?: string } | null = null;
      if (state.action === "insert") {
        const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
        for (const raw of incoming as Record<string, unknown>[]) {
          if (table === "video_lipsync_jobs" && rows.some((row) => row.idempotency_key === raw.idempotency_key)) {
            error = { code: "23505", message: "duplicate idempotency_key" };
            break;
          }
          const row: Record<string, unknown> = { created_at: new Date().toISOString(), ...raw };
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

async function seedMedia(
  supabase: ReturnType<typeof createMemorySupabase>,
  input: { userId?: string; projectId: string; videoId?: string; audioId?: string },
) {
  const videoId = input.videoId || randomUUID();
  const audioId = input.audioId || randomUUID();
  const userId = input.userId || USER;
  await supabase.from("video_media").insert({
    id: videoId,
    user_id: userId,
    generation_id: input.projectId,
    scene_id: null,
    kind: "clip",
    mime_type: "video/mp4",
    storage_path: `${userId}/${input.projectId}/source.mp4`,
    public_url: "https://signed.example/source.mp4",
    size_bytes: 5000,
    duration_sec: 8,
    provider: "kling",
    sha256: "source-sha",
    width: 1280,
    height: 720,
  });
  await supabase.from("video_media").insert({
    id: audioId,
    user_id: userId,
    generation_id: input.projectId,
    scene_id: null,
    kind: "voice",
    mime_type: "audio/mpeg",
    storage_path: `${userId}/${input.projectId}/voice.mp3`,
    public_url: "https://signed.example/voice.mp3",
    size_bytes: 512,
    duration_sec: 8,
    provider: "openai",
    sha256: "audio-sha",
  });
  return { videoId, audioId };
}

function mockLipSync(behavior: { failFirst?: boolean; invalid?: boolean; processingFirst?: boolean } = {}): LipSyncProvider & { createCalls: number } {
  let createCalls = 0;
  const succeed = (idempotencyKey: string): LipSyncJobHandle => ({
    provider: "heygen",
    status: "succeeded",
    idempotencyKey,
    mimeType: "video/mp4",
    bytes: behavior.invalid ? new Uint8Array([0x3c, 0x73, 0x76, 0x67]) : contractMp4(),
    durationSec: 8,
    width: 1280,
    height: 720,
    message: behavior.invalid ? "invalid" : "ok",
  });
  const provider: LipSyncProvider & { createCalls: number } = {
    id: "heygen",
    label: "Mock HeyGen",
    createCalls: 0,
    status: () => "ready",
    capabilities: () => ({
      languages: ["en"],
      modes: ["precision"],
      requiresHttpsAssets: true,
      maxDurationSec: 60,
    }),
    estimateCost: ({ durationSec }) => ({
      provider: "heygen",
      credits: Math.max(2, Math.ceil(durationSec / 4)),
      currency: "credits",
      durationSec,
    }),
    health: () => ({ ok: true, status: "ready", reason: "mock" }),
    async createJob(request) {
      createCalls += 1;
      provider.createCalls = createCalls;
      if (behavior.failFirst && createCalls === 1) {
        return {
          provider: "heygen",
          status: "failed",
          idempotencyKey: request.idempotencyKey,
          message: "provider down",
          errorCode: "provider_failed",
        };
      }
      if (behavior.processingFirst && createCalls === 1) {
        return {
          provider: "heygen",
          status: "processing",
          idempotencyKey: request.idempotencyKey,
          externalJobId: "ext-1",
          message: "queued",
        };
      }
      return succeed(request.idempotencyKey);
    },
    async pollJob(_id, idempotencyKey) {
      return succeed(idempotencyKey);
    },
  };
  return provider;
}

test("unconfigured HeyGen provider fails honestly", async () => {
  const prev = process.env.HEYGEN_API_KEY;
  delete process.env.HEYGEN_API_KEY;
  try {
    assert.equal(heygenLipSyncProvider.status(), "unconfigured");
    assert.equal(heygenLipSyncProvider.health().ok, false);
    await assert.rejects(
      () =>
        heygenLipSyncProvider.createJob({
          projectId: "p1",
          videoUrl: "https://signed.example/v.mp4",
          audioUrl: "https://signed.example/a.mp3",
          idempotencyKey: "proj:lipsync:heygen:abc",
        }),
      (error: unknown) => error instanceof LipSyncError && error.code === "unconfigured",
    );
    assert.throws(() => resolveLipSyncProvider("heygen"), LipSyncError);
  } finally {
    if (prev) process.env.HEYGEN_API_KEY = prev;
  }
});

test("runLipSync unconfigured does not create a fake artifact", async () => {
  const prev = process.env.HEYGEN_API_KEY;
  delete process.env.HEYGEN_API_KEY;
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  try {
    await assert.rejects(
      () =>
        runLipSync({
          supabase,
          userId: USER,
          projectId,
          sourceArtifactId: videoId,
          audioArtifactId: audioId,
        }),
      (error: unknown) => error instanceof LipSyncError && error.code === "unconfigured",
    );
  } finally {
    if (prev) process.env.HEYGEN_API_KEY = prev;
  }
  const source = supabase._tables.video_media.find((row) => row.id === videoId);
  assert.equal(source?.provider, "kling");
  assert.equal(supabase._tables.video_media.length, 2);
  assert.equal(supabase._tables.video_lipsync_jobs[0]?.actual_cost, 0);
  assert.equal(supabase._tables.video_lipsync_jobs[0]?.status, "failed");
});

test("valid lip-sync artifact is persisted with checksum and duration", async () => {
  clearLipSyncJobCache();
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  const provider = mockLipSync();
  const result = await runLipSync({
    supabase,
    userId: USER,
    projectId,
    sourceArtifactId: videoId,
    audioArtifactId: audioId,
    speaker: "Presenter",
    language: "en",
    lipSync: provider,
    pollDelayMs: 0,
  });
  assert.equal(result.reused, false);
  assert.ok(result.resultArtifact);
  assert.equal(result.resultArtifact?.mimeType, "video/mp4");
  assert.ok((result.resultArtifact?.durationSec || 0) > 0);
  assert.equal(result.estimatedCost, 2);
  assert.equal(result.actualCost, null);
  const stored = supabase._tables.video_media.find((row) => row.id === result.resultArtifact?.id);
  assert.ok(stored?.sha256);
  assert.equal(result.sourceArtifact.id, videoId);
});

test("invalid lip-sync output fails without replacing the source artifact", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  const before = supabase._tables.video_media.map((row) => row.id).sort();
  await assert.rejects(
    () =>
      runLipSync({
        supabase,
        userId: USER,
        projectId,
        sourceArtifactId: videoId,
        audioArtifactId: audioId,
        lipSync: mockLipSync({ invalid: true }),
        pollDelayMs: 0,
      }),
    LipSyncError,
  );
  const source = await loadOwnedMedia(supabase, { userId: USER, artifactId: videoId });
  assert.equal(source.provider, "kling");
  assert.deepEqual(supabase._tables.video_media.map((row) => row.id).sort(), before);
  const job = supabase._tables.video_lipsync_jobs[0];
  assert.equal(job?.status, "failed");
  assert.equal(job?.actual_cost, 0);
  assert.equal(job?.result_artifact_id, undefined);
});

test("lip-sync failure preserves the old artifact and records zero cost", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  await assert.rejects(
    () =>
      runLipSync({
        supabase,
        userId: USER,
        projectId,
        sourceArtifactId: videoId,
        audioArtifactId: audioId,
        lipSync: mockLipSync({ failFirst: true }),
        pollDelayMs: 0,
      }),
    LipSyncError,
  );
  const source = supabase._tables.video_media.find((row) => row.id === videoId);
  assert.equal(source?.kind, "clip");
  assert.equal(supabase._tables.video_lipsync_jobs[0]?.actual_cost, 0);
  assert.equal(supabase._tables.video_lipsync_jobs[0]?.status, "failed");
});

test("retry with a new attempt can succeed after a failed job", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  const provider = mockLipSync({ failFirst: true });
  await assert.rejects(
    () =>
      runLipSync({
        supabase,
        userId: USER,
        projectId,
        sourceArtifactId: videoId,
        audioArtifactId: audioId,
        lipSync: provider,
        pollDelayMs: 0,
        attempt: 1,
      }),
    LipSyncError,
  );
  const retry = await runLipSync({
    supabase,
    userId: USER,
    projectId,
    sourceArtifactId: videoId,
    audioArtifactId: audioId,
    lipSync: provider,
    pollDelayMs: 0,
    attempt: 2,
  });
  assert.ok(retry.resultArtifact);
  assert.equal(retry.actualCost, null);
  assert.equal(retry.sourceArtifact.id, videoId);
  assert.notEqual(retry.resultArtifact?.id, videoId);
});

test("duplicate idempotency key does not double-charge", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  const provider = mockLipSync();
  const first = await runLipSync({
    supabase,
    userId: USER,
    projectId,
    sourceArtifactId: videoId,
    audioArtifactId: audioId,
    lipSync: provider,
    pollDelayMs: 0,
  });
  const second = await runLipSync({
    supabase,
    userId: USER,
    projectId,
    sourceArtifactId: videoId,
    audioArtifactId: audioId,
    lipSync: provider,
    pollDelayMs: 0,
  });
  assert.equal(second.reused, true);
  assert.equal(second.resultArtifact?.id, first.resultArtifact?.id);
  assert.equal(second.actualCost, first.actualCost);
  assert.equal(provider.createCalls, 1);
  assert.equal(supabase._tables.video_lipsync_jobs.length, 1);
});

test("duplicate job insert is rejected by idempotency", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  const provider = mockLipSync();
  await runLipSync({
    supabase,
    userId: USER,
    projectId,
    sourceArtifactId: videoId,
    audioArtifactId: audioId,
    lipSync: provider,
    pollDelayMs: 0,
  });
  const key = buildLipSyncIdempotencyKey({
    projectId,
    videoArtifactId: videoId,
    audioArtifactId: audioId,
    provider: "heygen",
  });
  const existing = await findLipSyncJobByIdempotencyKey(supabase, key);
  assert.ok(existing);
  await assert.rejects(
    () =>
      insertLipSyncJob(supabase, {
        userId: USER,
        projectId,
        sourceArtifactId: videoId,
        audioArtifactId: audioId,
        provider: "heygen",
        idempotencyKey: key,
      }),
    (error: unknown) => error instanceof LipSyncError && error.code === "idempotency",
  );
});

test("poll/retry of a processing job can complete", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId });
  const result = await runLipSync({
    supabase,
    userId: USER,
    projectId,
    sourceArtifactId: videoId,
    audioArtifactId: audioId,
    lipSync: mockLipSync({ processingFirst: true }),
    pollDelayMs: 0,
    maxPolls: 3,
  });
  assert.ok(result.resultArtifact);
  assert.equal(result.job.status, "succeeded");
});

test("ownership is enforced for lip-sync inputs", async () => {
  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const { videoId, audioId } = await seedMedia(supabase, { projectId, userId: OTHER });
  await assert.rejects(
    () =>
      runLipSync({
        supabase,
        userId: USER,
        projectId,
        sourceArtifactId: videoId,
        audioArtifactId: audioId,
        lipSync: mockLipSync(),
      }),
    (error: unknown) => error instanceof LipSyncError && error.code === "ownership",
  );
});
