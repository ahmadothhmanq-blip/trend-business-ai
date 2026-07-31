/**
 * EDS-003 Content Intelligence — architecture verification.
 * Usage: node scripts/verify-content-intelligence.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const types = read("lib/ai-core/content-intelligence/types.ts");
const policies = read("lib/ai-core/content-intelligence/policies.ts");
const resolve = read("lib/ai-core/content-intelligence/resolve.ts");
const engine = read("lib/ai-core/content-intelligence/engine.ts");
const catalog = read("lib/ai-core/content-intelligence/knowledge-base/catalog.ts");
const validate = read("lib/ai-core/content-intelligence/validate-content.ts");
const agency = read("lib/ai-core/agency-orchestrator/orchestrate.ts");
const generate = read("plugins/website/generate.ts");
const adapter = read("lib/ai-core/adapters/website-builder.ts");
const pkg = read("package.json");

assert.ok(types.includes("ContentIntelligenceTrace"), "CIE trace type required");
assert.ok(types.includes("ContentPolicy"), "ContentPolicy type required");
assert.ok(types.includes("knowledgeEntryId"), "policy must reference CKB entries");
assert.ok(types.includes("CONTENT_INTELLIGENCE_TRACE_KEY"), "trace metadata key required");

assert.ok(catalog.includes("CONTENT_KNOWLEDGE_ENTRIES"), "CKB catalog required");
assert.ok(catalog.includes("content-policy-furniture"), "furniture CKB policy required");
assert.ok(catalog.includes("getContentKnowledgeEntry"), "CKB lookup required");

assert.ok(
  policies.includes("getContentKnowledgeEntry"),
  "policies must query CKB not hardcode industry rules",
);
assert.ok(
  policies.includes("normalizeRoutingIndustryId"),
  "policies must align with AKB industry routing",
);

assert.ok(
  validate.includes("forbidden-subjects"),
  "validation must check forbidden subjects from CKB",
);
assert.ok(
  !validate.includes("furniture") || validate.includes("forbiddenSubjects"),
  "validation must use policy forbiddenSubjects not hardcoded furniture",
);

assert.ok(
  resolve.includes("resolveProductionContentWithIntelligence"),
  "authoritative content resolution required",
);
assert.ok(
  resolve.includes("remediateAgencyContent"),
  "resolution must auto-remediate content",
);

assert.ok(
  engine.includes("runContentIntelligenceEngine"),
  "CIE engine entry required",
);

assert.ok(
  agency.includes("runContentIntelligenceEngine"),
  "agency orchestrator must run CIE after content generation",
);

assert.ok(
  generate.includes("resolveProductionContentWithIntelligence"),
  "website generate must use CIE resolution",
);
assert.ok(
  generate.includes("masterWebsitePlan"),
  "generate must accept master plan for content policy",
);

assert.ok(
  adapter.includes("masterWebsitePlan: getMasterWebsitePlan"),
  "adapter must pass master plan to generation",
);

assert.ok(
  read("lib/ai-core/content-intelligence/cliches.ts").includes("AI_CONTENT_CLICHES"),
  "shared cliché SSOT required",
);
assert.ok(
  read("lib/ai-core/content-intelligence/llm-generate.ts").includes("stripContentCliches"),
  "LLM generate must use shared cliché filter",
);

assert.ok(
  pkg.includes("verify:content-intelligence"),
  "package.json must register verify:content-intelligence",
);

console.log("✓ Content Intelligence architecture verified (EDS-003)");
