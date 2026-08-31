import { FOOTER_GENERATORS } from "../layout-generators/footer.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumFooter(entry, layoutKey) {
  const fn = FOOTER_GENERATORS[layoutKey] ?? FOOTER_GENERATORS["dark-split"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry, "footer");
}
