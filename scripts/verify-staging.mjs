/**
 * Phase 12 — staging environment verification.
 *
 * Checks: env vars, Supabase DB reachability, storage buckets, AI provider config,
 * optional live HTTP against STAGING_BASE_URL.
 *
 * Usage:
 *   npm run verify:staging
 *   npm run verify:staging -- --strict
 *   STAGING_BASE_URL=https://….vercel.app npm run verify:staging -- --strict
 *
 * Env files loaded (first wins per key): process.env, then .env.staging, then .env.local
 */
import assert from "node:assert/strict";
import { access, existsSync, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const accessAsync = promisify(access);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const strict = process.argv.includes("--strict");

function loadEnvFile(rel) {
  const envPath = path.join(root, rel);
  if (!existsSync(envPath)) return false;
  const text = readFileSync(envPath, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
  return true;
}

loadEnvFile(".env.staging");
loadEnvFile(".env.local");

const REQUIRED_BUCKETS = [
  "avatars",
  "generation-uploads",
  "website-assets",
  "ai-assets",
];

const CORE_APIS = [
  { id: "website-builder", path: "/api/website-builder" },
  { id: "app-builder", path: "/api/webapp-builder" },
  { id: "landing-page-builder", path: "/api/landing-page-builder" },
  { id: "video-studio", path: "/api/video-studio" },
  { id: "brand-designer", path: "/api/brand-identity" },
  { id: "content-studio", path: "/api/content-studio" },
  { id: "marketing-ai", path: "/api/workspaces/marketing" },
];

const docs = [
  "docs/STAGING_SETUP.md",
  "docs/STAGING_TEST_REPORT.md",
  "docs/LAUNCH_BLOCKERS.md",
  "docs/PRODUCTION_LAUNCH.md",
  "docs/FINAL_LAUNCH_CHECKLIST.md",
  "lib/production/staging.ts",
  "lib/production/readiness.ts",
];

function check(id, level, message) {
  return { id, level, message };
}

function has(k) {
  return Boolean(process.env[k]?.trim());
}

function evaluateEnv() {
  const checks = [];
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";

  if (!siteUrl) {
    checks.push(
      check("site_url", strict ? "fail" : "warn", "NEXT_PUBLIC_SITE_URL missing"),
    );
  } else if (!/^https?:\/\//i.test(siteUrl)) {
    checks.push(check("site_url", "fail", "SITE_URL must include http(s)://"));
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
        strict ? "fail" : "warn",
        "SERVICE_ROLE missing (billing/credits/webhooks/buckets list)",
      ),
    );
  } else {
    checks.push(check("service_role", "ok", "SERVICE_ROLE ok"));
  }

  if (!has("DEEPSEEK_API_KEY") && !has("OPENAI_API_KEY")) {
    checks.push(
      check("ai_provider", strict ? "fail" : "warn", "AI provider key missing"),
    );
  } else {
    const provider = has("DEEPSEEK_API_KEY") ? "deepseek" : "openai";
    checks.push(check("ai_provider", "ok", `AI provider key present (${provider})`));
  }

  if (process.env.WEBSITE_PREVIEW_BUILDER_ENABLED === "true") {
    checks.push(
      check("preview_builder", "fail", "Preview builder must be false on staging"),
    );
  } else {
    checks.push(check("preview_builder", "ok", "Preview builder disabled"));
  }

  const paypalMode = (process.env.PAYPAL_MODE || "sandbox").toLowerCase();
  if (has("PAYPAL_CLIENT_ID") && has("PAYPAL_CLIENT_SECRET")) {
    checks.push(
      check(
        "billing",
        paypalMode === "live" ? "warn" : "ok",
        `PayPal configured (mode=${paypalMode})`,
      ),
    );
  } else {
    checks.push(
      check(
        "billing",
        "warn",
        "PayPal unset — free credits only; set sandbox for billing QA",
      ),
    );
  }

  if (!has("UPSTASH_REDIS_REST_URL") || !has("UPSTASH_REDIS_REST_TOKEN")) {
    checks.push(
      check("upstash", "warn", "Upstash unset (per-instance rate limits)"),
    );
  } else {
    checks.push(check("upstash", "ok", "Upstash ok"));
  }

  return checks;
}

async function checkDatabase() {
  const checks = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    return [check("database", "fail", "Cannot probe DB without public Supabase env")];
  }

  // Probe via PostgREST through the JS client. Root `/rest/v1/` often returns 401
  // even when the project is healthy — table probes are authoritative.
  const supabase = createClient(url, anon);
  const { error } = await supabase.from("profiles").select("id").limit(1);
  if (
    error &&
    (error.code === "42P01" ||
      /does not exist|schema cache|Could not find the table/i.test(error.message))
  ) {
    checks.push(check("database", "fail", "profiles missing — apply migrations"));
    checks.push(
      check("profiles_table", "fail", "profiles missing — apply migrations"),
    );
  } else if (
    error &&
    /Failed to fetch|fetch failed|ENOTFOUND|ECONNREFUSED|network/i.test(
      error.message,
    )
  ) {
    checks.push(check("database", "fail", `Supabase unreachable: ${error.message}`));
    checks.push(check("profiles_table", "fail", error.message));
  } else {
    checks.push(check("database", "ok", "Supabase PostgREST reachable"));
    checks.push(
      check(
        "profiles_table",
        "ok",
        error ? `profiles reachable (${error.code || "rls"})` : "profiles reachable",
      ),
    );
  }

  const { error: runsError } = await supabase.from("ai_runs").select("id").limit(1);
  if (
    runsError &&
    (runsError.code === "42P01" ||
      /does not exist|schema cache|Could not find the table/i.test(runsError.message))
  ) {
    checks.push(
      check("ai_runs_table", strict ? "fail" : "warn", "ai_runs missing — apply 033"),
    );
  } else {
    checks.push(check("ai_runs_table", "ok", "ai_runs table reachable"));
  }

  return checks;
}

async function checkStorageBuckets() {
  const checks = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    return [check("storage", "fail", "Supabase URL missing")];
  }

  // Service role can list all buckets; anon often cannot.
  if (!service) {
    checks.push(
      check(
        "storage",
        strict ? "fail" : "warn",
        "Skip full bucket list without SERVICE_ROLE (set for staging)",
      ),
    );
    return checks;
  }

  const admin = createClient(url, service, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: buckets, error } = await admin.storage.listBuckets();
  if (error) {
    return [check("storage", "fail", `listBuckets failed: ${error.message}`)];
  }

  const ids = new Set((buckets ?? []).map((b) => b.id || b.name));
  for (const id of REQUIRED_BUCKETS) {
    if (ids.has(id)) {
      checks.push(check(`bucket_${id}`, "ok", `bucket ${id}`));
    } else {
      checks.push(
        check(
          `bucket_${id}`,
          "fail",
          `bucket ${id} missing — migrations 007/011/032/033`,
        ),
      );
    }
  }

  // Anon client sanity (does not need full list).
  if (anon) {
    const userClient = createClient(url, anon);
    const { error: anonErr } = await userClient.storage.from("avatars").list("", {
      limit: 1,
    });
    if (anonErr && /not found|Bucket not found/i.test(anonErr.message)) {
      checks.push(check("avatars_anon", "fail", "avatars not accessible"));
    } else {
      checks.push(check("avatars_anon", "ok", "avatars bucket addressable"));
    }
  }

  return checks;
}

async function checkAiProviderLive() {
  const checks = [];
  const key = process.env.DEEPSEEK_API_KEY?.trim();
  if (!key) {
    checks.push(
      check(
        "ai_live",
        "warn",
        "Skip DeepSeek live probe (no DEEPSEEK_API_KEY) — env presence checked separately",
      ),
    );
    return checks;
  }

  try {
    const res = await fetch("https://api.deepseek.com/models", {
      headers: { Authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10000),
    });
    if (res.ok) {
      checks.push(check("ai_live", "ok", "DeepSeek API accepts key"));
    } else if (res.status === 401 || res.status === 403) {
      checks.push(check("ai_live", "fail", `DeepSeek key rejected (${res.status})`));
    } else {
      checks.push(
        check(
          "ai_live",
          strict ? "fail" : "warn",
          `DeepSeek models endpoint status ${res.status}`,
        ),
      );
    }
  } catch (error) {
    checks.push(
      check(
        "ai_live",
        strict ? "fail" : "warn",
        `DeepSeek unreachable: ${error instanceof Error ? error.message : error}`,
      ),
    );
  }

  return checks;
}

async function checkHttpStaging() {
  const checks = [];
  const base = process.env.STAGING_BASE_URL?.replace(/\/+$/, "");
  if (!base) {
    checks.push(
      check(
        "http_staging",
        "warn",
        "STAGING_BASE_URL unset — skip live HTTP (set for deploy validation)",
      ),
    );
    return checks;
  }

  try {
    const health = await fetch(`${base}/api/health`, {
      signal: AbortSignal.timeout(10000),
    });
    if (!health.ok) {
      checks.push(check("health", "fail", `/api/health → ${health.status}`));
    } else {
      checks.push(check("health", "ok", "/api/health ok"));
    }
  } catch (error) {
    checks.push(
      check(
        "health",
        "fail",
        `health failed: ${error instanceof Error ? error.message : error}`,
      ),
    );
  }

  for (const product of CORE_APIS) {
    try {
      const res = await fetch(`${base}${product.path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "staging-verify" }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 401 || res.status === 403 || res.status === 400) {
        checks.push(
          check(`api_${product.id}`, "ok", `${product.id} gated (${res.status})`),
        );
      } else if (res.status === 402 || res.status === 429) {
        // Unexpected without session, but proves route + limits exist.
        checks.push(
          check(
            `api_${product.id}`,
            "warn",
            `${product.id} returned ${res.status} without session`,
          ),
        );
      } else {
        checks.push(
          check(
            `api_${product.id}`,
            "fail",
            `${product.id} expected 401/403/400, got ${res.status}`,
          ),
        );
      }
    } catch (error) {
      checks.push(
        check(
          `api_${product.id}`,
          "fail",
          `${product.id}: ${error instanceof Error ? error.message : error}`,
        ),
      );
    }
  }

  return checks;
}

const allChecks = [];

console.log("verify-staging", { strict, cwd: root });

for (const rel of docs) {
  await accessAsync(path.join(root, rel));
}
allChecks.push(check("docs", "ok", "Phase 12 staging docs present"));

allChecks.push(...evaluateEnv());
allChecks.push(...(await checkDatabase()));
allChecks.push(...(await checkStorageBuckets()));
allChecks.push(...(await checkAiProviderLive()));
allChecks.push(...(await checkHttpStaging()));

const fail = allChecks.filter((c) => c.level === "fail");
const warn = allChecks.filter((c) => c.level === "warn");
const ok = allChecks.filter((c) => c.level === "ok");

console.log({
  fail: fail.length,
  warn: warn.length,
  ok: ok.length,
});

for (const c of allChecks) {
  console.log(`  [${c.level.toUpperCase().padEnd(4)}] ${c.id}: ${c.message}`);
}

assert.equal(
  fail.length,
  0,
  `Staging not ready: ${fail.map((f) => f.id).join(", ")}`,
);
console.log("verify-staging: OK");
