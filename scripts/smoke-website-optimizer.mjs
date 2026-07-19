/**
 * Smoke: AI Website Optimizer Engine wiring.
 * Usage: node scripts/smoke-website-optimizer.mjs
 */
import assert from "node:assert/strict";
import { access, readFileSync } from "node:fs";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";

const accessAsync = promisify(access);
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const files = [
  "supabase/migrations/037_ai_website_optimizer.sql",
  "lib/ai-core/optimizer/types.ts",
  "lib/ai-core/optimizer/audit.ts",
  "lib/ai-core/optimizer/analyze.ts",
  "lib/ai-core/optimizer/score.ts",
  "lib/ai-core/optimizer/apply.ts",
  "lib/ai-core/optimizer/persist.ts",
  "lib/ai-core/optimizer/run.ts",
  "lib/ai-core/optimizer/index.ts",
  "lib/ai-core/adapters/website-builder.ts",
  "app/api/website-builder/[id]/optimize/route.ts",
];

for (const rel of files) {
  await accessAsync(path.join(root, rel));
}

const migration = readFileSync(
  path.join(root, "supabase/migrations/037_ai_website_optimizer.sql"),
  "utf8",
);
assert.match(migration, /create table if not exists public\.website_audits/);
assert.match(migration, /create table if not exists public\.optimization_reports/);
assert.match(migration, /create table if not exists public\.improvement_history/);

const run = readFileSync(
  path.join(root, "lib/ai-core/optimizer/run.ts"),
  "utf8",
);
assert.match(run, /runWebsiteOptimizer/);
assert.match(run, /shouldApplyOptimizerFixes/);
assert.match(run, /analyzeWebsiteWithDeepSeek/);

const adapter = readFileSync(
  path.join(root, "lib/ai-core/adapters/website-builder.ts"),
  "utf8",
);
assert.match(adapter, /runWebsiteOptimizer/);
assert.match(adapter, /shouldApplyOptimizerFixes/);

const validation = readFileSync(
  path.join(root, "lib/validations/website-builder.ts"),
  "utf8",
);
assert.match(validation, /optimizeWithAi/);

const ui = readFileSync(
  path.join(root, "components/dashboard/website-builder-tool.tsx"),
  "utf8",
);
assert.match(ui, /optimize:\s*true/);
assert.match(ui, /Website Quality Score/);

console.log("smoke-website-optimizer: OK", {
  tables: ["website_audits", "optimization_reports", "improvement_history"],
  scores: ["design", "seo", "ux", "performance", "overall"],
});
