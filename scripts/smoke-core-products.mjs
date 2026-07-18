/**
 * Smoke: Phase 10 — seven Core product surfaces exist (routes + adapters + tools).
 * Usage: node scripts/smoke-core-products.mjs
 * Optional HTTP: CORE_SMOKE_BASE_URL=https://… (expects 401 on protected generate without cookie)
 */
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const products = [
  {
    id: "website-builder",
    files: [
      "lib/ai-core/adapters/website-builder.ts",
      "app/api/website-builder/route.ts",
      "app/(dashboard)/dashboard/website-builder/page.tsx",
      "app/products/website-builder/page.tsx",
    ],
    apiPath: "/api/website-builder",
  },
  {
    id: "app-builder",
    files: [
      "lib/ai-core/adapters/webapp-builder.ts",
      "app/api/webapp-builder/route.ts",
      "app/(dashboard)/dashboard/app-builder/page.tsx",
      "app/products/app-builder/page.tsx",
    ],
    apiPath: "/api/webapp-builder",
  },
  {
    id: "landing-page-builder",
    files: [
      "lib/ai-core/adapters/landing-page-builder.ts",
      "app/api/landing-page-builder/route.ts",
      "app/(dashboard)/dashboard/landing-page-builder/page.tsx",
      "app/products/landing-page-builder/page.tsx",
    ],
    apiPath: "/api/landing-page-builder",
  },
  {
    id: "video-studio",
    files: [
      "lib/ai-core/adapters/video-studio.ts",
      "app/api/video-studio/route.ts",
      "app/(dashboard)/dashboard/video-studio/page.tsx",
      "app/products/video-studio/page.tsx",
    ],
    apiPath: "/api/video-studio",
  },
  {
    id: "brand-designer",
    files: [
      "lib/ai-core/adapters/brand-designer.ts",
      "app/api/brand-identity/route.ts",
      "app/(dashboard)/dashboard/brand-studio/page.tsx",
      "app/products/brand-studio/page.tsx",
    ],
    apiPath: "/api/brand-identity",
  },
  {
    id: "content-studio",
    files: [
      "lib/ai-core/adapters/content-studio.ts",
      "app/api/content-studio/route.ts",
      "app/(dashboard)/dashboard/content-studio/page.tsx",
      "app/products/content-studio/page.tsx",
    ],
    apiPath: "/api/content-studio",
  },
  {
    id: "marketing-ai",
    files: [
      "lib/ai-core/adapters/marketing-ai.ts",
      "app/api/workspaces/[type]/route.ts",
      "app/(dashboard)/dashboard/marketing/page.tsx",
      "app/products/marketing-ai/page.tsx",
    ],
    apiPath: "/api/workspaces/marketing",
  },
];

const shared = [
  "lib/ai-core/layers/runner.ts",
  "lib/api/helpers.ts",
  "lib/api/rate-limit.ts",
  "lib/billing/manager.ts",
  "lib/auth/ownership.ts",
  "lib/production/readiness.ts",
  "docs/PRODUCTION_LAUNCH.md",
  "docs/LAUNCH_CHECKLIST.md",
  "docs/BILLING_ARCHITECTURE.md",
  "docs/SECURITY_PRODUCTION.md",
];

let fileCount = 0;
for (const rel of shared) {
  await access(path.join(root, rel));
  fileCount += 1;
}

for (const product of products) {
  for (const rel of product.files) {
    await access(path.join(root, rel));
    fileCount += 1;
  }
}

assert.equal(products.length, 7, "expected 7 Core products");
assert.ok(fileCount >= 35, `expected many files, got ${fileCount}`);

const base = process.env.CORE_SMOKE_BASE_URL?.replace(/\/+$/, "");
const httpResults = [];
if (base) {
  for (const product of products) {
    const url = `${base}${product.apiPath}`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "smoke" }),
      });
      // Unauthenticated must not succeed.
      assert.ok(
        res.status === 401 || res.status === 403 || res.status === 400,
        `${product.id} expected 401/403/400 without auth, got ${res.status}`,
      );
      httpResults.push({ id: product.id, status: res.status });
    } catch (error) {
      throw new Error(
        `HTTP smoke failed for ${product.id}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}

console.log("smoke-core-products: OK", {
  products: products.length,
  files: fileCount,
  http: httpResults.length ? httpResults : "skipped (set CORE_SMOKE_BASE_URL)",
});
