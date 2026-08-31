/**
 * Industry → structure template routing (delegates to Architecture Knowledge Base).
 */

import {
  WEBSITE_STRUCTURE_TEMPLATE_INDEX,
  WEBSITE_STRUCTURE_TEMPLATES,
} from "@/lib/website/builder/template-package-index";
import { INTERNAL_GENERATION_STRUCTURE_FALLBACK } from "@/lib/website/builder/generation-structure-fallback";
import type { WebsiteStructureTemplate } from "@/lib/website/contracts/structure";
import {
  DEFAULT_STRUCTURE_TEMPLATE_ID,
  normalizeRoutingIndustryId,
  resolveStructureTemplateIdForIndustry as resolveStructureFromAkb,
} from "@/lib/ai-core/architecture-knowledge-base";

export { normalizeRoutingIndustryId };

export function resolveStructureTemplateIdForIndustry(
  industryId: string,
): string {
  return resolveStructureFromAkb(industryId).value;
}

export function resolveStructureTemplateForIndustry(
  industryId: string,
): WebsiteStructureTemplate {
  const id = resolveStructureTemplateIdForIndustry(industryId);
  return (
    WEBSITE_STRUCTURE_TEMPLATE_INDEX[id] ??
    WEBSITE_STRUCTURE_TEMPLATE_INDEX[DEFAULT_STRUCTURE_TEMPLATE_ID] ??
    WEBSITE_STRUCTURE_TEMPLATES[0] ??
    INTERNAL_GENERATION_STRUCTURE_FALLBACK
  );
}
