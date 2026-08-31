import { CONTACT_GENERATORS } from "../layout-generators/contact.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumContact(entry, layoutKey) {
  const fn = CONTACT_GENERATORS[layoutKey] ?? CONTACT_GENERATORS["demo-request"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
