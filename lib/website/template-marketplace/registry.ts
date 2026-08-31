import {
  WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
  WB_TEMPLATE_MARKETPLACE_VERSION,
} from "@/lib/website/template-marketplace/constants";
import {
  buildSupersessionAliasListing,
  mapInstalledRegistryEntryToMarketplaceListing,
  mapStructureTemplateToMarketplaceListing,
} from "@/lib/website/template-marketplace/adapters";
import { WEBSITE_STRUCTURE_TEMPLATES } from "@/lib/website/builder/unified-template-registry";
import {
  getRemoteMarketplaceListing,
  listRemoteMarketplaceListings,
} from "@/lib/website/template-marketplace/remote-catalog";
import type {
  WbTemplateMarketplaceListing,
  WbTemplateMarketplaceRegistryStatus,
} from "@/lib/website/template-marketplace/types";
import {
  getWbTemplateRegistry,
  initializeWbTemplateEngine,
} from "@/lib/website/template-engine/index.server";
import { PACKAGE_SUPERSESSION_ALIASES } from "@/lib/website/builder/package-supersession-aliases";
import { promises as fs } from "node:fs";
import { resolveRegistryPackageDir } from "@/lib/website/template-marketplace/install.server";

const FEATURED_INSTALLED_RANKS: Record<string, number> = {};

async function registryPackageExists(templateId: string): Promise<boolean> {
  try {
    await fs.access(resolveRegistryPackageDir(templateId));
    return true;
  } catch {
    return false;
  }
}

/** Alias ids that keep marketplace featured visibility (distinct product brands). */
const FEATURED_ALIAS_IDS = new Set<string>();

async function applySupersessionAliasListings(
  listings: Map<string, WbTemplateMarketplaceListing>,
): Promise<void> {
  for (const [aliasId, targetId] of Object.entries(PACKAGE_SUPERSESSION_ALIASES)) {
    const target = listings.get(targetId);
    if (target?.availability !== "installed") continue;

    const remoteSeed = getRemoteMarketplaceListing(aliasId);
    // Without its own marketplace identity an alias would duplicate the target card.
    if (!remoteSeed) continue;

    listings.set(
      aliasId,
      buildSupersessionAliasListing(
        aliasId,
        target,
        remoteSeed,
        FEATURED_INSTALLED_RANKS[aliasId],
      ),
    );
    const aliasListing = listings.get(aliasId);
    if (aliasListing) {
      listings.set(aliasId, {
        ...aliasListing,
        featured: FEATURED_ALIAS_IDS.has(aliasId) ? aliasListing.featured : false,
      });
    }
  }
}

function mergeUnifiedStructureTemplateListings(
  listings: Map<string, WbTemplateMarketplaceListing>,
  installedAt: string,
): void {
  for (const template of WEBSITE_STRUCTURE_TEMPLATES) {
    if (listings.has(template.id)) {
      continue;
    }

    const featuredRank = FEATURED_INSTALLED_RANKS[template.id];
    listings.set(
      template.id,
      mapStructureTemplateToMarketplaceListing(template, {
        installedAt,
        featured: featuredRank !== undefined,
        featuredRank,
      }),
    );
  }
}

async function markUnavailableRemoteListings(
  listings: Map<string, WbTemplateMarketplaceListing>,
): Promise<void> {
  for (const [id, listing] of listings.entries()) {
    if (listing.availability !== "remote") continue;

    const registryId = listing.remote?.registryId?.trim() || id;
    if (await registryPackageExists(registryId)) continue;

    listings.set(id, {
      ...listing,
      availability: "unavailable",
      featured: false,
    });
  }
}

/**
 * In-memory marketplace registry.
 * Merges installed template-engine packages with remote metadata listings.
 */
export class WbTemplateMarketplaceRegistry {
  private listings = new Map<string, WbTemplateMarketplaceListing>();
  private lastRefreshedAt: string | null = null;

  async refresh(): Promise<void> {
    await initializeWbTemplateEngine();
    const engineRegistry = getWbTemplateRegistry();

    // Installed packages on disk are the catalog source of truth; the unified
    // structure registry only adds legacy V1 presets when it is populated.
    const publicTemplateIds = new Set([
      ...engineRegistry.list().map((item) => item.id),
      ...WEBSITE_STRUCTURE_TEMPLATES.map((template) => template.id),
    ]);

    if (publicTemplateIds.size === 0) {
      this.listings = new Map();
      this.lastRefreshedAt = new Date().toISOString();
      return;
    }

    const next = new Map<string, WbTemplateMarketplaceListing>();

    for (const remote of listRemoteMarketplaceListings()) {
      if (!publicTemplateIds.has(remote.id)) continue;
      next.set(remote.id, remote);
    }

    for (const item of engineRegistry.list()) {
      if (!publicTemplateIds.has(item.id)) continue;
      const entry = engineRegistry.get(item.id);
      if (!entry) continue;

      const remoteSeed = getRemoteMarketplaceListing(entry.id);
      const featuredRank =
        remoteSeed?.featuredRank ?? FEATURED_INSTALLED_RANKS[entry.id];
      const installed = mapInstalledRegistryEntryToMarketplaceListing(entry, {
        featured: remoteSeed?.featured ?? featuredRank !== undefined,
        featuredRank,
        installedAt: this.lastRefreshedAt ?? new Date().toISOString(),
      });
      next.set(installed.id, installed);
    }

    await applySupersessionAliasListings(next);
    mergeUnifiedStructureTemplateListings(
      next,
      this.lastRefreshedAt ?? new Date().toISOString(),
    );
    await markUnavailableRemoteListings(next);

    this.listings = next;
    this.lastRefreshedAt = new Date().toISOString();
  }

  async ensureFresh(): Promise<void> {
    if (!this.lastRefreshedAt) {
      await this.refresh();
    }
  }

  list(): WbTemplateMarketplaceListing[] {
    return [...this.listings.values()];
  }

  get(id: string): WbTemplateMarketplaceListing | null {
    return this.listings.get(id) ?? null;
  }

  getStatus(): WbTemplateMarketplaceRegistryStatus {
    const listings = this.list();
    const installedCount = listings.filter(
      (listing) => listing.availability === "installed",
    ).length;
    const remoteCount = listings.filter(
      (listing) => listing.availability === "remote",
    ).length;
    const unavailableCount = listings.filter(
      (listing) => listing.availability === "unavailable",
    ).length;

    return {
      marketplaceVersion: WB_TEMPLATE_MARKETPLACE_VERSION,
      installedCount,
      remoteCount,
      unavailableCount,
      listingCount: listings.length,
      featuredCount: listings.filter((listing) => listing.featured).length,
      lastRefreshedAt: this.lastRefreshedAt,
    };
  }

  clear(): void {
    this.listings.clear();
    this.lastRefreshedAt = null;
  }
}

let registrySingleton: WbTemplateMarketplaceRegistry | null = null;

export function getWbTemplateMarketplaceRegistry(): WbTemplateMarketplaceRegistry {
  if (!registrySingleton) {
    registrySingleton = new WbTemplateMarketplaceRegistry();
  }
  return registrySingleton;
}

export function resetWbTemplateMarketplaceRegistry(): void {
  registrySingleton?.clear();
  registrySingleton = null;
}

export async function initializeWbTemplateMarketplace(): Promise<WbTemplateMarketplaceRegistryStatus> {
  const registry = getWbTemplateMarketplaceRegistry();
  await registry.refresh();
  return registry.getStatus();
}

export async function listTemplateMarketplaceRegistryListings(): Promise<
  WbTemplateMarketplaceListing[]
> {
  const registry = getWbTemplateMarketplaceRegistry();
  await registry.ensureFresh();
  return registry.list();
}

export async function getTemplateMarketplaceRegistryListing(
  id: string,
): Promise<WbTemplateMarketplaceListing | null> {
  const registry = getWbTemplateMarketplaceRegistry();
  await registry.ensureFresh();
  return registry.get(id) ?? getRemoteMarketplaceListing(id);
}

export function getTemplateMarketplaceDefaultSort() {
  return { ...WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT };
}
