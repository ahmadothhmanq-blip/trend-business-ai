/**
 * Ensure portfolio component is in homeFlow for flagship templates.
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Skins where portfolio should appear early (after features). */
const EARLY_PORTFOLIO_SKINS = new Set(["kinetic"]);

for (const skin of FLAGSHIP_SKIN_MANIFEST) {
  const presentationPath = path.join(
    root,
    "templates",
    "website",
    skin.packageId,
    "presentation",
    "presentation.json",
  );
  const raw = await readFile(presentationPath, "utf8");
  const json = JSON.parse(raw);
  const portfolioId = `${skin.packageId}-portfolio`;
  const main = json.homeFlow?.regions?.main ?? [];
  if (main.includes(portfolioId)) continue;

  if (EARLY_PORTFOLIO_SKINS.has(skin.skinId)) {
    const featuresIdx = main.indexOf(`${skin.packageId}-features`);
    if (featuresIdx >= 0) {
      main.splice(featuresIdx + 1, 0, portfolioId);
    } else {
      main.push(portfolioId);
    }
  } else {
    const testimonialsIdx = main.indexOf(`${skin.packageId}-testimonials`);
    const pricingIdx = main.indexOf(`${skin.packageId}-pricing`);
    if (testimonialsIdx >= 0) {
      main.splice(testimonialsIdx + 1, 0, portfolioId);
    } else if (pricingIdx >= 0) {
      main.splice(pricingIdx, 0, portfolioId);
    } else {
      main.push(portfolioId);
    }
  }

  json.homeFlow.regions.main = main;
  await writeFile(presentationPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  console.log(`updated ${skin.skinId}: added ${portfolioId}`);
}
