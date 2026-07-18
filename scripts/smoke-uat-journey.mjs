/**
 * Phase 13 — Final User Acceptance Test smoke + checklist.
 *
 * Automated (PRODUCTION_BASE_URL or STAGING_BASE_URL):
 *   public routes, health, auth surfaces, Core API gates, billing credits gate
 *
 * Manual checklist printed for full journey across 7 Core products.
 *
 * Usage:
 *   npm run smoke:uat
 *   PRODUCTION_BASE_URL=https://… npm run smoke:uat
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

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

const products = [
  {
    id: "website-builder",
    dash: "/dashboard/website-builder",
    page: "/products/website-builder",
    api: "/api/website-builder",
    export: "ZIP + publish",
  },
  {
    id: "app-builder",
    dash: "/dashboard/app-builder",
    page: "/products/app-builder",
    api: "/api/webapp-builder",
    export: "ZIP",
  },
  {
    id: "landing-page-builder",
    dash: "/dashboard/landing-page-builder",
    page: "/products/landing-page-builder",
    api: "/api/landing-page-builder",
    export: "ZIP",
  },
  {
    id: "video-studio",
    dash: "/dashboard/video-studio",
    page: "/products/video-studio",
    api: "/api/video-studio",
    export: "ZIP (not MP4)",
  },
  {
    id: "brand-designer",
    dash: "/dashboard/brand-studio",
    page: "/products/brand-studio",
    api: "/api/brand-identity",
    export: "Brand ZIP",
  },
  {
    id: "content-studio",
    dash: "/dashboard/content-studio",
    page: "/products/content-studio",
    api: "/api/content-studio",
    export: "Content ZIP",
  },
  {
    id: "marketing-ai",
    dash: "/dashboard/marketing",
    page: "/products/marketing-ai",
    api: "/api/workspaces/marketing",
    export: "MD/JSON/PDF/DOCX",
  },
];

function printUatChecklist() {
  console.log("\n=== FINAL UAT (sign in PRODUCTION_LAUNCH_REPORT.md / FINAL_GO_LIVE_CHECKLIST.md) ===\n");
  console.log("Journey:");
  console.log(
    "  New User → Register → Choose Service → Enter Idea → Generate → Quality → Preview → Save → Export/Publish\n",
  );
  console.log("Billing:");
  console.log("  - [ ] Free plan credits after signup");
  console.log("  - [ ] Paid plan checkout (PayPal)");
  console.log("  - [ ] Card / Visa via PayPal hosted");
  console.log("  - [ ] Credits decrement; zero credits → 402");
  console.log("  - [ ] Rate limit 429 under burst\n");
  console.log("Products:");
  for (const p of products) {
    console.log(`  - [ ] ${p.id}  (${p.dash})  export: ${p.export}`);
  }
}

const base = (
  process.env.PRODUCTION_BASE_URL ||
  process.env.STAGING_BASE_URL ||
  ""
).replace(/\/+$/, "");

if (!base) {
  console.log("smoke-uat-journey: no PRODUCTION_BASE_URL / STAGING_BASE_URL — HTTP skipped");
  printUatChecklist();
  console.log("\nsmoke-uat-journey: OK (manual UAT checklist printed)");
  process.exit(0);
}

console.log("smoke-uat-journey", { base });
const results = [];

const paths = [
  "/",
  "/signup",
  "/register",
  "/login",
  "/pricing",
  "/api/health",
  ...products.map((p) => p.page),
];

for (const p of paths) {
  const res = await fetch(`${base}${p}`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  assert.ok(
    [200, 301, 302, 307, 308].includes(res.status),
    `${p} expected redirect/ok, got ${res.status}`,
  );
  results.push({ path: p, status: res.status });
}

{
  const res = await fetch(`${base}/dashboard`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  assert.ok([200, 301, 302, 307, 308].includes(res.status));
  results.push({ path: "/dashboard", status: res.status });
}

for (const product of products) {
  const res = await fetch(`${base}${product.api}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "uat smoke" }),
    signal: AbortSignal.timeout(15000),
  });
  assert.ok(
    res.status === 401 || res.status === 403 || res.status === 400,
    `${product.id} expected auth gate, got ${res.status}`,
  );
  results.push({ path: product.api, status: res.status });
}

{
  const res = await fetch(`${base}/api/platform/billing/credits`, {
    signal: AbortSignal.timeout(10000),
  });
  assert.ok(
    res.status === 401 || res.status === 403,
    `credits expected 401/403, got ${res.status}`,
  );
  results.push({ path: "/api/platform/billing/credits", status: res.status });
}

{
  const res = await fetch(`${base}/api/platform/plans`, {
    signal: AbortSignal.timeout(10000),
  });
  // Plans may be public or gated depending on implementation
  assert.ok(
    [200, 401, 403].includes(res.status),
    `plans unexpected ${res.status}`,
  );
  results.push({ path: "/api/platform/plans", status: res.status });
}

console.log("automated:", results);
printUatChecklist();
console.log("\nsmoke-uat-journey: OK", { checks: results.length });
