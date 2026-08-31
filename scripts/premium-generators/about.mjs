import { ABOUT_GENERATORS } from "../layout-generators/about.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumAbout(entry, layoutKey) {
  const fn = ABOUT_GENERATORS[layoutKey] ?? ABOUT_GENERATORS["saas-origin"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
