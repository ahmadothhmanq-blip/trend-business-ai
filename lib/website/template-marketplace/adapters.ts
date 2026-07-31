import type {
  WbTemplateListItem,
  WbTemplateManifest,
  WbTemplateRegistryEntry,
} from "@/lib/website/template-engine/types";
import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";

export function mapInstalledListItemToMarketplaceListing(
  item: WbTemplateListItem,
  manifest?: WbTemplateManifest | null,
  options?: {
    featured?: boolean;
    featuredRank?: number;
    installedAt?: string;
  },
): WbTemplateMarketplaceListing {
  const metadata = manifest?.metadata;

  return {
    id: item.id,
    version: item.version,
    name: item.name,
    description: item.description,
    category: item.category as WbTemplateMarketplaceListing["category"],
    tags: [...item.tags],
    layout: item.layout,
    regionCount: item.regionCount,
    pageCount: item.pageCount,
    thumbnail: item.thumbnail,
    preview: item.preview,
    source: "installed",
    availability: "installed",
    featured: options?.featured ?? false,
    featuredRank: options?.featuredRank,
    installedAt: options?.installedAt,
    metadata: {
      author: metadata?.author ?? { name: "Unknown" },
      license: metadata?.license,
      homepage: metadata?.homepage,
      repository: metadata?.repository,
      keywords: metadata?.keywords ? [...metadata.keywords] : undefined,
      updateChannel: manifest?.update?.channel,
      releasedAt: manifest?.update?.releasedAt,
      changelog: manifest?.update?.changelog,
      compatibility: manifest?.compatibility,
    },
  };
}

export function mapInstalledRegistryEntryToMarketplaceListing(
  entry: WbTemplateRegistryEntry,
  options?: {
    featured?: boolean;
    featuredRank?: number;
    installedAt?: string;
  },
): WbTemplateMarketplaceListing {
  const defaultLayout =
    entry.package.layouts[entry.package.entry.defaultLayoutId] ??
    Object.values(entry.package.layouts)[0];

  const listItem: WbTemplateListItem = {
    id: entry.manifest.id,
    version: entry.manifest.version,
    name: entry.manifest.name,
    description: entry.manifest.description,
    category: entry.manifest.metadata.category,
    tags: entry.manifest.metadata.tags,
    thumbnail: entry.manifest.media.thumbnail,
    preview: entry.manifest.media.preview,
    layout: defaultLayout?.kind ?? entry.manifest.layouts[0]!.kind,
    regionCount: entry.manifest.regions.length,
    pageCount: entry.manifest.pages.length,
  };

  return mapInstalledListItemToMarketplaceListing(
    listItem,
    entry.manifest,
    options,
  );
}

export function mapMarketplaceListingToListItem(
  listing: WbTemplateMarketplaceListing,
): WbTemplateListItem {
  return {
    id: listing.id,
    version: listing.version,
    name: listing.name,
    description: listing.description,
    category: listing.category,
    tags: [...listing.tags],
    thumbnail: listing.thumbnail,
    preview: listing.preview,
    layout: listing.layout,
    regionCount: listing.regionCount,
    pageCount: listing.pageCount,
  };
}

export function canSelectMarketplaceListing(
  listing: WbTemplateMarketplaceListing,
): boolean {
  return listing.availability === "installed";
}

export function mapRemoteSeedToMarketplaceListing(
  seed: WbTemplateMarketplaceListing,
): WbTemplateMarketplaceListing {
  return {
    ...seed,
    source: "remote",
    availability: "remote",
    tags: [...seed.tags],
    metadata: {
      ...seed.metadata,
      author: { ...seed.metadata.author },
      keywords: seed.metadata.keywords ? [...seed.metadata.keywords] : undefined,
      compatibility: seed.metadata.compatibility
        ? { ...seed.metadata.compatibility }
        : undefined,
    },
    remote: seed.remote ? { ...seed.remote } : undefined,
  };
}
