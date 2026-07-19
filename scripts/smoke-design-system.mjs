/**
 * Smoke: AI Design System Engine wiring.
 * Usage: node scripts/smoke-design-system.mjs
 */
import assert from "node:assert/strict";
import { access, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const accessAsync = promisify(access);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "supabase/migrations/036_ai_design_system_engine.sql",
  "lib/ai-core/design-system/types.ts",
  "lib/ai-core/design-system/presets.ts",
  "lib/ai-core/design-system/build.ts",
  "lib/ai-core/design-system/generate.ts",
  "lib/ai-core/design-system/persist.ts",
  "lib/ai-core/design-system/index.ts",
  "lib/ai-core/adapters/website-builder.ts",
];

for (const rel of files) {
  await accessAsync(path.join(root, rel));
}

const migration = readFileSync(
  path.join(root, "supabase/migrations/036_ai_design_system_engine.sql"),
  "utf8",
);
assert.match(migration, /create table if not exists public\.design_systems/);
assert.match(migration, /create table if not exists public\.design_presets/);
assert.match(migration, /create table if not exists public\.generated_designs/);
assert.match(migration, /'tech'/);

const presets = readFileSync(
  path.join(root, "lib/ai-core/design-system/presets.ts"),
  "utf8",
);
for (const id of ["luxury", "modern", "minimal", "corporate", "creative", "tech"]) {
  assert.match(presets, new RegExp(`${id}:\\s*\\{`));
}

const generate = readFileSync(
  path.join(root, "lib/ai-core/design-system/generate.ts"),
  "utf8",
);
assert.match(generate, /getDefaultTextProvider/);
assert.match(generate, /generateDesignSystem/);
assert.match(generate, /persistGeneratedDesign/);

const adapter = readFileSync(
  path.join(root, "lib/ai-core/adapters/website-builder.ts"),
  "utf8",
);
assert.match(adapter, /generateDesignSystem/);
assert.doesNotMatch(adapter, /buildAiDesignSystemFromStrategy\(/);

const catalog = readFileSync(
  path.join(root, "lib/website/smart-templates/catalog.ts"),
  "utf8",
);
assert.match(catalog, /designPreset:\s*"tech"/);

console.log("smoke-design-system: OK", {
  presets: ["luxury", "modern", "minimal", "corporate", "creative", "tech"],
  tables: ["design_systems", "design_presets", "generated_designs"],
});
