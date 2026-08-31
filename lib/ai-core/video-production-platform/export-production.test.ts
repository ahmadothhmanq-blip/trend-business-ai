/**
 * P0-4 Production Video Export — verified composite only, no fake success.
 */
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { describe, it } from "node:test";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import type { MemoryQueryBuilder } from "@/lib/ai-core/video-production-platform/test/memory-query-builder";
import type { AssemblyInput, AssemblyResult, ProbedMediaInfo } from "@/lib/ai-core/video-production-platform/assemble";
import { getSocialExportPreset } from "@/lib/ai-core/video-production-platform/social-export";
import {
  ProductionExportError,
  exportProductionForSocialPreset,
  sniffPlayableVideoMime,
  verifyPlayableCompositeBytes,
  type ProductionExportDeps,
} from "@/lib/ai-core/video-production-platform/export-production";
import { sha256Hex } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import { toneWavBytes } from "@/lib/ai-core/video-production-platform/audio-engine/mixer";
import { uploadVideoStudioMedia } from "@/lib/ai-core/video-production-platform/media-storage";

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const OTHER = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const PROJECT = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
const PRESET = getSocialExportPreset("tiktok")!;

function contractMp4(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d], 0);
  return bytes;
}

function contractWebm(): Uint8Array {
  const bytes = new Uint8Array(5000);
  bytes.set([0x1a, 0x45, 0xdf, 0xa3], 0);
  return bytes;
}

function stubMp4(): Uint8Array {
  const bytes = new Uint8Array(2000);
  bytes.set([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70], 0);
  bytes.set(Buffer.from("TB-AI-VIDEO:preview"), 64);
  return bytes;
}

function probed(over: Partial<ProbedMediaInfo> = {}): ProbedMediaInfo {
  return {
    durationSec: 8,
    width: 1080,
    height: 1920,
    codec: "h264",
    hasAudio: false,
    audioCodec: null,
    ...over,
  };
}

function model(over: Partial<VideoProductionModel> = {}): VideoProductionModel {
  const now = new Date().toISOString();
  return {
    version: 1,
    title: "Studio film",
    videoType: "storyboard",
    aspectRatio: "9:16",
    targetDurationSec: 8,
    durationTier: "short",
    language: "en",
    style: "Cinematic",
    mood: "Professional",
    scenes: [
      {
        id: "s1",
        name: "Hero",
        order: 0,
        durationSec: 8,
        script: "",
        visualPrompt: "Controlled studio product table",
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
    ...over,
  };
}

function createMemorySupabase() {
  const tables: Record<string, Record<string, unknown>[]> = {
    video_media: [],
    video_audio_jobs: [],
  };
  const blobs = new Map<string, Uint8Array>();

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
      const error: { message: string; code?: string } | null = null;
      if (state.action === "insert") {
        const incoming = Array.isArray(state.payload) ? state.payload : [state.payload];
        for (const raw of incoming as Record<string, unknown>[]) {
          const row: Record<string, unknown> = {
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            sha256: raw.sha256 ?? null,
            width: raw.width ?? null,
            height: raw.height ?? null,
            codec: raw.codec ?? null,
            meta: raw.meta || {},
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
        return { data: data[0] || null, error: data[0] ? null : { message: "missing", code: "PGRST116" } };
      }
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
          async upload(path: string, bytes: Uint8Array) {
            blobs.set(path, bytes);
            return { error: null };
          },
          async createSignedUrl(path: string) {
            return { data: { signedUrl: `https://signed.example/${path}` } };
          },
          getPublicUrl(path: string) {
            return { data: { publicUrl: `https://signed.example/${path}` } };
          },
          async download(path: string) {
            const bytes = blobs.get(path);
            if (!bytes) return { data: null, error: { message: "missing" } };
            return { data: { arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) } };
          },
        };
      },
    },
    _tables: tables,
  };
}

function seedComposite(
  supabase: ReturnType<typeof createMemorySupabase>,
  over: Record<string, unknown> = {},
) {
  const row = {
    id: randomUUID(),
    user_id: USER,
    generation_id: PROJECT,
    scene_id: null,
    kind: "composite",
    mime_type: "video/mp4",
    storage_path: `${USER}/${PROJECT}/composite.mp4`,
    public_url: "https://cdn.example/composite.mp4",
    size_bytes: 5000,
    duration_sec: 8,
    provider: "kling",
    sha256: sha256Hex(contractMp4()),
    width: 1080,
    height: 1920,
    codec: "h264",
    ...over,
  };
  supabase._tables.video_media.push(row);
  return row;
}

function ffmpegResult(bytes: Uint8Array, audioUrl?: string | null): AssemblyResult {
  return {
    method: "ffmpeg",
    bytes,
    mimeType: "video/mp4",
    note: "FFmpeg assembled 1 clips.",
    manifest: {
      clipUrls: ["https://cdn.example/composite.mp4"],
      audioUrl: audioUrl || undefined,
      method: "ffmpeg",
      note: "ok",
      outputFormat: "mp4",
    },
    assetStub: {
      id: "stub",
      kind: "composite",
      mimeType: "video/mp4",
      url: "",
      durationSec: 8,
      provider: "ffmpeg",
      createdAt: new Date().toISOString(),
    },
  };
}

function deps(over: Partial<ProductionExportDeps> & { assembleCalls?: AssemblyInput[] } = {}): ProductionExportDeps {
  const assembleCalls = over.assembleCalls || [];
  return {
    assemble: over.assemble || (async (input) => {
      assembleCalls.push(input);
      return ffmpegResult(contractMp4(), input.audioUrl);
    }),
    probe: over.probe || (async () => probed()),
    fetchVideo: over.fetchVideo || (async () => contractMp4()),
    fetchAudio: over.fetchAudio || (async () => null),
    upload: over.upload || uploadVideoStudioMedia,
  };
}

async function runExport(input: {
  supabase?: ReturnType<typeof createMemorySupabase>;
  userId?: string;
  model?: VideoProductionModel;
  deps?: ProductionExportDeps;
  reencode?: boolean;
}) {
  const supabase = input.supabase || createMemorySupabase();
  return exportProductionForSocialPreset({
    supabase,
    userId: input.userId || USER,
    generationId: PROJECT,
    model: input.model || model(),
    preset: PRESET,
    reencode: input.reencode,
    deps: input.deps || deps(),
  });
}

describe("P0-4 production composite export", () => {
  it("sniffs mp4/webm magic bytes and rejects stubs", () => {
    assert.equal(sniffPlayableVideoMime(contractMp4()), "video/mp4");
    assert.equal(sniffPlayableVideoMime(contractWebm()), "video/webm");
    assert.equal(sniffPlayableVideoMime(stubMp4()), null);
    assert.equal(sniffPlayableVideoMime(new Uint8Array(Buffer.from("<svg></svg>"))), null);
  });

  it("valid composite export records MIME, magic, duration, dimensions, codec, sha256, size", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase);
    const assembled = contractMp4();
    const result = await runExport({
      supabase,
      deps: deps({
        assemble: async () => ffmpegResult(assembled),
        probe: async () => probed({ durationSec: 7.5, width: 1080, height: 1920, codec: "h264" }),
      }),
    });
    assert.equal(result.reencoded, true);
    assert.equal(result.reused, false);
    assert.equal(result.charged, false);
    assert.equal(result.artifact.mimeType, "video/mp4");
    assert.equal(sniffPlayableVideoMime(result.artifact.bytes), "video/mp4");
    assert.equal(result.artifact.durationSec, 7.5);
    assert.equal(result.artifact.width, 1080);
    assert.equal(result.artifact.height, 1920);
    assert.equal(result.artifact.codec, "h264");
    assert.equal(result.artifact.size, assembled.byteLength);
    assert.equal(result.artifact.sha256, sha256Hex(assembled));
    assert.match(result.videoUrl, /^https:\/\//);
  });

  it("rejects missing composite instead of clip/stub passthrough", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase, {
      kind: "clip",
      public_url: "https://cdn.example/clip.mp4",
    });
    await assert.rejects(
      () => runExport({ supabase }),
      (error: unknown) => {
        assert.ok(error instanceof ProductionExportError);
        assert.equal(error.code, "missing_composite");
        return true;
      },
    );
  });

  it("rejects invalid artifacts (stub / svg / wrong mime)", async () => {
    await assert.rejects(
      () =>
        verifyPlayableCompositeBytes({
          bytes: stubMp4(),
          declaredMime: "video/mp4",
          probe: async () => probed(),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "invalid_signature",
    );
    await assert.rejects(
      () =>
        verifyPlayableCompositeBytes({
          bytes: new Uint8Array(Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'></svg>".repeat(40))),
          declaredMime: "video/mp4",
          probe: async () => probed(),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "invalid_signature",
    );
    await assert.rejects(
      () =>
        verifyPlayableCompositeBytes({
          bytes: contractMp4(),
          declaredMime: "video/webm",
          probe: async () => probed(),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "invalid_mime",
    );
  });

  it("rejects duration <= 0", async () => {
    await assert.rejects(
      () =>
        verifyPlayableCompositeBytes({
          bytes: contractMp4(),
          probe: async () => probed({ durationSec: 0 }),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "invalid_duration",
    );
  });

  it("rejects missing dimensions", async () => {
    await assert.rejects(
      () =>
        verifyPlayableCompositeBytes({
          bytes: contractMp4(),
          probe: async () => probed({ width: null, height: null }),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "invalid_dimensions",
    );
  });

  it("rejects missing codec", async () => {
    await assert.rejects(
      () =>
        verifyPlayableCompositeBytes({
          bytes: contractMp4(),
          probe: async () => probed({ codec: null }),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "invalid_codec",
    );
  });

  it("checksum matches sha256 of written bytes", async () => {
    const bytes = contractMp4();
    const verified = await verifyPlayableCompositeBytes({
      bytes,
      probe: async () => probed(),
    });
    assert.equal(verified.sha256, sha256Hex(bytes));
    assert.notEqual(verified.sha256, sha256Hex(contractWebm()));
  });

  it("muxes mixed audio when narration is required", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase);
    const wav = toneWavBytes({ durationSec: 1, frequencyHz: 440 });
    const audioUrl = `data:audio/wav;base64,${Buffer.from(wav).toString("base64")}`;
    const assembleCalls: AssemblyInput[] = [];
    const result = await runExport({
      supabase,
      model: model({
        voiceTracks: [
          {
            id: "v1",
            voiceId: "studio",
            style: "professional",
            language: "en",
            script: "Studio narration for the product film.",
            status: "completed",
            asset: {
              id: "a1",
              kind: "audio",
              mimeType: "audio/wav",
              url: audioUrl,
              durationSec: 1,
              provider: "elevenlabs",
              createdAt: new Date().toISOString(),
            },
          },
        ],
        jobs: [
          {
            id: "job-1",
            status: "completed",
            progress: 100,
            mode: "full",
            clips: [],
            provider: "kling",
            message: "ready",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            audioAsset: {
              id: "mix-1",
              kind: "audio",
              mimeType: "audio/wav",
              url: audioUrl,
              durationSec: 1,
              provider: "ffmpeg",
              createdAt: new Date().toISOString(),
            },
          },
        ],
      }),
      deps: deps({
        assembleCalls,
        fetchAudio: async () => wav,
        probe: async () => probed({ hasAudio: true, audioCodec: "aac" }),
      }),
    });
    assert.equal(result.audioRequired, true);
    assert.equal(result.audioIncluded, true);
    assert.equal(assembleCalls[0]?.audioUrl, audioUrl);
    assert.equal(result.artifact.hasAudio, true);
    assert.equal(result.charged, false);
  });

  it("allows export without audio when narration is not required", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase);
    const assembleCalls: AssemblyInput[] = [];
    const result = await runExport({
      supabase,
      deps: deps({
        assembleCalls,
        probe: async () => probed({ hasAudio: false }),
      }),
    });
    assert.equal(result.audioRequired, false);
    assert.equal(result.audioIncluded, false);
    assert.equal(assembleCalls[0]?.audioUrl, undefined);
  });

  it("rejects required audio that never reached the final render", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase);
    await assert.rejects(
      () =>
        runExport({
          supabase,
          model: model({
            voiceTracks: [
              {
                id: "v1",
                voiceId: "studio",
                style: "professional",
                language: "en",
                script: "Required narration.",
                status: "completed",
              },
            ],
          }),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "audio_required",
    );
  });

  it("reuses the same artifact without a second encode or credit charge", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase);
    const assembleCalls: AssemblyInput[] = [];
    const shared = deps({ assembleCalls });
    const first = await runExport({ supabase, deps: shared });
    const second = await runExport({ supabase, deps: shared });
    assert.equal(first.reused, false);
    assert.equal(second.reused, true);
    assert.equal(second.charged, false);
    assert.equal(first.charged, false);
    assert.equal(assembleCalls.length, 1);
    assert.equal(second.artifact.sha256, first.artifact.sha256);
    assert.equal(second.videoUrl, first.videoUrl);
  });

  it("rejects another user's composite (ownership)", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase, { user_id: OTHER });
    await assert.rejects(
      () => runExport({ supabase, userId: USER }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "ownership",
    );
  });

  it("export failure does not report success or return the source URL", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase);
    await assert.rejects(
      () =>
        runExport({
          supabase,
          deps: deps({
            assemble: async () => ({
              method: "first-clip",
              bytes: contractMp4(),
              mimeType: "video/mp4",
              note: "FFmpeg unavailable — first clip passthrough.",
              manifest: { clipUrls: ["https://cdn.example/composite.mp4"], method: "first-clip", note: "passthrough" },
              assetStub: {
                id: "x",
                kind: "composite",
                mimeType: "video/mp4",
                url: "https://cdn.example/composite.mp4",
                durationSec: 8,
                provider: "external",
                createdAt: new Date().toISOString(),
              },
            }),
          }),
        }),
      (error: unknown) => {
        assert.ok(error instanceof ProductionExportError);
        assert.equal(error.code, "ffmpeg_failed");
        return true;
      },
    );
  });

  it("does not fake success when FFmpeg writes nothing", async () => {
    const supabase = createMemorySupabase();
    seedComposite(supabase);
    await assert.rejects(
      () =>
        runExport({
          supabase,
          deps: deps({
            assemble: async () => ({
              method: "manifest-only",
              mimeType: "video/mp4",
              note: "FFmpeg did not produce a playable export.",
              manifest: { clipUrls: [], method: "manifest-only", note: "no write" },
              assetStub: {
                id: "x",
                kind: "composite",
                mimeType: "video/mp4",
                url: "",
                durationSec: 0,
                provider: "external",
                createdAt: new Date().toISOString(),
              },
            }),
          }),
        }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "ffmpeg_failed",
    );
  });

  it("empty project has no playable composite and cannot succeed", async () => {
    const supabase = createMemorySupabase();
    await assert.rejects(
      () => runExport({ supabase }),
      (error: unknown) => error instanceof ProductionExportError && error.code === "missing_composite",
    );
  });
});
