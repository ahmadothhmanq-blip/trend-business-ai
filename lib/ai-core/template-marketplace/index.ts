export type {
  MarketplaceCategory,
  MarketplaceStyleVariation,
  MarketplaceColorSystem,
  MarketplacePreviewSection,
  MarketplaceTemplate,
  MarketplaceRecommendInput,
  MarketplaceRecommendation,
  MarketplaceRecommendResult,
} from "@/lib/ai-core/template-marketplace/types";

export {
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_TEMPLATES,
  MARKETPLACE_STYLE_VARIATIONS,
  listMarketplaceTemplates,
  getMarketplaceTemplate,
  marketplaceStyleLabel,
} from "@/lib/ai-core/template-marketplace/catalog";

export {
  recommendMarketplaceTemplates,
  resolveMarketplaceSelection,
} from "@/lib/ai-core/template-marketplace/recommend";

export { buildMarketplacePreviewHtml } from "@/lib/ai-core/template-marketplace/preview";
