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
  "supabase/migrations/090_video_domain_persistence.sql",
  "lib/ai-core/video-production-platform/production-health.ts",
  "lib/ai-core/video-production-platform/env-config.ts",
  "lib/ai-core/video-production-platform/generation-pipeline.ts",
  "lib/ai-core/video-production-platform/persistence/repository.ts",
  "app/api/video-studio/health/route.ts",
  "app/api/video-studio/cron/route.ts",
  "app/api/video-studio/jobs/route.ts",
  "supabase/migrations/098_video_studio_bucket_policy.sql",
  "vercel.json",
];

console.log("\n[1] Video Studio files");
for (const rel of VS_FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Environment variables");
const forceProduction =
  process.argv.includes("--production") ||
  (process.env.NODE_ENV === "production" && process.env.VERCEL_ENV !== "preview");
if (forceProduction) {
  console.log("  (production fail-closed mode)");
}
const envKeys = [
  "GEMINI_API_KEY",
  "VEO_API_KEY",
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
const requiredProduction = new Set([
  "FFMPEG_PATH",
  "VIDEO_PROVIDER_STRICT",
  "VIDEO_STUDIO_CRON_SECRET",
  "SUPABASE_SERVICE_ROLE_KEY",
]);
for (const key of envKeys) {
  const set = Boolean(process.env[key]?.trim());
  const strictOn = key === "VIDEO_PROVIDER_STRICT" && process.env.VIDEO_PROVIDER_STRICT === "1";
  if (key === "VIDEO_PROVIDER_STRICT") {
    if (strictOn) ok(key, "1");
    else if (forceProduction) fail(key, "must be 1 in production");
    else warn(key, "unset (must be 1 in production)");
    continue;
  }
  if (set) ok(key, "set");
  else if (forceProduction && requiredProduction.has(key)) fail(key, "required in production");
  else if (requiredProduction.has(key)) warn(key, "required in production");
  else warn(key, "unset");
}

const hasVideoProvider = Boolean(
  process.env.GEMINI_API_KEY?.trim() ||
    process.env.VEO_API_KEY?.trim() ||
    process.env.KLING_API_KEY?.trim() ||
    process.env.RUNWAY_API_KEY?.trim() ||
    (process.env.VIDEO_PROVIDER_API_KEY?.trim() && process.env.VIDEO_PROVIDER_BASE_URL?.trim()),
);
if (hasVideoProvider) ok("video provider", "at least one full-render provider configured");
else if (forceProduction) fail("video provider", "none configured — production full render blocked");
else warn("video provider", "none configured — preview/stub mode");

const hasTts = Boolean(process.env.ELEVENLABS_API_KEY?.trim() || process.env.OPENAI_API_KEY?.trim());
if (hasTts) ok("TTS provider", "configured");
else if (forceProduction) fail("TTS provider", "required in production");
else warn("TTS provider", "unset — silent preview WAV");

console.log("\n[3] FFmpeg");
const ffmpegBin =
  process.env.FFMPEG_PATH?.trim() ||
  process.env.FFMPEG_BINARY?.trim() ||
  "ffmpeg";
const ffmpegSource = process.env.FFMPEG_PATH?.trim()
  ? "FFMPEG_PATH"
  : process.env.FFMPEG_BINARY?.trim()
    ? "FFMPEG_BINARY"
    : "PATH";
const ff = spawnSync(ffmpegBin, ["-version"], { encoding: "utf8" });
if (ff.status === 0) {
  ok("ffmpeg", `${(ff.stdout || ff.stderr || "").split("\n")[0] || "available"} (${ffmpegSource})`);
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
  fail(
    "ffmpeg",
    `not found (${ffmpegBin}) — set FFMPEG_PATH in .env.local or install via winget; see docs/VIDEO_STUDIO_LOCAL_SETUP.md`,
  );
}

console.log("\n[4] Database migration 044/045");
const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (dbUrl) {
  const client = new pg.Client({ connectionString: dbUrl });
  try {
    await client.connect();
    for (const table of [
      "video_media",
      "video_render_jobs",
      "video_generations",
      "video_plans",
      "video_scenes",
      "video_provider_jobs",
      "video_quality_reports",
    ]) {
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
      `select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'video-studio'`,
    );
    if (bucket.rowCount > 0) {
      const row = bucket.rows[0];
      if (row.public === false) ok("storage bucket video-studio private");
      else fail("storage bucket video-studio", "must be private (public=false)");
      if (Number(row.file_size_limit) > 0) ok("bucket file_size_limit", String(row.file_size_limit));
      else warn("bucket file_size_limit", "unset — apply migration 098");
      if (Array.isArray(row.allowed_mime_types) && row.allowed_mime_types.length > 0) {
        ok("bucket allowed_mime_types", `${row.allowed_mime_types.length} types`);
      } else {
        warn("bucket allowed_mime_types", "unset — apply migration 098");
      }
    } else {
      fail("storage bucket video-studio", "apply migration 044");
    }
  } catch (error) {
    fail("database", error instanceof Error ? error.message : String(error));
  } finally {
    await client.end().catch(() => undefined);
  }
}

if (!dbUrl) {
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
  }
}

{
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && service) {
    const supabase = createClient(url, service);
    const probePath = `_health/verify-${Date.now()}.png`;
    const png = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      "base64",
    );
    const uploaded = await supabase.storage.from("video-studio").upload(probePath, png, {
      contentType: "image/png",
      upsert: true,
    });
    if (uploaded.error) fail("storage upload", uploaded.error.message);
    else {
      ok("storage upload");
      const signed = await supabase.storage.from("video-studio").createSignedUrl(probePath, 60);
      const signedUrl = signed.data?.signedUrl || "";
      if (/\/object\/public\//i.test(signedUrl)) fail("signed download", "returned unsigned public URL");
      else if (signedUrl.startsWith("https://")) ok("signed download");
      else fail("signed download", signed.error?.message || "no signed URL");
      await supabase.storage.from("video-studio").remove([probePath]);
    }
  }
}

console.log("\n[5] Pipeline routes");
for (const route of [
  "app/api/video-studio/route.ts",
  "app/api/video-studio/[id]/manage/route.ts",
  "app/api/video-studio/[id]/media/route.ts",
  "app/api/video-studio/cron/route.ts",
  "app/api/video-studio/health/route.ts",
]) {
  if (existsSync(join(root, route))) ok(route);
  else fail(route, "missing");
}

console.log("\n[6] Cron schedule");
try {
  const vercel = JSON.parse(readFileSync(join(root, "vercel.json"), "utf8"));
  const cron = (vercel.crons || []).find((c) => c.path === "/api/video-studio/cron");
  if (cron?.schedule) ok("vercel.json cron", cron.schedule);
  else fail("vercel.json cron", "missing /api/video-studio/cron schedule");
} catch (error) {
  fail("vercel.json", error instanceof Error ? error.message : String(error));
}

console.log(`\n--- ${failed === 0 ? "PASS" : "FAIL"} (${failed} issue(s)) ---\n`);
process.exit(failed > 0 ? 1 : 0);
