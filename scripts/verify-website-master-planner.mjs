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
const pre = read("lib/ai-core/planning-reasoning-engine/orchestrator.ts");
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

assert.ok(
  types.includes("reasoningChain"),
  "plan must include explainable routing chain (EDS-001)",
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
  read("lib/ai-core/architecture-validation/validate.ts").includes(
    "validateWebsiteGenerationPlan",
  ),
  "architecture validation engine must exist",
);
assert.ok(
  types.includes("validation:"),
  "master plan must record validation status in sources",
);
const engine = read("lib/ai-core/master-planner/engine.ts");
assert.ok(
  engine.includes("runMasterWebsitePlanner"),
  "master planner facade must export runMasterWebsitePlanner",
);
assert.ok(
  read("lib/ai-core/planning-reasoning-engine/orchestrator.ts").includes(
    "runPlanningReasoningEngine",
  ),
  "PRE orchestrator must exist (EDS-002)",
);
assert.ok(
  read("lib/ai-core/planning-reasoning-engine/types.ts").includes(
    "DecisionTraceEntry",
  ),
  "PRE must define structured DecisionTraceEntry (EDS-002)",
);
assert.ok(
  runner.includes("runPlanningReasoningEngine"),
  "runner must invoke PRE for website-builder (EDS-002)",
);
assert.ok(
  pre.includes("runBusinessIntelligenceAnalysis") ||
    pre.includes("getBusinessIntelligenceFromBrief"),
  "PRE must run business intelligence before routing",
);
assert.ok(
  pre.includes("validateAndRouteWebsiteGeneration"),
  "PRE must use unified router + architecture validation (EDS-001)",
);
assert.ok(
  pre.includes("runAgencyOrchestrator"),
  "PRE must run agency orchestrator before plan lock",
);
assert.ok(
  pre.includes("runAutoDesignDecision"),
  "PRE must orchestrate auto-design",
);
assert.ok(
  pre.includes("applyMasterWebsitePlanToBrief"),
  "PRE must apply plan to brief",
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
  apply.includes("layoutTemplateIntelligenceId"),
  "apply must separate layout TI from visual theme",
);
assert.ok(
  apply.includes("masterPlanReasoningChain"),
  "apply must persist reasoning chain on brief",
);

assert.ok(
  runner.includes("runPlanningReasoningEngine") ||
    runner.includes("runMasterWebsitePlanner"),
  "runner must invoke PRE or master planner for website-builder",
);
assert.ok(
  !runner.includes("detectWebsiteIndustry(brief)") ||
    runner.indexOf("runMasterWebsitePlanner") < runner.indexOf("detectWebsiteIndustry(brief)"),
  "runner must not call detectWebsiteIndustry directly before master planner",
);
assert.ok(
  runner.includes("Applying locked layout template from master plan"),
  "runner must apply locked layout template from master plan",
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
