/**
 * Resolves legacy marketplace / premium / industry template ids to installed
 * Website Builder template package ids (V2 structure packages).
 */

import { resolveStructureTemplateIdForIndustry } from "@/lib/website/builder/industry-structure-routing";
import {
  getKnowledgeEntry,
  getKnowledgeRegistry,
  normalizeRoutingIndustryId,
} from "@/lib/ai-core/architecture-knowledge-base";
import { isKnownStructureTemplateId } from "@/lib/website/contracts/structure-registry";

function isKnownRoutingIndustryId(industryId: string): boolean {
  const registry = getKnowledgeRegistry();
  const normalized = normalizeRoutingIndustryId(industryId);
  const entry = getKnowledgeEntry(normalized, registry);
  return entry?.kind === "industry";
}

/**
 * Explicit legacy premium / alias → installed package map.
 * Each legacy id maps to exactly one package (no duplicates, no last-write wins).
 */
export const LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP: Record<string, string> = {
  "luxury-business": "corporate-business",
  saas: "saas-enterprise",
  restaurant: "restaurant-premium",
  "real-estate": "real-estate-premium",
  healthcare: "medical-premium",
  medical: "medical-premium",
  agency: "creative-agency-premium",
  creative: "creative-agency-premium",
  ecommerce: "ecommerce-premium",
  hotel: "hotel-resort-premium",
  tourism: "hotel-resort-premium",
  hospitality: "hotel-resort-premium",
  resort: "hotel-resort-premium",
};

/**
 * Installed package ids superseded by flagship V2 replacements.
 * Checked before direct index lookup so legacy ids route to current flagships.
 */
export const PACKAGE_SUPERSESSION_ALIASES: Record<string, string> = {
  "modern-business": "corporate-business",
  "restaurant-signature": "restaurant-premium",
  "real-estate-prestige": "real-estate-premium",
  "creative-portfolio": "creative-agency-premium",
};

let legacyMapValidated = false;

function ensureLegacyMapConsistency(): void {
  if (legacyMapValidated) return;
  legacyMapValidated = true;

  const legacyIds = Object.keys(LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP);
  if (new Set(legacyIds).size !== legacyIds.length) {
    throw new Error("LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP contains duplicate legacy keys");
  }
  for (const [legacyId, packageId] of Object.entries(LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP)) {
    if (!isKnownStructureTemplateId(packageId)) {
      throw new Error(
        `LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP maps "${legacyId}" to unknown package "${packageId}"`,
      );
    }
  }
}

/** Read-only view of legacy mappings — for audits and tests. */
export function getLegacyBuilderTemplatePackageMap(): Readonly<Record<string, string>> {
  ensureLegacyMapConsistency();
  return LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP;
}

/** @deprecated No-op — legacy map is static. Kept for existing tests. */
export function resetLegacyPremiumTemplatePackageMapForTests(): void {}

/**
 * Normalize any builder-facing template id to an installed package id.
 * Legacy premium ids (e.g. `restaurant`) resolve to V2 packages (`restaurant-signature`).
 */
export function resolveBuilderTemplatePackageId(rawId: string): string {
  ensureLegacyMapConsistency();

  const id = rawId.trim();
  if (!id) return id;

  const superseded = PACKAGE_SUPERSESSION_ALIASES[id];
  if (superseded) {
    return superseded;
  }

  if (isKnownStructureTemplateId(id)) {
    return id;
  }

  const legacyPackageId = LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP[id];
  if (legacyPackageId) {
    return legacyPackageId;
  }

  const industryPackageId = isKnownRoutingIndustryId(id)
    ? resolveStructureTemplateIdForIndustry(id)
    : id;
  if (industryPackageId !== id && isKnownStructureTemplateId(industryPackageId)) {
    return industryPackageId;
  }

  return id;
}
