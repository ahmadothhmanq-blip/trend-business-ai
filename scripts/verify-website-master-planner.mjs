/**
 * Master AI Planner — single source of truth for website generation.
 * Usage: node scripts/verify-website-master-planner.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const types = read("lib/ai-core/master-planner/types.ts");
const engine = read("lib/ai-core/master-planner/engine.ts");
const apply = read("lib/ai-core/master-planner/apply.ts");
const runner = read("lib/ai-core/layers/runner.ts");
const detect = read("lib/ai-core/industry-intelligence/detect.ts");
const intelligence = read("lib/ai-core/image-engine/intelligence.ts");
const imageEngine = read("lib/ai-core/image-engine/engine.ts");
const adapter = read("lib/ai-core/adapters/website-builder.ts");
const pkg = read("package.json");

assert.ok(types.includes("MasterWebsitePlan"), "MasterWebsitePlan type must exist");
assert.ok(
  types.includes('MASTER_WEBSITE_PLAN_KEY = "masterWebsitePlan"'),
  "master plan metadata key must be defined",
);
assert.ok(
  types.includes("locked:") && types.includes("industry: boolean"),
  "plan must define locked industry flag",
);

for (const field of [
  "industry",
  "businessType",
  "style",
  "audience",
  "template",
  "layout",
  "hero",
  "navigation",
  "colorPalette",
  "typography",
  "imageStyle",
  "imageKeywords",
  "sections",
  "ctaStyle",
  "features",
]) {
  assert.ok(
    types.includes(`${field}:`),
    `MasterWebsitePlan must include ${field}`,
  );
}

assert.ok(
  engine.includes("runMasterWebsitePlanner"),
  "engine must export runMasterWebsitePlanner",
);
assert.ok(
  engine.includes("detectWebsiteIndustry"),
  "master planner must call industry detection once",
);
assert.ok(
  engine.includes("runAutoDesignDecision"),
  "master planner must orchestrate auto-design",
);
assert.ok(
  engine.includes("applyMasterWebsitePlanToBrief"),
  "master planner must apply plan to brief",
);

assert.ok(
  apply.includes("getMasterWebsitePlan"),
  "apply module must expose getMasterWebsitePlan",
);
assert.ok(
  apply.includes("resolveIndustryFromMasterPlan"),
  "apply module must expose resolveIndustryFromMasterPlan",
);

assert.ok(
  runner.includes("runMasterWebsitePlanner"),
  "runner must invoke master planner for website-builder",
);
assert.ok(
  !runner.includes("detectWebsiteIndustry(brief)") ||
    runner.indexOf("runMasterWebsitePlanner") < runner.indexOf("detectWebsiteIndustry(brief)"),
  "runner must not call detectWebsiteIndustry directly before master planner",
);
assert.ok(
  runner.includes("Applying locked template from master plan"),
  "runner must apply locked template from master plan",
);

assert.ok(
  detect.includes("masterWebsitePlan"),
  "industry detect must respect master plan",
);
assert.ok(
  detect.includes("Master AI Planner locked industry"),
  "detect must short-circuit when industry is locked",
);

assert.ok(
  intelligence.includes("masterPlan?: MasterWebsitePlan"),
  "image intelligence must accept master plan",
);
assert.ok(
  intelligence.includes("lockedImageKeywords"),
  "image intelligence must use locked image keywords",
);

assert.ok(
  imageEngine.includes("masterPlan: params.masterPlan"),
  "image engine must pass master plan through",
);

assert.ok(
  adapter.includes("getMasterWebsitePlan"),
  "website adapter must read master plan",
);
assert.ok(
  adapter.includes("resolveIndustryFromMasterPlan"),
  "website adapter must resolve industry from master plan",
);
assert.ok(
  adapter.includes("masterPlan: getMasterWebsitePlan(brief)"),
  "assets layer must pass master plan to image engine",
);

assert.ok(
  pkg.includes("verify:website-master-planner"),
  "package.json must register verify:website-master-planner script",
);

console.log("✓ Master AI Planner architecture verified");
