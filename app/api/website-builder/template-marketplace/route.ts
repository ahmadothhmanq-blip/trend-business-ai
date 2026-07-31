import { NextResponse } from "next/server";
import { z } from "zod";
import { API_ERROR_CODES, apiNotFoundError } from "@/lib/i18n/api-errors";
import {
  WB_TEMPLATE_CATEGORIES,
  WB_TEMPLATE_LAYOUT_KINDS,
} from "@/lib/website/template-engine/spec/constants";
import {
  getTemplateMarketplaceListing,
  getTemplateMarketplaceStatus,
  listFeaturedTemplateMarketplaceListings,
  listTemplateMarketplaceCatalog,
  listTemplateMarketplaceCategoryDefinitions,
  listTemplateMarketplaceCatalogTags,
  searchTemplateMarketplaceCatalog,
  WB_TEMPLATE_MARKETPLACE_SORT_FIELDS,
  type WbTemplateMarketplaceFilters,
  type WbTemplateMarketplaceSort,
} from "@/lib/website/template-marketplace/index.server";

export const dynamic = "force-dynamic";

const categorySchema = z.enum(WB_TEMPLATE_CATEGORIES);
const layoutSchema = z.enum(WB_TEMPLATE_LAYOUT_KINDS);
const sortFieldSchema = z.enum(
  WB_TEMPLATE_MARKETPLACE_SORT_FIELDS as [
    (typeof WB_TEMPLATE_MARKETPLACE_SORT_FIELDS)[number],
    ...(typeof WB_TEMPLATE_MARKETPLACE_SORT_FIELDS)[number][],
  ],
);

function parseBooleanParam(value: string | null): boolean | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (normalized === "1" || normalized === "true" || normalized === "yes") {
    return true;
  }
  if (normalized === "0" || normalized === "false" || normalized === "no") {
    return false;
  }
  return undefined;
}

function parseTagsParam(value: string | null): string[] | undefined {
  if (!value?.trim()) return undefined;
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseCatalogQuery(searchParams: URLSearchParams) {
  const categoryParam = searchParams.get("category")?.trim();
  const layoutParam = searchParams.get("layout")?.trim();
  const sortFieldParam = searchParams.get("sort")?.trim();
  const sortDirectionParam = searchParams.get("direction")?.trim();

  const category =
    categoryParam && categoryParam !== "all"
      ? categorySchema.safeParse(categoryParam)
      : null;
  const layout =
    layoutParam && layoutParam !== "all"
      ? layoutSchema.safeParse(layoutParam)
      : null;
  const sortField = sortFieldParam
    ? sortFieldSchema.safeParse(sortFieldParam)
    : null;
  const sortDirection =
    sortDirectionParam === "asc" || sortDirectionParam === "desc"
      ? sortDirectionParam
      : undefined;

  const limitRaw = Number(searchParams.get("limit"));
  const offsetRaw = Number(searchParams.get("offset"));
  const limit =
    Number.isFinite(limitRaw) && limitRaw > 0
      ? Math.min(Math.floor(limitRaw), 100)
      : undefined;
  const offset =
    Number.isFinite(offsetRaw) && offsetRaw >= 0
      ? Math.floor(offsetRaw)
      : undefined;

  const sourceParam = searchParams.get("source");
  const availabilityParam = searchParams.get("availability");

  const filters: WbTemplateMarketplaceFilters = {
    category:
      category && category.success ? category.data : "all",
    layout: layout && layout.success ? layout.data : "all",
    query: searchParams.get("q")?.trim() || undefined,
    tags: parseTagsParam(searchParams.get("tags")),
    source:
      sourceParam === "installed" || sourceParam === "remote"
        ? sourceParam
        : "all",
    availability:
      availabilityParam === "installed" ||
      availabilityParam === "remote" ||
      availabilityParam === "unavailable"
        ? availabilityParam
        : "all",
    featured: parseBooleanParam(searchParams.get("featured")),
  };

  const sort: WbTemplateMarketplaceSort = {
    field:
      sortField && sortField.success ? sortField.data : "featured",
    direction: sortDirection ?? "desc",
  };

  return {
    filters,
    sort,
    limit,
    offset,
  };
}

/**
 * GET /api/website-builder/template-marketplace
 *
 * Query params:
 * - id: single listing
 * - status=1: registry status
 * - featured=1: featured listings only
 * - q: search query
 * - category, layout, tags, source, availability
 * - sort, direction, limit, offset
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  if (searchParams.get("status") === "1") {
    const status = await getTemplateMarketplaceStatus();
    return NextResponse.json({ ok: true, status });
  }

  const id = searchParams.get("id")?.trim();
  if (id) {
    const listing = await getTemplateMarketplaceListing(id);
    if (!listing) {
      return apiNotFoundError(API_ERROR_CODES.NOT_FOUND, "Template not found.");
    }

    return NextResponse.json({ ok: true, listing });
  }

  if (searchParams.get("featured") === "1") {
    const limitRaw = Number(searchParams.get("limit"));
    const limit =
      Number.isFinite(limitRaw) && limitRaw > 0
        ? Math.min(Math.floor(limitRaw), 24)
        : 6;
    const listings = await listFeaturedTemplateMarketplaceListings(limit);
    return NextResponse.json({
      ok: true,
      listings,
      count: listings.length,
    });
  }

  const parsed = parseCatalogQuery(searchParams);
  const categories = await listTemplateMarketplaceCategoryDefinitions();
  const tags = await listTemplateMarketplaceCatalogTags();

  const catalog = parsed.filters.query
    ? await searchTemplateMarketplaceCatalog({
        query: parsed.filters.query,
        filters: parsed.filters,
        sort: parsed.sort,
        limit: parsed.limit,
        offset: parsed.offset,
      })
    : await listTemplateMarketplaceCatalog(
        parsed.filters,
        parsed.sort,
        {
          limit: parsed.limit,
          offset: parsed.offset,
        },
      );

  return NextResponse.json({
    ok: true,
    ...catalog,
    categories,
    tags,
  });
}
