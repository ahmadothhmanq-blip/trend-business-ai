/**
 * Website structure templates — backed by the Template Engine package catalog.
 */

import {
  WEBSITE_STRUCTURE_TEMPLATES,
  WEBSITE_STRUCTURE_TEMPLATE_INDEX,
} from "@/lib/website/builder/template-package-index";
import { resolveStructureTemplateForIndustry as resolveByIndustry } from "@/lib/website/builder/industry-structure-routing";

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

/**
 * Internal generation fallback when no template package is installed or selected.
 * Not listed in WEBSITE_STRUCTURE_TEMPLATES and not shown in the builder UI.
 */
const INTERNAL_GENERATION_STRUCTURE_FALLBACK: WebsiteStructureTemplate = {
  id: "_generation-default",
  label: "Default",
  description: "Internal generation fallback",
  industry: "business",
  layoutType: "corporate-trust",
  heroType: "split corporate hero",
  navigationType: "corporate topbar",
  footerType: "enterprise links",
  sections: [],
  templateIntelligenceId: "ti-corporate-trust",
  marketplaceTemplateId: "",
  premiumTemplateId: "luxury-business",
};

export function getWebsiteStructureTemplate(
  id: string,
): WebsiteStructureTemplate | undefined {
  return (
    WEBSITE_STRUCTURE_TEMPLATE_INDEX[id] ??
    WEBSITE_STRUCTURE_TEMPLATES.find((template) => template.id === id)
  );
}

export function resolveStructureTemplateForIndustry(
  industryId: string,
): WebsiteStructureTemplate {
  return resolveByIndustry(industryId);
}
