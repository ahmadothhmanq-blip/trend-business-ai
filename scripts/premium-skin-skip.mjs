/**
 * Shared skip registry for premium handcrafted visual skin components.
 * Used by write-distinct-template-layouts.mjs and write-premium-handcrafted-skins.mjs
 */
import { FLAGSHIP_SKIN_MANIFEST } from "./visual-skin-catalog-manifest.mjs";

/** @type {readonly string[]} */
export const PREMIUM_HANDCRAFTED_SUFFIXES = [
  "hero",
  "nav",
  "features",
  "footer",
  "about",
  "stats",
  "integrations",
  "testimonials",
  "pricing",
  "faq",
  "contact",
  "utility-band",
  "floating-cta",
  "portfolio",
  "section-shell",
];

/** @type {Set<string>} */
export const PREMIUM_HANDCRAFTED_PARTS = new Set(PREMIUM_HANDCRAFTED_SUFFIXES);

/** Skins that already have premium handcrafted components on disk (do not regenerate). */
/** @type {Set<string>} */
export const ALREADY_HANDCRAFTED_SKIN_IDS = new Set(["signal", "volt", "citadel", "ledger", "atlas", "monolith", "serenity", "haven"]);

/** All flagship skin IDs — each should use premium handcrafted parts once generated. */
/** @type {Set<string>} */
export const PREMIUM_HANDCRAFTED_SKIN_IDS = new Set(
  FLAGSHIP_SKIN_MANIFEST.map((s) => s.skinId),
);

/**
 * @param {string} skinId
 * @returns {Set<string>}
 */
export function getPremiumSkipParts(skinId) {
  if (PREMIUM_HANDCRAFTED_SKIN_IDS.has(skinId)) {
    return PREMIUM_HANDCRAFTED_PARTS;
  }
  return new Set();
}
