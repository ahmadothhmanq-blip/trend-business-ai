/**
 * Lightweight smoke checks for AI Engine + Website Builder helpers.
 * Does not call live LLM APIs (fast / CI-safe).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const required = [
  "lib/ai/generator.ts",
  "lib/ai/website-scaffold.ts",
  "lib/deepseek.ts",
  "plugins/website/pipeline-validate.ts",
  "plugins/website/analyze.ts",
  "plugins/website/plan.ts",
  "plugins/website/generate.ts",
  "app/api/website-builder/stream/route.ts",
  "app/api/website-builder/[id]/export/route.ts",
];

for (const rel of required) {
  assert.ok(existsSync(join(root, rel)), `missing ${rel}`);
  assert.ok(read(rel).length > 20, `empty ${rel}`);
}

const generator = read("lib/ai/generator.ts");
assert.match(generator, /generateJsonWithValidation/);
assert.match(generator, /generateWithValidation/);

const scaffold = read("lib/ai/website-scaffold.ts");
assert.match(scaffold, /MAX_WEBSITE_FILES\s*=\s*18/);
assert.match(scaffold, /syncPackageJsonDependencies/);

const deepseek = read("lib/deepseek.ts");
assert.match(deepseek, /autoFallback/);
assert.match(deepseek, /listConfigured/);

const planPrompt = read("lib/ai/prompts/website.ts");
assert.match(planPrompt, /HARD RULES/);
assert.match(planPrompt, /estimatedFileCount MUST be <= 18/);

const exportRoute = read("app/api/website-builder/[id]/export/route.ts");
assert.match(exportRoute, /buildProjectZip/);
assert.match(exportRoute, /application\/zip/);

const tool = read("components/dashboard/website-builder-tool.tsx");
assert.match(tool, /\/api\/website-builder\/\$\{project\.id\}\/export/);

console.log("smoke-website-ai: PASS (structure + contracts)");
