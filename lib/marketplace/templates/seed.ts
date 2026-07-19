/**
 * Seed curated creator listings from the AI Template Marketplace catalog.
 */

import { MARKETPLACE_TEMPLATES } from "@/lib/ai-core/template-marketplace/catalog";
import type {
  CreatorMarketplaceCategory,
  CreatorTemplateListing,
  MarketplaceCreatorProfile,
} from "@/lib/marketplace/templates/types";
import { toCreatorCategory } from "@/lib/marketplace/templates/types";

const CREATORS: MarketplaceCreatorProfile[] = [
  {
    id: "creator-atelier-nova",
    displayName: "Atelier Nova",
    handle: "ateliernova",
    bio: "Luxury editorial websites for hospitality and automotive brands.",
    avatarGradient: "linear-gradient(135deg,#1a1a1a,#c6a75e)",
    location: "Paris",
    templateCount: 0,
    followerCount: 1280,
    payoutReady: false,
    createdAt: "2025-01-12T00:00:00.000Z",
  },
  {
    id: "creator-gridline",
    displayName: "Gridline Studio",
    handle: "gridline",
    bio: "Product-led SaaS and fintech templates with conversion craft.",
    avatarGradient: "linear-gradient(135deg,#020617,#6366f1)",
    location: "Berlin",
    templateCount: 0,
    followerCount: 2140,
    payoutReady: false,
    createdAt: "2025-02-03T00:00:00.000Z",
  },
  {
    id: "creator-hearth",
    displayName: "Hearth Digital",
    handle: "hearth",
    bio: "Warm restaurant and clinic experiences with booking-first UX.",
    avatarGradient: "linear-gradient(135deg,#7c2d12,#fbbf24)",
    location: "Austin",
    templateCount: 0,
    followerCount: 860,
    payoutReady: false,
    createdAt: "2025-03-18T00:00:00.000Z",
  },
  {
    id: "creator-estateform",
    displayName: "Estateform",
    handle: "estateform",
    bio: "Property and agency showcases with cinematic photography.",
    avatarGradient: "linear-gradient(135deg,#0b1f33,#c9a227)",
    location: "Dubai",
    templateCount: 0,
    followerCount: 1540,
    payoutReady: false,
    createdAt: "2025-04-09T00:00:00.000Z",
  },
];

function hashSeed(input: string): number {
  let h = 0;
  for (let i = 0; i < input.length; i += 1) {
    h = (h + input.charCodeAt(i) * (i + 1)) % 997;
  }
  return h;
}

function priceFor(style: string, category: string): number {
  if (style === "luxury" || category === "finance") return 4900;
  if (style === "premium-saas" || style === "technology") return 3900;
  if (style === "minimal") return 0;
  return 2900;
}

/**
 * Build published creator listings from official AI templates.
 */
export function buildSeedCreatorListings(): {
  creators: MarketplaceCreatorProfile[];
  listings: CreatorTemplateListing[];
} {
  const listings: CreatorTemplateListing[] = [];
  const creatorCounts = new Map<string, number>();

  for (const tpl of MARKETPLACE_TEMPLATES) {
    const category = toCreatorCategory(tpl.category);
    if (!category) continue;

    const creator = CREATORS[hashSeed(tpl.id) % CREATORS.length]!;
    creatorCounts.set(creator.id, (creatorCounts.get(creator.id) || 0) + 1);

    const priceCents = priceFor(tpl.style, category);
    const ratingBase = 4.2 + (hashSeed(tpl.id) % 8) / 10;
    const reviewCount = 12 + (hashSeed(tpl.name) % 90);
    const uses = 40 + (hashSeed(tpl.id + "u") % 400);
    const views = uses * (3 + (hashSeed(tpl.id + "v") % 5));

    const listing: CreatorTemplateListing = {
      id: `listing-${tpl.id}`,
      slug: tpl.id,
      title: tpl.name,
      tagline: tpl.tagline,
      description: tpl.description,
      category,
      style: tpl.style,
      status: "published",
      author: creator,
      features: tpl.features,
      previewGradient: `linear-gradient(135deg, ${tpl.colorSystem.primary}, ${tpl.colorSystem.secondary} 55%, ${tpl.colorSystem.accent})`,
      previewImageUrl: null,
      livePreviewAvailable: true,
      commerce: {
        priceModel: priceCents === 0 ? "free" : "paid",
        priceCents,
        currency: "USD",
        creatorRevenueShareBps: 7000,
        stripeProductId: null,
        stripePriceId: null,
      },
      reviews: {
        averageRating: Math.min(5, Number(ratingBase.toFixed(1))),
        reviewCount,
        readyForReviews: true,
      },
      analytics: {
        views,
        uses,
        favorites: Math.floor(uses * 0.18),
        readyForAnalytics: true,
      },
      versions: [
        {
          id: `ver-${tpl.id}-1`,
          version: "1.0.0",
          changelog: "Initial marketplace release",
          premiumTemplateId: tpl.premiumTemplateId,
          marketplaceTemplateId: tpl.id,
          createdAt: tpl.popular ? "2025-11-01T00:00:00.000Z" : "2026-01-15T00:00:00.000Z",
          isLatest: true,
        },
      ],
      premiumTemplateId: tpl.premiumTemplateId,
      marketplaceTemplateId: tpl.id,
      designPreset: tpl.designPreset,
      tags: [tpl.category, tpl.style, ...tpl.features.slice(0, 2)],
      createdAt: "2025-11-01T00:00:00.000Z",
      updatedAt: "2026-06-01T00:00:00.000Z",
    };
    listings.push(listing);
  }

  const creators = CREATORS.map((c) => ({
    ...c,
    templateCount: creatorCounts.get(c.id) || 0,
  }));

  // Attach updated author snapshots
  for (const listing of listings) {
    const author = creators.find((c) => c.id === listing.author.id);
    if (author) listing.author = author;
  }

  return { creators, listings };
}

export const CREATOR_MARKETPLACE_CATEGORIES: Array<{
  id: CreatorMarketplaceCategory;
  label: string;
}> = [
  { id: "automotive", label: "Automotive" },
  { id: "restaurant", label: "Restaurant" },
  { id: "saas", label: "SaaS" },
  { id: "real-estate", label: "Real Estate" },
  { id: "healthcare", label: "Healthcare" },
  { id: "ecommerce", label: "E-commerce" },
  { id: "agency", label: "Agency" },
  { id: "finance", label: "Finance" },
];
