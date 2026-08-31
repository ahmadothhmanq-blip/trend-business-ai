import { FAQ_GENERATORS } from "../layout-generators/faq.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumFaq(entry, layoutKey) {
  const fn = FAQ_GENERATORS[layoutKey] ?? FAQ_GENERATORS["saas-faq"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
