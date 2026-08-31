/**
 * Phase 7A runtime proof — one path only.
 * Unconfigured TTS: VideoPlan → required audio → unconfigured → no fake audio → no video_rendered.
 * Configured TTS: VideoPlan → TTS → mix → final MP4 (single project).
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import type { VideoBlueprint, VideoGeneration } from "@/types/video";
import type { VideoProductionModel } from "@/lib/ai-core/video-production-platform/types";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain";
import { mixPcmWav, toneWavBytes } from "@/lib/ai-core/video-production-platform/audio-engine/mixer";
import { resolveTtsProvider } from "@/lib/ai-core/video-production-platform/audio-engine/tts/registry";
import { seedDomainProject } from "@/lib/ai-core/video-production-platform/runtime/seed";
import { runDomainRenderPipeline } from "@/lib/ai-core/video-production-platform/runtime/render-pipeline";
import { createProviderRegistry } from "@/lib/ai-core/video-production-platform/provider-router";
import type { ProviderJobRequest, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { mixAudio } from "@/lib/ai-core/video-production-platform/audio-engine/mixer";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
function loadEnv() {
  for (const name of [".env.local", ".env"]) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq === -1) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      if (!process.env[k]) process.env[k] = v;
    }
  }
}
loadEnv();

const USER = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const steps: Array<{ name: string; status: "PASS" | "FAIL"; detail?: string }> = [];
function log(name: string, status: "PASS" | "FAIL", detail = "") {
  steps.push({ name, status, detail });
  console.log(`${status.padEnd(4)} ${name}${detail ? ` — ${detail}` : ""}`);
}

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
    video_render_jobs: [],
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
      limitN: number | null;
    } = { action: "select", payload: null, filters: [], orderCol: null, limitN: null };
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
          const row = { created_at: new Date().toISOString(), ...raw };
          if (!row.id) row.id = randomUUID();
          rows.push(row);
          data.push(row);
        }
      } else if (state.action === "update") {
        for (const row of rows) {
          if (matches(row, state.filters)) Object.assign(row, state.payload as object);
        }
        data = rows.filter((row) => matches(row, state.filters));
      } else {
        data = rows.filter((row) => matches(row, state.filters));
        if (state.limitN != null) data = data.slice(0, state.limitN);
      }
      if (error) return { data: null, error };
      if (shape === "single") return { data: data[0] || null, error: data[0] ? null : { message: "missing" } };
      if (shape === "maybe") return { data: data[0] || null, error: null };
      return { data, error: null };
    }
    const api: Record<string, unknown> = {
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
      order(col: string) {
        state.orderCol = col;
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
  return {
    from,
    storage: {
      from() {
        return {
          async upload(_path: string, bytes: Uint8Array) {
            return { error: null, bytes };
          },
          async createSignedUrl() {
            return { data: { signedUrl: "https://signed.example/media" } };
          },
        };
      },
    },
    _tables: tables,
  };
}

function generation(): VideoGeneration {
  const now = new Date().toISOString();
  const blueprint: VideoBlueprint = {
    title: "Phase 7A",
    description: "",
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
        visualPrompt: "Controlled studio product table",
        cameraMove: "Slow push-in",
        mood: "Professional",
        narration: "Trend Business AI delivers production-ready video.",
        musicDirection: "",
        sfxNotes: "",
        transition: "cut",
        svgStoryboard: "",
      },
    ],
    script: "Trend Business AI delivers production-ready video.",
    voiceoverScript: "Trend Business AI delivers production-ready video.",
    musicSuggestions: [],
    subtitles: [],
    thumbnailSvg: "",
    colorGrade: "",
    exportPreset: "1080p",
    files: [],
    prompt: "phase 7a",
    language: "en",
    generatedAt: now,
  };
  return {
    id: randomUUID(),
    user_id: USER,
    video_name: "Phase 7A",
    video_type: "product-demo",
    description: "",
    style: "Cinematic",
    aspect_ratio: "16:9",
    duration: "8s",
    options: [],
    prompt: "phase 7a",
    blueprint,
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
        script: "Trend Business AI delivers production-ready video.",
        visualPrompt: "Controlled studio product table",
        cameraMove: "Slow push-in",
        transition: "cut",
      },
    ],
    chapters: [],
    voiceTracks: [
      {
        id: "vt-1",
        voiceId: "alloy",
        style: "professional",
        language: "en",
        script: "Trend Business AI delivers production-ready video.",
        status: "queued",
      },
    ],
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
    health: () => ({ ok: true, status: "ready", reason: "runtime kling mock" }),
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

async function main() {
  let ttsReady = false;
  try {
    ttsReady = resolveTtsProvider().status() === "ready";
  } catch {
    ttsReady = false;
  }
  log("tts_status", ttsReady ? "PASS" : "PASS", ttsReady ? "configured" : "unconfigured");

  const supabase = createMemorySupabase();
  const gen = generation();
  await supabase.from("video_generations").insert(gen).select("*").single();
  await seedDomainProject(supabase, { userId: USER, generation: gen });
  const snapshot = { veo: false, kling: true, runway: false, heygen: false, external: false };
  const registry = { ...createProviderRegistry(snapshot), kling: successKling() };

  const result = await runDomainRenderPipeline({
    model: modelFor(gen),
    supabase,
    userId: USER,
    generationId: gen.id,
    snapshot,
    registry,
    mixFn: ttsReady ? mixAudio : mixPcmWav,
    musicBytes: ttsReady ? toneWavBytes({ durationSec: 1, frequencyHz: 180 }) : undefined,
  });

  const audioMedia = (supabase._tables.video_media || []).filter((row) =>
    String(row.mime_type || "").startsWith("audio/"),
  );

  if (!ttsReady) {
    if (result.domainState === "failed" && result.errorCode === "unconfigured" && !result.artifact && audioMedia.length === 0) {
      log("required_audio_unconfigured", "PASS", "no fake audio, no video_rendered");
    } else {
      log(
        "required_audio_unconfigured",
        "FAIL",
        `state=${result.domainState} code=${result.errorCode} artifact=${Boolean(result.artifact)} audioRows=${audioMedia.length}`,
      );
    }
  } else {
    const playable = result.artifact && isValidVideoArtifact(result.artifact);
    const mixed = Boolean(result.job.audioAsset);
    if (result.domainState === "video_rendered" && playable && mixed && result.artifact!.durationSec > 0) {
      log(
        "configured_tts_final_video",
        "PASS",
        `${result.artifact!.mimeType} duration=${result.artifact!.durationSec} mix=${result.job.audioAsset?.provider}`,
      );
    } else {
      log(
        "configured_tts_final_video",
        "FAIL",
        `state=${result.domainState} playable=${Boolean(playable)} mixed=${mixed} err=${result.errorMessage || ""}`,
      );
    }
  }

  const failed = steps.some((step) => step.status === "FAIL");
  console.log(`\n--- ${failed ? "FAIL" : "PASS"} Phase 7A runtime ---\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
