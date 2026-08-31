/**
 * Website structure templates — backed by the Template Engine package catalog.
 */

import {
  WEBSITE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATE_INDEX,
} from "@/lib/website/builder/template-package-index";
import { resolveStructureTemplateForIndustry as resolveByIndustry } from "@/lib/website/builder/industry-structure-routing";
import { resolveBuilderTemplatePackageId } from "@/lib/website/builder/resolve-builder-template-package-id";

export type { WebsiteStructureTemplateChoice } from "@/lib/website/builder/template-catalog";
import type {
  WebsiteStructureTemplate,
  WebsiteStructureTemplateId,
} from "@/lib/website/contracts/structure";

export type {
  WebsiteStructureTemplate,
  WebsiteStructureTemplateId,
} from "@/lib/website/contracts/structure";

export { WEBSITE_STRUCTURE_TEMPLATES };

import { INTERNAL_GENERATION_STRUCTURE_FALLBACK } from "@/lib/website/builder/generation-structure-fallback";

export { INTERNAL_GENERATION_STRUCTURE_FALLBACK } from "@/lib/website/builder/generation-structure-fallback";

export function getWebsiteStructureTemplate(
  id: string,
): WebsiteStructureTemplate | undefined {
  const direct = WEBSITE_STRUCTURE_TEMPLATE_INDEX[id];
  if (direct) return direct;

  const resolvedId = resolveBuilderTemplatePackageId(id);
  return (
    WEBSITE_STRUCTURE_TEMPLATE_INDEX[resolvedId] ??
    WEBSITE_STRUCTURE_TEMPLATES.find((template) => template.id === resolvedId)
  );
}

export function resolveStructureTemplateForIndustry(
  industryId: string,
): WebsiteStructureTemplate {
  return resolveByIndustry(industryId);
}
