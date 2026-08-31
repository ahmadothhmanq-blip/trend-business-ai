import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { test } from "node:test";
import type { AudioPlan, Scene } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { audioPlanFromPlanRow, type VideoPlanRow } from "@/lib/ai-core/video-production-platform/persistence/mappers";
import { silentWavBytes } from "@/lib/ai-core/video-production-platform/tts";
import { AudioEngineError } from "@/lib/ai-core/video-production-platform/audio-engine/errors";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";
import {
  audioProductionPlanFromLegacy,
  audioProductionPlanFromSource,
  toLegacyAudioPlan,
} from "@/lib/ai-core/video-production-platform/audio-engine/from-plan";
import {
  alignDuration,
  duckMusic,
  mixAudio,
  mixPcmWav,
  pcmFromWav,
  toneWavBytes,
} from "@/lib/ai-core/video-production-platform/audio-engine/mixer";
import {
  findAudioJobByIdempotencyKey,
  insertAudioJob,
  persistAudioArtifact,
  signAudioArtifactUrl,
} from "@/lib/ai-core/video-production-platform/audio-engine/persist";
import { produceAudio } from "@/lib/ai-core/video-production-platform/audio-engine/service";
import type { TtsJobHandle, TtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";
import { openAiTtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/openai";
import { elevenLabsTtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/elevenlabs";
import { resolveTtsProvider, ttsProviderHealthReport } from "@/lib/ai-core/video-production-platform/audio-engine/tts/registry";
import { clearTtsJobCache } from "@/lib/ai-core/video-production-platform/audio-engine/tts/job-cache";
import {
  assertAudioOwnership,
  assertValidAudioBytes,
  buildAudioIdempotencyKey,
} from "@/lib/ai-core/video-production-platform/audio-engine/validation";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

function mp3Bytes(): Uint8Array {
  const bytes = new Uint8Array(512);
  bytes[0] = 0x49;
  bytes[1] = 0x44;
  bytes[2] = 0x33;
  bytes[10] = 0x7f;
  return bytes;
}

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_audio_plans: [],
    video_audio_tracks: [],
    video_audio_jobs: [],
    video_media: [],
  };
  let lastUpload = toneWavBytes({ durationSec: 1 });

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
          if (table === "video_audio_jobs" && rows.some((row) => row.idempotency_key === raw.idempotency_key)) {
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
            const mime = lastUpload[0] === 0x49 ? "audio/mpeg" : "audio/wav";
            return {
              data: { signedUrl: `https://signed.example/audio?sig=1&m=${mime}` },
            };
          },
        };
      },
    },
    _tables: tables,
  };
}

function mockTts(behavior: {
  failFirst?: boolean;
  processingFirst?: boolean;
  invalid?: boolean;
  silent?: boolean;
} = {}): TtsProvider {
  let createCalls = 0;
  return {
    id: "openai",
    label: "Mock TTS",
    status: () => "ready",
    capabilities: () => ({
      languages: ["en", "ar"],
      voices: [{ id: "alloy", label: "Alloy", languages: ["en"] }],
      maxChars: 4000,
    }),
    estimateCost: ({ characters }) => ({
      provider: "openai",
      credits: Math.max(1, Math.ceil(characters / 120)),
      currency: "credits",
      characters,
    }),
    health: () => ({ ok: true, status: "ready", reason: "mock" }),
    async createJob(request) {
      createCalls += 1;
      if (behavior.failFirst && createCalls === 1) {
        return {
          provider: "openai",
          status: "failed",
          idempotencyKey: request.idempotencyKey,
          message: "provider down",
          errorCode: "provider_failed",
        };
      }
      if (behavior.processingFirst && createCalls === 1) {
        return {
          provider: "openai",
          status: "processing",
          idempotencyKey: request.idempotencyKey,
          message: "queued",
        };
      }
      return succeed(request.idempotencyKey, behavior);
    },
    async pollJob(_id, idempotencyKey) {
      return succeed(idempotencyKey, behavior);
    },
  };
}

function succeed(idempotencyKey: string, behavior: { invalid?: boolean; silent?: boolean }): TtsJobHandle {
  const bytes = behavior.silent
    ? silentWavBytes(1)
    : behavior.invalid
      ? new Uint8Array([1, 2, 3, 4])
      : toneWavBytes({ durationSec: 1 });
  return {
    provider: "openai",
    status: "succeeded",
    idempotencyKey,
    mimeType: behavior.invalid ? "audio/mpeg" : "audio/wav",
    bytes,
    durationSec: 1,
    message: "ok",
  };
}

function source(projectId = randomUUID()) {
  return audioProductionPlanFromSource({
    projectId,
    planId: randomUUID(),
    language: "en",
    voiceScript: "Trend Business AI delivers production-ready video audio.",
    targetDurationSec: 2,
    speaker: "alloy",
    tone: "professional",
    musicMood: "cinematic",
    musicStyle: "corporate",
    sfx: [{ cue: "whoosh", timestampSec: 0.4, durationSec: 0.4, intensity: 0.7 }],
  });
}

test("TTS contract exposes capabilities, languages, voices, cost, health, jobs, idempotency", async () => {
  clearTtsJobCache();
  const provider = mockTts();
  const caps = provider.capabilities();
  assert.ok(caps.languages.includes("en"));
  assert.ok(caps.voices.length >= 1);
  const estimate = provider.estimateCost({ characters: 240 });
  assert.equal(estimate.credits, 2);
  assert.equal(provider.health().ok, true);
  const first = await provider.createJob({
    projectId: "p",
    trackId: "t",
    script: "Hello operators.",
    language: "en",
    idempotencyKey: "k1",
  });
  assert.equal(first.status, "succeeded");
  assert.ok(first.bytes && first.bytes.byteLength > 256);
  const polled = await provider.pollJob("ext", "k1");
  assert.equal(polled.status, "succeeded");
});

test("real TTS providers stay unconfigured without keys and do not emit audio", async () => {
  const prev = {
    eleven: process.env.ELEVENLABS_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    tts: process.env.TTS_PROVIDER_API_KEY,
  };
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.TTS_PROVIDER_API_KEY;
  try {
    assert.equal(elevenLabsTtsProvider.status(), "unconfigured");
    assert.equal(openAiTtsProvider.status(), "unconfigured");
    assert.equal(openAiTtsProvider.health().ok, false);
    assert.throws(() => resolveTtsProvider(), (error: unknown) => {
      assert.ok(error instanceof AudioEngineError);
      assert.equal(error.code, "unconfigured");
      return true;
    });
    await assert.rejects(
      () =>
        openAiTtsProvider.createJob({
          projectId: "p",
          trackId: "t",
          script: "x",
          language: "en",
          idempotencyKey: "none",
        }),
      (error: unknown) => error instanceof AudioEngineError && error.code === "unconfigured",
    );
    const report = ttsProviderHealthReport();
    assert.ok(report.every((row) => row.status === "unconfigured"));
  } finally {
    if (prev.eleven) process.env.ELEVENLABS_API_KEY = prev.eleven;
    else delete process.env.ELEVENLABS_API_KEY;
    if (prev.openai) process.env.OPENAI_API_KEY = prev.openai;
    else delete process.env.OPENAI_API_KEY;
    if (prev.tts) process.env.TTS_PROVIDER_API_KEY = prev.tts;
    else delete process.env.TTS_PROVIDER_API_KEY;
  }
});

test("OpenAI TTS createJob is idempotent and pollJob returns the cached artifact", async () => {
  clearTtsJobCache();
  const prev = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = "sk-test";
  const originalFetch = globalThis.fetch;
  let calls = 0;
  globalThis.fetch = (async () => {
    calls += 1;
    return new Response(Buffer.from(mp3Bytes()), { status: 200, headers: { "content-type": "audio/mpeg" } });
  }) as typeof fetch;
  try {
    const a = await openAiTtsProvider.createJob({
      projectId: "p",
      trackId: "t",
      script: "Cached voice line.",
      language: "en",
      idempotencyKey: "openai-idemp",
    });
    const b = await openAiTtsProvider.createJob({
      projectId: "p",
      trackId: "t",
      script: "Cached voice line.",
      language: "en",
      idempotencyKey: "openai-idemp",
    });
    const polled = await openAiTtsProvider.pollJob("inline", "openai-idemp");
    assert.equal(a.status, "succeeded");
    assert.equal(b.status, "succeeded");
    assert.equal(polled.status, "succeeded");
    assert.equal(calls, 1);
    assert.equal(a.bytes, b.bytes);
  } finally {
    globalThis.fetch = originalFetch;
    if (prev) process.env.OPENAI_API_KEY = prev;
    else delete process.env.OPENAI_API_KEY;
    clearTtsJobCache();
  }
});

test("invalid audio is rejected by magic bytes, MIME, size, duration, and silent preview WAV", () => {
  assert.throws(() => assertValidAudioBytes({ bytes: new Uint8Array([1, 2, 3]) }), /too small/);
  assert.throws(() => assertValidAudioBytes({ bytes: mp3Bytes(), declaredMime: "video/mp4" }), /Unsupported audio MIME/);
  const jpeg = new Uint8Array(512);
  jpeg[0] = 0xff;
  jpeg[1] = 0xd8;
  assert.throws(() => assertValidAudioBytes({ bytes: jpeg }), /magic bytes/);
  assert.throws(() => assertValidAudioBytes({ bytes: silentWavBytes(1), declaredMime: "audio/wav" }), /Silent preview/);
  assert.throws(
    () => assertValidAudioBytes({ bytes: toneWavBytes({ durationSec: 1 }), declaredMime: "audio/wav", durationSec: 0.01 }),
    /duration/,
  );
});

test("duplicate audio job is rejected by idempotency key", async () => {
  const supabase = createMemorySupabase();
  const key = "proj:tts:openai:dup";
  await insertAudioJob(supabase, {
    userId: USER,
    projectId: randomUUID(),
    kind: "tts",
    provider: "openai",
    idempotencyKey: key,
    estimatedCost: 2,
  });
  await assert.rejects(
    () =>
      insertAudioJob(supabase, {
        userId: USER,
        projectId: randomUUID(),
        kind: "tts",
        provider: "openai",
        idempotencyKey: key,
        estimatedCost: 2,
      }),
    (error: unknown) => error instanceof AudioEngineError && error.code === "idempotency",
  );
  const found = await findAudioJobByIdempotencyKey(supabase, key);
  assert.equal(found?.estimatedCost, 2);
});

test("retry after provider failure charges only the successful attempt", async () => {
  const supabase = createMemorySupabase();
  const plan = source();
  await assert.rejects(
    () =>
      produceAudio({
        supabase,
        userId: USER,
        source: plan,
        tts: mockTts({ failFirst: true }),
        mixFn: mixPcmWav,
        musicBytes: toneWavBytes({ durationSec: 2, frequencyHz: 220 }),
        sfxSources: [{ bytes: toneWavBytes({ durationSec: 0.4, frequencyHz: 880 }) }],
      }),
    (error: unknown) => error instanceof AudioEngineError && error.code === "provider_failed",
  );
  const failed = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "tts");
  assert.equal(failed?.status, "failed");
  assert.equal(Number(failed?.actual_cost), 0);

  const result = await produceAudio({
    supabase,
    userId: USER,
    source: plan,
    tts: mockTts(),
    mixFn: mixPcmWav,
    musicBytes: toneWavBytes({ durationSec: 2, frequencyHz: 220 }),
    sfxSources: [{ bytes: toneWavBytes({ durationSec: 0.4, frequencyHz: 880 }) }],
  });
  const ttsJobs = result.jobs.filter((job) => job.kind === "tts");
  assert.ok(ttsJobs.some((job) => job.status === "failed" && job.actualCost === 0));
  const succeeded = ttsJobs.find((job) => job.status === "succeeded");
  assert.ok(succeeded);
  assert.equal(succeeded?.actualCost, succeeded?.estimatedCost);
  assert.ok((succeeded?.attempt || 1) >= 2);
});

test("pollJob retry path completes after processing", async () => {
  const supabase = createMemorySupabase();
  const result = await produceAudio({
    supabase,
    userId: USER,
    source: source(),
    tts: mockTts({ processingFirst: true }),
    mixFn: mixPcmWav,
  });
  assert.equal(result.voiceArtifact?.kind, "voice");
  assert.equal(result.mixArtifact?.kind, "mix");
  const tts = result.jobs.find((job) => job.kind === "tts");
  assert.equal(tts?.status, "succeeded");
  assert.equal(tts?.actualCost, tts?.estimatedCost);
});

test("mix success aligns duration, ducks music, and persists a mix artifact", async () => {
  const supabase = createMemorySupabase();
  const result = await produceAudio({
    supabase,
    userId: USER,
    source: source(),
    tts: mockTts(),
    mixFn: mixPcmWav,
    musicBytes: toneWavBytes({ durationSec: 0.5, frequencyHz: 180, amplitude: 9000 }),
    sfxSources: [{ bytes: toneWavBytes({ durationSec: 0.4, frequencyHz: 1200 }) }],
    mix: { ducking: true, normalize: true, fadeInSec: 0.05, fadeOutSec: 0.05, targetDurationSec: 2 },
  });
  assert.ok(result.voiceArtifact);
  assert.ok(result.musicArtifact);
  assert.ok(result.mixArtifact);
  assert.equal(result.mixJob?.ducking, true);
  const pcm = pcmFromWav(result.mixArtifact!.bytes!);
  assert.equal(pcm.length, 2 * 8000);
  assert.equal(result.actualCost, result.estimatedCost);
  assert.ok(result.jobs.every((job) => job.status !== "succeeded" || job.actualCost === 0 || job.actualCost === job.estimatedCost));
});

test("mix failure records actual cost 0 and does not charge", async () => {
  const supabase = createMemorySupabase();
  await assert.rejects(
    () =>
      produceAudio({
        supabase,
        userId: USER,
        source: source(),
        tts: mockTts(),
        mixFn: () => {
          throw new AudioEngineError("forced mix failure", "mix_failed");
        },
      }),
    (error: unknown) => error instanceof AudioEngineError && error.code === "mix_failed",
  );
  const mix = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "mix");
  assert.equal(mix?.status, "failed");
  assert.equal(Number(mix?.actual_cost), 0);
  const tts = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "tts");
  assert.equal(tts?.status, "succeeded");
});

test("duration alignment pads a short stem to the target length", () => {
  const short = pcmFromWav(toneWavBytes({ durationSec: 0.4 }));
  const aligned = alignDuration(short, 1);
  assert.equal(aligned.length, 8000);
  assert.ok(aligned.slice(0, 3200).some((sample) => sample !== 0));
  assert.equal(aligned[4000], 0);
  assert.equal(aligned[aligned.length - 1], 0);
});

test("ducking lowers music while voice is present", () => {
  const voice = pcmFromWav(toneWavBytes({ durationSec: 1, amplitude: 16000 }));
  const music = pcmFromWav(toneWavBytes({ durationSec: 1, frequencyHz: 180, amplitude: 12000 }));
  const ducked = duckMusic(voice, music, 0.3);
  assert.equal(ducked.ducked, true);
  assert.ok(Math.abs(ducked.music[20]!) < Math.abs(music[20]!));
});

test("idempotent produceAudio does not double-charge", async () => {
  const supabase = createMemorySupabase();
  const plan = source();
  const first = await produceAudio({
    supabase,
    userId: USER,
    source: plan,
    tts: mockTts(),
    mixFn: mixPcmWav,
    musicBytes: toneWavBytes({ durationSec: 2, frequencyHz: 200 }),
    sfxSources: [{ bytes: toneWavBytes({ durationSec: 0.4 }) }],
  });
  const second = await produceAudio({
    supabase,
    userId: USER,
    source: plan,
    tts: mockTts(),
    mixFn: mixPcmWav,
    musicBytes: toneWavBytes({ durationSec: 2, frequencyHz: 200 }),
    sfxSources: [{ bytes: toneWavBytes({ durationSec: 0.4 }) }],
  });
  assert.equal(second.reused, true);
  assert.equal(second.actualCost, 0);
  const ttsJobs = second.jobs.filter((job) => job.kind === "tts");
  assert.equal(ttsJobs.length, 1);
  assert.equal(ttsJobs[0]?.actualCost, first.estimatedCost);
});

test("ownership is enforced for signed URLs", async () => {
  const supabase = createMemorySupabase();
  const artifact = await persistAudioArtifact(supabase, {
    userId: USER,
    projectId: randomUUID(),
    kind: "voice",
    bytes: toneWavBytes({ durationSec: 1 }),
    mimeType: "audio/wav",
    durationSec: 1,
    provider: "openai",
  });
  const url = await signAudioArtifactUrl(supabase, { userId: USER, artifactId: artifact.id });
  assert.match(url, /^https:\/\/signed\.example\//);
  await assert.rejects(
    () => signAudioArtifactUrl(supabase, { userId: OTHER, artifactId: artifact.id }),
    (error: unknown) => error instanceof AudioEngineError && error.code === "ownership",
  );
  assert.throws(() => assertAudioOwnership({ ownerId: USER, userId: OTHER }), /does not belong/);
});

test("legacy AudioPlan remains compatible both directions", () => {
  const legacy: AudioPlan = {
    id: "audio-legacy",
    projectId: "proj-1",
    language: "en",
    voiceScript: "Built for operators.",
    musicCue: "cinematic",
    sfx: ["whoosh"],
  };
  const production = audioProductionPlanFromLegacy(legacy, 8);
  const roundTrip = toLegacyAudioPlan(production);
  assert.equal(roundTrip.projectId, legacy.projectId);
  assert.equal(roundTrip.language, legacy.language);
  assert.equal(roundTrip.voiceScript, legacy.voiceScript);
  assert.equal(roundTrip.musicCue, "cinematic");
  assert.deepEqual(roundTrip.sfx, ["whoosh"]);

  const planRow = {
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
  const scene: Scene = {
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
    audio: { musicCue: "cinematic", sfx: ["whoosh"] },
    transition: "cut",
    providerPreference: "auto",
    fallbackProvider: "kling",
    status: "planned",
    qualityScore: null,
  };
  const fromRow = audioPlanFromPlanRow(planRow, [scene]);
  assert.equal(fromRow.voiceScript, "Built for operators.");
  assert.equal(fromRow.musicCue, "cinematic");
});

test("PCM mix of empty stems fails honestly", () => {
  assert.throws(
    () =>
      mixPcmWav({
        settings: {
          voiceLevel: 1,
          musicLevel: 0.3,
          sfxLevel: 0.4,
          ducking: true,
          normalize: true,
          fadeInSec: 0,
          fadeOutSec: 0,
          targetDurationSec: 1,
        },
      }),
    (error: unknown) => error instanceof AudioEngineError && error.code === "mix_failed",
  );
});

test("FFmpeg mix either succeeds with real audio or fails honestly when unavailable", async () => {
  const voice = toneWavBytes({ durationSec: 1 });
  const music = toneWavBytes({ durationSec: 1, frequencyHz: 180 });
  try {
    const mixed = await mixAudio({
      voice,
      music,
      settings: {
        voiceLevel: 1,
        musicLevel: 0.3,
        sfxLevel: 0.4,
        ducking: true,
        normalize: false,
        fadeInSec: 0.05,
        fadeOutSec: 0.05,
        targetDurationSec: 1,
      },
    });
    assert.equal(mixed.method, "ffmpeg");
    assert.ok(mixed.bytes.byteLength > 256);
    assertValidAudioBytes({ bytes: mixed.bytes });
  } catch (error) {
    assert.ok(error instanceof AudioEngineError);
    assert.ok(error.code === "ffmpeg_unavailable" || error.code === "mix_failed");
  }
});

test("idempotency key is stable for the same fingerprint and changes on retry", () => {
  const a = buildAudioIdempotencyKey({ projectId: "p", kind: "tts", provider: "openai", fingerprint: "script" });
  const b = buildAudioIdempotencyKey({ projectId: "p", kind: "tts", provider: "openai", fingerprint: "script" });
  const c = buildAudioIdempotencyKey({
    projectId: "p",
    kind: "tts",
    provider: "openai",
    fingerprint: "script",
    attempt: 2,
  });
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("unconfigured produceAudio fails without writing fake MP3/WAV", async () => {
  const prev = {
    eleven: process.env.ELEVENLABS_API_KEY,
    openai: process.env.OPENAI_API_KEY,
    tts: process.env.TTS_PROVIDER_API_KEY,
  };
  delete process.env.ELEVENLABS_API_KEY;
  delete process.env.OPENAI_API_KEY;
  delete process.env.TTS_PROVIDER_API_KEY;
  const supabase = createMemorySupabase();
  try {
    await assert.rejects(
      () =>
        produceAudio({
          supabase,
          userId: USER,
          source: source(),
          mixFn: mixPcmWav,
        }),
      (error: unknown) => error instanceof AudioEngineError && error.code === "unconfigured",
    );
    const media = supabase._tables.video_media || [];
    assert.equal(media.length, 0);
    const tts = (supabase._tables.video_audio_jobs || []).find((row) => row.kind === "tts");
    assert.equal(tts?.actual_cost ?? 0, 0);
  } finally {
    if (prev.eleven) process.env.ELEVENLABS_API_KEY = prev.eleven;
    else delete process.env.ELEVENLABS_API_KEY;
    if (prev.openai) process.env.OPENAI_API_KEY = prev.openai;
    else delete process.env.OPENAI_API_KEY;
    if (prev.tts) process.env.TTS_PROVIDER_API_KEY = prev.tts;
    else delete process.env.TTS_PROVIDER_API_KEY;
  }
});
