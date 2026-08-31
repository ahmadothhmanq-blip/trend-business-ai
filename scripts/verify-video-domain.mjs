/**
 * Verify Video Studio domain persistence (migrations 090+).
 * Scene order uniqueness is plan-scoped after 092: video_scenes_plan_order_key.
 * Usage: npm run verify:video-domain
 */
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
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

const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Missing SUPABASE_DB_URL or DATABASE_URL");
  process.exit(2);
}

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

await client.connect();

console.log("\n[1] Schema");
for (const table of [
  "video_generations",
  "video_plans",
  "video_scenes",
  "video_provider_jobs",
  "video_media",
  "video_quality_reports",
  "video_render_jobs",
  "video_audio_plans",
  "video_audio_tracks",
  "video_audio_jobs",
  "video_lipsync_jobs",
]) {
  const { rows } = await client.query(`select to_regclass('public.${table}') as reg`);
  if (rows[0]?.reg) ok(`table ${table}`);
  else fail(`table ${table}`, "missing — apply 090");
}
const view = await client.query(`select to_regclass('public.video_artifacts') as reg`);
if (view.rows[0]?.reg) ok("view video_artifacts");
else fail("view video_artifacts", "missing");

console.log("\n[2] Foreign keys");
const fks = await client.query(`
  select conrelid::regclass::text as tbl, conname, pg_get_constraintdef(oid) as def
  from pg_constraint
  where contype = 'f'
    and (
      conrelid::regclass::text like '%video_plans%'
      or conrelid::regclass::text like '%video_scenes%'
      or conrelid::regclass::text like '%video_provider_jobs%'
      or conrelid::regclass::text like '%video_quality_reports%'
      or conrelid::regclass::text like '%video_media%'
      or conrelid::regclass::text like '%video_render_jobs%'
      or conrelid::regclass::text like '%video_generations%'
      or conrelid::regclass::text like '%video_audio_plans%'
      or conrelid::regclass::text like '%video_audio_tracks%'
      or conrelid::regclass::text like '%video_audio_jobs%'
      or conrelid::regclass::text like '%video_lipsync_jobs%'
    )
`);
const defs = fks.rows.map((r) => `${r.tbl} ${r.def}`);
const need = [
  "video_plans",
  "video_scenes",
  "video_provider_jobs",
  "video_quality_reports",
  "video_audio_plans",
  "video_audio_tracks",
  "video_audio_jobs",
  "video_lipsync_jobs",
];
for (const name of need) {
  if (defs.some((d) => d.includes(name) && d.includes("video_generations"))) ok(`fk ${name} → project`);
  else fail(`fk ${name} → project`);
}

console.log("\n[3] Indexes");
for (const index of [
  "idx_video_scenes_project_status",
  "idx_video_provider_jobs_project_status",
  "idx_video_provider_jobs_scene_status",
  "idx_video_media_generation_kind",
  "idx_video_media_scene_id",
  "idx_video_quality_reports_project_id",
  "video_scenes_plan_order_key",
  "video_provider_jobs_idempotency_key_key",
  "idx_video_audio_plans_project",
  "idx_video_audio_tracks_plan",
  "idx_video_audio_jobs_project_status",
  "idx_video_lipsync_jobs_project_status",
]) {
  const { rowCount } = await client.query(
    `select 1 from pg_indexes where schemaname = 'public' and indexname = $1
     union
     select 1 from pg_constraint where conname = $1`,
    [index],
  );
  if (rowCount > 0) ok(index);
  else fail(index, "missing");
}

console.log("\n[4] Unique constraints");
for (const name of [
  "video_provider_jobs_idempotency_key_key",
  "video_provider_jobs_scene_provider_key",
  "video_plans_project_version_key",
  "video_scenes_plan_order_key",
  "video_audio_jobs_idempotency_key_key",
  "video_lipsync_jobs_idempotency_key_key",
]) {
  const { rowCount } = await client.query(
    `select 1 from pg_constraint where conname = $1 and contype = 'u'
     union
     select 1 from pg_indexes where schemaname = 'public' and indexname = $1`,
    [name],
  );
  if (rowCount > 0) ok(name);
  else fail(name, "missing");
}

console.log("\n[5] RLS");
const rls = await client.query(`
  select c.relname, c.relrowsecurity, count(p.polname) as policies
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  left join pg_policy p on p.polrelid = c.oid
  where n.nspname = 'public'
    and c.relname in ('video_plans', 'video_scenes', 'video_provider_jobs', 'video_quality_reports', 'video_generations', 'video_media', 'video_audio_plans', 'video_audio_tracks', 'video_audio_jobs', 'video_lipsync_jobs')
  group by c.relname, c.relrowsecurity
`);
for (const row of rls.rows) {
  if (row.relrowsecurity && Number(row.policies) >= 3) ok(`rls ${row.relname}`, `${row.policies} policies`);
  else fail(`rls ${row.relname}`, `relrowsecurity=${row.relrowsecurity} policies=${row.policies}`);
}

console.log("\n[6] Existing projects / blueprint");
const counts = await client.query(`
  select
    count(*)::int as generations,
    count(*) filter (where blueprint is not null)::int as with_blueprint,
    count(*) filter (where status = 'completed')::int as legacy_completed,
    count(*) filter (where domain_state is not null)::int as with_domain_state
  from public.video_generations
`);
const c = counts.rows[0];
ok(
  "row counts",
  `generations=${c.generations} blueprint=${c.with_blueprint} completed=${c.legacy_completed} domain_state=${c.with_domain_state}`,
);

const completedMismatch = await client.query(`
  select count(*)::int as n
  from public.video_generations
  where status = 'completed' and domain_state is distinct from 'storyboard_ready'
`);
if (Number(completedMismatch.rows[0].n) === 0) ok("legacy completed mapped to storyboard_ready");
else fail("legacy completed mapped to storyboard_ready", `${completedMismatch.rows[0].n} mismatch`);

const triggers = await client.query(`
  select tgname from pg_trigger
  where tgname in (
    'trg_video_generations_guard_state',
    'trg_video_media_guard_artifact',
    'trg_video_plans_sync_owner'
  )
`);
if (triggers.rowCount === 3) ok("state/artifact/owner triggers");
else fail("triggers", `found ${triggers.rowCount}`);

await client.end();
console.log(`\n--- ${failed === 0 ? "PASS" : "FAIL"} (${failed} issue(s)) ---\n`);
process.exit(failed > 0 ? 1 : 0);
