import type {
  WbTemplateMarketplaceCatalogResult,
  WbTemplateMarketplaceListing,
  WbTemplateMarketplaceRegistryStatus,
  WbTemplateMarketplaceSortDirection,
  WbTemplateMarketplaceSortField,
} from "@/lib/website/template-marketplace/types";

const MARKETPLACE_API = "/api/website-builder/template-marketplace";

export type TemplateMarketplaceCategoryDefinition = {
  id: string;
  label: string;
  description: string;
};

export type TemplateMarketplaceCatalogQuery = {
  q?: string;
  category?: string;
  tags?: string[];
  source?: "all" | "installed" | "remote";
  availability?: "all" | "installed" | "remote" | "unavailable";
  featured?: boolean;
  sort?: WbTemplateMarketplaceSortField;
  direction?: WbTemplateMarketplaceSortDirection;
  limit?: number;
  offset?: number;
};

export type TemplateMarketplaceCatalogResponse = WbTemplateMarketplaceCatalogResult & {
  ok: boolean;
  categories: TemplateMarketplaceCategoryDefinition[];
  tags: string[];
};

export type TemplateMarketplaceFeaturedResponse = {
  ok: boolean;
  listings: WbTemplateMarketplaceListing[];
  count: number;
};

export type TemplateMarketplaceListingResponse = {
  ok: boolean;
  listing: WbTemplateMarketplaceListing;
};

export type TemplateMarketplaceStatusResponse = {
  ok: boolean;
  status: WbTemplateMarketplaceRegistryStatus;
};

function buildCatalogSearchParams(
  query: TemplateMarketplaceCatalogQuery,
): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.category && query.category !== "all") {
    params.set("category", query.category);
  }
  if (query.tags?.length) params.set("tags", query.tags.join(","));
  if (query.source && query.source !== "all") params.set("source", query.source);
  if (query.availability && query.availability !== "all") {
    params.set("availability", query.availability);
  }
  if (query.featured) params.set("featured", "1");
  if (query.sort) params.set("sort", query.sort);
  if (query.direction) params.set("direction", query.direction);
  if (query.limit) params.set("limit", String(query.limit));
  if (query.offset) params.set("offset", String(query.offset));

  return params;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  return (await response.json().catch(() => null)) as T | null;
}

export async function fetchTemplateMarketplaceCatalog(
  query: TemplateMarketplaceCatalogQuery = {},
): Promise<TemplateMarketplaceCatalogResponse | null> {
  const params = buildCatalogSearchParams(query);
  const response = await fetch(`${MARKETPLACE_API}?${params.toString()}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = await parseJson<TemplateMarketplaceCatalogResponse>(response);
  if (!response.ok || !payload?.ok) return null;
  return payload;
}

export async function fetchFeaturedTemplateMarketplaceListings(
  limit = 6,
): Promise<WbTemplateMarketplaceListing[]> {
  const response = await fetch(
    `${MARKETPLACE_API}?featured=1&limit=${encodeURIComponent(String(limit))}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const payload = await parseJson<TemplateMarketplaceFeaturedResponse>(response);
  if (!response.ok || !payload?.ok || !payload.listings) return [];
  return payload.listings;
}

export async function fetchTemplateMarketplaceListing(
  id: string,
): Promise<WbTemplateMarketplaceListing | null> {
  const response = await fetch(
    `${MARKETPLACE_API}?id=${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
    },
  );

  const payload = await parseJson<TemplateMarketplaceListingResponse>(response);
  if (!response.ok || !payload?.ok || !payload.listing) return null;
  return payload.listing;
}

export async function fetchTemplateMarketplaceStatus(): Promise<WbTemplateMarketplaceRegistryStatus | null> {
  const response = await fetch(`${MARKETPLACE_API}?status=1`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const payload = await parseJson<TemplateMarketplaceStatusResponse>(response);
  if (!response.ok || !payload?.ok || !payload.status) return null;
  return payload.status;
}

export type TemplateMarketplaceInstallResponse = {
  ok: boolean;
  listing?: WbTemplateMarketplaceListing;
  alreadyInstalled?: boolean;
  packageId?: string;
  packageVersion?: string;
  code?: string;
  message?: string;
  issues?: Array<{ code: string; message: string; path?: string }>;
};

export async function installTemplateMarketplaceListing(
  templateId: string,
): Promise<TemplateMarketplaceInstallResponse> {
  const response = await fetch(`${MARKETPLACE_API}/install`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ templateId }),
  });

  const payload = await parseJson<TemplateMarketplaceInstallResponse>(response);
  if (!payload) {
    return {
      ok: false,
      message: "Install request failed",
    };
  }

  if (!response.ok || !payload.ok) {
    return {
      ok: false,
      message: payload.message ?? "Install request failed",
      code: payload.code,
      issues: payload.issues,
    };
  }

  return payload;
}

export function isMarketplaceMediaUrl(path: string): boolean {
  const value = path.trim();
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/")
  );
}

export function resolveMarketplaceListingThumbnail(
  listing: WbTemplateMarketplaceListing,
): string | null {
  if (isMarketplaceMediaUrl(listing.thumbnail)) return listing.thumbnail;
  if (isMarketplaceMediaUrl(listing.preview)) return listing.preview;
  return null;
}
