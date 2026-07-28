/**
 * Website Builder feature registry & pipeline wiring verification.
 * Usage: node scripts/verify-website-builder-features.mjs
 */
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

function mustInclude(file, needle, label) {
  const content = read(file);
  assert(
    content.includes(needle),
    `${label}: expected "${needle}" in ${file}`,
  );
}

const registryPath = "lib/website/builder/feature-registry.ts";
const constantsPath = "lib/constants/website-builder.ts";

assert(existsSync(join(root, registryPath)), "feature-registry.ts must exist");

const constants = read(constantsPath);
const idMatch = constants.match(
  /export const WEBSITE_FEATURE_IDS = \[([\s\S]*?)\] as const/,
);
assert(idMatch, "WEBSITE_FEATURE_IDS block not found");
const featureIds = [...idMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
assert(featureIds.length >= 24, `expected >= 24 feature IDs, got ${featureIds.length}`);

const registry = read(registryPath);
for (const id of featureIds) {
  assert(
    registry.includes(`id: "${id}"`),
    `registry missing definition for feature id "${id}"`,
  );
}

const aliasCases = [
  ["Authentication", "login"],
  ["Admin Panel", "dashboard"],
  ["Payments", "payment"],
  ["E-commerce", "ecommerce"],
  ["feature:blog", "blog"],
];

for (const [raw, expectedId] of aliasCases) {
  const pattern = new RegExp(
    `normalizeWebsiteFeatureId\\([^)]*\\)`,
  );
  assert(pattern.test(registry), "normalizeWebsiteFeatureId must exist");
  const aliasIndex = registry.includes(`ALIAS_INDEX`);
  assert(aliasIndex, "ALIAS_INDEX must exist for alias resolution");
  assert(
    registry.includes(`id: "${expectedId}"`),
    `expected registry entry for alias ${raw} -> ${expectedId}`,
  );
}

const pipelineChecks = [
  ["plugins/website/layers/business-idea.ts", "applyFeaturesToAnalysis"],
  ["plugins/website/layers/strategy.ts", "applyFeaturesToStrategy"],
  ["plugins/website/plan.ts", "mergeFeatureFilePlans"],
  ["plugins/website/plan.ts", "applyFeaturesToStrategy"],
  ["app/api/website-builder/stream/route.ts", "normalizeWebsiteFeatureList"],
  ["app/api/website-builder/[id]/optimize/route.ts", "preservedFeatures"],
  ["lib/ai-core/adapters/website-builder.ts", "normalizeWebsiteFeatureList"],
  ["components/dashboard/website-builder-tool.tsx", "BUILDER_PANEL_FEATURES"],
  ["lib/website/builder/index.ts", "WEBSITE_FEATURE_REGISTRY"],
];

for (const [file, needle] of pipelineChecks) {
  mustInclude(file, needle, "pipeline wiring");
}

for (const id of featureIds) {
  const marker = `\n    id: "${id}",`;
  const start = registry.indexOf(marker);
  assert(start >= 0, `registry missing id ${id}`);
  const nextEntry = registry.indexOf("\n  },\n  {", start + marker.length);
  const block = registry.slice(start, nextEntry > start ? nextEntry : start + 3000);
  assert(block.includes("aiPlanning:"), `${id} must define aiPlanning`);
  assert(block.includes("exportSupport: true"), `${id} must support export`);
  assert(block.includes("publishSupport: true"), `${id} must support publish`);
}

console.log(`Website Builder features OK (${featureIds.length} registry entries, pipeline wired).`);
