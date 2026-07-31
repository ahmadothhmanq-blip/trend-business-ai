import type { ArchitectureValidationTraceEntry } from "@/lib/ai-core/architecture-validation/types";
import type { IndustryLayoutFamily } from "@/lib/website/builder/industry-layout-policy";
import {
  getAllowedLayoutFamilies,
  isLayoutFamilyAllowed as akbIsLayoutFamilyAllowed,
} from "@/lib/ai-core/architecture-knowledge-base";
import { layoutTaxonomy } from "@/lib/ai-core/architecture-knowledge-base/catalog";

/** @deprecated Query Architecture Knowledge Base via validation engine. */
export const EDITORIAL_LAYOUT_STRUCTURES = new Set(
  layoutTaxonomy().editorialLayoutStructures,
);

/** @deprecated Query Architecture Knowledge Base via validation engine. */
export const EDITORIAL_PAGE_TOPOLOGIES = new Set(
  layoutTaxonomy().editorialPageTopologies,
);

/** @deprecated Built dynamically from AKB — use getAllowedLayoutFamilies(). */
export const ALLOWED_LAYOUT_FAMILIES: Record<string, IndustryLayoutFamily[]> =
  {};

/** @deprecated Use isForbiddenStructureTemplate() from AKB. */
export const FORBIDDEN_STRUCTURE_BY_INDUSTRY: Record<string, string[]> = {};

/** @deprecated Use isForbiddenPremiumTemplate() from AKB. */
export const FORBIDDEN_PREMIUM_BY_INDUSTRY: Record<string, string[]> = {};

export function allowedFamiliesForIndustry(
  industryId: string,
): IndustryLayoutFamily[] {
  return getAllowedLayoutFamilies(industryId) as IndustryLayoutFamily[];
}

export function isLayoutFamilyAllowed(
  industryId: string,
  layoutFamily: IndustryLayoutFamily,
): boolean {
  return akbIsLayoutFamilyAllowed(industryId, layoutFamily);
}

export function traceEntry(
  ruleId: string,
  category: ArchitectureValidationTraceEntry["category"],
  passed: boolean,
  severity: "error" | "warning",
  message: string,
  knowledgeEntryId?: string,
): ArchitectureValidationTraceEntry {
  return {
    ruleId,
    category,
    passed,
    severity,
    message,
    knowledgeEntryId,
  };
}
