import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain";
import { audioPlanFromPlanRow, type VideoPlanRow } from "@/lib/ai-core/video-production-platform/persistence/mappers";
import { isSilentPreviewWav } from "@/lib/ai-core/video-production-platform/audio-engine/validation";
import { mixPcmWav, toneWavBytes } from "@/lib/ai-core/video-production-platform/audio-engine/mixer";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import { isNarrationRequired } from "@/lib/ai-core/video-production-platform/audio-engine/render-lane";
import type { TtsJobHandle, TtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";
import { seedDomainProject } from "@/lib/ai-core/video-production-platform/runtime/seed";
import { runDomainRenderPipeline } from "@/lib/ai-core/video-production-platform/runtime/render-pipeline";
import { createProviderRegistry } from "@/lib/ai-core/video-production-platform/provider-router";
import type { ProviderJobRequest, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { silentWavBytes } from "@/lib/ai-core/video-production-platform/tts";
import type { AssemblyInput, AssemblyResult } from "@/lib/ai-core/video-production-platform/assemble";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

async function ffmpegAssemble(input: AssemblyInput): Promise<AssemblyResult> {
  return {
    method: "ffmpeg",
    bytes: contractMp4(),
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

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_generations: [],
    video_plans: [],
    video_scenes: [],
    video_provider_jobs: [],
    video_media: [],
    video_quality_reports: [],
    video_render_jobs: [],
    video_audio_plans: [],
    video_audio_tracks: [],
    video_audio_jobs: [],
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
          if (
            (table === "video_provider_jobs" || table === "video_audio_jobs") &&
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

function modelFor(gen: VideoGeneration, narration = false): VideoProductionModel {
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
        script: narration ? "Trend Business AI delivers production-ready video." : "",
        visualPrompt: "Controlled studio product table with cinematic lighting",
        cameraMove: "Slow push-in",
        transition: "cut",
      },
    ],
    chapters: [],
    voiceTracks: narration
      ? [
          {
            id: "vt-1",
            voiceId: "alloy",
            style: "professional",
            language: "en",
            script: "Trend Business AI delivers production-ready video.",
            status: "queued",
          },
        ]
      : [],
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
        message: "ok",
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
        message: "ok",
      };
    },
    async cancelJob(_id, idempotencyKey) {
      return { provider: "kling", status: "cancelled", idempotencyKey, message: "cancelled" };
    },
  };
}

function registryWith(kling: VideoProviderV2) {
  const snapshot = { veo: false, kling: true, runway: true, heygen: false, external: false };
  const registry = createProviderRegistry(snapshot);
  return { snapshot, registry: { ...registry, kling } };
}

function mockTts(behavior: { fail?: boolean } = {}): TtsProvider {
  return {
    id: "openai",
    label: "Mock TTS",
    status: () => "ready",
    capabilities: () => ({ languages: ["en"], voices: [{ id: "alloy", label: "Alloy", languages: ["en"] }], maxChars: 4000 }),
    estimateCost: ({ characters }) => ({ provider: "openai", credits: Math.max(1, Math.ceil(characters / 120)), currency: "credits", characters }),
    health: () => ({ ok: true, status: "ready", reason: "mock" }),
    async createJob(request) {
      if (behavior.fail) {
        return {
          provider: "openai",
          status: "failed",
          idempotencyKey: request.idempotencyKey,
          message: "TTS unavailable",
          errorCode: "provider_failed",
        } satisfies TtsJobHandle;
      }
      return {
        provider: "openai",
        status: "succeeded",
        idempotencyKey: request.idempotencyKey,
        mimeType: "audio/wav",
        bytes: toneWavBytes({ durationSec: 1 }),
        durationSec: 1,
        message: "ok",
      };
    },
    async pollJob(_id, idempotencyKey) {
      return {
        provider: "openai",
        status: "succeeded",
        idempotencyKey,
        mimeType: "audio/wav",
        bytes: toneWavBytes({ durationSec: 1 }),
        durationSec: 1,
        message: "ok",
      };
    },
  };
}

test("narrationRequired is true only when voice tracks or scene voice flags exist", () => {
  const gen = generation();
  assert.equal(isNarrationRequired(modelFor(gen, false), []), false);
  assert.equal(isNarrationRequired(modelFor(gen, true), []), true);
});

test("audio optional + TTS unavailable still reaches video_rendered", async () => {
  const prev = { eleven: process.env.ELEVENLABS_API_KEY, openai: process.env.OPENAI_API_KEY, tts: process.env.TTS_PROVIDER_API_KEY };
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.TTS_PROVIDER_API_KEY;
  try {
    const supabase = createMemorySupabase();
    const gen = generation();
    await supabase.from("video_generations").insert(gen).select("*").single();
    await seedDomainProject(supabase, { userId: USER, generation: gen });
    const { snapshot, registry } = registryWith(successKling());
    const result = await runDomainRenderPipeline({
      model: modelFor(gen, false),
      supabase,
      userId: USER,
      generationId: gen.id,
      snapshot,
      registry,
      assemble: ffmpegAssemble,
    });
    assert.equal(result.domainState, "video_rendered");
    assert.ok(result.artifact && isValidVideoArtifact(result.artifact));
    assert.equal(result.job.audioAsset, undefined);
    assert.equal((supabase._tables.video_audio_jobs || []).length, 0);
  } finally {
    if (prev.eleven) process.env.ELEVENLABS_API_KEY = prev.eleven;
    else delete process.env.ELEVENLABS_API_KEY;
    if (prev.openai) process.env.OPENAI_API_KEY = prev.openai;
    else delete process.env.OPENAI_API_KEY;
    if (prev.tts) process.env.TTS_PROVIDER_API_KEY = prev.tts;
    else delete process.env.TTS_PROVIDER_API_KEY;
  }
});

test("audio required + TTS unavailable fails without fake audio or video_rendered", async () => {
  const prev = { eleven: process.env.ELEVENLABS_API_KEY, openai: process.env.OPENAI_API_KEY, tts: process.env.TTS_PROVIDER_API_KEY };
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.TTS_PROVIDER_API_KEY;
  try {
    const supabase = createMemorySupabase();
    const gen = generation();
    await supabase.from("video_generations").insert(gen).select("*").single();
    await seedDomainProject(supabase, { userId: USER, generation: gen });
    const { snapshot, registry } = registryWith(successKling());
    const result = await runDomainRenderPipeline({
      model: modelFor(gen, true),
      supabase,
      userId: USER,
      generationId: gen.id,
      snapshot,
      registry,
    });
    assert.equal(result.domainState, "failed");
    assert.equal(result.errorCode, "unconfigured");
    assert.equal(result.artifact, null);
    const audioMedia = (supabase._tables.video_media || []).filter((row) => String(row.mime_type || "").startsWith("audio/"));
    assert.equal(audioMedia.length, 0);
    const ttsJob = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "tts");
    assert.equal(ttsJob?.status, "failed");
    assert.equal(Number(ttsJob?.actual_cost ?? 0), 0);
  } finally {
    if (prev.eleven) process.env.ELEVENLABS_API_KEY = prev.eleven;
    else delete process.env.ELEVENLABS_API_KEY;
    if (prev.openai) process.env.OPENAI_API_KEY = prev.openai;
    else delete process.env.OPENAI_API_KEY;
    if (prev.tts) process.env.TTS_PROVIDER_API_KEY = prev.tts;
    else delete process.env.TTS_PROVIDER_API_KEY;
  }
});

test("mix success wires mixed audio into a playable render", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await supabase.from("video_generations").insert(gen).select("*").single();
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const { snapshot, registry } = registryWith(successKling());
  const result = await runDomainRenderPipeline({
    model: modelFor(gen, true),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    tts: mockTts(),
    mixFn: mixPcmWav,
    musicBytes: toneWavBytes({ durationSec: 1, frequencyHz: 180 }),
    assemble: ffmpegAssemble,
  });
  assert.equal(result.domainState, "video_rendered");
  assert.ok(result.artifact && isValidVideoArtifact(result.artifact));
  assert.ok(result.job.audioAsset?.url);
  assert.equal(result.artifact.mimeType === "video/mp4" || result.artifact.mimeType === "video/webm", true);
  assert.ok(result.artifact.durationSec > 0);
  const mix = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "mix");
  assert.equal(mix?.status, "succeeded");
  const tts = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "tts");
  assert.equal(tts?.actualCost ?? tts?.actual_cost, tts?.estimatedCost ?? tts?.estimated_cost);
  const audioRows = (supabase._tables.video_media || []).filter((row) => String(row.kind) === "mix" || String(row.kind) === "voice");
  assert.ok(audioRows.length >= 1);
});

test("mix failure blocks video_rendered and does not charge", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await supabase.from("video_generations").insert(gen).select("*").single();
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const { snapshot, registry } = registryWith(successKling());
  const result = await runDomainRenderPipeline({
    model: modelFor(gen, true),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    tts: mockTts(),
    mixFn: () => {
      throw new AudioEngineError("forced mix failure", "mix_failed");
    },
  });
  assert.equal(result.domainState, "failed");
  assert.equal(result.errorCode, "mix_failed");
  assert.equal(result.artifact, null);
  const mix = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "mix");
  assert.equal(mix?.status, "failed");
  assert.equal(Number(mix?.actual_cost ?? 0), 0);
});

test("previous playable video is preserved when a later audio job fails", async () => {
  const supabase = createMemorySupabase();
  const gen = generation();
  await supabase.from("video_generations").insert(gen).select("*").single();
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const { snapshot, registry } = registryWith(successKling());
  const first = await runDomainRenderPipeline({
    model: modelFor(gen, true),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    tts: mockTts(),
    mixFn: mixPcmWav,
    assemble: ffmpegAssemble,
  });
  assert.equal(first.domainState, "video_rendered");
  const secondModel = modelFor(gen, true);
  secondModel.voiceTracks[0] = {
    ...secondModel.voiceTracks[0]!,
    script: "A different narration line for the second audio attempt.",
  };
  const second = await runDomainRenderPipeline({
    model: secondModel,
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    tts: mockTts({ fail: true }),
    mixFn: mixPcmWav,
  });
  assert.equal(second.domainState, "video_rendered");
  assert.equal(second.errorCode, "provider_failed");
  assert.ok(second.artifact && isValidVideoArtifact(second.artifact));
  assert.equal(second.artifact?.id, first.artifact?.id);
});

test("legacy AudioPlan mapping remains compatible after render wiring", () => {
  const row = {
    id: "plan-1",
    user_id: USER,
    project_id: "proj-1",
    version: 1,
    objective: "Launch",
    language: "en",
    aspect_ratio: "16:9",
    duration_sec: 8,
    style: "cinematic",
    budget_credits: null,
    pacing: "medium",
    preferred_provider: "auto",
    created_at: new Date().toISOString(),
  } as VideoPlanRow;
  const mapped = audioPlanFromPlanRow(row, [
    {
      id: "scene-1",
      projectId: "proj-1",
      order: 0,
      duration: 8,
      prompt: "Studio product hero",
      camera: { move: "Slow push-in", shotSize: "medium" },
      visualStyle: "Cinematic",
      references: [],
      characters: [],
      products: [],
      dialogue: { text: "Built for operators.", language: "en" },
      audio: { sfx: [] },
      transition: "cut",
      providerPreference: "auto",
      fallbackProvider: "kling",
      status: "planned",
      qualityScore: null,
    },
  ]);
  assert.equal(mapped.voiceScript, "Built for operators.");
  assert.equal(mapped.projectId, "proj-1");
});

test("silent preview WAV is still rejected by the audio engine", () => {
  assert.equal(isSilentPreviewWav(silentWavBytes(1)), true);
});
