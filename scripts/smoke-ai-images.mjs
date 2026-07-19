/**
 * Smoke: AI Real Images Engine wiring.
 * Usage: node scripts/smoke-ai-images.mjs
 */
import assert from "node:assert/strict";
import { access, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const accessAsync = promisify(access);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "supabase/migrations/035_ai_real_images_engine.sql",
  "lib/ai-core/assets/settings.ts",
  "lib/ai-core/assets/prompt-engine.ts",
  "lib/ai-core/assets/persist.ts",
  "lib/ai-core/assets/provider.ts",
  "lib/ai-core/assets/providers/openai.ts",
  "lib/ai-core/assets/providers/replicate.ts",
  "lib/ai-core/assets/providers/stability.ts",
  "lib/ai-core/assets/providers/router.ts",
  "lib/ai-core/assets/generate.ts",
  "lib/ai-core/adapters/website-builder.ts",
];

for (const rel of files) {
  await accessAsync(path.join(root, rel));
}

const migration = readFileSync(
  path.join(root, "supabase/migrations/035_ai_real_images_engine.sql"),
  "utf8",
);
assert.match(migration, /create table if not exists public\.generated_images/);
assert.match(migration, /create table if not exists public\.image_prompts/);
assert.match(migration, /create table if not exists public\.image_assets/);

const adapter = readFileSync(
  path.join(root, "lib/ai-core/adapters/website-builder.ts"),
  "utf8",
);
assert.match(adapter, /buildImagePrompts/);
assert.match(adapter, /generateCoreAssets/);

const router = readFileSync(
  path.join(root, "lib/ai-core/assets/providers/router.ts"),
  "utf8",
);
assert.match(router, /openaiImageProvider/);
assert.match(router, /replicateImageProvider/);
assert.match(router, /stabilityImageProvider/);

const provider = readFileSync(
  path.join(root, "lib/ai-core/assets/provider.ts"),
  "utf8",
);
assert.match(provider, /generateWithImageProviders/);
assert.doesNotMatch(
  provider,
  /from ["']@\/lib\/ai\/adapters\/deepseek|DEEPSEEK_API_KEY/,
);

console.log("smoke-ai-images: OK", {
  providers: ["openai", "replicate", "stability"],
  tables: ["generated_images", "image_prompts", "image_assets"],
});
