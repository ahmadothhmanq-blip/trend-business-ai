/**
 * Industry isolation — travel must not resolve to automotive palette/components/images.
 * Usage: node scripts/verify-website-industry-isolation.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const palettes = read("lib/ai-core/template-intelligence/industry-palettes.ts");
const promptIndustry = read("lib/ai-core/website-builder/prompt-industry.ts");
const families = read("lib/ai-core/website-design-platform/families.ts");
const sectionStrategies = read("lib/ai-core/image-engine/section-strategies.ts");

assert.ok(palettes.includes("PALETTE_TOURISM"), "PALETTE_TOURISM must exist");
assert.ok(
  palettes.includes('if (normalized === "tourism") return "tourism"'),
  "resolveVerticalPaletteId must return tourism palette for tourism industry",
);
assert.ok(
  palettes.includes("isTourismContext"),
  "isTourismContext helper must exist",
);
assert.ok(
  palettes.includes("HeroFullBleed") && palettes.includes("DestinationsGallery"),
  "tourism palette must use travel components",
);

const tourismBlock = palettes.slice(
  palettes.indexOf("PALETTE_TOURISM"),
  palettes.indexOf("PALETTE_RESTAURANT"),
);
assert.ok(
  !tourismBlock.includes("HeroLuxuryShowcase"),
  "tourism palette must not include automotive hero",
);
assert.ok(
  tourismBlock.includes("DestinationsGallery"),
  "tourism palette must include DestinationsGallery",
);
assert.ok(
  tourismBlock.includes("TourPackagesGrid"),
  "tourism palette must include TourPackagesGrid",
);

assert.ok(
  promptIndustry.includes("/\\btravel\\b/i"),
  "prompt industry detection must match bare 'travel'",
);
assert.ok(
  promptIndustry.includes("travel\\s*and\\s*tourism"),
  "prompt industry must match travel and tourism phrase",
);

assert.ok(
  families.indexOf("vertical: \"Travel\"") < families.indexOf("vertical: \"Automotive\""),
  "mapIndustryToVertical must check Travel before Automotive",
);

assert.ok(
  sectionStrategies.includes("tourism:") &&
    sectionStrategies.includes("destination landscape hero"),
  "tourism hero image briefs must exist",
);

const wiring = [
  ["lib/ai-core/template-intelligence/select.ts", "ti-travel-horizon"],
  ["lib/ai-core/components/select.ts", "HeroLuxuryShowcase"],
  ["lib/ai-core/adapters/website-builder.ts", "industryId"],
  ["lib/ai-core/image-engine/stock.ts", "tourism"],
];
for (const [file, needle] of wiring) {
  assert.ok(read(file).includes(needle), `${file} must include ${needle}`);
}

console.log("verify-website-industry-isolation: OK");
console.log("  tourism palette: HeroFullBleed, DestinationsGallery, TourPackagesGrid, BookingSection");
console.log("  travel detection: expanded keywords + tourism-before-automotive guards");
