/**
 * Smoke: Smart Template Engine catalog + Website Builder wiring.
 * Usage: node scripts/smoke-smart-templates.mjs
 */
import assert from "node:assert/strict";
import { access, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const accessAsync = promisify(access);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "supabase/migrations/034_smart_templates.sql",
  "lib/website/smart-templates/catalog.ts",
  "lib/website/smart-templates/select.ts",
  "lib/website/smart-templates/apply.ts",
  "lib/website/smart-templates/repository.ts",
  "lib/website/smart-templates/index.ts",
  "app/api/website-builder/templates/route.ts",
  "lib/ai-core/layers/runner.ts",
];

for (const rel of files) {
  await accessAsync(path.join(root, rel));
}

const catalog = readFileSync(
  path.join(root, "lib/website/smart-templates/catalog.ts"),
  "utf8",
);
const expected = [
  "automotive-luxury",
  "restaurant-premium",
  "real-estate",
  "saas-startup",
  "agency",
  "clinic",
  "ecommerce-store",
];
for (const id of expected) {
  assert.match(catalog, new RegExp(`"${id}"`), `catalog missing ${id}`);
}

const runner = readFileSync(
  path.join(root, "lib/ai-core/layers/runner.ts"),
  "utf8",
);
assert.match(runner, /selectSmartTemplate/, "LayerRunner must call Smart Template Engine");
assert.match(runner, /website-builder/, "Smart templates scoped to Website Builder");

const migration = readFileSync(
  path.join(root, "supabase/migrations/034_smart_templates.sql"),
  "utf8",
);
assert.match(migration, /create table if not exists public\.templates/);
assert.match(migration, /create table if not exists public\.template_sections/);
assert.match(migration, /create table if not exists public\.template_design_systems/);

console.log("smoke-smart-templates: OK", {
  templates: expected.length,
  migration: "034_smart_templates.sql",
});
