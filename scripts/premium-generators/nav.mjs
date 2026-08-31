import { NAV_GENERATORS } from "../layout-generators/nav.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumNav(entry, layoutKey) {
  const fn = NAV_GENERATORS[layoutKey] ?? NAV_GENERATORS["product-glass"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry, "nav");
}
