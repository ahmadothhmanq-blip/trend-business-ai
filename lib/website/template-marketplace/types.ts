import type {
  WbTemplateCategory,
  WbTemplateCompatibility,
  WbTemplateLayoutKind,
  WbTemplateUpdateChannel,
} from "@/lib/website/template-engine/spec/types";

/** Where a marketplace listing originates. */
export type WbTemplateMarketplaceSource = "installed" | "remote";

/**
 * Installation state for a marketplace listing.
 * Download/install flows are out of scope for this foundation.
 */
export type WbTemplateMarketplaceAvailability =
  | "installed"
  | "remote"
  | "unavailable";

export type WbTemplateMarketplaceAuthor = {
  name: string;
  email?: string;
  url?: string;
  organization?: string;
};

export type WbTemplateMarketplaceMetadata = {
  author: WbTemplateMarketplaceAuthor;
  license?: string;
  homepage?: string;
  repository?: string;
  keywords?: string[];
  updateChannel?: WbTemplateUpdateChannel;
  releasedAt?: string;
  changelog?: string;
  compatibility?: WbTemplateCompatibility;
  templateIntelligenceId?: string;
  premium?: boolean;
};

/**
 * Future remote package reference.
 * Metadata only — download and installation are not implemented yet.
 */
export type WbTemplateMarketplaceRemoteRef = {
  registryId: string;
  /** Reserved for signed package distribution. */
  packageUrl?: string;
  checksum?: string;
  signature?: string;
  publisher?: string;
  publishedAt?: string;
};

export type WbTemplateMarketplaceListing = {
  id: string;
  version: string;
  name: string;
  description: string;
  category: WbTemplateCategory;
  tags: string[];
  layout: WbTemplateLayoutKind;
  regionCount: number;
  pageCount: number;
  thumbnail: string;
  preview: string;
  source: WbTemplateMarketplaceSource;
  availability: WbTemplateMarketplaceAvailability;
  featured: boolean;
  featuredRank?: number;
  metadata: WbTemplateMarketplaceMetadata;
  remote?: WbTemplateMarketplaceRemoteRef;
  /** Present when `availability` is `installed`. */
  installedAt?: string;
};

export type WbTemplateMarketplaceSortField =
  | "name"
  | "releasedAt"
  | "featured"
  | "category"
  | "regionCount"
  | "pageCount";

export type WbTemplateMarketplaceSortDirection = "asc" | "desc";

export type WbTemplateMarketplaceSort = {
  field: WbTemplateMarketplaceSortField;
  direction?: WbTemplateMarketplaceSortDirection;
};

export type WbTemplateMarketplaceFilters = {
  category?: WbTemplateCategory | "all";
  tags?: string[];
  query?: string;
  source?: WbTemplateMarketplaceSource | "all";
  availability?: WbTemplateMarketplaceAvailability | "all";
  featured?: boolean;
  layout?: WbTemplateLayoutKind | "all";
};

export type WbTemplateMarketplaceFacetCount = {
  id: string;
  label?: string;
  count: number;
};

export type WbTemplateMarketplaceFacets = {
  categories: WbTemplateMarketplaceFacetCount[];
  tags: WbTemplateMarketplaceFacetCount[];
  sources: Array<{
    id: WbTemplateMarketplaceSource;
    count: number;
  }>;
  layouts: Array<{
    id: WbTemplateLayoutKind;
    count: number;
  }>;
};

export type WbTemplateMarketplaceCatalogResult = {
  listings: WbTemplateMarketplaceListing[];
  count: number;
  total: number;
  filters: WbTemplateMarketplaceFilters;
  sort: WbTemplateMarketplaceSort;
  facets: WbTemplateMarketplaceFacets;
};

export type WbTemplateMarketplaceRegistryStatus = {
  marketplaceVersion: string;
  installedCount: number;
  remoteCount: number;
  listingCount: number;
  featuredCount: number;
  lastRefreshedAt: string | null;
};

export type WbTemplateMarketplaceSearchInput = {
  query: string;
  filters?: WbTemplateMarketplaceFilters;
  sort?: WbTemplateMarketplaceSort;
  limit?: number;
  offset?: number;
};
