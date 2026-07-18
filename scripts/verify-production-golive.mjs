/**
 * Phase 13 — production go-live verification.
 *
 * Usage:
 *   npm run verify:golive
 *   npm run verify:golive -- --production
 *   npm run verify:golive -- --production --paid
 *   PRODUCTION_BASE_URL=https://your-domain npm run verify:golive -- --production
 */
import assert from "node:assert/strict";
import { access, existsSync, readdirSync, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const accessAsync = promisify(access);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const forceProduction = process.argv.includes("--production");
const requirePaid = process.argv.includes("--paid");

function loadEnvFile(rel) {
  const envPath = path.join(root, rel);
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split("\n")) {
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
loadEnvFile(".env.production.local");
loadEnvFile(".env.local");

const REQUIRED_BUCKETS = [
  "avatars",
  "generation-uploads",
  "website-assets",
  "ai-assets",
];

const CRITICAL_MIGRATIONS = [
  "001_profiles.sql",
  "007_storage_avatars.sql",
  "008_website_generations.sql",
  "010_workspace_generations.sql",
  "011_ai_engine_phase5.sql",
  "013_webapp_generations.sql",
  "014_landing_page_generations.sql",
  "016_brand_identity_generations.sql",
  "018_video_generations.sql",
  "019_content_studio.sql",
  "025_billing_system.sql",
  "028_production_qa_fixes.sql",
  "031_website_publications.sql",
  "032_website_design_engine_artifacts.sql",
  "033_ai_runs.sql",
];

const CORE_APIS = [
  "/api/website-builder",
  "/api/webapp-builder",
  "/api/landing-page-builder",
  "/api/video-studio",
  "/api/brand-identity",
  "/api/content-studio",
  "/api/workspaces/marketing",
];

const PUBLIC_ROUTES = [
  "/",
  "/signup",
  "/login",
  "/pricing",
  "/api/health",
  "/products/website-builder",
  "/robots.txt",
  "/sitemap.xml",
];

const docs = [
  "docs/PRODUCTION_LAUNCH_REPORT.md",
  "docs/FINAL_GO_LIVE_CHECKLIST.md",
  "docs/PRODUCTION_LAUNCH.md",
  "docs/BILLING_ARCHITECTURE.md",
  "docs/LAUNCH_BLOCKERS.md",
  "lib/production/golive.ts",
  "DEPLOYMENT.md",
];

function check(id, level, message) {
  return { id, level, message };
}
function has(k) {
  return Boolean(process.env[k]?.trim());
}

const production =
  forceProduction ||
  process.env.VERCEL_ENV === "production" ||
  process.env.NODE_ENV === "production";

function evaluateEnv() {
  const checks = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  if (!siteUrl) {
    checks.push(check("site_url", production ? "fail" : "warn", "SITE_URL missing"));
  } else if (production && !siteUrl.startsWith("https://")) {
    checks.push(check("site_url_https", "fail", "SITE_URL must be https in production"));
  } else if (
    production &&
    (siteUrl.includes("localhost") || siteUrl.includes("127.0.0.1"))
  ) {
    checks.push(
      check("site_url_host", "fail", "SITE_URL must be public domain in production"),
    );
  } else {
    checks.push(check("site_url", "ok", `SITE_URL=${siteUrl}`));
  }

  if (!has("NEXT_PUBLIC_SUPABASE_URL") || !has("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    checks.push(check("supabase_public", "fail", "Supabase public env missing"));
  } else {
    checks.push(check("supabase_public", "ok", "Supabase public ok"));
  }

  if (!has("SUPABASE_SERVICE_ROLE_KEY")) {
    checks.push(
      check(
        "service_role",
        production ? "fail" : "warn",
        "SERVICE_ROLE required for billing/credits/webhooks",
      ),
    );
  } else {
    checks.push(check("service_role", "ok", "SERVICE_ROLE ok"));
  }

  if (!has("DEEPSEEK_API_KEY") && !has("OPENAI_API_KEY")) {
    checks.push(
      check("ai_provider", production ? "fail" : "warn", "AI provider key missing"),
    );
  } else {
    checks.push(
      check(
        "ai_provider",
        "ok",
        `AI key present (${has("DEEPSEEK_API_KEY") ? "deepseek" : "openai"})`,
      ),
    );
  }

  if (process.env.BILLING_OPTIONAL === "true" && production) {
    checks.push(check("billing_optional", "fail", "BILLING_OPTIONAL must be false"));
  } else {
    checks.push(check("billing_optional", "ok", "Billing fail-closed ok"));
  }

  if (process.env.WEBSITE_PREVIEW_BUILDER_ENABLED === "true") {
    checks.push(
      check("preview_builder", "fail", "Preview builder must be false in production"),
    );
  } else {
    checks.push(check("preview_builder", "ok", "Preview builder disabled"));
  }

  if (process.env.ALLOW_INSECURE_PAYPAL_WEBHOOKS === "true" && production) {
    checks.push(check("paypal_insecure", "fail", "Insecure PayPal webhooks in prod"));
  }

  const paypalOk = has("PAYPAL_CLIENT_ID") && has("PAYPAL_CLIENT_SECRET");
  const paypalMode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  if (paypalOk) {
    if (production && requirePaid && paypalMode !== "live") {
      checks.push(
        check("billing", "fail", "PAYPAL_MODE must be live for --paid go-live"),
      );
    } else if (production && paypalMode !== "live") {
      checks.push(
        check(
          "billing",
          "warn",
          `PayPal configured (mode=${paypalMode}) — switch to live for real payments`,
        ),
      );
    } else {
      checks.push(check("billing", "ok", `PayPal ok (mode=${paypalMode})`));
    }
    if (!has("PAYPAL_WEBHOOK_ID")) {
      checks.push(
        check(
          "paypal_webhook",
          requirePaid && production ? "fail" : "warn",
          "PAYPAL_WEBHOOK_ID missing",
        ),
      );
    } else {
      checks.push(check("paypal_webhook", "ok", "PayPal webhook id set"));
    }
  } else {
    checks.push(
      check(
        "billing",
        requirePaid && production ? "fail" : production ? "warn" : "ok",
        "PayPal unset — Free plan only until configured",
      ),
    );
  }

  if (!has("UPSTASH_REDIS_REST_URL") || !has("UPSTASH_REDIS_REST_TOKEN")) {
    checks.push(
      check("upstash", production ? "warn" : "ok", "Upstash unset (memory limits)"),
    );
  } else {
    checks.push(check("upstash", "ok", "Upstash ok"));
  }

  if (!has("SENTRY_DSN") && !has("NEXT_PUBLIC_SENTRY_DSN")) {
    checks.push(
      check("monitoring", "warn", "No Sentry DSN — host logs + structured logger"),
    );
  } else {
    checks.push(check("monitoring", "ok", "Error monitoring DSN present"));
  }

  return checks;
}

function checkMigrationFiles() {
  const checks = [];
  const dir = path.join(root, "supabase", "migrations");
  let files = [];
  try {
    files = readdirSync(dir);
  } catch (error) {
    return [
      check(
        "migrations_dir",
        "fail",
        `Cannot read migrations: ${error instanceof Error ? error.message : error}`,
      ),
    ];
  }

  const set = new Set(files);
  let missing = 0;
  for (const name of CRITICAL_MIGRATIONS) {
    if (!set.has(name)) {
      missing += 1;
      checks.push(check(`migration_${name}`, "fail", `Missing migration file ${name}`));
    }
  }
  if (missing === 0) {
    checks.push(
      check(
        "migrations_repo",
        "ok",
        `${CRITICAL_MIGRATIONS.length} critical migration files present (apply on prod DB)`,
      ),
    );
  }
  return checks;
}

async function checkDatabaseAndStorage() {
  const checks = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url || !anon) {
    return [check("database", "fail", "Cannot probe DB without public Supabase env")];
  }

  const supabase = createClient(url, anon);
  const tables = [
    "profiles",
    "website_generations",
    "webapp_generations",
    "landing_page_generations",
    "video_generations",
    "brand_identity_generations",
    "content_generations",
    "workspace_generations",
    "subscription_plans",
    "ai_runs",
  ];

  let missingTables = 0;
  for (const table of tables) {
    const { error } = await supabase.from(table).select("id").limit(1);
    if (
      error &&
      (error.code === "42P01" ||
        /does not exist|schema cache|Could not find the table/i.test(error.message))
    ) {
      missingTables += 1;
      checks.push(
        check(
          `table_${table}`,
          production ? "fail" : "warn",
          `${table} missing — apply migrations`,
        ),
      );
    }
  }
  if (missingTables === 0) {
    checks.push(check("database_tables", "ok", `${tables.length} Core/billing tables reachable`));
  } else {
    checks.push(
      check(
        "database",
        production ? "fail" : "warn",
        `${missingTables}/${tables.length} tables missing on connected project`,
      ),
    );
  }

  if (!service) {
    checks.push(
      check(
        "storage",
        production ? "fail" : "warn",
        "Cannot verify buckets without SERVICE_ROLE",
      ),
    );
    return checks;
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) {
    checks.push(check("storage", "fail", `listBuckets: ${error.message}`));
    return checks;
  }
  const ids = new Set((buckets ?? []).map((b) => b.id || b.name));
  let missingBuckets = 0;
  for (const id of REQUIRED_BUCKETS) {
    if (!ids.has(id)) {
      missingBuckets += 1;
      checks.push(check(`bucket_${id}`, "fail", `bucket ${id} missing`));
    }
  }
  if (missingBuckets === 0) {
    checks.push(check("storage", "ok", `${REQUIRED_BUCKETS.length} storage buckets present`));
  }
  return checks;
}

async function checkAiLive() {
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  if (!key) {
    return [
      check(
        "ai_live",
        "warn",
        "Skip DeepSeek live probe (no DEEPSEEK_API_KEY)",
      ),
    ];
  }
  try {
    const res = await fetch("https://api.deepseek.com/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) return [check("ai_live", "ok", "DeepSeek API accepts key")];
    if (res.status === 401 || res.status === 403) {
      return [check("ai_live", "fail", `DeepSeek key rejected (${res.status})`)];
    }
    return [
      check(
        "ai_live",
        production ? "fail" : "warn",
        `DeepSeek status ${res.status}`,
      ),
    ];
  } catch (error) {
    return [
      check(
        "ai_live",
        production ? "fail" : "warn",
        `DeepSeek unreachable: ${error instanceof Error ? error.message : error}`,
      ),
    ];
  }
}

async function checkProductionHttp() {
  const checks = [];
  const base = (
    process.env.PRODUCTION_BASE_URL ||
    process.env.STAGING_BASE_URL ||
    ""
  ).replace(/\/+$/, "");

  if (!base) {
    checks.push(
      check(
        "http_production",
        production ? "warn" : "ok",
        "PRODUCTION_BASE_URL unset — skip routing/SSL probe",
      ),
    );
    return checks;
  }

  if (production && !base.startsWith("https://")) {
    checks.push(check("ssl", "fail", "PRODUCTION_BASE_URL must use https://"));
  } else if (base.startsWith("https://")) {
    checks.push(check("ssl", "ok", "HTTPS base URL"));
  }

  for (const route of PUBLIC_ROUTES) {
    try {
      const res = await fetch(`${base}${route}`, {
        redirect: "manual",
        signal: AbortSignal.timeout(15000),
      });
      const ok = [200, 301, 302, 307, 308].includes(res.status);
      checks.push(
        check(
          `route_${route}`,
          ok ? "ok" : "fail",
          ok ? `${route} → ${res.status}` : `${route} unexpected ${res.status}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          `route_${route}`,
          "fail",
          `${route}: ${error instanceof Error ? error.message : error}`,
        ),
      );
    }
  }

  for (const api of CORE_APIS) {
    try {
      const res = await fetch(`${base}${api}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "golive-verify" }),
        signal: AbortSignal.timeout(15000),
      });
      const ok = res.status === 401 || res.status === 403 || res.status === 400;
      checks.push(
        check(
          `api_gate_${api}`,
          ok ? "ok" : "fail",
          ok ? `${api} gated (${res.status})` : `${api} got ${res.status}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          `api_gate_${api}`,
          "fail",
          `${api}: ${error instanceof Error ? error.message : error}`,
        ),
      );
    }
  }

  return checks;
}

const all = [];
console.log("verify-production-golive", { production, requirePaid });

for (const rel of docs) {
  await accessAsync(path.join(root, rel));
}
all.push(check("docs", "ok", "Phase 13 go-live docs present"));
all.push(...evaluateEnv());
all.push(...checkMigrationFiles());
all.push(...(await checkDatabaseAndStorage()));
all.push(...(await checkAiLive()));
all.push(...(await checkProductionHttp()));

const fail = all.filter((c) => c.level === "fail");
const warn = all.filter((c) => c.level === "warn");
const ok = all.filter((c) => c.level === "ok");

console.log({ fail: fail.length, warn: warn.length, ok: ok.length });
for (const c of all) {
  console.log(`  [${c.level.toUpperCase().padEnd(4)}] ${c.id}: ${c.message}`);
}

assert.equal(fail.length, 0, `Go-live not ready: ${fail.map((f) => f.id).join(", ")}`);
console.log("verify-production-golive: OK");
