/**
 * Website Builder Template Marketplace — server-only exports.
 */
export * from "@/lib/website/template-marketplace/index";

export {
  WbTemplateMarketplaceRegistry,
  getWbTemplateMarketplaceRegistry,
  resetWbTemplateMarketplaceRegistry,
  initializeWbTemplateMarketplace,
  listTemplateMarketplaceRegistryListings,
  getTemplateMarketplaceRegistryListing,
  getTemplateMarketplaceDefaultSort,
} from "@/lib/website/template-marketplace/registry";

export {
  listTemplateMarketplaceCatalog,
  searchTemplateMarketplaceCatalog,
  getTemplateMarketplaceListing,
  listFeaturedTemplateMarketplaceListings,
  listTemplateMarketplaceCategoryDefinitions,
  listTemplateMarketplaceCatalogTags,
  listTemplateMarketplaceCatalogCategories,
  getTemplateMarketplaceStatus,
} from "@/lib/website/template-marketplace/catalog";

export { installRemoteTemplatePackage } from "@/lib/website/template-marketplace/install.server";
