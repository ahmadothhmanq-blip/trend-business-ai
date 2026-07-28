/**
 * Template DNA verification — ensures templates differ in layout, not just colors.
 * Usage: node scripts/verify-website-template-dna.mjs
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
  assert(read(file).includes(needle), `${label}: expected "${needle}" in ${file}`);
}

const wiring = [
  ["lib/ai-core/design-intelligence/layout-selection.ts", "templateDna"],
  ["lib/ai-core/design-intelligence/analyze.ts", "applyTemplateDnaToIntelligence"],
  ["lib/ai-core/design-plan/build.ts", "buildSectionsFromTemplateDna"],
  ["lib/ai-core/design-plan/engine.ts", "templateDna"],
  ["lib/ai-core/design-renderer/render.ts", "dnaDriven"],
  ["lib/ai-core/components/inject.ts", "templateVisualCss"],
  ["plugins/website/generate.ts", "buildTemplateVisualCss"],
  ["lib/ai-core/template-intelligence/template-dna.ts", "ti-automotive-corporate"],
  ["lib/ai-core/template-intelligence/catalog.ts", "ti-automotive-modern"],
];

for (const [file, needle] of wiring) {
  assert(existsSync(join(root, file)), `${file} must exist`);
  mustInclude(file, needle, "pipeline wiring");
}

const catalog = read("lib/ai-core/template-intelligence/catalog.ts");
const automotiveIds = [
  "ti-automotive-luxury",
  "ti-automotive-corporate",
  "ti-automotive-modern",
  "ti-automotive-technology",
];
for (const id of automotiveIds) {
  assert(catalog.includes(`id: "${id}"`), `catalog missing ${id}`);
}

const dnaSource = read("lib/ai-core/template-intelligence/template-dna.ts");
const profileBlocks = [
  "AUTOMOTIVE_LUXURY",
  "AUTOMOTIVE_CORPORATE",
  "AUTOMOTIVE_MODERN",
  "AUTOMOTIVE_TECHNOLOGY",
];

const profiles = profileBlocks.map((name) => {
  const start = dnaSource.indexOf(`const ${name}:`);
  assert(start >= 0, `${name} block not found`);
  const block = dnaSource.slice(start, start + 2500);
  const sectionOrderMatch = block.match(/sectionOrder:\s*\[([\s\S]*?)\],/);
  const heroMatch = block.match(/heroProfile:\s*"([^"]+)"/);
  const navMatch = block.match(/navigationProfile:\s*"([^"]+)"/);
  const layoutMatch = block.match(/layoutProfile:\s*"([^"]+)"/);
  const componentsMatch = block.match(/components:\s*comps\(([\s\S]*?)\),/);
  assert(sectionOrderMatch, `${name}: sectionOrder not found`);
  const sectionOrder = [...sectionOrderMatch[1].matchAll(/"([^"]+)"/g)].map(
    (m) => m[1],
  );
  const components = componentsMatch
    ? [...componentsMatch[1].matchAll(/"([^"]+)"/g)].map((m) => m[1])
    : [];
  return {
    id: name,
    sectionOrder,
    heroProfile: heroMatch?.[1],
    navigationProfile: navMatch?.[1],
    layoutProfile: layoutMatch?.[1],
    components,
  };
});

function allDistinct(values, label) {
  const unique = new Set(values.filter(Boolean));
  assert(
    unique.size === values.length,
    `${label}: expected all distinct, got ${JSON.stringify(values)}`,
  );
}

allDistinct(
  profiles.map((p) => p.heroProfile),
  "automotive heroProfile",
);
allDistinct(
  profiles.map((p) => p.navigationProfile),
  "automotive navigationProfile",
);
allDistinct(
  profiles.map((p) => p.layoutProfile),
  "automotive layoutProfile",
);
allDistinct(
  profiles.map((p) => p.sectionOrder.join("|")),
  "automotive sectionOrder",
);
allDistinct(
  profiles.map((p) => p.components.join("|")),
  "automotive components",
);

console.log("verify-website-template-dna: OK");
for (const p of profiles) {
  console.log(
    `  ${p.id}: hero=${p.heroProfile} · nav=${p.navigationProfile} · ${p.sectionOrder.length} sections · ${p.components.length} components`,
  );
}
