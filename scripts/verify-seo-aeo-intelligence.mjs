/**
 * EDS-006 SEO & AEO Intelligence — architecture verification.
 * Usage: node scripts/verify-seo-aeo-intelligence.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const saieTypes = read("lib/ai-core/seo-aeo-intelligence/saie-types.ts");
const catalog = read("lib/ai-core/seo-aeo-intelligence/knowledge-base/catalog.ts");
const policies = read("lib/ai-core/seo-aeo-intelligence/policies.ts");
const validate = read("lib/ai-core/seo-aeo-intelligence/validate-seo.ts");
const buildSpec = read("lib/ai-core/seo-aeo-intelligence/build-spec.ts");
const saieEngine = read("lib/ai-core/seo-aeo-intelligence/saie-engine.ts");
const seoBuild = read("lib/ai-core/seo/build.ts");
const assemble = read("lib/ai-core/seo/assemble-package.ts");
const adapter = read("lib/ai-core/adapters/website-builder.ts");
const index = read("lib/ai-core/seo-aeo-intelligence/index.ts");
const pkg = read("package.json");

assert.ok(saieTypes.includes("SeoAeoIntelligenceTrace"), "SAIE trace type required");
assert.ok(saieTypes.includes("SEOSpecification"), "SEOSpecification type required");
assert.ok(saieTypes.includes("AeoOptimization"), "AEO optimization type required");
assert.ok(saieTypes.includes("knowledgeEntryId"), "policy must reference SKB entries");
assert.ok(saieTypes.includes("SEO_AEO_INTELLIGENCE_TRACE_KEY"), "trace metadata key required");
assert.ok(saieTypes.includes("SEO_AEO_INTELLIGENCE_SPEC_KEY"), "spec metadata key required");

assert.ok(catalog.includes("SEO_KNOWLEDGE_ENTRIES"), "SKB catalog required");
assert.ok(catalog.includes("AEO_KNOWLEDGE_ENTRIES"), "AEO KB catalog required");
assert.ok(catalog.includes("seo-policy-furniture"), "furniture SKB policy required");
assert.ok(catalog.includes("getSeoKnowledgeEntry"), "SKB lookup required");
assert.ok(catalog.includes("getAeoKnowledgeEntry"), "AEO KB lookup required");

assert.ok(
  policies.includes("getSeoKnowledgeEntry"),
  "policies must query SKB not hardcode industry rules",
);
assert.ok(
  policies.includes("getAeoKnowledgeEntry"),
  "policies must query AEO KB",
);
assert.ok(
  policies.includes("normalizeRoutingIndustryId"),
  "policies must align with AKB industry routing",
);

assert.ok(
  validate.includes("required-schema"),
  "validation must check required schema types from SKB",
);
assert.ok(
  validate.includes("title-length"),
  "validation must check metadata length policies",
);

assert.ok(
  buildSpec.includes("buildSeoAeoSpecification"),
  "SEOSpecification builder required",
);
assert.ok(
  buildSpec.includes("aeo"),
  "build spec must include AEO optimization",
);

assert.ok(
  saieEngine.includes("runSeoAeoIntelligenceEngine"),
  "SAIE engine entry required",
);
assert.ok(
  saieEngine.includes("persistSeoAeoIntelligenceOnBrief"),
  "brief persistence helper required",
);

assert.ok(
  seoBuild.includes("runSeoAeoIntelligenceEngine"),
  "buildSeoPackageFromStrategy must delegate to SAIE",
);
assert.ok(
  !seoBuild.includes("function truncate") || assemble.includes("assembleSeoPackage"),
  "SEO package assembly must live in assemble-package for SAIE",
);

assert.ok(
  adapter.includes("runSeoAeoIntelligenceEngine"),
  "adapter must run SAIE for SEO phase",
);
assert.ok(
  adapter.includes("getWebsiteGenerationPlanFromBrief"),
  "adapter must pass WebsiteGenerationPlan to SAIE",
);
assert.ok(
  adapter.includes("getImageSystemSpecFromBrief"),
  "adapter must pass IIE spec to SAIE",
);
assert.ok(
  adapter.includes("SEO_AEO_INTELLIGENCE_TRACE_KEY"),
  "adapter must persist SAIE trace on brief",
);

assert.ok(
  index.includes("runSeoAeoIntelligenceEngine"),
  "public API must export SAIE engine",
);
assert.ok(
  index.includes("resolveSeoPolicy"),
  "public API must export policy resolution",
);

assert.ok(
  pkg.includes("verify:seo-aeo-intelligence"),
  "package.json must register verify:seo-aeo-intelligence",
);

console.log("✓ SEO & AEO Intelligence architecture verified (EDS-006)");
