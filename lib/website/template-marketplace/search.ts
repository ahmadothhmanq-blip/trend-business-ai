import {
  WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS,
  WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
} from "@/lib/website/template-marketplace/constants";
import type {
  WbTemplateMarketplaceFacetCount,
  WbTemplateMarketplaceFacets,
  WbTemplateMarketplaceFilters,
  WbTemplateMarketplaceListing,
  WbTemplateMarketplaceSort,
  WbTemplateMarketplaceSortDirection,
  WbTemplateMarketplaceSortField,
} from "@/lib/website/template-marketplace/types";

function normalizeQuery(query?: string): string {
  return query?.trim().toLowerCase() ?? "";
}

function normalizeTags(tags?: string[]): string[] {
  if (!tags?.length) return [];
  return [...new Set(tags.map((tag) => tag.trim().toLowerCase()).filter(Boolean))];
}

function listingMatchesQuery(
  listing: WbTemplateMarketplaceListing,
  query: string,
): boolean {
  if (!query) return true;

  const haystack = [
    listing.id,
    listing.name,
    listing.description,
    listing.category,
    listing.layout,
    ...listing.tags,
    ...(listing.metadata.keywords ?? []),
    listing.metadata.author.name,
    listing.metadata.author.organization ?? "",
  ]
    .join(" ")
    .toLowerCase();

  return query
    .split(/\s+/)
    .filter(Boolean)
    .every((token) => haystack.includes(token));
}

export function filterTemplateMarketplaceListings(
  listings: WbTemplateMarketplaceListing[],
  filters: WbTemplateMarketplaceFilters = {},
): WbTemplateMarketplaceListing[] {
  const query = normalizeQuery(filters.query);
  const tags = normalizeTags(filters.tags);

  return listings.filter((listing) => {
    if (filters.category && filters.category !== "all") {
      if (listing.category !== filters.category) return false;
    }

    if (filters.layout && filters.layout !== "all") {
      if (listing.layout !== filters.layout) return false;
    }

    if (filters.source && filters.source !== "all") {
      if (listing.source !== filters.source) return false;
    }

    if (filters.availability && filters.availability !== "all") {
      if (listing.availability !== filters.availability) return false;
    }

    if (filters.featured === true && !listing.featured) {
      return false;
    }

    if (tags.length > 0) {
      const listingTags = new Set(listing.tags.map((tag) => tag.toLowerCase()));
      if (!tags.every((tag) => listingTags.has(tag))) {
        return false;
      }
    }

    if (!listingMatchesQuery(listing, query)) {
      return false;
    }

    return true;
  });
}

function compareFeatured(
  a: WbTemplateMarketplaceListing,
  b: WbTemplateMarketplaceListing,
): number {
  if (a.featured !== b.featured) {
    return a.featured ? -1 : 1;
  }

  const rankA = a.featuredRank ?? Number.MAX_SAFE_INTEGER;
  const rankB = b.featuredRank ?? Number.MAX_SAFE_INTEGER;
  if (rankA !== rankB) {
    return rankA - rankB;
  }

  return 0;
}

function compareByField(
  a: WbTemplateMarketplaceListing,
  b: WbTemplateMarketplaceListing,
  field: WbTemplateMarketplaceSortField,
): number {
  switch (field) {
    case "name":
      return a.name.localeCompare(b.name);
    case "category":
      return a.category.localeCompare(b.category);
    case "regionCount":
      return a.regionCount - b.regionCount;
    case "pageCount":
      return a.pageCount - b.pageCount;
    case "releasedAt": {
      const releasedA = a.metadata.releasedAt ?? "";
      const releasedB = b.metadata.releasedAt ?? "";
      return releasedA.localeCompare(releasedB);
    }
    case "featured":
      return compareFeatured(a, b);
    default:
      return 0;
  }
}

export function sortTemplateMarketplaceListings(
  listings: WbTemplateMarketplaceListing[],
  sort: WbTemplateMarketplaceSort = WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
): WbTemplateMarketplaceListing[] {
  const direction: WbTemplateMarketplaceSortDirection =
    sort.direction ?? WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT.direction;
  const field = sort.field ?? WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT.field;

  return [...listings].sort((a, b) => {
    if (field === "featured") {
      const featuredCompare = compareFeatured(a, b);
      if (featuredCompare !== 0) {
        return direction === "desc" ? featuredCompare : -featuredCompare;
      }
      return a.name.localeCompare(b.name);
    }

    const value = compareByField(a, b, field);
    if (value === 0) {
      return a.name.localeCompare(b.name);
    }

    return direction === "asc" ? value : -value;
  });
}

export function searchTemplateMarketplaceListings(
  listings: WbTemplateMarketplaceListing[],
  query: string,
  filters: WbTemplateMarketplaceFilters = {},
  sort: WbTemplateMarketplaceSort = WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
): WbTemplateMarketplaceListing[] {
  const mergedFilters: WbTemplateMarketplaceFilters = {
    ...filters,
    query: query.trim() || filters.query,
  };

  return sortTemplateMarketplaceListings(
    filterTemplateMarketplaceListings(listings, mergedFilters),
    sort,
  );
}

export function buildTemplateMarketplaceFacets(
  listings: WbTemplateMarketplaceListing[],
  filters: WbTemplateMarketplaceFilters = {},
): WbTemplateMarketplaceFacets {
  const filtered = filterTemplateMarketplaceListings(listings, {
    ...filters,
    category: "all",
    tags: undefined,
    source: "all",
    availability: "all",
    layout: "all",
    featured: undefined,
    query: undefined,
  });

  const categoryCounts = new Map<string, number>();
  const tagCounts = new Map<string, number>();
  const sourceCounts = new Map<string, number>();
  const layoutCounts = new Map<string, number>();

  for (const listing of filtered) {
    categoryCounts.set(
      listing.category,
      (categoryCounts.get(listing.category) ?? 0) + 1,
    );
    sourceCounts.set(
      listing.source,
      (sourceCounts.get(listing.source) ?? 0) + 1,
    );
    layoutCounts.set(
      listing.layout,
      (layoutCounts.get(listing.layout) ?? 0) + 1,
    );

    for (const tag of listing.tags) {
      const normalized = tag.toLowerCase();
      tagCounts.set(normalized, (tagCounts.get(normalized) ?? 0) + 1);
    }
  }

  const categories: WbTemplateMarketplaceFacetCount[] =
    WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS.map((definition) => ({
      id: definition.id,
      label: definition.label,
      count: categoryCounts.get(definition.id) ?? 0,
    })).filter((facet) => facet.count > 0);

  const tags: WbTemplateMarketplaceFacetCount[] = [...tagCounts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  const sources = [...sourceCounts.entries()]
    .map(([id, count]) => ({
      id: id as WbTemplateMarketplaceFacets["sources"][number]["id"],
      count,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  const layouts = [...layoutCounts.entries()]
    .map(([id, count]) => ({
      id: id as WbTemplateMarketplaceFacets["layouts"][number]["id"],
      count,
    }))
    .sort((a, b) => a.id.localeCompare(b.id));

  return { categories, tags, sources, layouts };
}

export function listTemplateMarketplaceTags(
  listings: WbTemplateMarketplaceListing[],
): string[] {
  const tags = new Set<string>();
  for (const listing of listings) {
    for (const tag of listing.tags) {
      tags.add(tag);
    }
  }
  return [...tags].sort((a, b) => a.localeCompare(b));
}

export function listTemplateMarketplaceCategories(
  listings: WbTemplateMarketplaceListing[],
): WbTemplateMarketplaceFacetCount[] {
  return buildTemplateMarketplaceFacets(listings).categories;
}
