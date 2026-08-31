import { INTEGRATIONS_GENERATORS } from "../layout-generators/integrations.mjs";
import { premiumizeComponent } from "./premiumize.mjs";

/**
 * @param {import("../visual-skin-catalog-manifest.mjs").FlagshipSkinManifest[number]} entry
 * @param {string} layoutKey
 */
export function generatePremiumIntegrations(entry, layoutKey) {
  const fn = INTEGRATIONS_GENERATORS[layoutKey] ?? INTEGRATIONS_GENERATORS["pipeline-connectors"];
  const raw = fn({ p: entry.cssPrefix, pkg: entry.packageId, Pascal: entry.pascal });
  return premiumizeComponent(raw, entry);
}
