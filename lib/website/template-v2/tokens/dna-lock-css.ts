/**
 * Append DNA-lock CSS layers after base package CSS.
 */
import {
  buildHeritageDnaCss,
  buildAtelierDnaCss,
  buildNexusDnaCss,
  buildKineticDnaCss,
  buildEstatesDnaCss,
  buildForestDnaCss,
  buildPrismDnaCss,
  buildObsidianDnaCss,
  buildPulseDnaCss,
  buildForgeDnaCss,
  buildCitadelDnaCss,
  buildLuminaDnaCss,
} from "./dna-layers-all";

const DNA_CSS_BY_PACKAGE: Record<string, () => string> = {
  "education-premium": buildHeritageDnaCss,
  "ecommerce-premium": buildAtelierDnaCss,
  "saas-enterprise": buildNexusDnaCss,
  "creative-portfolio": buildKineticDnaCss,
  "real-estate-premium": buildEstatesDnaCss,
  "restaurant-signature": buildForestDnaCss,
  "prism-aurora": buildPrismDnaCss,
  "obsidian-noir": buildObsidianDnaCss,
  "pulse-fintech": buildPulseDnaCss,
  "forge-industrial": buildForgeDnaCss,
  "citadel-trust": buildCitadelDnaCss,
  "lumina-wellness": buildLuminaDnaCss,
};

export function buildDnaLockCss(packageId: string): string | null {
  const fn = DNA_CSS_BY_PACKAGE[packageId];
  return fn ? fn() : null;
}
