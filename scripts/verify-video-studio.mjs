/**
 * Verify Video Studio production setup (migration 044/045, env, ffmpeg, modules).
 * Usage: npm run verify:video-studio
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { createClient } from "@supabase/supabase-js";
import pg from "pg";

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
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

loadEnv();

let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}
function warn(label, detail = "") {
  console.log(`  ! ${label}${detail ? ` — ${detail}` : ""}`);
}

const VS_FILES = [
  "supabase/migrations/044_video_studio_media.sql",
  "supabase/migrations/045_video_studio_media_update_rls.sql",
  "lib/ai-core/video-production-platform/production-health.ts",
  "lib/ai-core/video-production-platform/env-config.ts",
  "lib/ai-core/video-production-platform/generation-pipeline.ts",
  "app/api/video-studio/health/route.ts",
  "app/api/video-studio/cron/route.ts",
  "app/api/video-studio/jobs/route.ts",
];

console.log("\n[1] Video Studio files");
for (const rel of VS_FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Environment variables");
const envKeys = [
  "KLING_API_KEY",
  "RUNWAY_API_KEY",
  "HEYGEN_API_KEY",
  "ELEVENLABS_API_KEY",
  "OPENAI_API_KEY",
  "FFMPEG_PATH",
  "VIDEO_PROVIDER_STRICT",
  "VIDEO_STUDIO_CRON_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
];
for (const key of envKeys) {
  const set = Boolean(process.env[key]?.trim());
  if (set) ok(key, "set");
  else if (key === "VIDEO_PROVIDER_STRICT" || key === "VIDEO_STUDIO_CRON_SECRET") warn(key, "unset (recommended for production)");
  else if (key === "SUPABASE_SERVICE_ROLE_KEY") warn(key, "unset (required for cron worker)");
  else warn(key, "unset");
}

const hasVideoProvider = Boolean(
  process.env.KLING_API_KEY?.trim() ||
    process.env.RUNWAY_API_KEY?.trim() ||
    process.env.HEYGEN_API_KEY?.trim() ||
    (process.env.VIDEO_PROVIDER_API_KEY?.trim() && process.env.VIDEO_PROVIDER_BASE_URL?.trim()),
);
if (hasVideoProvider) ok("video provider", "at least one configured");
else warn("video provider", "none configured — preview/stub mode");

const hasTts = Boolean(process.env.ELEVENLABS_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());
if (hasTts) ok("TTS provider", "configured");
else warn("TTS provider", "unset — silent preview WAV");

console.log("\n[3] FFmpeg");
const ffmpegBin = process.env.FFMPEG_PATH?.trim() || "ffmpeg";
const ff = spawnSync(ffmpegBin, ["-version"], { encoding: "utf8" });
if (ff.status === 0) {
  ok("ffmpeg", (ff.stdout || ff.stderr || "").split("\n")[0] || "available");
  const filters = spawnSync(ffmpegBin, ["-hide_banner", "-filters"], { encoding: "utf8" });
  const text = `${filters.stdout || ""}${filters.stderr || ""}`.toLowerCase();
  for (const [name, token] of [
    ["merge/xfade", "xfade"],
    ["audio mix", "amix"],
    ["subtitle burn", "ass"],
    ["scale/re-encode", "scale"],
  ]) {
    if (text.includes(token)) ok(`filter:${name}`);
    else warn(`filter:${name}`, "not found");
  }
} else {
  fail("ffmpeg", "not found — set FFMPEG_PATH or install ffmpeg");
}

console.log("\n[4] Database migration 044/045");
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (dbUrl) {
  const client = new pg.Client({ connectionString: dbUrl });
  try {
    await client.connect();
    for (const table of ["video_media", "video_render_jobs", "video_generations"]) {
      const res = await client.query(
        `select to_regclass('public.${table}') as reg`,
      );
      const exists = Boolean(res.rows[0]?.reg);
      if (exists) ok(`table ${table}`);
      else fail(`table ${table}`, "missing — run npm run db:apply -- --only 044,045");
    }
    const policy = await client.query(`
      select polname from pg_policy p
      join pg_class c on c.oid = p.polrelid
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public' and c.relname = 'video_media'
        and polname = 'Users can update own video media'
    `);
    if (policy.rowCount > 0) ok("RLS update policy on video_media");
    else fail("RLS update policy on video_media", "apply migration 045");
    const bucket = await client.query(
      `select id from storage.buckets where id = 'video-studio'`,
    );
    if (bucket.rowCount > 0) ok("storage bucket video-studio");
    else fail("storage bucket video-studio", "apply migration 044");
  } catch (error) {
    fail("database", error instanceof Error ? error.message : String(error));
  } finally {
    await client.end().catch(() => undefined);
  }
} else {
  warn("database", "SUPABASE_DB_URL unset — skipping direct table check");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (url && key) {
    const supabase = createClient(url, key);
    for (const table of ["video_media", "video_render_jobs", "video_generations"]) {
      const { error } = await supabase.from(table).select("id").limit(1);
      if (!error || error.code !== "PGRST205") ok(`table ${table}`, "reachable");
      else fail(`table ${table}`, "missing — apply 044/045");
    }
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data } = await supabase.storage.listBuckets();
      const found = (data || []).some((b) => b.id === "video-studio");
      if (found) ok("storage bucket video-studio");
      else fail("storage bucket video-studio", "missing");
    }
  }
}

console.log("\n[5] Pipeline routes");
for (const route of [
  "app/api/video-studio/route.ts",
  "app/api/video-studio/[id]/manage/route.ts",
  "app/api/video-studio/[id]/media/route.ts",
]) {
  if (existsSync(join(root, route))) ok(route);
  else fail(route, "missing");
}

console.log(`\n--- ${failed === 0 ? "PASS" : "FAIL"} (${failed} issue(s)) ---\n`);
process.exit(failed > 0 ? 1 : 0);
