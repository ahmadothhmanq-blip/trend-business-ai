/**
 * In-process marketplace store with seed data.
 * Swap persist layer later for Supabase (migration 040).
 */

import {
  buildSeedCreatorListings,
  CREATOR_MARKETPLACE_CATEGORIES,
} from "@/lib/marketplace/templates/seed";
import type {
  CreatorTemplateListing,
  MarketplaceCreatorProfile,
  MarketplaceListFilters,
  UploadTemplateInput,
} from "@/lib/marketplace/templates/types";

type StoreState = {
  creators: MarketplaceCreatorProfile[];
  listings: CreatorTemplateListing[];
  /** userId → listing ids */
  favorites: Map<string, Set<string>>;
};

const globalStore = globalThis as typeof globalThis & {
  __tbaCreatorMarketplace?: StoreState;
};

function getState(): StoreState {
  if (!globalStore.__tbaCreatorMarketplace) {
    const seed = buildSeedCreatorListings();
    globalStore.__tbaCreatorMarketplace = {
      creators: seed.creators,
      listings: seed.listings,
      favorites: new Map(),
    };
  }
  return globalStore.__tbaCreatorMarketplace;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 64) || `template-${Date.now().toString(36)}`
  );
}

export function listCreatorMarketplaceCategories() {
  return CREATOR_MARKETPLACE_CATEGORIES;
}

export function listCreatorProfiles(): MarketplaceCreatorProfile[] {
  return getState().creators;
}

export function getCreatorProfile(
  idOrHandle: string,
): MarketplaceCreatorProfile | null {
  const state = getState();
  return (
    state.creators.find(
      (c) => c.id === idOrHandle || c.handle === idOrHandle,
    ) ?? null
  );
}

export function listCreatorListings(
  filters?: MarketplaceListFilters,
  userId?: string | null,
): CreatorTemplateListing[] {
  const state = getState();
  let items = state.listings.filter((l) => l.status === "published");

  if (filters?.creatorId) {
    items = items.filter((l) => l.author.id === filters.creatorId);
  }
  if (filters?.category && filters.category !== "all") {
    items = items.filter((l) => l.category === filters.category);
  }
  if (filters?.style && filters.style !== "all") {
    items = items.filter((l) => l.style === filters.style);
  }
  if (filters?.price === "free") {
    items = items.filter((l) => l.commerce.priceCents === 0);
  } else if (filters?.price === "paid") {
    items = items.filter((l) => l.commerce.priceCents > 0);
  }
  const q = filters?.query?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.author.displayName.toLowerCase().includes(q) ||
        l.features.some((f) => f.toLowerCase().includes(q)) ||
        l.tags.some((t) => t.toLowerCase().includes(q)),
    );
  }

  const favs = userId ? state.favorites.get(userId) : undefined;
  if (filters?.favoritesOnly && favs) {
    items = items.filter((l) => favs.has(l.id));
  }

  const sort = filters?.sort || "popular";
  items = [...items].sort((a, b) => {
    switch (sort) {
      case "newest":
        return b.updatedAt.localeCompare(a.updatedAt);
      case "rating":
        return b.reviews.averageRating - a.reviews.averageRating;
      case "price-asc":
        return a.commerce.priceCents - b.commerce.priceCents;
      case "price-desc":
        return b.commerce.priceCents - a.commerce.priceCents;
      case "popular":
      default:
        return b.analytics.uses - a.analytics.uses;
    }
  });

  return items.map((l) => ({
    ...l,
    favorited: Boolean(favs?.has(l.id)),
  }));
}

export function getCreatorListing(
  idOrSlug: string,
  userId?: string | null,
): CreatorTemplateListing | null {
  const state = getState();
  const listing =
    state.listings.find((l) => l.id === idOrSlug || l.slug === idOrSlug) ??
    null;
  if (!listing) return null;
  const favs = userId ? state.favorites.get(userId) : undefined;
  return { ...listing, favorited: Boolean(favs?.has(listing.id)) };
}

export function toggleFavorite(
  userId: string,
  listingId: string,
): { favorited: boolean } {
  const state = getState();
  if (!state.listings.some((l) => l.id === listingId)) {
    throw new Error("Template not found");
  }
  let set = state.favorites.get(userId);
  if (!set) {
    set = new Set();
    state.favorites.set(userId, set);
  }
  if (set.has(listingId)) {
    set.delete(listingId);
    const listing = state.listings.find((l) => l.id === listingId);
    if (listing) {
      listing.analytics.favorites = Math.max(0, listing.analytics.favorites - 1);
    }
    return { favorited: false };
  }
  set.add(listingId);
  const listing = state.listings.find((l) => l.id === listingId);
  if (listing) listing.analytics.favorites += 1;
  return { favorited: true };
}

export function recordTemplateUse(listingId: string): void {
  const listing = getState().listings.find((l) => l.id === listingId);
  if (!listing) return;
  listing.analytics.uses += 1;
  listing.analytics.views += 1;
}

export function ensureCreatorForUser(params: {
  userId: string;
  displayName: string;
  email?: string | null;
}): MarketplaceCreatorProfile {
  const state = getState();
  const existing = state.creators.find((c) => c.userId === params.userId);
  if (existing) return existing;

  const handleBase =
    slugify(params.displayName || params.email?.split("@")[0] || "creator") ||
    "creator";
  let handle = handleBase;
  let n = 1;
  while (state.creators.some((c) => c.handle === handle)) {
    n += 1;
    handle = `${handleBase}-${n}`;
  }

  const profile: MarketplaceCreatorProfile = {
    id: `creator-user-${params.userId.slice(0, 8)}`,
    userId: params.userId,
    displayName: params.displayName || "Creator",
    handle,
    bio: "Independent template designer on Trend Business AI.",
    avatarGradient: "linear-gradient(135deg,#111827,#d4af37)",
    templateCount: 0,
    followerCount: 0,
    payoutReady: false,
    createdAt: new Date().toISOString(),
  };
  state.creators.unshift(profile);
  return profile;
}

export function uploadCreatorTemplate(params: {
  userId: string;
  displayName: string;
  email?: string | null;
  input: UploadTemplateInput;
}): CreatorTemplateListing {
  const state = getState();
  const author = ensureCreatorForUser({
    userId: params.userId,
    displayName: params.displayName,
    email: params.email,
  });

  const slugBase = slugify(params.input.title);
  let slug = slugBase;
  let i = 1;
  while (state.listings.some((l) => l.slug === slug)) {
    i += 1;
    slug = `${slugBase}-${i}`;
  }

  const priceCents = Math.max(0, params.input.priceCents ?? 0);
  const marketplaceTemplateId =
    params.input.marketplaceTemplateId ||
    `${params.input.category}-${params.input.style}`;
  const premiumTemplateId =
    params.input.premiumTemplateId ||
    defaultPremiumForCategory(params.input.category);
  const now = new Date().toISOString();
  const version = params.input.version || "1.0.0";

  const listing: CreatorTemplateListing = {
    id: `listing-user-${Date.now().toString(36)}`,
    slug,
    title: params.input.title.trim(),
    tagline: params.input.tagline?.trim() || params.input.title.trim(),
    description: params.input.description.trim(),
    category: params.input.category,
    style: params.input.style,
    status: params.input.status || "published",
    author,
    features: params.input.features.filter(Boolean).slice(0, 12),
    previewGradient: gradientForCategory(params.input.category),
    previewImageUrl: null,
    livePreviewAvailable: true,
    commerce: {
      priceModel: priceCents === 0 ? "free" : params.input.priceModel || "paid",
      priceCents,
      currency: "USD",
      creatorRevenueShareBps: 7000,
      stripeProductId: null,
      stripePriceId: null,
    },
    reviews: {
      averageRating: 0,
      reviewCount: 0,
      readyForReviews: true,
    },
    analytics: {
      views: 0,
      uses: 0,
      favorites: 0,
      readyForAnalytics: true,
    },
    versions: [
      {
        id: `ver-${Date.now().toString(36)}`,
        version,
        changelog: params.input.changelog || "Initial upload",
        premiumTemplateId,
        marketplaceTemplateId,
        createdAt: now,
        isLatest: true,
      },
    ],
    premiumTemplateId,
    marketplaceTemplateId,
    designPreset: params.input.designPreset || params.input.style,
    tags: [
      params.input.category,
      params.input.style,
      ...params.input.features.slice(0, 3),
    ],
    createdAt: now,
    updatedAt: now,
  };

  state.listings.unshift(listing);
  author.templateCount += 1;
  return listing;
}

export function addTemplateVersion(params: {
  listingId: string;
  userId: string;
  version: string;
  changelog: string;
  premiumTemplateId?: string;
  marketplaceTemplateId?: string;
}): CreatorTemplateListing {
  const state = getState();
  const listing = state.listings.find((l) => l.id === params.listingId);
  if (!listing) throw new Error("Template not found");
  if (!listing.author.userId || listing.author.userId !== params.userId) {
    throw new Error("Not allowed to version this template");
  }

  listing.versions = listing.versions.map((v) => ({ ...v, isLatest: false }));
  listing.versions.unshift({
    id: `ver-${Date.now().toString(36)}`,
    version: params.version,
    changelog: params.changelog,
    premiumTemplateId: params.premiumTemplateId || listing.premiumTemplateId,
    marketplaceTemplateId:
      params.marketplaceTemplateId || listing.marketplaceTemplateId,
    createdAt: new Date().toISOString(),
    isLatest: true,
  });
  if (params.premiumTemplateId) {
    listing.premiumTemplateId = params.premiumTemplateId;
  }
  if (params.marketplaceTemplateId) {
    listing.marketplaceTemplateId = params.marketplaceTemplateId;
  }
  listing.updatedAt = new Date().toISOString();
  return listing;
}

function defaultPremiumForCategory(category: string): string {
  const map: Record<string, string> = {
    automotive: "automotive",
    restaurant: "restaurant",
    saas: "saas",
    "real-estate": "real-estate",
    healthcare: "healthcare",
    ecommerce: "ecommerce",
    agency: "agency",
    finance: "luxury-business",
  };
  return map[category] || "saas";
}

function gradientForCategory(category: string): string {
  const map: Record<string, string> = {
    automotive: "linear-gradient(135deg,#0f172a,#64748b)",
    restaurant: "linear-gradient(135deg,#7c2d12,#fbbf24)",
    saas: "linear-gradient(135deg,#020617,#6366f1)",
    "real-estate": "linear-gradient(135deg,#0b1f33,#c9a227)",
    healthcare: "linear-gradient(135deg,#164e63,#67e8f9)",
    ecommerce: "linear-gradient(135deg,#4c0519,#fb7185)",
    agency: "linear-gradient(135deg,#18181b,#f43f5e)",
    finance: "linear-gradient(135deg,#0b1f33,#1e4e79)",
  };
  return map[category] || "linear-gradient(135deg,#111,#d4af37)";
}
