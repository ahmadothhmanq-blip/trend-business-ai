import { PORTFOLIO_GENERATORS } from "../layout-generators/portfolio.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumPortfolio(entry, layoutKey) {
  const fn = PORTFOLIO_GENERATORS[layoutKey] ?? PORTFOLIO_GENERATORS["saas-customers"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
