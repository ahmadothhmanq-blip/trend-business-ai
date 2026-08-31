/**
 * Unified website template registry — user-facing structure template catalog.
 *
 * No user-facing templates are published; generation uses internal fallback routing.
 */

import type { WebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";

/** Installed active V2 packages — none published to users. */
export const ACTIVE_STRUCTURE_TEMPLATES: WebsiteStructureTemplate[] = [];

/** Legacy alias ids — none while the catalog is empty. */
export const ALIAS_STRUCTURE_TEMPLATES: WebsiteStructureTemplate[] = [];

/** Full user-facing catalog. */
export const WEBSITE_STRUCTURE_TEMPLATES: WebsiteStructureTemplate[] = [];

export const WEBSITE_STRUCTURE_TEMPLATE_INDEX: Record<string, WebsiteStructureTemplate> =
  Object.fromEntries(WEBSITE_STRUCTURE_TEMPLATES.map((template) => [template.id, template]));

export function getWebsiteStructureTemplateFromRegistry(
  id: string,
): WebsiteStructureTemplate | undefined {
  return WEBSITE_STRUCTURE_TEMPLATE_INDEX[id];
}

export function listV2StructureTemplates(): WebsiteStructureTemplate[] {
  return WEBSITE_STRUCTURE_TEMPLATES.filter(
    (template) => template.architectureVersion === "v2",
  );
}
