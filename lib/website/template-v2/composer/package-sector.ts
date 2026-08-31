import type { SectionRhythmSector } from "@/lib/website/template-v2/flagship/section-rhythm";
import { normalizeRoutingIndustryId } from "@/lib/ai-core/architecture-knowledge-base";
import { PACKAGE_SUPERSESSION_ALIASES } from "@/lib/website/builder/package-supersession-aliases";
import { resolveStructureTemplateIdForIndustry } from "@/lib/website/builder/industry-structure-routing";

/** Installed flagship package → section rhythm sector. */
const PACKAGE_SECTOR: Record<string, SectionRhythmSector> = {
  "corporate-business": "corporate",
  "saas-enterprise": "saas",
  "ai-startup-signal": "saas",
  "education-premium": "education",
  "finance-premium": "finance",
  "restaurant-premium": "hospitality",
  "hotel-resort-premium": "hospitality",
  "ecommerce-premium": "ecommerce",
  "medical-premium": "medical",
  "real-estate-premium": "estate",
  "creative-agency-premium": "creative",
};

const HOSPITALITY_PACKAGE_IDS = new Set([
  "restaurant-premium",
  "hotel-resort-premium",
  "restaurant-signature",
]);

const TECH_BLUEPRINT_PACKAGE_ID = "saas-enterprise";

function normalizePackageId(packageId: string): string {
  return PACKAGE_SUPERSESSION_ALIASES[packageId] ?? packageId;
}

const TECH_ROUTING_INDUSTRY_IDS = new Set([
  "gaming",
  "esports",
  "technology",
  "tech",
  "saas",
  "game-studio",
  "video-games",
  "game-dev",
  "software",
  "ai-startup",
]);

export function resolvePackageSector(packageId?: string | null): SectionRhythmSector | "general" {
  const id = packageId?.trim();
  if (!id) return "general";
  const resolved = normalizePackageId(id);
  return PACKAGE_SECTOR[resolved] ?? "general";
}

export function isHospitalityPackage(packageId?: string | null): boolean {
  const id = packageId?.trim();
  if (!id) return false;
  return HOSPITALITY_PACKAGE_IDS.has(normalizePackageId(id));
}

export function isTechRoutingIndustry(industryId?: string | null): boolean {
  const normalized = normalizeRoutingIndustryId(industryId ?? "");
  return TECH_ROUTING_INDUSTRY_IDS.has(normalized);
}

/**
 * Resolve structure package for an industry — tech/gaming never routes to hospitality flagships.
 */
export function resolveStructureTemplatePackageForIndustry(industryId: string): string {
  const normalized = normalizeRoutingIndustryId(industryId);
  const fromAkb = normalizePackageId(
    resolveStructureTemplateIdForIndustry(normalized),
  );

  if (isTechRoutingIndustry(normalized)) {
    return isHospitalityPackage(fromAkb) ? TECH_BLUEPRINT_PACKAGE_ID : fromAkb;
  }

  return fromAkb;
}

export function resolveTechBlueprintPackageId(): string {
  return TECH_BLUEPRINT_PACKAGE_ID;
}
