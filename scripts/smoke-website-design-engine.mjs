/**
 * Smoke: Design Engine source modules exist (no AI calls).
 * Usage: node scripts/smoke-website-design-engine.mjs
 */
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "plugins/website/layers/business-idea.ts",
  "plugins/website/layers/strategy.ts",
  "plugins/website/layers/design-engine.ts",
  "plugins/website/layers/assets.ts",
  "plugins/website/layers/quality.ts",
  "lib/website/assets-storage.ts",
  "lib/ai/prompts/website-layers.ts",
  "supabase/migrations/032_website_design_engine_artifacts.sql",
  "docs/WEBSITE_BUILDER_DESIGN_ENGINE.md",
];

for (const rel of required) {
  await access(path.join(root, rel));
}

assert.ok(required.length >= 8);
console.log("smoke-website-design-engine: OK", { files: required.length });
