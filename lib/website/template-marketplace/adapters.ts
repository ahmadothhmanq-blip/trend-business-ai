import type {
  WbTemplateListItem,
  WbTemplateManifest,
  WbTemplateRegistryEntry,
} from "@/lib/website/template-engine/types";
import {
  WB_TEMPLATE_LAYOUT_KINDS,
} from "@/lib/website/template-engine/spec/constants";
import type {
  WbTemplateCategory,
  WbTemplateLayoutKind,
} from "@/lib/website/template-engine/spec/types";
import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import type { WebsiteStructureTemplate } from "@/lib/website/contracts/structure";
import { WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS } from "@/lib/website/template-marketplace/constants";
import { resolveInstalledTemplateMediaUrl } from "@/lib/website/template-marketplace/media-url";
import { resolveStructureTemplateIntelligenceId } from "@/lib/website/builder/template-package-ti-mapping";
import { resolveTemplateDisplayName } from "@/lib/website/builder/template-display-names";
import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";

const MARKETPLACE_CATEGORY_IDS = new Set(
  WB_TEMPLATE_MARKETPLACE_CATEGORY_DEFINITIONS.map((definition) => definition.id),
);

function resolveMarketplaceCategory(industry: string): WbTemplateCategory {
  const normalized = industry.trim().toLowerCase().replace(/\s+/g, "-");
  if (MARKETPLACE_CATEGORY_IDS.has(normalized as WbTemplateCategory)) {
    return normalized as WbTemplateCategory;
  }
  return "other";
}

function resolveMarketplaceLayoutKind(layoutType: string): WbTemplateLayoutKind {
  const normalized = layoutType.trim().toLowerCase();
  if ((WB_TEMPLATE_LAYOUT_KINDS as readonly string[]).includes(normalized)) {
    return normalized as WbTemplateLayoutKind;
  }
  if (normalized.includes("full-bleed") || normalized.includes("editorial")) {
    return "full-bleed";
  }
  if (normalized.includes("sidebar-right")) return "sidebar-right";
  if (normalized.includes("sidebar")) return "sidebar-left";
  return "single-column";
}

/** Synthetic installed listing for unified-registry templates missing from marketplace. */
export function mapStructureTemplateToMarketplaceListing(
  template: WebsiteStructureTemplate,
  options?: {
    installedAt?: string;
    featured?: boolean;
    featuredRank?: number;
  },
): WbTemplateMarketplaceListing {
  const ti = getTemplateIntelligence(template.templateIntelligenceId);
  const category = resolveMarketplaceCategory(template.industry);
  const tagSet = new Set<string>([category]);
  for (const keyword of ti?.keywords?.slice(0, 4) ?? []) {
    tagSet.add(keyword.toLowerCase());
  }

  const usePackageMedia = template.architectureVersion === "v2";

  return {
    id: template.id,
    version: template.architectureVersion === "v2" ? "2.0.0" : "1.0.0",
    name: template.label,
    description: template.description,
    category,
    tags: [...tagSet],
    layout: resolveMarketplaceLayoutKind(template.layoutType),
    regionCount: Math.max(template.sections.length, 1),
    pageCount: 1,
    thumbnail: usePackageMedia
      ? resolveInstalledTemplateMediaUrl(template.id, "thumbnail")
      : "",
    preview: usePackageMedia
      ? resolveInstalledTemplateMediaUrl(template.id, "preview")
      : "",
    source: "installed",
    availability: "installed",
    featured: options?.featured ?? false,
    featuredRank: options?.featuredRank,
    installedAt: options?.installedAt,
    metadata: {
      author: {
        name: "Trend Business AI",
        organization:
          template.architectureVersion === "v1"
            ? "Template Intelligence"
            : "Premium Template Studio",
      },
      templateIntelligenceId: template.templateIntelligenceId,
      premium: Boolean(template.premiumTemplateId),
      keywords: ti?.keywords ? [...ti.keywords] : undefined,
    },
  };
}

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
  const extendedMetadata = metadata as
    | (typeof metadata & {
        templateIntelligenceId?: string;
        premium?: boolean;
        localizedNames?: Record<string, string>;
      })
    | undefined;

  return {
    id: item.id,
    version: item.version,
    name: resolveTemplateDisplayName(item.id, item.name),
    description: item.description,
    category: item.category as WbTemplateMarketplaceListing["category"],
    tags: [...item.tags],
    layout: item.layout,
    regionCount: item.regionCount,
    pageCount: item.pageCount,
    thumbnail: resolveInstalledTemplateMediaUrl(item.id, "thumbnail"),
    preview: resolveInstalledTemplateMediaUrl(item.id, "preview"),
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
      templateIntelligenceId:
        extendedMetadata?.templateIntelligenceId ??
        resolveStructureTemplateIntelligenceId(item.id),
      premium: extendedMetadata?.premium,
      localizedNames: extendedMetadata?.localizedNames
        ? { ...extendedMetadata.localizedNames }
        : undefined,
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

export function canInstallMarketplaceListing(
  listing: WbTemplateMarketplaceListing,
): boolean {
  return listing.availability === "remote";
}

/**
 * Virtual installed listing for a legacy alias id that superseded to an active package.
 */
export function buildSupersessionAliasListing(
  aliasId: string,
  target: WbTemplateMarketplaceListing,
  remoteSeed?: WbTemplateMarketplaceListing | null,
  featuredRank?: number,
): WbTemplateMarketplaceListing {
  return {
    ...target,
    id: aliasId,
    name: remoteSeed?.name ?? target.name,
    description: remoteSeed?.description ?? target.description,
    category: remoteSeed?.category ?? target.category,
    layout: remoteSeed?.layout ?? target.layout,
    thumbnail: remoteSeed?.thumbnail ?? target.thumbnail,
    preview: remoteSeed?.preview ?? target.preview,
    tags: remoteSeed?.tags ? [...remoteSeed.tags] : [...target.tags],
    featured: remoteSeed?.featured ?? target.featured,
    featuredRank: remoteSeed?.featuredRank ?? featuredRank ?? target.featuredRank,
    availability: "installed",
    source: "installed",
    remote: undefined,
    metadata: {
      ...target.metadata,
      ...(remoteSeed?.metadata.keywords
        ? { keywords: [...remoteSeed.metadata.keywords] }
        : {}),
      ...(remoteSeed?.metadata.localizedNames
        ? { localizedNames: { ...remoteSeed.metadata.localizedNames } }
        : {}),
    },
  };
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
