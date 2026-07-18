/**
 * Phase 12 — staging user-journey smoke (automated gate + manual checklist).
 *
 * Automated (requires STAGING_BASE_URL):
 *   public pages, health, auth surfaces, unauthenticated Core APIs, credits gate
 *
 * Manual (printed): full AI pipeline + export/publish per product
 *
 * Usage:
 *   STAGING_BASE_URL=https://… npm run smoke:staging
 *   npm run smoke:staging   # prints manual checklist only when URL unset
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
loadEnvFile(".env.staging");
loadEnvFile(".env.local");

const products = [
  {
    id: "website-builder",
    dash: "/dashboard/website-builder",
    marketing: "/products/website-builder",
    api: "/api/website-builder",
    layers: "full (incl. SEO + Performance)",
    export: "ZIP + publish /w/[slug]",
  },
  {
    id: "app-builder",
    dash: "/dashboard/app-builder",
    marketing: "/products/app-builder",
    api: "/api/webapp-builder",
    layers: "full (incl. SEO + Performance)",
    export: "ZIP",
  },
  {
    id: "landing-page-builder",
    dash: "/dashboard/landing-page-builder",
    marketing: "/products/landing-page-builder",
    api: "/api/landing-page-builder",
    layers: "full (incl. SEO + Performance)",
    export: "ZIP",
  },
  {
    id: "video-studio",
    dash: "/dashboard/video-studio",
    marketing: "/products/video-studio",
    api: "/api/video-studio",
    layers: "Idea→Quality (no SEO/Perf)",
    export: "ZIP package (not MP4)",
  },
  {
    id: "brand-designer",
    dash: "/dashboard/brand-studio",
    marketing: "/products/brand-studio",
    api: "/api/brand-identity",
    layers: "Idea→Quality (no SEO/Perf)",
    export: "Brand-kit ZIP",
  },
  {
    id: "content-studio",
    dash: "/dashboard/content-studio",
    marketing: "/products/content-studio",
    api: "/api/content-studio",
    layers: "Idea→Quality (no SEO/Perf)",
    export: "Content ZIP",
  },
  {
    id: "marketing-ai",
    dash: "/dashboard/marketing",
    marketing: "/products/marketing-ai",
    api: "/api/workspaces/marketing",
    layers: "Idea→Quality (no SEO/Perf)",
    export: "MD/JSON/PDF/DOCX",
  },
];

const publicPaths = [
  "/",
  "/signup",
  "/login",
  "/pricing",
  "/api/health",
  ...products.map((p) => p.marketing),
];

function printManualChecklist() {
  console.log("\n=== MANUAL JOURNEY (sign off in STAGING_TEST_REPORT.md) ===\n");
  console.log("New User → Signup → Login → Dashboard");
  console.log("For EACH Core product:");
  console.log("  Select service → Enter business idea → watch pipeline:");
  console.log(
    "  Idea → Strategy → Design → Assets → Generation → Quality → SEO → Performance → Ready",
  );
  console.log("  View result → Save/history → Export/Publish\n");
  for (const p of products) {
    console.log(`- [ ] ${p.id}`);
    console.log(`      dashboard: ${p.dash}`);
    console.log(`      layers: ${p.layers}`);
    console.log(`      export: ${p.export}`);
  }
  console.log("\nProduction checks:");
  console.log("- [ ] Error toasts on bad requests / zero credits (402)");
  console.log("- [ ] Rate limit returns 429 under burst");
  console.log("- [ ] Credits decrement after successful generate");
  console.log("- [ ] PayPal sandbox checkout (if monetizing)");
  console.log("- [ ] Structured logs visible in host (Vercel/runtime)");
}

const base = process.env.STAGING_BASE_URL?.replace(/\/+$/, "");

if (!base) {
  console.log("smoke-staging-journey: STAGING_BASE_URL unset — automated HTTP skipped");
  printManualChecklist();
  console.log("\nsmoke-staging-journey: OK (manual checklist printed)");
  process.exit(0);
}

console.log("smoke-staging-journey", { base });

const results = [];

for (const p of publicPaths) {
  const url = `${base}${p}`;
  const res = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  const ok =
    res.status === 200 ||
    res.status === 307 ||
    res.status === 308 ||
    res.status === 302 ||
    res.status === 301;
  assert.ok(ok, `${p} expected 2xx/3xx, got ${res.status}`);
  results.push({ path: p, status: res.status });
}

// Dashboard should redirect unauthenticated users to login (or show login gate).
{
  const res = await fetch(`${base}/dashboard`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  assert.ok(
    [200, 301, 302, 307, 308].includes(res.status),
    `/dashboard unexpected ${res.status}`,
  );
  results.push({ path: "/dashboard", status: res.status });
}

for (const product of products) {
  const res = await fetch(`${base}${product.api}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: "staging journey smoke" }),
    signal: AbortSignal.timeout(15000),
  });
  assert.ok(
    res.status === 401 || res.status === 403 || res.status === 400,
    `${product.id} API expected auth gate, got ${res.status}`,
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

console.log("automated:", results);
printManualChecklist();
console.log("\nsmoke-staging-journey: OK", { checks: results.length });
