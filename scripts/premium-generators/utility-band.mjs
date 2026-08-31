import { UTILITY_BAND_GENERATORS } from "../layout-generators/utility-band.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumUtilityBand(entry, layoutKey) {
  const fn = UTILITY_BAND_GENERATORS[layoutKey] ?? UTILITY_BAND_GENERATORS["saas-pipeline-band"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
