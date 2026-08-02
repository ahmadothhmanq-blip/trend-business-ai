/**
 * Website Builder API smoke audit (no auth required for public catalog routes).
 * Usage: node scripts/audit-wb-apis.mjs [baseUrl]
 * Default base: QA_BASE → NEXT_PUBLIC_SITE_URL → http://localhost:{PORT|DEV_PORT|3003}
 */
import assert from "node:assert/strict";
import {
  loadEnvLocal,
  resolveProbeBaseUrl,
} from "./lib/dev-base-url.mjs";
import { ensureDevServer } from "./lib/dev-server.mjs";

loadEnvLocal();

const base = resolveProbeBaseUrl(process.argv[2]);

const publicRoutes = [
  {
    name: "template-marketplace catalog",
    path: "/api/website-builder/template-marketplace",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.ok(Array.isArray(data.listings));
      assert.ok(data.listings.length >= 1);
      assert.ok(Array.isArray(data.categories));
      assert.ok(Array.isArray(data.tags));
    },
  },
  {
    name: "template-marketplace featured",
    path: "/api/website-builder/template-marketplace?featured=1",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.ok(Array.isArray(data.listings));
    },
  },
  {
    name: "template-marketplace status",
    path: "/api/website-builder/template-marketplace?status=1",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.ok(data.status);
      assert.ok(data.status.listingCount >= 1);
    },
  },
  {
    name: "template-marketplace search",
    path: "/api/website-builder/template-marketplace?q=modern",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.ok(Array.isArray(data.listings));
    },
  },
  {
    name: "template-marketplace category filter",
    path: "/api/website-builder/template-marketplace?category=saas",
    assert: (data) => {
      assert.equal(data.ok, true);
      for (const listing of data.listings) {
        assert.equal(listing.category, "saas");
      }
    },
  },
  {
    name: "template-marketplace tag filter",
    path: "/api/website-builder/template-marketplace?tags=saas",
    assert: (data) => {
      assert.equal(data.ok, true);
      for (const listing of data.listings) {
        assert.ok(listing.tags.includes("saas"));
      }
    },
  },
  {
    name: "template-marketplace sort",
    path: "/api/website-builder/template-marketplace?sort=name&direction=asc",
    assert: (data) => {
      assert.equal(data.ok, true);
      const names = data.listings.map((l) => l.name);
      const sorted = [...names].sort((a, b) => a.localeCompare(b));
      assert.deepEqual(names, sorted);
    },
  },
  {
    name: "template-marketplace listing by id",
    path: "/api/website-builder/template-marketplace?id=modern-business",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.equal(data.listing.id, "modern-business");
      assert.equal(data.listing.availability, "installed");
    },
  },
  {
    name: "template-marketplace remote listing",
    path: "/api/website-builder/template-marketplace?id=modern-business",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.equal(data.listing.availability, "remote");
    },
  },
  {
    name: "template-engine list",
    path: "/api/website-builder/template-engine",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.ok(Array.isArray(data.templates));
      assert.ok(data.templates.some((t) => t.id === "modern-business"));
    },
  },
  {
    name: "template-engine status",
    path: "/api/website-builder/template-engine?status=1",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.ok(data.status);
    },
  },
  {
    name: "template-runtime list",
    path: "/api/website-builder/template-runtime",
    assert: (data) => {
      assert.equal(data.ok, true);
      assert.ok(Array.isArray(data.templateIds));
      assert.ok(data.templateIds.includes("modern-business"));
    },
  },
  {
    name: "template-runtime model",
    path: "/api/website-builder/template-runtime?id=modern-business",
    assert: (data) => {
      assert.ok(data.ok === true);
      assert.equal(data.templateId, "modern-business");
      assert.ok(data.model);
      assert.ok(data.model.regions);
      assert.ok(data.meta);
    },
  },
  {
    name: "template-runtime 404",
    path: "/api/website-builder/template-runtime?id=missing-package",
    assert: async (data, response) => {
      assert.equal(response.status, 404);
      assert.equal(data.ok, false);
    },
  },
  {
    name: "marketplace not found",
    path: "/api/website-builder/template-marketplace?id=missing-template",
    assert: async (data, response) => {
      assert.equal(response.status, 404);
    },
  },
];

let passed = 0;
let failed = 0;

async function run() {
  const dev = await ensureDevServer();
  console.log(`[dev] ${dev.action} → ${dev.baseUrl}\n`);

  for (const route of publicRoutes) {
    try {
      const response = await fetch(`${base}${route.path}`, {
        headers: { Accept: "application/json" },
      });
      const data = await response.json();
      await route.assert(data, response);
      console.log(`PASS  ${route.name}`);
      passed++;
    } catch (error) {
      console.error(`FAIL  ${route.name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\nAPI audit: ${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
