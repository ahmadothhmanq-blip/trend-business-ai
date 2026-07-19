import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/lib/api/helpers";
import {
  getCreatorMarketplaceCatalog,
  getCreatorMarketplaceListingDetail,
  publishCreatorTemplate,
} from "@/lib/marketplace/templates";
import type {
  CreatorMarketplaceCategory,
  MarketplaceListFilters,
} from "@/lib/marketplace/templates/types";
import type { MarketplaceStyleVariation } from "@/lib/ai-core/template-marketplace/types";

export const dynamic = "force-dynamic";

const categorySchema = z.enum([
  "automotive",
  "restaurant",
  "saas",
  "real-estate",
  "healthcare",
  "ecommerce",
  "agency",
  "finance",
  "all",
]);

const styleSchema = z.enum([
  "luxury",
  "modern",
  "corporate",
  "creative",
  "minimal",
  "premium-saas",
  "technology",
  "all",
]);

/**
 * GET — Creator marketplace catalog, or single listing with live preview.
 * Query: id, category, style, q, price, sort, favorites, creatorId
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();

  const auth = await requireUser();
  const userId = auth.user?.id ?? null;

  if (id) {
    const detail = getCreatorMarketplaceListingDetail(id, userId);
    if (!detail) {
      return NextResponse.json({ error: "Template not found." }, { status: 404 });
    }
    return NextResponse.json(detail);
  }

  const categoryRaw = searchParams.get("category") || "all";
  const styleRaw = searchParams.get("style") || "all";
  const priceRaw = searchParams.get("price") || "all";
  const sortRaw = searchParams.get("sort") || "popular";

  const categoryParsed = categorySchema.safeParse(categoryRaw);
  const styleParsed = styleSchema.safeParse(styleRaw);

  const filters: MarketplaceListFilters = {
    category: categoryParsed.success
      ? (categoryParsed.data as CreatorMarketplaceCategory | "all")
      : "all",
    style: styleParsed.success
      ? (styleParsed.data as MarketplaceStyleVariation | "all")
      : "all",
    query: searchParams.get("q") || undefined,
    price:
      priceRaw === "free" || priceRaw === "paid" || priceRaw === "all"
        ? priceRaw
        : "all",
    sort:
      sortRaw === "newest" ||
      sortRaw === "rating" ||
      sortRaw === "price-asc" ||
      sortRaw === "price-desc" ||
      sortRaw === "popular"
        ? sortRaw
        : "popular",
    creatorId: searchParams.get("creatorId") || undefined,
    favoritesOnly: searchParams.get("favorites") === "1",
  };

  // Favorites require auth; unauthenticated gets empty favorites filter
  if (filters.favoritesOnly && !userId) {
    return NextResponse.json(
      { listings: [], count: 0, categories: [], styles: [], creators: [] },
      { status: 200 },
    );
  }

  const catalog = getCreatorMarketplaceCatalog(filters, userId);
  return NextResponse.json(catalog);
}

const uploadSchema = z.object({
  title: z.string().trim().min(3).max(120),
  tagline: z.string().trim().max(160).optional(),
  description: z.string().trim().min(10).max(4000),
  category: z.enum([
    "automotive",
    "restaurant",
    "saas",
    "real-estate",
    "healthcare",
    "ecommerce",
    "agency",
    "finance",
  ]),
  style: z.enum([
    "luxury",
    "modern",
    "corporate",
    "creative",
    "minimal",
    "premium-saas",
    "technology",
  ]),
  features: z.array(z.string().trim().min(1).max(80)).max(12).default([]),
  premiumTemplateId: z.string().trim().max(80).optional(),
  marketplaceTemplateId: z.string().trim().max(120).optional(),
  designPreset: z.string().trim().max(80).optional(),
  priceCents: z.number().int().min(0).max(500000).optional(),
  priceModel: z.enum(["free", "paid", "subscription"]).optional(),
  version: z.string().trim().max(32).optional(),
  changelog: z.string().trim().max(1000).optional(),
  status: z
    .enum(["draft", "pending-review", "published", "archived"])
    .optional(),
});

/**
 * POST — Upload / publish a creator template listing.
 */
export async function POST(request: Request) {
  const auth = await requireUser();
  if (auth.response) return auth.response;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid upload" },
      { status: 400 },
    );
  }

  const meta = auth.user!.user_metadata ?? {};
  const listing = publishCreatorTemplate({
    userId: auth.user!.id,
    displayName:
      (meta.full_name as string | undefined) ||
      auth.user!.email?.split("@")[0] ||
      "Creator",
    email: auth.user!.email,
    input: {
      ...parsed.data,
      style: parsed.data.style as MarketplaceStyleVariation,
    },
  });

  return NextResponse.json({ listing }, { status: 201 });
}
