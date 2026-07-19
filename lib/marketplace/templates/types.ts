/**
 * Creator Template Marketplace — publish, sell, share website templates.
 * Prepared for payments, creator revenue, reviews, and analytics.
 */

import type {
  MarketplaceCategory,
  MarketplaceStyleVariation,
} from "@/lib/ai-core/template-marketplace/types";

/** Commerce categories (subset focused on selling). */
export type CreatorMarketplaceCategory =
  | "automotive"
  | "restaurant"
  | "saas"
  | "real-estate"
  | "healthcare"
  | "ecommerce"
  | "agency"
  | "finance";

export type TemplateListingStatus =
  | "draft"
  | "pending-review"
  | "published"
  | "archived";

export type TemplatePriceModel = "free" | "paid" | "subscription";

/** Future payment / revenue hooks (not charged yet). */
export type TemplateCommerceMeta = {
  priceModel: TemplatePriceModel;
  /** Price in USD cents. 0 = free. */
  priceCents: number;
  currency: "USD";
  /** Basis points for creator share when payments go live (e.g. 7000 = 70%). */
  creatorRevenueShareBps: number;
  stripeProductId?: string | null;
  stripePriceId?: string | null;
};

export type TemplateReviewSummary = {
  averageRating: number;
  reviewCount: number;
  /** Reserved for full review entities. */
  readyForReviews: boolean;
};

export type TemplateAnalyticsStub = {
  views: number;
  uses: number;
  favorites: number;
  /** Reserved for event stream. */
  readyForAnalytics: boolean;
};

export type MarketplaceCreatorProfile = {
  id: string;
  userId?: string | null;
  displayName: string;
  handle: string;
  bio: string;
  avatarGradient: string;
  location?: string;
  website?: string;
  templateCount: number;
  followerCount: number;
  /** Future payouts. */
  payoutReady: boolean;
  createdAt: string;
};

export type TemplateVersion = {
  id: string;
  version: string;
  changelog: string;
  premiumTemplateId: string;
  marketplaceTemplateId?: string | null;
  createdAt: string;
  isLatest: boolean;
};

export type CreatorTemplateListing = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  category: CreatorMarketplaceCategory;
  style: MarketplaceStyleVariation;
  status: TemplateListingStatus;
  author: MarketplaceCreatorProfile;
  features: string[];
  previewGradient: string;
  previewImageUrl?: string | null;
  livePreviewAvailable: boolean;
  commerce: TemplateCommerceMeta;
  reviews: TemplateReviewSummary;
  analytics: TemplateAnalyticsStub;
  versions: TemplateVersion[];
  /** Maps into Website Builder generation. */
  premiumTemplateId: string;
  marketplaceTemplateId: string;
  designPreset: string;
  tags: string[];
  favorited?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UploadTemplateInput = {
  title: string;
  tagline?: string;
  description: string;
  category: CreatorMarketplaceCategory;
  style: MarketplaceStyleVariation;
  features: string[];
  premiumTemplateId?: string;
  marketplaceTemplateId?: string;
  designPreset?: string;
  priceCents?: number;
  priceModel?: TemplatePriceModel;
  version?: string;
  changelog?: string;
  status?: TemplateListingStatus;
};

export type MarketplaceListFilters = {
  category?: CreatorMarketplaceCategory | "all";
  style?: MarketplaceStyleVariation | "all";
  query?: string;
  price?: "all" | "free" | "paid";
  sort?: "popular" | "newest" | "rating" | "price-asc" | "price-desc";
  creatorId?: string;
  favoritesOnly?: boolean;
};

/** Map AI marketplace categories → commerce categories. */
export function toCreatorCategory(
  category: MarketplaceCategory | string,
): CreatorMarketplaceCategory | null {
  const map: Record<string, CreatorMarketplaceCategory> = {
    automotive: "automotive",
    restaurant: "restaurant",
    saas: "saas",
    "real-estate": "real-estate",
    healthcare: "healthcare",
    ecommerce: "ecommerce",
    agency: "agency",
    finance: "finance",
  };
  return map[category] ?? null;
}
