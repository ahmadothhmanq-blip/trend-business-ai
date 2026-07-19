import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const presets = readFileSync(
  join(root, "lib/ai-core/design-renderer/presets.ts"),
  "utf8",
);
const components = readFileSync(
  join(root, "lib/ai-core/design-renderer/components.ts"),
  "utf8",
);
const render = readFileSync(
  join(root, "lib/ai-core/design-renderer/render.ts"),
  "utf8",
);
const adapter = readFileSync(
  join(root, "lib/ai-core/adapters/website-builder.ts"),
  "utf8",
);

let ok = true;
function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL", msg);
    ok = false;
  }
}

assert(presets.includes("tourism:"), "tourism preset");
assert(presets.includes("HeroFullBleed"), "tourism hero");
assert(presets.includes("DestinationsGallery"), "destinations gallery");
assert(presets.includes("TourPackagesGrid"), "tour packages");
assert(presets.includes("BookingSection"), "booking section");
assert(presets.includes("TravelCtaBand"), "travel CTA");

assert(presets.includes("automotive:"), "automotive preset");
assert(presets.includes("HeroLuxuryShowcase"), "luxury hero");
assert(presets.includes("VehicleShowcase"), "vehicle showcase");
assert(presets.includes("InventoryGrid"), "inventory");
assert(presets.includes("BranchesMap"), "branches");

assert(presets.includes('"real-estate"') || presets.includes("real-estate:"), "real estate");
assert(presets.includes("HeroProperty"), "property hero");
assert(presets.includes("PropertyListings"), "listings");
assert(presets.includes("LocationSections"), "location sections");

assert(presets.includes("saas:"), "saas preset");
assert(presets.includes("HeroProduct"), "product hero");
assert(presets.includes("FeaturesBento"), "features");
assert(presets.includes("PricingTable"), "pricing");
assert(presets.includes("IntegrationsLogoCloud"), "integrations");
assert(presets.includes("FaqAccordion"), "faq");

assert(components.includes("components/sections/hero-full-bleed.tsx"), "hero path");
assert(render.includes("export function renderWebsiteDesign"), "render export");
assert(adapter.includes("applyDesignRenderer"), "adapter wired");
assert(adapter.includes("designRenderComponentPaths"), "plan paths wired");

if (!ok) process.exit(1);
console.log("PASS design renderer smoke");
