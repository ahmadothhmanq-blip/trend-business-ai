/**
 * Resolves legacy marketplace / premium / industry template ids to installed
 * Website Builder template package ids (V2 structure packages).
 */

import {
  getKnowledgeEntry,
  getKnowledgeRegistry,
  normalizeRoutingIndustryId,
} from "@/lib/ai-core/architecture-knowledge-base";
import { resolveStructureTemplatePackageForIndustry } from "@/lib/website/template-v2/composer/package-sector";
import { PACKAGE_SUPERSESSION_ALIASES } from "@/lib/website/builder/package-supersession-aliases";
import { isKnownStructureTemplateId } from "@/lib/website/contracts/structure-registry";
import { isVisualSkinV2PackageId } from "@/lib/website/visual-skin/theme-bridge";

export { PACKAGE_SUPERSESSION_ALIASES } from "@/lib/website/builder/package-supersession-aliases";

function isKnownRoutingIndustryId(industryId: string): boolean {
  const registry = getKnowledgeRegistry();
  const normalized = normalizeRoutingIndustryId(industryId);
  const entry = getKnowledgeEntry(normalized, registry);
  return entry?.kind === "industry";
}

const INTERNAL_GENERATION_PACKAGE_ID = "_generation-default";

/**
 * Explicit legacy premium / alias → internal generation fallback map.
 * Visual-skin V2 package ids must NEVER appear here — they resolve to themselves.
 */
export const LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP: Record<string, string> = {
  "luxury-business": INTERNAL_GENERATION_PACKAGE_ID,
  saas: INTERNAL_GENERATION_PACKAGE_ID,
  gaming: INTERNAL_GENERATION_PACKAGE_ID,
  esports: INTERNAL_GENERATION_PACKAGE_ID,
  technology: INTERNAL_GENERATION_PACKAGE_ID,
  tech: INTERNAL_GENERATION_PACKAGE_ID,
  restaurant: INTERNAL_GENERATION_PACKAGE_ID,
  "real-estate": INTERNAL_GENERATION_PACKAGE_ID,
  healthcare: INTERNAL_GENERATION_PACKAGE_ID,
  medical: INTERNAL_GENERATION_PACKAGE_ID,
  agency: INTERNAL_GENERATION_PACKAGE_ID,
  creative: INTERNAL_GENERATION_PACKAGE_ID,
  ecommerce: INTERNAL_GENERATION_PACKAGE_ID,
  hotel: INTERNAL_GENERATION_PACKAGE_ID,
  tourism: INTERNAL_GENERATION_PACKAGE_ID,
  hospitality: INTERNAL_GENERATION_PACKAGE_ID,
  resort: INTERNAL_GENERATION_PACKAGE_ID,
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
    if (isVisualSkinV2PackageId(legacyId)) {
      throw new Error(
        `LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP must not remap visual-skin package "${legacyId}"`,
      );
    }
    if (!isKnownStructureTemplateId(packageId)) {
      throw new Error(
        `LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP maps "${legacyId}" to unknown package "${packageId}"`,
      );
    }
  }
}

export function getLegacyBuilderTemplatePackageMap(): Readonly<Record<string, string>> {
  ensureLegacyMapConsistency();
  return LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP;
}

/** @deprecated No-op — legacy map is static. Kept for existing tests. */
export function resetLegacyPremiumTemplatePackageMapForTests(): void {}

export function resolveBuilderTemplatePackageId(rawId: string): string {
  ensureLegacyMapConsistency();

  const id = rawId.trim();
  if (!id) return id;

  const superseded = PACKAGE_SUPERSESSION_ALIASES[id];
  if (superseded) {
    return superseded;
  }

  // Visual-skin flagship packages always resolve to themselves — never
  // `_generation-default`, even when absent from the structure index.
  if (isVisualSkinV2PackageId(id)) {
    return id;
  }

  if (isKnownStructureTemplateId(id)) {
    return id;
  }

  const legacyPackageId = LEGACY_BUILDER_TEMPLATE_PACKAGE_MAP[id];
  if (legacyPackageId) {
    return legacyPackageId;
  }

  const industryPackageId = isKnownRoutingIndustryId(id)
    ? resolveStructureTemplatePackageForIndustry(id)
    : id;
  return id;
}

/**
 * Resolve to an on-disk installed template package id.
 * Flagship V2 skins and superseded aliases bypass the generation fallback remap.
 */
export function resolveInstalledBuilderTemplatePackageId(rawId: string): string {
  const id = rawId.trim();
  if (!id) return id;

  const superseded = PACKAGE_SUPERSESSION_ALIASES[id];
  const normalized = superseded ?? id;

  if (isVisualSkinV2PackageId(normalized)) {
    return normalized;
  }

  return resolveBuilderTemplatePackageId(id);
}
