/**
 * EDS-007 Quality Assurance & Self-Healing — architecture verification.
 * Usage: node scripts/verify-quality-assurance.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const qasheTypes = read("lib/ai-core/quality-assurance/qashe-types.ts");
const catalog = read("lib/ai-core/quality-assurance/knowledge-base/catalog.ts");
const policies = read("lib/ai-core/quality-assurance/policies.ts");
const validate = read("lib/ai-core/quality-assurance/validate-pipeline.ts");
const buildSpec = read("lib/ai-core/quality-assurance/build-spec.ts");
const selfHeal = read("lib/ai-core/quality-assurance/self-heal.ts");
const qasheEngine = read("lib/ai-core/quality-assurance/qashe-engine.ts");
const report = read("lib/ai-core/quality/report.ts");
const reportInternal = read("lib/ai-core/quality/report-internal.ts");
const adapter = read("lib/ai-core/adapters/website-builder.ts");
const index = read("lib/ai-core/quality-assurance/index.ts");
const pkg = read("package.json");

assert.ok(qasheTypes.includes("QualityAssuranceTrace"), "QASHE trace type required");
assert.ok(qasheTypes.includes("QualitySpecification"), "QualitySpecification type required");
assert.ok(qasheTypes.includes("RemediationAction"), "remediation action type required");
assert.ok(qasheTypes.includes("knowledgeEntryId"), "policy must reference QKB entries");
assert.ok(qasheTypes.includes("QUALITY_ASSURANCE_TRACE_KEY"), "trace metadata key required");
assert.ok(qasheTypes.includes("QUALITY_SPECIFICATION_KEY"), "spec metadata key required");

assert.ok(catalog.includes("QUALITY_KNOWLEDGE_ENTRIES"), "QKB catalog required");
assert.ok(catalog.includes("quality-policy-furniture"), "furniture QKB policy required");
assert.ok(catalog.includes("getQualityKnowledgeEntry"), "QKB lookup required");

assert.ok(
  policies.includes("getQualityKnowledgeEntry"),
  "policies must query QKB not hardcode industry rules",
);
assert.ok(
  policies.includes("normalizeRoutingIndustryId"),
  "policies must align with AKB industry routing",
);

assert.ok(
  validate.includes("validateCrossEngineConsistency"),
  "cross-engine consistency validation required",
);
assert.ok(
  validate.includes("hallucination-detection"),
  "hallucination detection phase required",
);
assert.ok(
  validate.includes("broken-references"),
  "broken reference detection required",
);
assert.ok(
  validate.includes("validateQualitySpecification"),
  "spec lock validation required",
);

assert.ok(
  buildSpec.includes("buildQualitySpecification"),
  "QualitySpecification builder required",
);
assert.ok(
  buildSpec.includes("buildAutoQualityReportInternal"),
  "must delegate dimension checks to report-internal",
);
assert.ok(
  !buildSpec.includes("runQualityAssuranceEngine"),
  "build-spec must not circular-import QASHE engine",
);

assert.ok(selfHeal.includes("applySelfHealing"), "self-healing entry required");
assert.ok(selfHeal.includes("repairAccessibility"), "accessibility auto-fix required");

assert.ok(
  qasheEngine.includes("runQualityAssuranceEngine"),
  "authoritative QASHE entry required",
);
assert.ok(
  qasheEngine.includes("persistQualityAssuranceOnBrief"),
  "brief persistence required",
);

assert.ok(
  report.includes("runQualityAssuranceEngine"),
  "buildAutoQualityReport must route through QASHE",
);
assert.ok(
  reportInternal.includes("buildAutoQualityReportInternal"),
  "internal report builder required",
);
assert.ok(
  !reportInternal.includes("runQualityAssuranceEngine"),
  "report-internal must not import QASHE (circular dep)",
);

assert.ok(
  adapter.includes("runQualityAssuranceEngine"),
  "website builder adapter must use QASHE",
);
assert.ok(
  adapter.includes("QUALITY_ASSURANCE_TRACE_KEY"),
  "adapter must persist QASHE trace",
);
assert.ok(
  adapter.includes("QUALITY_SPECIFICATION_KEY"),
  "adapter must persist QualitySpecification",
);

assert.ok(index.includes("runQualityAssuranceEngine"), "public index export required");
assert.ok(index.includes("QUALITY_KNOWLEDGE_ENTRIES"), "QKB export required");

assert.ok(
  pkg.includes("verify:quality-assurance"),
  "package.json verify script required",
);

console.log("EDS-007 Quality Assurance & Self-Healing architecture verified.");
