/**
 * Website Builder Template Marketplace — client-safe exports.
 *
 * Types, constants, adapters, remote metadata, and pure search helpers.
 * Server registry/catalog APIs live in `index.server.ts`.
 */

export {
  WB_TEMPLATE_MARKETPLACE_VERSION,
  WB_TEMPLATE_MARKETPLACE_CATEGORIES,
  WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS,
  WB_TEMPLATE_MARKETPLACE_SORT_FIELDS,
  WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
} from "@/lib/website/template-marketplace/constants";

export type {
  WbTemplateMarketplaceSource,
  WbTemplateMarketplaceAvailability,
  WbTemplateMarketplaceAuthor,
  WbTemplateMarketplaceMetadata,
  WbTemplateMarketplaceRemoteRef,
  WbTemplateMarketplaceListing,
  WbTemplateMarketplaceSortField,
  WbTemplateMarketplaceSortDirection,
  WbTemplateMarketplaceSort,
  WbTemplateMarketplaceFilters,
  WbTemplateMarketplaceFacetCount,
  WbTemplateMarketplaceFacets,
  WbTemplateMarketplaceCatalogResult,
  WbTemplateMarketplaceRegistryStatus,
  WbTemplateMarketplaceSearchInput,
} from "@/lib/website/template-marketplace/types";

export {
  mapInstalledListItemToMarketplaceListing,
  mapInstalledRegistryEntryToMarketplaceListing,
  mapMarketplaceListingToListItem,
  canSelectMarketplaceListing,
  canInstallMarketplaceListing,
  mapRemoteSeedToMarketplaceListing,
} from "@/lib/website/template-marketplace/adapters";

export {
  WB_TEMPLATE_MARKETPLACE_REMOTE_LISTINGS,
  listRemoteMarketplaceListings,
  getRemoteMarketplaceListing,
} from "@/lib/website/template-marketplace/remote-catalog";

export {
  filterTemplateMarketplaceListings,
  sortTemplateMarketplaceListings,
  searchTemplateMarketplaceListings,
  buildTemplateMarketplaceFacets,
  listTemplateMarketplaceTags,
  listTemplateMarketplaceCategories,
} from "@/lib/website/template-marketplace/search";
