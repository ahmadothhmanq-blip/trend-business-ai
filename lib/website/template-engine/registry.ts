import type {
  WbTemplateId,
  WbTemplateListItem,
  WbTemplateManifest,
  WbTemplatePackage,
  WbTemplateRegistryEntry,
} from "@/lib/website/template-engine/types";

function toListItem(entry: WbTemplateRegistryEntry): WbTemplateListItem {
  const { manifest } = entry;
  const defaultLayout =
    entry.package.layouts[entry.package.entry.defaultLayoutId] ??
    Object.values(entry.package.layouts)[0];

  return {
    id: manifest.id,
    version: manifest.version,
    name: manifest.name,
    description: manifest.description,
    category: manifest.metadata.category,
    tags: manifest.metadata.tags,
    thumbnail: manifest.media.thumbnail,
    preview: manifest.media.preview,
    layout: defaultLayout?.kind ?? manifest.layouts[0]!.kind,
    regionCount: manifest.regions.length,
    pageCount: manifest.pages.length,
  };
}

/**
 * In-memory registry for installable website templates.
 * Populated exclusively by the template-engine loader.
 */
export class WbTemplateRegistry {
  private readonly entries = new Map<WbTemplateId, WbTemplateRegistryEntry>();
  private lastLoadedAt: string | null = null;

  clear(): void {
    this.entries.clear();
    this.lastLoadedAt = null;
  }

  register(pkg: WbTemplatePackage): WbTemplateRegistryEntry {
    const entry: WbTemplateRegistryEntry = {
      id: pkg.manifest.id,
      manifest: pkg.manifest,
      package: pkg,
    };
    this.entries.set(pkg.manifest.id, entry);
    this.lastLoadedAt = new Date().toISOString();
    return entry;
  }

  unregister(id: WbTemplateId): boolean {
    return this.entries.delete(id);
  }

  has(id: WbTemplateId): boolean {
    return this.entries.has(id);
  }

  get(id: WbTemplateId): WbTemplateRegistryEntry | null {
    return this.entries.get(id) ?? null;
  }

  getManifest(id: WbTemplateId): WbTemplateManifest | null {
    return this.entries.get(id)?.manifest ?? null;
  }

  getPackage(id: WbTemplateId): WbTemplatePackage | null {
    return this.entries.get(id)?.package ?? null;
  }

  list(): WbTemplateListItem[] {
    return [...this.entries.values()]
      .map(toListItem)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  listManifests(): WbTemplateManifest[] {
    return [...this.entries.values()]
      .map((entry) => entry.manifest)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  size(): number {
    return this.entries.size;
  }

  getLastLoadedAt(): string | null {
    return this.lastLoadedAt;
  }
}

let defaultRegistry: WbTemplateRegistry | null = null;

export function getWbTemplateRegistry(): WbTemplateRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new WbTemplateRegistry();
  }
  return defaultRegistry;
}

export function resetWbTemplateRegistry(): void {
  defaultRegistry?.clear();
  defaultRegistry = null;
}
