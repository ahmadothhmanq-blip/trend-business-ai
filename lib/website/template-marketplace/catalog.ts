import {
  WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS,
  WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
} from "@/lib/website/template-marketplace/constants";
import {
  getTemplateMarketplaceRegistryListing,
  initializeWbTemplateMarketplace,
  listTemplateMarketplaceRegistryListings,
} from "@/lib/website/template-marketplace/registry";
import {
  buildTemplateMarketplaceFacets,
  filterTemplateMarketplaceListings,
  listTemplateMarketplaceCategories,
  listTemplateMarketplaceTags,
  searchTemplateMarketplaceListings,
  sortTemplateMarketplaceListings,
} from "@/lib/website/template-marketplace/search";
import type {
  WbTemplateMarketplaceCatalogResult,
  WbTemplateMarketplaceFilters,
  WbTemplateMarketplaceListing,
  WbTemplateMarketplaceSearchInput,
  WbTemplateMarketplaceSort,
} from "@/lib/website/template-marketplace/types";

function paginateListings(
  listings: WbTemplateMarketplaceListing[],
  limit?: number,
  offset?: number,
): WbTemplateMarketplaceListing[] {
  const start = Math.max(0, offset ?? 0);
  const end = limit ? start + limit : undefined;
  return listings.slice(start, end);
}

export async function listTemplateMarketplaceCatalog(
  filters: WbTemplateMarketplaceFilters = {},
  sort: WbTemplateMarketplaceSort = WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
  options?: { limit?: number; offset?: number },
): Promise<WbTemplateMarketplaceCatalogResult> {
  await initializeWbTemplateMarketplace();
  const all = await listTemplateMarketplaceRegistryListings();
  const filtered = filterTemplateMarketplaceListings(all, filters);
  const sorted = sortTemplateMarketplaceListings(filtered, sort);
  const listings = paginateListings(sorted, options?.limit, options?.offset);

  return {
    listings,
    count: listings.length,
    total: filtered.length,
    filters,
    sort: {
      field: sort.field ?? WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT.field,
      direction:
        sort.direction ?? WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT.direction,
    },
    facets: buildTemplateMarketplaceFacets(all, filters),
  };
}

export async function searchTemplateMarketplaceCatalog(
  input: WbTemplateMarketplaceSearchInput,
): Promise<WbTemplateMarketplaceCatalogResult> {
  await initializeWbTemplateMarketplace();
  const all = await listTemplateMarketplaceRegistryListings();
  const sort = input.sort ?? WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT;
  const filtered = searchTemplateMarketplaceListings(
    all,
    input.query,
    input.filters,
    sort,
  );
  const listings = paginateListings(filtered, input.limit, input.offset);

  return {
    listings,
    count: listings.length,
    total: filtered.length,
    filters: {
      ...input.filters,
      query: input.query,
    },
    sort: {
      field: sort.field ?? WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT.field,
      direction:
        sort.direction ?? WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT.direction,
    },
    facets: buildTemplateMarketplaceFacets(all, {
      ...input.filters,
      query: input.query,
    }),
  };
}

export async function getTemplateMarketplaceListing(
  id: string,
): Promise<WbTemplateMarketplaceListing | null> {
  await initializeWbTemplateMarketplace();
  return getTemplateMarketplaceRegistryListing(id);
}

export async function listFeaturedTemplateMarketplaceListings(
  limit = 6,
): Promise<WbTemplateMarketplaceListing[]> {
  const result = await listTemplateMarketplaceCatalog(
    { featured: true },
    { field: "featured", direction: "desc" },
    { limit },
  );
  return result.listings;
}

export async function listTemplateMarketplaceCategoryDefinitions() {
  return WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS;
}

export async function listTemplateMarketplaceCatalogTags(): Promise<string[]> {
  const all = await listTemplateMarketplaceRegistryListings();
  return listTemplateMarketplaceTags(all);
}

export async function listTemplateMarketplaceCatalogCategories() {
  const all = await listTemplateMarketplaceRegistryListings();
  return listTemplateMarketplaceCategories(all);
}

export async function getTemplateMarketplaceStatus() {
  return initializeWbTemplateMarketplace();
}
