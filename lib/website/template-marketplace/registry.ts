import {
  WB_TEMPLATE_MARKETPLACE_DEFAULT_SORT,
  WB_TEMPLATE_MARKETPLACE_VERSION,
} from "@/lib/website/template-marketplace/constants";
import {
  mapInstalledRegistryEntryToMarketplaceListing,
} from "@/lib/website/template-marketplace/adapters";
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

const FEATURED_INSTALLED_RANKS: Record<string, number> = {
  "modern-business": 1,
};

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
    const next = new Map<string, WbTemplateMarketplaceListing>();

    for (const remote of listRemoteMarketplaceListings()) {
      next.set(remote.id, remote);
    }

    for (const item of engineRegistry.list()) {
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

    return {
      marketplaceVersion: WB_TEMPLATE_MARKETPLACE_VERSION,
      installedCount,
      remoteCount,
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
