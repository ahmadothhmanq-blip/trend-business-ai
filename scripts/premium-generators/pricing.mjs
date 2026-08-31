import { PRICING_GENERATORS } from "../layout-generators/pricing.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumPricing(entry, layoutKey) {
  const fn = PRICING_GENERATORS[layoutKey] ?? PRICING_GENERATORS["three-column-cards"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
