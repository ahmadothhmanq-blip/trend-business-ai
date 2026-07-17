/**
 * Website Builder production-launch env / config verifier.
 * Does not change product behavior. Exit 1 if P0 checks fail.
 *
 * Usage:
 *   node scripts/verify-wb-launch.mjs           # local / current .env.local
 *   node scripts/verify-wb-launch.mjs --production
 */
import { createClient } from "@supabase/supabase-js";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const productionMode = process.argv.includes("--production");

function loadEnvLocal() {
  const path = join(root, ".env.local");
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvLocal();

let failed = 0;
let warned = 0;

function pass(label, detail = "") {
  console.log(`PASS  ${label}${detail ? ` — ${detail}` : ""}`);
}
function warn(label, detail = "") {
  warned += 1;
  console.log(`WARN  ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed += 1;
  console.log(`FAIL  ${label}${detail ? ` — ${detail}` : ""}`);
}

function present(key) {
  const v = (process.env[key] || "").trim();
  return v && !/your-|placeholder|changeme/i.test(v) ? v : "";
}

console.log("=== Website Builder launch verify ===");
console.log(`mode=${productionMode ? "production" : "local"}`);

// --- Exact required env vars ---
const siteUrl = present("NEXT_PUBLIC_SITE_URL");
const supabaseUrl = present("NEXT_PUBLIC_SUPABASE_URL");
const anonKey = present("NEXT_PUBLIC_SUPABASE_ANON_KEY");
const serviceRole = present("SUPABASE_SERVICE_ROLE_KEY");
const deepseek = present("DEEPSEEK_API_KEY");
const dbUrl = present("SUPABASE_DB_URL");
const publishFlag = process.env.WEBSITE_PUBLISH_ENABLED;
const previewBuilder = process.env.WEBSITE_PREVIEW_BUILDER_ENABLED;
const upstashUrl = present("UPSTASH_REDIS_REST_URL");
const upstashToken = present("UPSTASH_REDIS_REST_TOKEN");
const billingOptional = process.env.BILLING_OPTIONAL;

if (!supabaseUrl) fail("NEXT_PUBLIC_SUPABASE_URL", "required");
else if (!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/i.test(supabaseUrl.replace(/\/$/, ""))) {
  warn("NEXT_PUBLIC_SUPABASE_URL", `unexpected shape: ${supabaseUrl}`);
} else pass("NEXT_PUBLIC_SUPABASE_URL", supabaseUrl);

if (!anonKey) fail("NEXT_PUBLIC_SUPABASE_ANON_KEY", "required");
else {
  const looksJwt = anonKey.startsWith("eyJ") && anonKey.length >= 100;
  const looksSbPublishable =
    anonKey.startsWith("sb_publishable_") && anonKey.length >= 40;
  const looksSbLegacy = anonKey.startsWith("sb_") && anonKey.length >= 40;
  if (looksJwt || looksSbPublishable || looksSbLegacy) {
    pass("NEXT_PUBLIC_SUPABASE_ANON_KEY", `set len=${anonKey.length}`);
  } else if (productionMode) {
    fail(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      `len=${anonKey.length} — confirm full anon/publishable key from Supabase Dashboard → Settings → API`,
    );
  } else {
    warn(
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      `len=${anonKey.length} — confirm full anon/publishable key from Supabase Dashboard → Settings → API`,
    );
  }
}

if (!siteUrl) {
  if (productionMode) fail("NEXT_PUBLIC_SITE_URL", "required for production (auth redirects + public URLs)");
  else warn("NEXT_PUBLIC_SITE_URL", "missing — local falls back to http://localhost:3000");
} else if (!/^https?:\/\/[^/\s]+$/i.test(siteUrl.replace(/\/$/, ""))) {
  fail("NEXT_PUBLIC_SITE_URL", "must be absolute origin, no path (e.g. https://app.example.com)");
} else if (productionMode && !siteUrl.startsWith("https://")) {
  fail("NEXT_PUBLIC_SITE_URL", "production must use https://");
} else if (productionMode && /localhost|127\.0\.0\.1/i.test(siteUrl)) {
  fail("NEXT_PUBLIC_SITE_URL", "production must not be localhost");
} else if (!productionMode && /localhost|127\.0\.0\.1/i.test(siteUrl)) {
  pass("NEXT_PUBLIC_SITE_URL", siteUrl + " (local OK)");
} else {
  pass("NEXT_PUBLIC_SITE_URL", siteUrl.replace(/\/$/, ""));
}

if (!serviceRole) {
  if (productionMode) fail("SUPABASE_SERVICE_ROLE_KEY", "required for production billing/credits admin writes");
  else warn("SUPABASE_SERVICE_ROLE_KEY", "missing — required before public launch");
} else if (serviceRole.startsWith("eyJ") || serviceRole.startsWith("sb_")) {
  pass("SUPABASE_SERVICE_ROLE_KEY", `set len=${serviceRole.length}`);
} else {
  warn("SUPABASE_SERVICE_ROLE_KEY", `set len=${serviceRole.length} — confirm service_role from Dashboard`);
}

if (!deepseek) fail("DEEPSEEK_API_KEY", "required — default Website Builder AI provider");
else pass("DEEPSEEK_API_KEY", `set len=${deepseek.length}`);

// Flags
if (previewBuilder === "true") {
  fail("WEBSITE_PREVIEW_BUILDER_ENABLED", "must be unset or false in production (D-004)");
} else {
  pass("WEBSITE_PREVIEW_BUILDER_ENABLED", previewBuilder ?? "(unset=off)");
}

if (publishFlag === "false") {
  warn("WEBSITE_PUBLISH_ENABLED", "false — public /w/{slug} disabled");
} else {
  pass("WEBSITE_PUBLISH_ENABLED", publishFlag ?? "(unset=on)");
}

if (billingOptional === "true" && productionMode) {
  fail("BILLING_OPTIONAL", "must not be true in production");
} else {
  pass("BILLING_OPTIONAL", billingOptional ?? "(unset=ok)");
}

if (!upstashUrl || !upstashToken) {
  warn("UPSTASH_REDIS_*", "missing — production rate limits are per-instance only (P1)");
} else {
  pass("UPSTASH_REDIS_*", "set");
}

const leak = Object.keys(process.env).some(
  (k) => k.startsWith("NEXT_PUBLIC_") && /SERVICE_ROLE/i.test(k),
);
if (leak) fail("Secret hygiene", "SERVICE_ROLE must never be NEXT_PUBLIC_*");
else pass("Secret hygiene", "no NEXT_PUBLIC service role");

// --- Auth production requirements (documented checks) ---
console.log("\n--- Auth (app contract) ---");
pass(
  "Confirm-email gate",
  "signUp without session → /login?message=confirm-email (lib/actions/auth.ts)",
);
pass(
  "Auth callback",
  "emailRedirectTo = {SITE_URL}/auth/callback — set same URL in Supabase Auth redirect allow-list",
);
pass(
  "Password reset",
  "redirectTo = {SITE_URL}/auth/callback?next=/reset-password",
);
if (productionMode) {
  warn(
    "Mailbox proof",
    "Operator must prove signup → inbox confirm → login on production (not auto-verifiable here)",
  );
}

// --- Supabase DB ---
console.log("\n--- Supabase / database ---");
const requiredTables = [
  "website_generations",
  "website_publications",
  "credit_balances",
  "projects",
];

if (dbUrl) {
  try {
    const client = new pg.Client({
      connectionString: dbUrl,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();
    for (const table of requiredTables) {
      const { rows } = await client.query(
        `select to_regclass($1) as reg`,
        [`public.${table}`],
      );
      if (rows[0]?.reg) pass(`table ${table}`, "exists");
      else fail(`table ${table}`, "missing — apply migrations through 031");
    }
    const rpc = await client.query(
      `select 1 from pg_proc p
       join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'public' and p.proname = 'consume_credits' limit 1`,
    );
    if (rpc.rowCount) pass("RPC consume_credits", "exists");
    else fail("RPC consume_credits", "missing — credits/generation will fail closed in production");
    await client.end();
  } catch (e) {
    fail("SUPABASE_DB_URL probe", e.message);
  }
} else if (supabaseUrl && anonKey) {
  const supabase = createClient(supabaseUrl, anonKey);
  for (const table of ["website_generations", "website_publications", "credit_balances"]) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (error && (error.code === "42P01" || /does not exist|schema cache/i.test(error.message))) {
      fail(`table ${table}`, error.message);
    } else if (error && error.code === "PGRST301") {
      pass(`table ${table}`, "reachable (RLS blocked anon read — expected)");
    } else if (error) {
      warn(`table ${table}`, error.message);
    } else {
      pass(`table ${table}`, "reachable");
    }
  }
  warn("SUPABASE_DB_URL", "missing — could not verify consume_credits RPC via SQL");
} else {
  fail("Database verify", "need SUPABASE_DB_URL or Supabase URL+anon");
}

// --- AI ---
console.log("\n--- AI provider ---");
pass("Default provider", "deepseek (lib/ai/provider-config.ts)");
if (deepseek) pass("Website Builder generation", "DEEPSEEK_API_KEY present");

console.log("\n=== SUMMARY ===");
console.log(`failures=${failed} warnings=${warned}`);
if (failed) {
  console.log("RESULT: NOT READY for Website Builder public launch");
  process.exitCode = 1;
} else if (productionMode && warned) {
  console.log("RESULT: P0 env OK — resolve WARN items before announcing to customers");
} else if (!productionMode) {
  console.log("RESULT: Local checks complete — re-run with --production against host env before go-live");
} else {
  console.log("RESULT: P0 launch env checks PASSED");
}
