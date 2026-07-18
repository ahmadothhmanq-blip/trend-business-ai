/**
 * Verify production launch readiness (Phase 10).
 * Usage:
 *   node scripts/verify-production-launch.mjs
 *   node scripts/verify-production-launch.mjs --production
 */
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

// Load .env.local if present (optional; Vercel injects env in CI).
try {
  const { readFileSync } = await import("node:fs");
  const envPath = path.join(root, ".env.local");
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
} catch {
  // no .env.local
}

const forceProduction = process.argv.includes("--production");

// Dynamic import of compiled TS is unavailable; re-implement thin mirror of readiness rules.
function check(id, level, message) {
  return { id, level, message };
}

function evaluate() {
  const production =
    forceProduction ||
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production";
  const has = (k) => Boolean(process.env[k]?.trim());
  const checks = [];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() ?? "";
  if (!siteUrl) {
    checks.push(check("site_url", production ? "fail" : "warn", "NEXT_PUBLIC_SITE_URL missing"));
  } else if (production && !siteUrl.startsWith("https://")) {
    checks.push(check("site_url_https", "fail", "SITE_URL must be https in production"));
  } else {
    checks.push(check("site_url", "ok", "SITE_URL ok"));
  }

  if (!has("NEXT_PUBLIC_SUPABASE_URL") || !has("NEXT_PUBLIC_SUPABASE_ANON_KEY")) {
    checks.push(check("supabase_public", "fail", "Supabase public env missing"));
  } else {
    checks.push(check("supabase_public", "ok", "Supabase public ok"));
  }

  if (!has("SUPABASE_SERVICE_ROLE_KEY")) {
    checks.push(
      check("service_role", production ? "fail" : "warn", "SERVICE_ROLE missing"),
    );
  } else {
    checks.push(check("service_role", "ok", "SERVICE_ROLE ok"));
  }

  if (!has("DEEPSEEK_API_KEY") && !has("OPENAI_API_KEY")) {
    checks.push(check("ai_provider", production ? "fail" : "warn", "AI key missing"));
  } else {
    checks.push(check("ai_provider", "ok", "AI key ok"));
  }

  if (production && process.env.BILLING_OPTIONAL === "true") {
    checks.push(check("billing_optional", "fail", "BILLING_OPTIONAL must be false in prod"));
  }

  if (process.env.ALLOW_INSECURE_PAYPAL_WEBHOOKS === "true" && production) {
    checks.push(check("paypal_insecure", "fail", "Insecure PayPal webhooks in prod"));
  }

  const paypalOk =
    has("PAYPAL_CLIENT_ID") && has("PAYPAL_CLIENT_SECRET");
  checks.push(
    check(
      "billing",
      paypalOk ? "ok" : production ? "warn" : "ok",
      paypalOk ? "PayPal configured" : "PayPal unset (free plan only)",
    ),
  );

  if (
    !has("UPSTASH_REDIS_REST_URL") ||
    !has("UPSTASH_REDIS_REST_TOKEN")
  ) {
    checks.push(
      check(
        "upstash",
        production ? "warn" : "ok",
        "Upstash unset (memory rate limits)",
      ),
    );
  } else {
    checks.push(check("upstash", "ok", "Upstash ok"));
  }

  return { production, checks };
}

const docs = [
  "docs/PRODUCTION_LAUNCH.md",
  "docs/LAUNCH_CHECKLIST.md",
  "docs/BILLING_ARCHITECTURE.md",
  "docs/SECURITY_PRODUCTION.md",
  "DEPLOYMENT.md",
];

for (const rel of docs) {
  await access(path.join(root, rel));
}

const { production, checks } = evaluate();
const fail = checks.filter((c) => c.level === "fail");
const warn = checks.filter((c) => c.level === "warn");

console.log("verify-production-launch", {
  mode: production ? "production" : "development",
  fail: fail.length,
  warn: warn.length,
  ok: checks.filter((c) => c.level === "ok").length,
});

for (const c of checks) {
  const tag = c.level.toUpperCase().padEnd(4);
  console.log(`  [${tag}] ${c.id}: ${c.message}`);
}

assert.equal(fail.length, 0, `Launch not ready: ${fail.map((f) => f.id).join(", ")}`);
console.log("verify-production-launch: OK");
