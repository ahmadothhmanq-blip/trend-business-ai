/**
 * Generate structurally distinct hero + features + nav per visual skin.
 * Usage: node scripts/write-distinct-template-layouts.mjs
 */
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";
import { SKIN_LAYOUT_DNA } from "./layout-dna.mjs";
import { generateHero } from "./layout-generators/heroes.mjs";
import { generateFeatures } from "./layout-generators/features.mjs";
import { generateNav } from "./layout-generators/nav.mjs";
import { generateFooter } from "./layout-generators/footer.mjs";
import { generateTestimonials } from "./layout-generators/testimonials.mjs";
import { generatePricing } from "./layout-generators/pricing.mjs";
import { generateAbout } from "./layout-generators/about.mjs";
import { generateContact } from "./layout-generators/contact.mjs";
import { generateStats } from "./layout-generators/stats.mjs";
import { generateFaq } from "./layout-generators/faq.mjs";
import { generatePortfolio } from "./layout-generators/portfolio.mjs";
import { generateIntegrations } from "./layout-generators/integrations.mjs";
import { generateFloatingCta } from "./layout-generators/floating-cta.mjs";
import { generateUtilityBand } from "./layout-generators/utility-band.mjs";
import { generateSectionShell } from "./layout-generators/section-shell.mjs";
import { getPremiumSkipParts } from "./premium-skin-skip.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const websiteRoot = path.join(__dirname, "..", "templates", "website");

function transformContent(content, filePath, entry, sourceId, sourcePascal) {
  const { packageId, pascal, cssPrefix, oldPrefix } = entry;
  let out = content;
  out = out.replaceAll(sourceId, packageId);
  out = out.replaceAll(sourcePascal, pascal);
  if (/\.(tsx|json|css)$/i.test(filePath)) {
    out = out.replaceAll(`${oldPrefix}-`, `${cssPrefix}-`);
    out = out.replaceAll(`@${oldPrefix}-`, `@${cssPrefix}-`);
    out = out.replaceAll(`data-${oldPrefix}-`, `data-${cssPrefix}-`);
  }
  return out;
}

async function restoreMissingComponents(entry, sourceId, sourcePascal, oldPrefix) {
  const targetDir = path.join(websiteRoot, entry.packageId, "components");
  const sourceDir = path.join(websiteRoot, sourceId, "components");
  let sourceFiles = [];
  try {
    sourceFiles = (await readdir(sourceDir)).filter((f) => f.endsWith(".tsx"));
  } catch {
    return 0;
  }

  await mkdir(targetDir, { recursive: true });
  let restored = 0;

  for (const file of sourceFiles) {
    const targetName = file.replace(sourceId, entry.packageId);
    const targetPath = path.join(targetDir, targetName);
    if (targetName.endsWith("-hero.tsx")) continue;

    let exists = true;
    try {
      await readFile(targetPath, "utf8");
    } catch {
      exists = false;
    }
    if (exists) continue;

    const srcPath = path.join(sourceDir, file);
    const raw = await readFile(srcPath, "utf8");
    const transformed = transformContent(raw, targetName, { ...entry, oldPrefix }, sourceId, sourcePascal);
    await writeFile(targetPath, transformed, "utf8");
    restored += 1;
    console.log(`restored ${entry.packageId}/${targetName}`);
  }

  return restored;
}

async function writeComponent(entry, suffix, content) {
  const dir = path.join(websiteRoot, entry.packageId, "components");
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `${entry.packageId}-${suffix}.tsx`);
  await writeFile(file, content, "utf8");
  return file;
}

async function regenerateEntry(entry) {
  const dna = SKIN_LAYOUT_DNA[entry.skinId];
  if (!dna) {
    console.warn(`skip ${entry.skinId}: no layout DNA`);
    return;
  }

  const skipParts = getPremiumSkipParts(entry.skinId);

  async function writeUnlessSkipped(suffix, layoutKey, generator) {
    if (skipParts.has(suffix)) {
      console.log(`${suffix} skip ${entry.skinId} (custom on disk): ${entry.packageId}`);
      return;
    }
    await writeComponent(entry, suffix, generator(entry, layoutKey));
    console.log(`${suffix} [${layoutKey}]: ${entry.packageId}`);
  }

  const skipHero = entry.skinId === "atlas" || skipParts.has("hero");
  if (!skipHero) {
    await writeComponent(entry, "hero", generateHero(entry, dna.hero));
    console.log(`hero [${dna.hero}]: ${entry.packageId}`);
  } else {
    console.log(`hero skip ${entry.skinId} (custom hero on disk): ${entry.packageId}`);
  }

  await writeUnlessSkipped("features", dna.features, generateFeatures);
  await writeUnlessSkipped("nav", dna.nav, generateNav);
  await writeUnlessSkipped("footer", dna.footer, generateFooter);
  await writeUnlessSkipped("testimonials", dna.testimonials, generateTestimonials);
  await writeUnlessSkipped("pricing", dna.pricing, generatePricing);
  await writeUnlessSkipped("about", dna.about, generateAbout);
  await writeUnlessSkipped("contact", dna.contact, generateContact);
  await writeUnlessSkipped("stats", dna.stats, generateStats);
  await writeUnlessSkipped("faq", dna.faq, generateFaq);
  await writeUnlessSkipped("portfolio", dna.portfolio, generatePortfolio);
  await writeUnlessSkipped("integrations", dna.integrations, generateIntegrations);
  await writeUnlessSkipped("floating-cta", dna.floatingCta, generateFloatingCta);
  await writeUnlessSkipped("utility-band", dna.utilityBand, generateUtilityBand);
  await writeUnlessSkipped("section-shell", dna.sectionShell, generateSectionShell);
}

/** Restore original layout-generator components (ignores premium skip registry). */
export async function restoreSkinFromLayouts(skinId) {
  const entry = FLAGSHIP_SKIN_MANIFEST.find((s) => s.skinId === skinId || s.packageId === skinId);
  if (!entry) throw new Error(`Unknown skin: ${skinId}`);

  const dna = SKIN_LAYOUT_DNA[entry.skinId];
  if (!dna) throw new Error(`No layout DNA for skin: ${entry.skinId}`);

  console.log(`\nRestoring layout-generator components for ${entry.skinId} → ${entry.packageId}\n`);

  const skipParts = new Set();

  async function writeUnlessSkipped(suffix, layoutKey, generator) {
    if (skipParts.has(suffix)) return;
    await writeComponent(entry, suffix, generator(entry, layoutKey));
    console.log(`${suffix} [${layoutKey}]: ${entry.packageId}`);
  }

  const skipHero = entry.skinId === "atlas";
  if (!skipHero) {
    await writeComponent(entry, "hero", generateHero(entry, dna.hero));
    console.log(`hero [${dna.hero}]: ${entry.packageId}`);
  }

  await writeUnlessSkipped("features", dna.features, generateFeatures);
  await writeUnlessSkipped("nav", dna.nav, generateNav);
  await writeUnlessSkipped("footer", dna.footer, generateFooter);
  await writeUnlessSkipped("testimonials", dna.testimonials, generateTestimonials);
  await writeUnlessSkipped("pricing", dna.pricing, generatePricing);
  await writeUnlessSkipped("about", dna.about, generateAbout);
  await writeUnlessSkipped("contact", dna.contact, generateContact);
  await writeUnlessSkipped("stats", dna.stats, generateStats);
  await writeUnlessSkipped("faq", dna.faq, generateFaq);
  await writeUnlessSkipped("portfolio", dna.portfolio, generatePortfolio);
  await writeUnlessSkipped("integrations", dna.integrations, generateIntegrations);
  await writeUnlessSkipped("floating-cta", dna.floatingCta, generateFloatingCta);
  await writeUnlessSkipped("utility-band", dna.utilityBand, generateUtilityBand);
  await writeUnlessSkipped("section-shell", dna.sectionShell, generateSectionShell);

  console.log(`\nRestored — ${entry.skinId} (${entry.packageId})`);
}

export async function regenerateSkin(skinId) {
  const entry = FLAGSHIP_SKIN_MANIFEST.find((s) => s.skinId === skinId);
  if (!entry) throw new Error(`Unknown skin: ${skinId}`);
  console.log(`\nRegenerating layouts for ${entry.skinId} → ${entry.packageId}\n`);
  await regenerateEntry(entry);
  console.log(`\nDone — ${entry.skinId} (${entry.packageId})`);
}

async function main() {
  const args = process.argv.slice(2);
  const restoreFlag = args.includes("--restore");
  const skinFilter = args.find((a) => a.startsWith("--skin="))?.slice("--skin=".length)
    ?? args.find((a) => !a.startsWith("-") && a !== "restore");

  if (restoreFlag) {
    if (!skinFilter) {
      console.error("Usage: node scripts/write-distinct-template-layouts.mjs --restore <skinId>");
      process.exit(1);
    }
    await restoreSkinFromLayouts(skinFilter);
    return;
  }

  const skinFilterNormal = skinFilter;

  let restoredTotal = 0;

  if (!skinFilterNormal || skinFilterNormal === "signal" || skinFilterNormal === "ai-startup-signal") {
    for (const entry of FLAGSHIP_SKIN_MANIFEST) {
      if (entry.packageId === "ai-startup-signal") {
        restoredTotal += await restoreMissingComponents(
          { ...entry, oldPrefix: "se" },
          "saas-enterprise",
          "SaasEnterprise",
          "se",
        );
      }
    }
  }

  if (restoredTotal > 0) {
    console.log(`Restored ${restoredTotal} missing component(s) for ai-startup-signal`);
  }

  const targets = skinFilterNormal
    ? FLAGSHIP_SKIN_MANIFEST.filter((e) => e.skinId === skinFilterNormal || e.packageId === skinFilterNormal)
    : FLAGSHIP_SKIN_MANIFEST;
  if (skinFilterNormal && targets.length === 0) {
    console.error(`Unknown skin filter: ${skinFilter}`);
    process.exit(1);
  }

  for (const entry of targets) {
    await regenerateEntry(entry);
  }

  const scope = skinFilterNormal ? `skin ${skinFilterNormal}` : "20 skins";
  console.log(`\nDone — distinct layouts for ${scope} across all 15 component types.`);
}

const isDirectRun = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url));
if (isDirectRun) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
