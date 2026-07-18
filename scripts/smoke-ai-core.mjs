/**
 * Smoke: AI Core Engine Phase 1 modules exist.
 * Usage: node scripts/smoke-ai-core.mjs
 */
import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "lib/ai-core/index.ts",
  "lib/ai-core/adapter.ts",
  "lib/ai-core/registry.ts",
  "lib/ai-core/runtime/index.ts",
  "lib/ai-core/layers/types.ts",
  "lib/ai-core/layers/schemas.ts",
  "lib/ai-core/layers/runner.ts",
  "lib/ai-core/adapters/website-builder.ts",
  "supabase/migrations/033_ai_runs.sql",
  "docs/AI_CORE_ENGINE.md",
];

for (const rel of required) {
  await access(path.join(root, rel));
}

assert.ok(required.length >= 10);
console.log("smoke-ai-core: OK", { files: required.length });
