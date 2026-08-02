/**
 * Website Builder database schema verification (migrations 078–079).
 * Usage: node scripts/verify-website-builder-db.mjs
 */
import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
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

loadEnv();

let failed = 0;
function ok(label) {
  console.log(`  ✓ ${label}`);
}
function fail(label, err) {
  failed++;
  console.log(`  ✗ ${label}: ${err}`);
}

const migrationFiles = [
  "078_website_builder_extensions.sql",
  "079_website_builder_collaboration.sql",
  "080_website_builder_rls_fix.sql",
  "081_website_builder_invitation_email.sql",
  "082_website_builder_collaborator_access.sql",
];

console.log("\n[1] Migration files");
for (const file of migrationFiles) {
  const path = join(root, "supabase/migrations", file);
  try {
    const sql = readFileSync(path, "utf8");
    if (!sql.trim()) fail(file, "empty");
    else ok(file);
  } catch {
    fail(file, "missing");
  }
}

const sql078 = readFileSync(
  join(root, "supabase/migrations/078_website_builder_extensions.sql"),
  "utf8",
);
for (const needle of [
  "website_builder_snapshots",
  "website_generation_members",
  "references public.website_generations",
  "enable row level security",
  "idx_website_builder_snapshots_generation",
  "idx_website_generation_members_generation",
]) {
  if (!sql078.includes(needle)) fail(`078: ${needle}`, "missing");
  else ok(`078: ${needle}`);
}

const sql079 = readFileSync(
  join(root, "supabase/migrations/079_website_builder_collaboration.sql"),
  "utf8",
);
for (const needle of [
  "invitation_token",
  "expires_at",
  "accepted_at",
  "status",
  "Invitees can view pending invitations",
  "Accepted members can view team",
]) {
  if (!sql079.includes(needle)) fail(`079: ${needle}`, "missing");
  else ok(`079: ${needle}`);
}

const sql081 = readFileSync(
  join(root, "supabase/migrations/081_website_builder_invitation_email.sql"),
  "utf8",
);
for (const needle of [
  "email_sent_at",
  "email_message_id",
  "email_delivery_status",
  "email_last_error",
  "email_resend_count",
]) {
  if (!sql081.includes(needle)) fail(`081: ${needle}`, "missing");
  else ok(`081: ${needle}`);
}

const sql082 = readFileSync(
  join(root, "supabase/migrations/082_website_builder_collaborator_access.sql"),
  "utf8",
);
for (const needle of [
  "private.can_edit_website_generation",
  "Editors can update shared website generations",
]) {
  if (!sql082.includes(needle)) fail(`082: ${needle}`, "missing");
  else ok(`082: ${needle}`);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (url && anon) {
  console.log("\n[2] Live schema probes (anon)");
  const supabase = createClient(url, anon);
  for (const table of ["website_builder_snapshots", "website_generation_members"]) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (!error) ok(`${table} reachable`);
    else if (error.code === "42P01" || /does not exist|schema cache/i.test(error.message)) {
      fail(table, "MISSING — run npm run db:apply -- --only 078,079");
    } else if (error.code === "42501" || /permission|JWT/i.test(error.message)) {
      ok(`${table} exists (RLS blocks anon)`);
    } else {
      ok(`${table} (${error.code || "reachable"})`);
    }
  }
} else {
  console.log("\n[2] Skipping live probes (no Supabase env)");
}

console.log("\n[3] API routes");
const apiPaths = [
  "app/api/website-builder/[id]/builder/members/route.ts",
  "app/api/website-builder/[id]/builder/members/[memberId]/route.ts",
  "app/api/website-builder/[id]/builder/members/[memberId]/resend/route.ts",
  "app/api/website-builder/[id]/builder/snapshots/route.ts",
  "app/api/website-builder/builder/invitations/route.ts",
];
for (const rel of apiPaths) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

if (failed) {
  console.error(`\nverify-website-builder-db: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-builder-db: OK");
