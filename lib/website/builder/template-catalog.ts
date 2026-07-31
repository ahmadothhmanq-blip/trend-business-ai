import type { WbTemplateListItem } from "@/lib/website/template-engine/types";
import type { WbTemplateRuntimeModel } from "@/lib/website/template-renderer-contract/types";
import type { WebsiteStructureTemplate } from "@/lib/website/builder/structure-templates";
import { WEBSITE_STRUCTURE_TEMPLATE_INDEX } from "@/lib/website/builder/template-package-index";
import {
  BUILDER_DEFAULT_STRUCTURE_TEMPLATE_INTELLIGENCE_ID,
  mapPackageManifestToStructureTemplate,
} from "@/lib/website/builder/template-catalog-mapping";

export {
  BUILDER_DEFAULT_STRUCTURE_TEMPLATE_INTELLIGENCE_ID,
  mapPackageManifestToStructureTemplate,
};

export type WebsiteStructureTemplateChoice = WebsiteStructureTemplate & {
  components: string[];
  /** New template system package id (same as `id` for installed packages). */
  templatePackageId: string;
};

export function mapListItemToStructureTemplate(
  item: WbTemplateListItem,
): WebsiteStructureTemplate {
  const indexed = WEBSITE_STRUCTURE_TEMPLATE_INDEX[item.id];
  if (indexed) {
    return indexed;
  }

  return {
    id: item.id,
    label: item.name,
    description: item.description,
    industry: item.category,
    layoutType: item.layout,
    heroType: "region-based",
    navigationType: "header-region",
    footerType: "footer-region",
    sections: [],
    templateIntelligenceId: BUILDER_DEFAULT_STRUCTURE_TEMPLATE_INTELLIGENCE_ID,
    marketplaceTemplateId: "",
    premiumTemplateId: item.id,
  };
}

export function extractAllowedComponentsFromRuntimeModel(
  model: WbTemplateRuntimeModel,
): string[] {
  const mainRegion =
    model.regions.main ??
    Object.values(model.regions).find((region) => region.role === "main");

  if (!mainRegion) {
    return [];
  }

  return [...mainRegion.placement.allowedComponentTypes].sort((a, b) =>
    a.localeCompare(b),
  );
}

export function toStructureTemplateChoice(
  template: WebsiteStructureTemplate,
  components: string[] = [],
): WebsiteStructureTemplateChoice {
  return {
    ...template,
    components,
    templatePackageId: template.id,
  };
}

export function isLegacyMarketplaceStructureTemplate(
  choice: Pick<WebsiteStructureTemplateChoice, "marketplaceTemplateId" | "id">,
): boolean {
  return Boolean(choice.marketplaceTemplateId.trim()) || choice.id.startsWith("_");
}

export function mapListItemToStructureTemplateChoice(
  item: WbTemplateListItem,
  components: string[] = [],
): WebsiteStructureTemplateChoice {
  return toStructureTemplateChoice(mapListItemToStructureTemplate(item), components);
}
