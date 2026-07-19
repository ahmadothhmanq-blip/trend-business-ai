export type {
  ComponentMarketplaceCategory,
  ComponentIndustryPack,
  ComponentStyleVariant,
  ComponentConfigOption,
  ComponentResponsiveBehavior,
  MarketplaceComponent,
  ComponentMarketplaceFilters,
} from "@/lib/ai-core/component-marketplace/types";

export {
  COMPONENT_MARKETPLACE_CATEGORIES,
  COMPONENT_INDUSTRY_PACKS,
  COMPONENT_MARKETPLACE_CATALOG,
  COMPONENT_STYLE_VARIANTS,
  listMarketplaceComponents,
  getMarketplaceComponent,
  listComponentsByIndustry,
} from "@/lib/ai-core/component-marketplace/catalog";

export { buildComponentPreviewHtml } from "@/lib/ai-core/component-marketplace/preview";
