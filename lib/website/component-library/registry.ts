import type {
  WbComponentId,
  WbComponentListItem,
  WbComponentManifest,
  WbComponentRegistryEntry,
  WbComponentResolvedPackage,
} from "@/lib/website/component-library/types";

function toListItem(entry: WbComponentRegistryEntry): WbComponentListItem {
  const { manifest } = entry;
  return {
    id: manifest.id,
    name: manifest.name,
    category: manifest.category,
    capability: manifest.capability,
    version: manifest.version,
    description: manifest.description,
    composable: manifest.composable,
    primitive: manifest.primitive,
    tags: manifest.tags ?? [],
  };
}

/**
 * In-memory registry for installable website components.
 */
export class WbComponentRegistry {
  private readonly entries = new Map<WbComponentId, WbComponentRegistryEntry>();
  private lastLoadedAt: string | null = null;

  clear(): void {
    this.entries.clear();
    this.lastLoadedAt = null;
  }

  register(pkg: WbComponentResolvedPackage): WbComponentRegistryEntry {
    const entry: WbComponentRegistryEntry = {
      id: pkg.manifest.id,
      manifest: pkg.manifest,
      package: pkg,
    };
    this.entries.set(pkg.manifest.id, entry);
    this.lastLoadedAt = new Date().toISOString();
    return entry;
  }

  unregister(id: WbComponentId): boolean {
    return this.entries.delete(id);
  }

  has(id: WbComponentId): boolean {
    return this.entries.has(id);
  }

  get(id: WbComponentId): WbComponentRegistryEntry | null {
    return this.entries.get(id) ?? null;
  }

  getManifest(id: WbComponentId): WbComponentManifest | null {
    return this.entries.get(id)?.manifest ?? null;
  }

  getPackage(id: WbComponentId): WbComponentResolvedPackage | null {
    return this.entries.get(id)?.package ?? null;
  }

  list(): WbComponentListItem[] {
    return [...this.entries.values()]
      .map(toListItem)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  listByCategory(category: WbComponentListItem["category"]): WbComponentListItem[] {
    return this.list().filter((item) => item.category === category);
  }

  listByCapability(capability: WbComponentListItem["capability"]): WbComponentListItem[] {
    return this.list().filter((item) => item.capability === capability);
  }

  listManifests(): WbComponentManifest[] {
    return [...this.entries.values()]
      .map((entry) => entry.manifest)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  installedComponentIds(): Set<WbComponentId> {
    return new Set(this.entries.keys());
  }

  size(): number {
    return this.entries.size;
  }

  getLastLoadedAt(): string | null {
    return this.lastLoadedAt;
  }
}

let defaultRegistry: WbComponentRegistry | null = null;

export function getWbComponentRegistry(): WbComponentRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new WbComponentRegistry();
  }
  return defaultRegistry;
}

export function resetWbComponentRegistry(): void {
  defaultRegistry?.clear();
  defaultRegistry = null;
}
