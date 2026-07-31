import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";
import { mapRemoteSeedToMarketplaceListing } from "@/lib/website/template-marketplace/adapters";
import { PREMIUM_REMOTE_TEMPLATE_SEEDS } from "@/lib/website/template-marketplace/premium-remote-catalog.generated";

/**
 * Premium template marketplace listings (30 world-class industry templates).
 * Packages are distributed from `templates/website-registry/<id>/` and pre-installed
 * in `templates/website/<id>/`.
 */
export const WB_TEMPLATE_MARKETPLACE_REMOTE_LISTINGS: WbTemplateMarketplaceListing[] =
  PREMIUM_REMOTE_TEMPLATE_SEEDS.map(mapRemoteSeedToMarketplaceListing);

export function listRemoteMarketplaceListings(): WbTemplateMarketplaceListing[] {
  return WB_TEMPLATE_MARKETPLACE_REMOTE_LISTINGS.map((listing) => ({
    ...listing,
    tags: [...listing.tags],
    metadata: {
      ...listing.metadata,
      author: { ...listing.metadata.author },
      keywords: listing.metadata.keywords
        ? [...listing.metadata.keywords]
        : undefined,
    },
    remote: listing.remote ? { ...listing.remote } : undefined,
  }));
}

export function getRemoteMarketplaceListing(
  id: string,
): WbTemplateMarketplaceListing | null {
  return (
    WB_TEMPLATE_MARKETPLACE_REMOTE_LISTINGS.find((listing) => listing.id === id) ??
    null
  );
}
