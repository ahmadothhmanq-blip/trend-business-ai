import { FLOATING_CTA_GENERATORS } from "../layout-generators/floating-cta.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumFloatingCta(entry, layoutKey) {
  const fn = FLOATING_CTA_GENERATORS[layoutKey] ?? FLOATING_CTA_GENERATORS["saas-dock"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
