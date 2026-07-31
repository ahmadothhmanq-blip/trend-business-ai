/**
 * EDS-005 Image Intelligence — architecture verification.
 * Usage: node scripts/verify-image-intelligence.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const iieTypes = read("lib/ai-core/image-intelligence/iie-types.ts");
const catalog = read("lib/ai-core/image-intelligence/knowledge-base/catalog.ts");
const policies = read("lib/ai-core/image-intelligence/policies.ts");
const validate = read("lib/ai-core/image-intelligence/validate-image.ts");
const buildSpec = read("lib/ai-core/image-intelligence/build-spec.ts");
const semantic = read("lib/ai-core/image-intelligence/semantic-relevance.ts");
const iieEngine = read("lib/ai-core/image-intelligence/iie-engine.ts");
const inject = read("lib/ai-core/image-engine/inject.ts");
const imageEngine = read("lib/ai-core/image-engine/engine.ts");
const promptEngine = read("lib/ai-core/assets/prompt-engine.ts");
const adapter = read("lib/ai-core/adapters/website-builder.ts");
const index = read("lib/ai-core/image-intelligence/index.ts");
const pkg = read("package.json");

assert.ok(iieTypes.includes("ImageIntelligenceTrace"), "IIE trace type required");
assert.ok(iieTypes.includes("ImageSystemSpec"), "ImageSystemSpec type required");
assert.ok(iieTypes.includes("ImageSpecification"), "ImageSpecification type required");
assert.ok(iieTypes.includes("providerPrompt"), "provider-agnostic prompt field required");
assert.ok(iieTypes.includes("knowledgeEntryId"), "policy must reference IKB entries");
assert.ok(iieTypes.includes("IMAGE_INTELLIGENCE_TRACE_KEY"), "trace metadata key required");
assert.ok(iieTypes.includes("IMAGE_INTELLIGENCE_SPEC_KEY"), "spec metadata key required");

assert.ok(catalog.includes("IMAGE_KNOWLEDGE_ENTRIES"), "IKB catalog required");
assert.ok(catalog.includes("image-policy-furniture"), "furniture IKB policy required");
assert.ok(catalog.includes("getImageKnowledgeEntry"), "IKB lookup required");

assert.ok(
  policies.includes("getImageKnowledgeEntry"),
  "policies must query IKB not hardcode industry rules",
);
assert.ok(
  policies.includes("normalizeRoutingIndustryId"),
  "policies must align with AKB industry routing",
);
assert.ok(
  policies.includes("designSystemSpec"),
  "policies must integrate with DIE DesignSystemSpec",
);

assert.ok(
  validate.includes("forbidden-subjects"),
  "validation must check forbidden subjects from IKB",
);
assert.ok(
  validate.includes("required-purposes"),
  "validation must check required image purposes",
);

assert.ok(
  buildSpec.includes("buildImageSystemSpec"),
  "ImageSystemSpec builder required",
);
assert.ok(
  buildSpec.includes("imageSpecificationsToPlanItems"),
  "spec-to-plan conversion required for generation",
);
assert.ok(
  !buildSpec.includes("generateCoreAssets"),
  "IIE must not generate images directly",
);

assert.ok(
  buildSpec.includes("applySemanticRelevanceToSpecifications"),
  "build-spec must apply semantic relevance to ImageSpecifications",
);
assert.ok(
  semantic.includes("resolveSemanticVisualConcept"),
  "semantic relevance module required",
);
assert.ok(
  validate.includes("validateSemanticRelevance"),
  "validation must enforce semantic relevance",
);
assert.ok(
  inject.includes("imageSystemSpec"),
  "inject must replace template placeholders using ImageSystemSpec",
);

assert.ok(
  iieEngine.includes("runImageIntelligenceEngine"),
  "IIE engine entry required",
);
assert.ok(
  iieEngine.includes("persistImageIntelligenceOnBrief"),
  "brief persistence helper required",
);

assert.ok(
  imageEngine.includes("runImageIntelligenceEngine"),
  "image engine must delegate planning to IIE",
);
assert.ok(
  imageEngine.includes("imageSpecificationsToPlanItems"),
  "image engine must consume IIE specifications",
);

assert.ok(
  promptEngine.includes("runImageIntelligenceEngine"),
  "prompt-engine must use IIE not independent planning",
);

assert.ok(
  adapter.includes("getWebsiteGenerationPlanFromBrief"),
  "adapter must pass WebsiteGenerationPlan to image engine",
);
assert.ok(
  adapter.includes("designSystemSpec"),
  "adapter must pass DIE DesignSystemSpec to image engine",
);
assert.ok(
  adapter.includes("IMAGE_INTELLIGENCE_TRACE_KEY"),
  "adapter must persist IIE trace on brief",
);

assert.ok(
  index.includes("runImageIntelligenceEngine"),
  "public API must export IIE engine",
);
assert.ok(
  index.includes("resolveImagePolicy"),
  "public API must export policy resolution",
);

assert.ok(
  pkg.includes("verify:image-intelligence"),
  "package.json must register verify:image-intelligence",
);

console.log("✓ Image Intelligence architecture verified (EDS-005)");
