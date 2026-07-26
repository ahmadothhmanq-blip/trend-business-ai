/**
 * Phase 0 platform foundation — revision helpers + module contracts.
 * Usage: node scripts/verify-website-platform-foundation.mjs
 */
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
function ok(label) {
  console.log(`  ✓ ${label}`);
}
function fail(label, err) {
  failed++;
  console.log(`  ✗ ${label}: ${err}`);
}

// --- revision logic (mirrors lib/website/platform/revision.ts) ---
function readBlueprintRevisionFromGeneration(generation) {
  const column = generation.blueprint_revision;
  if (typeof column === "number" && Number.isFinite(column)) {
    return Math.max(0, Math.floor(column));
  }
  const embedded = generation.blueprint?.platformRevision?.revision;
  if (typeof embedded === "number" && Number.isFinite(embedded)) {
    return Math.max(0, Math.floor(embedded));
  }
  return 0;
}

function nextRevision(current) {
  return Math.max(0, Math.floor(current)) + 1;
}

if (readBlueprintRevisionFromGeneration({ blueprint_revision: 3 }) !== 3) {
  fail("column revision", "expected 3");
} else ok("read column revision");

if (
  readBlueprintRevisionFromGeneration({
    blueprint: { platformRevision: { revision: 7 } },
  }) !== 7
) {
  fail("embedded revision", "expected 7");
} else ok("read embedded revision");

if (nextRevision(0) !== 1 || nextRevision(5) !== 6) {
  fail("nextRevision", "increment failed");
} else ok("nextRevision increment");

// --- static source contracts ---
const requiredPaths = [
  "lib/website/platform/types.ts",
  "lib/website/platform/revision.ts",
  "lib/website/platform/idempotency.ts",
  "lib/website/platform/mutation-run.ts",
  "lib/website/platform/commit.ts",
  "lib/website/platform/load-generation.ts",
  "lib/website/platform/services/edit-service.ts",
  "lib/website/platform/services/structure-service.ts",
  "lib/website/platform/services/seo-service.ts",
  "lib/website/platform/index.ts",
  "supabase/migrations/074_website_platform_foundation.sql",
];

for (const rel of requiredPaths) {
  try {
    readFileSync(join(root, rel), "utf8");
    ok(`file exists: ${rel}`);
  } catch {
    fail(`file exists: ${rel}`, "missing");
  }
}

const editRoute = readFileSync(
  join(root, "app/api/website-builder/[id]/edit/route.ts"),
  "utf8",
);
if (!editRoute.includes("executeWebsiteEdit")) {
  fail("edit route uses service", "missing executeWebsiteEdit");
} else ok("edit route delegates to WebsiteEditService");

const seoRoute = readFileSync(
  join(root, "app/api/website-builder/[id]/seo/apply/route.ts"),
  "utf8",
);
if (!seoRoute.includes("executeWebsiteSeoApply")) {
  fail("seo route uses service", "missing executeWebsiteSeoApply");
} else ok("seo route delegates to WebsiteSeoService");

const manageRoute = readFileSync(
  join(root, "app/api/website-builder/[id]/manage/route.ts"),
  "utf8",
);
if (!manageRoute.includes("executeWebsiteStructureMutation")) {
  fail("manage route uses service", "missing executeWebsiteStructureMutation");
} else ok("manage route delegates to WebsiteStructureService");

const commitSrc = readFileSync(
  join(root, "lib/website/platform/commit.ts"),
  "utf8",
);
for (const needle of [
  "commitBlueprintRevision",
  "findIdempotentCommit",
  "recordWebsiteMutationRun",
  "stampPlatformRevisionOnProject",
  "syncBlueprintMaterializedView",
]) {
  if (!commitSrc.includes(needle)) fail(`commit.ts contains ${needle}`, "missing");
  else ok(`commit.ts: ${needle}`);
}

const migration = readFileSync(
  join(root, "supabase/migrations/074_website_platform_foundation.sql"),
  "utf8",
);
if (!migration.includes("blueprint_revision")) {
  fail("migration blueprint_revision", "missing");
} else ok("migration: blueprint_revision column");

if (!migration.includes("website_commit_idempotency")) {
  fail("migration idempotency table", "missing");
} else ok("migration: idempotency table");

if (failed) {
  console.error(`\nverify-website-platform-foundation: FAILED (${failed})`);
  process.exit(1);
}
console.log("\nverify-website-platform-foundation: OK");
