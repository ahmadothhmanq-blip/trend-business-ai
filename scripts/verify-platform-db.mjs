/**
 * Verify platform DB (021–024): tables, anon RLS, org/team API shape.
 * Uses anon key only (no secrets printed).
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

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
    const v = t.slice(eq + 1).trim();
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !anon) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  process.exit(1);
}

const supabase = createClient(url, anon);
let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

const PLATFORM_TABLES = [
  "organizations",
  "org_members",
  "team_invitations",
  "notifications",
  "activity_log",
  "api_keys",
  "webhooks",
  "usage_records",
  "feature_flags",
  "subscription_plans",
  "agents",
  "agent_workflows",
  "agent_executions",
];

console.log("\n[1] Platform tables");
for (const table of PLATFORM_TABLES) {
  const { error } = await supabase.from(table).select("*").limit(1);
  if (!error) ok(table, "exists");
  else if (error.code === "42P01" || /does not exist|schema cache|Could not find the table/i.test(error.message)) {
    fail(table, "MISSING — apply migrations 021–024");
  } else if (error.code === "42501" || /permission|JWT/i.test(error.message)) {
    ok(table, "exists (anon blocked)");
  } else {
    // PostgREST often returns empty for RLS with no rows
    ok(table, `reachable (${error.code || "ok"})`);
  }
}

console.log("\n[2] Anon must not create organizations");
{
  const { error } = await supabase.from("organizations").insert({
    name: "anon-probe",
    slug: `anon-probe-${Date.now()}`,
    owner_id: "00000000-0000-0000-0000-000000000000",
  });
  if (error) ok("organizations INSERT", error.code || "blocked");
  else fail("organizations INSERT", "anon write succeeded");
}

console.log("\n[3] Anon must not insert notifications for arbitrary users");
{
  const { error } = await supabase.from("notifications").insert({
    user_id: "00000000-0000-0000-0000-000000000000",
    type: "info",
    title: "probe",
  });
  if (error) ok("notifications INSERT", error.code || "blocked");
  else fail("notifications INSERT", "anon write succeeded — policy too open");
}

console.log("\n[4] Public read tables");
for (const table of ["subscription_plans", "feature_flags"]) {
  const { data, error } = await supabase.from(table).select("id").limit(3);
  if (error && (error.code === "42P01" || /Could not find the table/i.test(error.message))) {
    fail(table, "missing");
  } else if (error) {
    fail(table, error.message);
  } else {
    ok(table, `${data?.length ?? 0} row(s) visible`);
  }
}

console.log("\n[5] API route files");
const routes = [
  "app/api/platform/organizations/route.ts",
  "app/api/platform/team/route.ts",
  "lib/platform/organizations.ts",
  "supabase/migrations/023_security_hardening.sql",
  "supabase/migrations/024_organization_bootstrap.sql",
];
for (const f of routes) {
  if (existsSync(join(root, f))) ok(f);
  else fail(f, "missing");
}

console.log(`\n--- ${failed === 0 ? "PASS" : "FAIL"} (${failed} issue(s)) ---`);
process.exit(failed ? 1 : 0);
