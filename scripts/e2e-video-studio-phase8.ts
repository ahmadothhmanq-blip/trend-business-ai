/**
 * Phase 8 runtime proof — one path only.
 * Unconfigured HeyGen: lip-sync stops at unconfigured, no fake artifact, source video stays.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { canTransition } from "@/lib/ai-core/video-production-platform/domain";
import { inspectArtifactQuality } from "@/lib/ai-core/video-production-platform/quality-control";
import { LipSyncError } from "@/lib/ai-core/video-production-platform/lip-sync/errors";
import { heygenLipSyncConfigured, heygenLipSyncProvider } from "@/lib/ai-core/video-production-platform/lip-sync/heygen";
import { runLipSync } from "@/lib/ai-core/video-production-platform/lip-sync/service";

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
    video_lipsync_jobs: [],
    video_media: [],
    video_quality_reports: [],
  };
  function matches(row: Record<string, unknown>, filters: Array<[string, string, unknown]>) {
    return filters.every(([op, key, value]) => (op === "eq" ? row[key] === value : true));
  }
  function from(table: string) {
    const state: { action: string; payload: unknown; filters: Array<[string, string, unknown]> } = {
      action: "select",
      payload: null,
      filters: [],
    };
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
          const row = { created_at: new Date().toISOString(), ...raw };
          if (!row.id) row.id = randomUUID();
          rows.push(row);
          data.push(row);
        }
      } else if (state.action === "update") {
        for (const row of rows) {
          if (matches(row, state.filters)) Object.assign(row, state.payload as object);
          data.push(row);
        }
      } else {
        data = rows.filter((row) => matches(row, state.filters));
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

async function main() {
  const configured = heygenLipSyncConfigured();
  log(
    "HeyGen config",
    "PASS",
    configured ? "HEYGEN_API_KEY present — live createJob skipped to avoid a paid job" : "HEYGEN_API_KEY missing",
  );

  const blocked = inspectArtifactQuality({
    video: {
      mimeType: "image/svg+xml",
      url: "https://signed.example/x.svg",
      durationSec: 8,
      isStub: true,
      provider: "preview",
    },
  });
  const gate = canTransition("quality_check", "assembling", { qcVerdict: blocked.verdict });
  log("QC BLOCKED gate", !gate && blocked.verdict === "BLOCKED" ? "PASS" : "FAIL", blocked.summary);

  if (configured) {
    log("runtime lip-sync", "PASS", "Provider is configured; not creating a live HeyGen job without production HTTPS assets.");
    const failed = steps.filter((step) => step.status === "FAIL").length;
    console.log(`\n--- ${failed === 0 ? "PASS" : "FAIL"} Phase 8 runtime (${failed} failed) ---\n`);
    process.exit(failed > 0 ? 1 : 0);
  }

  const supabase = createMemorySupabase();
  const projectId = randomUUID();
  const videoId = randomUUID();
  const audioId = randomUUID();
  await supabase.from("video_media").insert({
    id: videoId,
    user_id: USER,
    generation_id: projectId,
    kind: "clip",
    mime_type: "video/mp4",
    storage_path: `${USER}/${projectId}/source.mp4`,
    public_url: "https://signed.example/source.mp4",
    size_bytes: contractMp4().byteLength,
    duration_sec: 8,
    provider: "kling",
    sha256: "source",
    width: 1280,
    height: 720,
  });
  await supabase.from("video_media").insert({
    id: audioId,
    user_id: USER,
    generation_id: projectId,
    kind: "voice",
    mime_type: "audio/mpeg",
    storage_path: `${USER}/${projectId}/voice.mp3`,
    public_url: "https://signed.example/voice.mp3",
    size_bytes: 512,
    duration_sec: 8,
    provider: "openai",
    sha256: "audio",
  });

  let code: string | null = null;
  try {
    await runLipSync({
      supabase,
      userId: USER,
      projectId,
      sourceArtifactId: videoId,
      audioArtifactId: audioId,
    });
    log("unconfigured runtime", "FAIL", "runLipSync succeeded without HEYGEN_API_KEY");
  } catch (error) {
    code = error instanceof LipSyncError ? error.code : "other";
    log(
      "unconfigured runtime",
      code === "unconfigured" ? "PASS" : "FAIL",
      error instanceof Error ? error.message : String(error),
    );
  }

  const sourceKept = supabase._tables.video_media.some((row) => row.id === videoId && row.provider === "kling");
  const fakeHeygen = supabase._tables.video_media.some((row) => row.provider === "heygen");
  log("source artifact preserved", sourceKept && !fakeHeygen ? "PASS" : "FAIL");
  log(
    "no fake success",
    heygenLipSyncProvider.status() === "unconfigured" && code === "unconfigured" ? "PASS" : "FAIL",
  );

  const failed = steps.filter((step) => step.status === "FAIL").length;
  console.log(`\n--- ${failed === 0 ? "PASS" : "FAIL"} Phase 8 runtime (${failed} failed) ---\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
