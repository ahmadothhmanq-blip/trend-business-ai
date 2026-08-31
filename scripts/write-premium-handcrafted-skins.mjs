/**
 * Write premium handcrafted React components for visual skin templates.
 *
 * Usage:
 *   node scripts/write-premium-handcrafted-skins.mjs
 *   node scripts/write-premium-handcrafted-skins.mjs --skin=ledger
 *   node scripts/write-premium-handcrafted-skins.mjs ledger
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";
import { SKIN_LAYOUT_DNA } from "./layout-dna.mjs";
import {
  ALREADY_HANDCRAFTED_SKIN_IDS,
  PREMIUM_HANDCRAFTED_SUFFIXES,
} from "./premium-skin-skip.mjs";
import { generatePremiumHero } from "./premium-generators/heroes.mjs";
import { generatePremiumFeatures } from "./premium-generators/features.mjs";
import { generatePremiumNav } from "./premium-generators/nav.mjs";
import { generatePremiumFooter } from "./premium-generators/footer.mjs";
import { generatePremiumTestimonials } from "./premium-generators/testimonials.mjs";
import { generatePremiumPricing } from "./premium-generators/pricing.mjs";
import { generatePremiumAbout } from "./premium-generators/about.mjs";
import { generatePremiumContact } from "./premium-generators/contact.mjs";
import { generatePremiumStats } from "./premium-generators/stats.mjs";
import { generatePremiumFaq } from "./premium-generators/faq.mjs";
import { generatePremiumPortfolio } from "./premium-generators/portfolio.mjs";
import { generatePremiumIntegrations } from "./premium-generators/integrations.mjs";
import { generatePremiumFloatingCta } from "./premium-generators/floating-cta.mjs";
import { generatePremiumUtilityBand } from "./premium-generators/utility-band.mjs";
import { generateSectionShell } from "./layout-generators/section-shell.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.join(__dirname, "..", "templates", "website");

/** @type {Record<string, (entry: import("./visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number], layoutKey: string) => string>} */
const PART_GENERATORS = {
  hero: (entry, layoutKey) => generatePremiumHero(entry, layoutKey),
  features: generatePremiumFeatures,
  nav: generatePremiumNav,
  footer: generatePremiumFooter,
  testimonials: generatePremiumTestimonials,
  pricing: generatePremiumPricing,
  about: generatePremiumAbout,
  contact: generatePremiumContact,
  stats: generatePremiumStats,
  faq: generatePremiumFaq,
  portfolio: generatePremiumPortfolio,
  integrations: generatePremiumIntegrations,
  "floating-cta": generatePremiumFloatingCta,
  "utility-band": generatePremiumUtilityBand,
  "section-shell": (entry, layoutKey) => generateSectionShell(entry, layoutKey),
};

/** @type {Record<string, keyof typeof SKIN_LAYOUT_DNA[string]>} */
const SUFFIX_TO_DNA_KEY = {
  hero: "hero",
  features: "features",
  nav: "nav",
  footer: "footer",
  testimonials: "testimonials",
  pricing: "pricing",
  about: "about",
  contact: "contact",
  stats: "stats",
  faq: "faq",
  portfolio: "portfolio",
  integrations: "integrations",
  "floating-cta": "floatingCta",
  "utility-band": "utilityBand",
  "section-shell": "sectionShell",
};

/**
 * @param {import("./visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} suffix
 * @param {string} content
 */
async function writeComponent(entry, suffix, content) {
  const dir = path.join(websiteRoot, entry.packageId, "components");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${entry.packageId}-${suffix}.tsx`);
  await writeFile(file, content, "utf8");
  return file;
}

/**
 * @param {string} skinId
 * @returns {Promise<string[]>}
 */
export async function writePremiumSkin(skinId) {
  const entry = FLAGSHIP_SKIN_MANIFEST.find((s) => s.skinId === skinId);
  if (!entry) {
    throw new Error(`Unknown skin: ${skinId}`);
  }
  if (ALREADY_HANDCRAFTED_SKIN_IDS.has(skinId)) {
    console.log(`skip ${skinId} (already handcrafted on disk)`);
    return [];
  }

  const dna = SKIN_LAYOUT_DNA[skinId];
  if (!dna) {
    throw new Error(`No layout DNA for skin: ${skinId}`);
  }

  console.log(`\nWriting premium components for ${entry.skinId} → ${entry.packageId}\n`);
  const written = [];

  for (const suffix of PREMIUM_HANDCRAFTED_SUFFIXES) {
    const dnaKey = SUFFIX_TO_DNA_KEY[suffix];
    const layoutKey = dna[dnaKey];
    const generator = PART_GENERATORS[suffix];
    if (!generator || !layoutKey) {
      console.warn(`skip ${suffix}: missing generator or DNA key`);
      continue;
    }

    const content = generator(entry, layoutKey);
    const filePath = await writeComponent(entry, suffix, content);
    written.push(filePath);
    console.log(`${suffix} [${layoutKey}]: ${path.relative(path.join(__dirname, ".."), filePath)}`);
  }

  console.log(`\nDone — ${entry.skinId} (${entry.packageId}): ${written.length} files`);
  return written;
}

/**
 * @returns {string | null}
 */
function parseSkinFilter() {
  const flagArg = process.argv.find((a) => a.startsWith("--skin="));
  if (flagArg) return flagArg.slice("--skin=".length);
  const positional = process.argv[2];
  if (positional && !positional.startsWith("-")) return positional;
  return null;
}

async function main() {
  const skinFilter = parseSkinFilter();
  const targets = skinFilter
    ? FLAGSHIP_SKIN_MANIFEST.filter((e) => e.skinId === skinFilter || e.packageId === skinFilter)
    : FLAGSHIP_SKIN_MANIFEST.filter((e) => !ALREADY_HANDCRAFTED_SKIN_IDS.has(e.skinId));

  if (skinFilter && targets.length === 0) {
    console.error(`Unknown skin filter: ${skinFilter}`);
    process.exit(1);
  }

  const allWritten = [];
  for (const entry of targets) {
    const files = await writePremiumSkin(entry.skinId);
    allWritten.push(...files);
  }

  const scope = skinFilter ? `skin ${skinFilter}` : `${targets.length} skins`;
  console.log(`\nPremium handcrafted components written for ${scope} (${allWritten.length} files total).`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
