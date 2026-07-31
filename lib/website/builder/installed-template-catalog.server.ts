import { initializeWbTemplateEngine } from "@/lib/website/template-engine/index.server";
import type { WbTemplateListItem } from "@/lib/website/template-engine/types";
import {
  mapListItemToStructureTemplate,
  mapListItemToStructureTemplateChoice,
  toStructureTemplateChoice,
  type WebsiteStructureTemplateChoice,
} from "@/lib/website/builder/template-catalog";
import type { WebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";
import { WEBSITE_STRUCTURE_TEMPLATE_INDEX } from "@/lib/website/builder/template-package-index";

export async function listInstalledTemplateCatalogItems(): Promise<WbTemplateListItem[]> {
  const engine = await initializeWbTemplateEngine();
  return engine.listTemplates();
}

export async function listWebsiteStructureTemplatesFromEngine(): Promise<
  WebsiteStructureTemplate[]
> {
  const items = await listInstalledTemplateCatalogItems();
  return items.map((item) => mapListItemToStructureTemplate(item));
}

export async function getWebsiteStructureTemplateFromEngine(
  id: string,
): Promise<WebsiteStructureTemplate | undefined> {
  const normalizedId = id.trim();
  if (!normalizedId) {
    return undefined;
  }

  const indexed = WEBSITE_STRUCTURE_TEMPLATE_INDEX[normalizedId];
  if (indexed) {
    return indexed;
  }

  const engine = await initializeWbTemplateEngine();
  const items = await engine.listTemplates();
  const listItem = items.find((item) => item.id === normalizedId);
  return listItem ? mapListItemToStructureTemplate(listItem) : undefined;
}

export async function getWebsiteStructureTemplateChoiceFromEngine(
  id: string,
): Promise<WebsiteStructureTemplateChoice | undefined> {
  const normalizedId = id.trim();
  if (!normalizedId) {
    return undefined;
  }

  const indexed = WEBSITE_STRUCTURE_TEMPLATE_INDEX[normalizedId];
  const engine = await initializeWbTemplateEngine();
  const items = await engine.listTemplates();
  const listItem = items.find((item) => item.id === normalizedId);

  if (listItem) {
    return mapListItemToStructureTemplateChoice(listItem);
  }

  if (indexed) {
    return toStructureTemplateChoice(indexed);
  }

  return undefined;
}
