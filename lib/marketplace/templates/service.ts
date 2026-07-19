/**
 * Creator Template Marketplace service layer.
 */

import {
  getMarketplaceTemplate,
  buildMarketplacePreviewHtml,
  MARKETPLACE_STYLE_VARIATIONS,
} from "@/lib/ai-core/template-marketplace";
import {
  addTemplateVersion,
  ensureCreatorForUser,
  getCreatorListing,
  getCreatorProfile,
  listCreatorListings,
  listCreatorMarketplaceCategories,
  listCreatorProfiles,
  recordTemplateUse,
  toggleFavorite,
  uploadCreatorTemplate,
} from "@/lib/marketplace/templates/store";
import type {
  CreatorTemplateListing,
  MarketplaceListFilters,
  UploadTemplateInput,
} from "@/lib/marketplace/templates/types";

export function getCreatorMarketplaceCatalog(
  filters?: MarketplaceListFilters,
  userId?: string | null,
) {
  const listings = listCreatorListings(filters, userId);
  return {
    listings,
    count: listings.length,
    categories: listCreatorMarketplaceCategories(),
    styles: MARKETPLACE_STYLE_VARIATIONS as string[],
    creators: listCreatorProfiles(),
  };
}

export function getCreatorMarketplaceListingDetail(
  idOrSlug: string,
  userId?: string | null,
) {
  const listing = getCreatorListing(idOrSlug, userId);
  if (!listing) return null;

  const seed = getMarketplaceTemplate(listing.marketplaceTemplateId);
  const previewHtml = seed
    ? buildMarketplacePreviewHtml(seed)
    : buildFallbackPreviewHtml(listing);

  return { listing, previewHtml };
}

export type TemplateHandoffPayload = {
  templateId: string;
  marketplaceTemplateId: string;
  listingId: string;
  industry: string;
  style: string;
  designPreset: string;
  components: string[];
  title: string;
  tagline: string;
  description: string;
  /** When true, Website Builder starts generation immediately. */
  autoGenerate: boolean;
};

/**
 * Build Website Builder URL that seeds generation + opens preview.
 */
export function buildTemplateHandoff(
  listing: CreatorTemplateListing,
): TemplateHandoffPayload {
  const latest = listing.versions.find((v) => v.isLatest) || listing.versions[0];
  return {
    templateId: latest?.premiumTemplateId || listing.premiumTemplateId,
    marketplaceTemplateId:
      latest?.marketplaceTemplateId || listing.marketplaceTemplateId,
    listingId: listing.id,
    industry: listing.category,
    style: listing.style,
    designPreset: listing.designPreset,
    components: listing.features.slice(0, 12),
    title: listing.title,
    tagline: listing.tagline,
    description: listing.description,
    autoGenerate: true,
  };
}

export function buildUseTemplateHref(listing: CreatorTemplateListing): string {
  const handoff = buildTemplateHandoff(listing);
  const params = new URLSearchParams({
    templateId: handoff.templateId,
    marketplaceTemplateId: handoff.marketplaceTemplateId,
    templateStyle: handoff.style,
    designPreset: handoff.designPreset,
    listingId: handoff.listingId,
    industry: handoff.industry,
    components: handoff.components.join(","),
    title: handoff.title,
    tagline: handoff.tagline,
    autoGenerate: "1",
    useTemplate: "1",
  });
  return `/dashboard/website-builder?${params.toString()}`;
}

export function useCreatorTemplate(listingId: string) {
  const listing = getCreatorListing(listingId);
  if (!listing) return null;
  recordTemplateUse(listingId);
  const resolved = getCreatorListing(listingId)!;
  const handoff = buildTemplateHandoff(resolved);
  return {
    listing: resolved,
    builderHref: buildUseTemplateHref(resolved),
    handoff,
  };
}

export function favoriteCreatorTemplate(userId: string, listingId: string) {
  return toggleFavorite(userId, listingId);
}

export function publishCreatorTemplate(params: {
  userId: string;
  displayName: string;
  email?: string | null;
  input: UploadTemplateInput;
}) {
  return uploadCreatorTemplate(params);
}

export function versionCreatorTemplate(params: {
  listingId: string;
  userId: string;
  version: string;
  changelog: string;
  premiumTemplateId?: string;
  marketplaceTemplateId?: string;
}) {
  return addTemplateVersion(params);
}

export function getOrCreateCreatorProfile(params: {
  userId: string;
  displayName: string;
  email?: string | null;
}) {
  return ensureCreatorForUser(params);
}

export function getPublicCreatorProfile(idOrHandle: string) {
  const profile = getCreatorProfile(idOrHandle);
  if (!profile) return null;
  const listings = listCreatorListings({ creatorId: profile.id });
  return { profile, listings, count: listings.length };
}

function buildFallbackPreviewHtml(listing: CreatorTemplateListing): string {
  const features = listing.features
    .slice(0, 6)
    .map((f) => `<li style="margin:0.35rem 0">${escapeHtml(f)}</li>`)
    .join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><style>
    body{margin:0;font-family:Georgia,serif;color:#111;background:#faf8f5}
    .hero{min-height:52vh;display:flex;flex-direction:column;justify-content:flex-end;padding:2.5rem;background:${listing.previewGradient};color:#fff}
    .hero h1{margin:0;font-size:clamp(2rem,5vw,3.2rem);letter-spacing:-0.03em}
    .hero p{margin:.75rem 0 0;max-width:36rem;opacity:.9;font-family:system-ui,sans-serif;font-size:.95rem}
    .meta{padding:1.5rem 2.5rem;font-family:system-ui,sans-serif;font-size:.8rem;color:#555;display:flex;gap:1rem;flex-wrap:wrap;border-bottom:1px solid #e8e4dc}
    main{padding:2rem 2.5rem}
    h2{font-size:1.1rem;margin:0 0 1rem}
    ul{padding-left:1.1rem;color:#333;font-family:system-ui,sans-serif;font-size:.9rem}
  </style></head><body>
    <section class="hero"><h1>${escapeHtml(listing.title)}</h1><p>${escapeHtml(listing.tagline)}</p></section>
    <div class="meta"><span>${escapeHtml(listing.category)}</span><span>${escapeHtml(listing.style)}</span><span>by ${escapeHtml(listing.author.displayName)}</span></div>
    <main><h2>Features</h2><ul>${features}</ul><p style="margin-top:1.5rem;color:#666;font-family:system-ui,sans-serif;font-size:.9rem">${escapeHtml(listing.description)}</p></main>
  </body></html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
