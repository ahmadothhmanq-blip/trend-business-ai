export type {
  CreatorMarketplaceCategory,
  TemplateListingStatus,
  TemplatePriceModel,
  TemplateCommerceMeta,
  TemplateReviewSummary,
  TemplateAnalyticsStub,
  MarketplaceCreatorProfile,
  TemplateVersion,
  CreatorTemplateListing,
  UploadTemplateInput,
  MarketplaceListFilters,
} from "@/lib/marketplace/templates/types";

export { toCreatorCategory } from "@/lib/marketplace/templates/types";

export {
  buildSeedCreatorListings,
  CREATOR_MARKETPLACE_CATEGORIES,
} from "@/lib/marketplace/templates/seed";

export {
  getCreatorMarketplaceCatalog,
  getCreatorMarketplaceListingDetail,
  buildTemplateHandoff,
  buildUseTemplateHref,
  useCreatorTemplate,
  favoriteCreatorTemplate,
  publishCreatorTemplate,
  versionCreatorTemplate,
  getOrCreateCreatorProfile,
  getPublicCreatorProfile,
  type TemplateHandoffPayload,
} from "@/lib/marketplace/templates/service";
