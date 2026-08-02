/**
 * Post-apply verification for security migrations 083–087 (staging).
 * Usage: node scripts/verify-security-migrations-staging.mjs
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  for (const rel of [".env.staging", ".env.local"]) {
    const path = join(root, rel);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const t = line.trim();
      if (!t || t.startsWith("#")) continue;
      const eq = t.indexOf("=");
      if (eq <= 0) continue;
      const k = t.slice(0, eq).trim();
      let v = t.slice(eq + 1).trim();
      if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

loadEnv();

const MIGRATION_IDS = [
  "081_website_builder_invitation_email",
  "082_website_builder_collaborator_access",
  "083_security_advisor_fixes",
  "084_security_advisor_function_grants",
  "085_security_advisor_complete",
  "086_rls_initplan_fix",
  "087_consolidate_permissive_policies",
];

const results = [];
function pass(id, msg) {
  results.push({ id, status: "PASS", msg });
  console.log(`  PASS  ${id}: ${msg}`);
}
function fail(id, msg) {
  results.push({ id, status: "FAIL", msg });
  console.log(`  FAIL  ${id}: ${msg}`);
}
function warn(id, msg) {
  results.push({ id, status: "WARN", msg });
  console.log(`  WARN  ${id}: ${msg}`);
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

console.log("\n=== [1] schema_migrations ===");
const { rows: applied } = await client.query(
  `select id, applied_at from public.schema_migrations
   where id = any($1::text[])
   order by id`,
  [MIGRATION_IDS],
);
for (const id of MIGRATION_IDS) {
  const row = applied.find((r) => r.id === id);
  if (row) pass("migration", `${id} @ ${row.applied_at.toISOString()}`);
  else fail("migration", `${id} NOT in schema_migrations`);
}

console.log("\n=== [2] Security Advisor structural checks ===");
const { rows: privateSchema } = await client.query(
  `select 1 from information_schema.schemata where schema_name = 'private'`,
);
privateSchema.length ? pass("private_schema", "exists") : fail("private_schema", "missing");

const { rows: privateHelpers } = await client.query(
  `select proname from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'private'
     and proname in (
       'is_website_generation_member',
       'can_edit_website_generation',
       'is_platform_admin',
       'is_org_member'
     )
   order by proname`,
);
if (privateHelpers.length === 4) {
  pass("private_helpers", `found ${privateHelpers.length}/4 expected helpers`);
} else {
  fail(
    "private_helpers",
    `found ${privateHelpers.length}/4 — missing: ${["can_edit_website_generation", "is_website_generation_member", "is_platform_admin", "is_org_member"].filter((name) => !privateHelpers.some((r) => r.proname === name)).join(", ")}`,
  );
}

const { rows: publicDropped } = await client.query(
  `select proname from pg_proc p
   join pg_namespace n on n.oid = p.pronamespace
   where n.nspname = 'public'
     and proname in ('is_org_member','is_platform_admin','is_website_generation_member','can_edit_website_generation')`,
);
publicDropped.length === 0
  ? pass("public_helpers_dropped", "public RPC helpers removed")
  : fail("public_helpers_dropped", `still present: ${publicDropped.map((r) => r.proname).join(", ")}`);

const { rows: creatorPrivate } = await client.query(
  `select 1 from information_schema.tables
   where table_schema = 'public' and table_name = 'marketplace_creator_private'`,
);
creatorPrivate.length ? pass("marketplace_creator_private", "table exists") : fail("marketplace_creator_private", "missing");

const { rows: schemaMigRls } = await client.query(
  `select relrowsecurity from pg_class c
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'schema_migrations'`,
);
schemaMigRls[0]?.relrowsecurity
  ? pass("schema_migrations_rls", "enabled")
  : fail("schema_migrations_rls", "not enabled");

const { rows: webhookPolicy } = await client.query(
  `select polname from pg_policy pol
   join pg_class c on c.oid = pol.polrelid
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'billing_webhook_events'
     and pol.polname ilike '%deny%'`,
);
webhookPolicy.length ? pass("billing_webhook_deny", webhookPolicy[0].polname) : warn("billing_webhook_deny", "deny policy not found by name");

const { rows: genSelect } = await client.query(
  `select polname from pg_policy pol
   join pg_class c on c.oid = pol.polrelid
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'website_generations'
     and pol.polcmd = 'r'
   order by polname`,
);
const consolidated = genSelect.some((r) =>
  r.polname.includes("own or shared"),
);
consolidated
  ? pass("website_generations_select", "consolidated owner-or-member policy present")
  : warn("website_generations_select", `policies: ${genSelect.map((r) => r.polname).join(", ")}`);

const { rows: editorUpdate } = await client.query(
  `select polname from pg_policy pol
   join pg_class c on c.oid = pol.polrelid
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'website_generations'
     and pol.polcmd = 'w'
     and pol.polname ilike '%editor%'`,
);
editorUpdate.length
  ? pass("collaborator_edit_policy", editorUpdate[0].polname)
  : fail("collaborator_edit_policy", "Editors can update policy missing");

const { rows: publicLeadsInsert } = await client.query(
  `select polname from pg_policy pol
   join pg_class c on c.oid = pol.polrelid
   join pg_namespace n on n.oid = c.relnamespace
   where n.nspname = 'public' and c.relname = 'website_leads'
     and pol.polcmd = 'a'`,
);
publicLeadsInsert.length
  ? pass("public_leads_insert", `${publicLeadsInsert.length} INSERT policy/policies`)
  : fail("public_leads_insert", "no INSERT policy");

const { rows: anonConsume } = await client.query(
  `select has_function_privilege('anon', 'public.consume_credits(uuid,integer,text,text)', 'EXECUTE') as allowed`,
);
!anonConsume[0]?.allowed
  ? pass("anon_consume_credits", "revoked")
  : fail("anon_consume_credits", "anon still has EXECUTE");

const { rows: prereq } = await client.query(
  `select id from public.schema_migrations where id like '07%' or id like '08%' order by id`,
);
console.log("\n=== [5] Prerequisite migrations (07x-08x) ===");
for (const row of prereq) console.log(`  ${row.id}`);

await client.end();

console.log("\n=== [3] Smoke probes (Supabase API) ===");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (url && anon) {
  const anonClient = createClient(url, anon);
  const { error: flagsErr } = await anonClient.from("feature_flags").select("id").limit(1);
  if (flagsErr && (flagsErr.code === "42501" || /permission|JWT/i.test(flagsErr.message))) {
    pass("feature_flags_anon", "anon blocked (admin-only RLS)");
  } else if (!flagsErr) {
    fail("feature_flags_anon", "anon can read feature_flags");
  } else {
    warn("feature_flags_anon", flagsErr.message);
  }

  const { data: pubView, error: viewErr } = await anonClient
    .from("website_active_domains_public")
    .select("hostname")
    .limit(1);
  if (!viewErr) pass("public_domains_view", `readable (${pubView?.length ?? 0} rows sampled)`);
  else warn("public_domains_view", viewErr.message);

  const { data: pubs } = await anonClient
    .from("website_publications")
    .select("slug,status,public_path")
    .eq("status", "published")
    .limit(1);
  if (pubs?.length) {
    pass("public_website", `published slug=${pubs[0].slug}`);
  } else {
    warn("public_website", "no published sites in staging DB to probe");
  }
} else {
  warn("supabase_api", "missing NEXT_PUBLIC_SUPABASE_URL/anon");
}

if (url && service) {
  const admin = createClient(url, service);
  const { data: buckets } = await admin.storage.listBuckets();
  const names = (buckets ?? []).map((b) => b.name);
  for (const bucket of ["website-assets", "ai-assets", "avatars"]) {
    names.includes(bucket)
      ? pass("storage_bucket", bucket)
      : fail("storage_bucket", `${bucket} missing`);
  }
} else {
  warn("storage_buckets", "service role unset — skipped bucket list");
}

console.log("\n=== [4] Structural smoke scripts ===");
const structural = [
  "node scripts/smoke-website-builder-production.mjs",
  "node scripts/smoke-website-ai.mjs",
  "node scripts/verify-website-publish-gates.mjs",
  "node scripts/verify-website-builder-db.mjs",
  "node scripts/smoke-collaborator-editing.mjs",
];

import { spawnSync } from "node:child_process";
for (const cmd of structural) {
  const [bin, ...args] = cmd.split(" ");
  const r = spawnSync(bin, args, { cwd: root, encoding: "utf8", shell: true });
  if (r.status === 0) pass("smoke", cmd);
  else fail("smoke", `${cmd} exit ${r.status}`);
}

const fails = results.filter((r) => r.status === "FAIL").length;
const warns = results.filter((r) => r.status === "WARN").length;
console.log(`\n=== SUMMARY: fail=${fails} warn=${warns} pass=${results.length - fails - warns} ===`);
process.exit(fails > 0 ? 1 : 0);
