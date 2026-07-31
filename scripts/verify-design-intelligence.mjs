/**
 * EDS-004 Design Intelligence — architecture verification.
 * Usage: node scripts/verify-design-intelligence.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const dieTypes = read("lib/ai-core/design-intelligence/die-types.ts");
const catalog = read("lib/ai-core/design-intelligence/knowledge-base/catalog.ts");
const policies = read("lib/ai-core/design-intelligence/policies.ts");
const validate = read("lib/ai-core/design-intelligence/validate-design.ts");
const buildSpec = read("lib/ai-core/design-intelligence/build-spec.ts");
const dieEngine = read("lib/ai-core/design-intelligence/die-engine.ts");
const designPlanEngine = read("lib/ai-core/design-plan/engine.ts");
const designPlanBuild = read("lib/ai-core/design-plan/build.ts");
const adapter = read("lib/ai-core/adapters/website-builder.ts");
const index = read("lib/ai-core/design-intelligence/index.ts");
const pkg = read("package.json");

assert.ok(dieTypes.includes("DesignIntelligenceTrace"), "DIE trace type required");
assert.ok(dieTypes.includes("DesignSystemSpec"), "DesignSystemSpec type required");
assert.ok(dieTypes.includes("DesignPolicy"), "DesignPolicy type required");
assert.ok(dieTypes.includes("knowledgeEntryId"), "policy must reference DKB entries");
assert.ok(dieTypes.includes("DESIGN_INTELLIGENCE_TRACE_KEY"), "trace metadata key required");
assert.ok(dieTypes.includes("DESIGN_INTELLIGENCE_SPEC_KEY"), "spec metadata key required");

assert.ok(catalog.includes("DESIGN_KNOWLEDGE_ENTRIES"), "DKB catalog required");
assert.ok(catalog.includes("design-policy-furniture"), "furniture DKB policy required");
assert.ok(catalog.includes("getDesignKnowledgeEntry"), "DKB lookup required");

assert.ok(
  policies.includes("getDesignKnowledgeEntry"),
  "policies must query DKB not hardcode industry rules",
);
assert.ok(
  policies.includes("normalizeRoutingIndustryId"),
  "policies must align with AKB industry routing",
);

assert.ok(
  validate.includes("layout-variation-forbidden"),
  "validation must check forbidden layout variations from DKB",
);
assert.ok(
  validate.includes("isEditorialLayoutIndustry"),
  "validation must align with AKB editorial routing",
);

assert.ok(
  buildSpec.includes("buildDesignSystemSpec"),
  "DesignSystemSpec builder required",
);
assert.ok(
  !buildSpec.includes("generateImage") && !buildSpec.includes("render"),
  "DIE must not generate visual assets",
);

assert.ok(
  dieEngine.includes("runDesignIntelligenceEngine"),
  "DIE engine entry required",
);
assert.ok(
  dieEngine.includes("persistDesignIntelligenceOnBrief"),
  "brief persistence helper required",
);

assert.ok(
  designPlanEngine.includes("runDesignIntelligenceEngine"),
  "design planning must run DIE",
);
assert.ok(
  designPlanBuild.includes("designSpec"),
  "visual design plan must consume DIE spec",
);

assert.ok(
  adapter.includes("masterPlan: getMasterWebsitePlan"),
  "adapter must pass master plan to design planning",
);
assert.ok(
  adapter.includes("getWebsiteGenerationPlanFromBrief"),
  "adapter must pass WebsiteGenerationPlan to design planning",
);
assert.ok(
  adapter.includes("DESIGN_INTELLIGENCE_TRACE_KEY"),
  "adapter must persist DIE trace on brief",
);

assert.ok(
  index.includes("runDesignIntelligenceEngine"),
  "public API must export DIE engine",
);
assert.ok(
  index.includes("resolveDesignPolicy"),
  "public API must export policy resolution",
);

assert.ok(
  pkg.includes("verify:design-intelligence"),
  "package.json must register verify:design-intelligence",
);

console.log("✓ Design Intelligence architecture verified (EDS-004)");
