import type { WbTemplateResolvedPackage } from "@/lib/website/template-engine/spec/types";
import type {
  WbTemplateRendererPackageInput,
  WbTemplateRuntimePageDefinition,
} from "@/lib/website/template-renderer-contract/types";

type EnginePageBlueprint = {
  id: string;
  title: string;
  path: string;
  layoutId: string;
  regions: string[];
  description?: string;
  optional?: boolean;
};

function orderPageRegionIds(
  layoutRegionOrder: string[] | undefined,
  pageRegions: string[],
): string[] {
  const active = new Set(pageRegions);
  if (layoutRegionOrder) {
    return layoutRegionOrder.filter((regionId) => active.has(regionId));
  }
  return [...pageRegions].sort((a, b) => a.localeCompare(b));
}

function adaptPages(
  pkg: WbTemplateResolvedPackage,
): Record<string, WbTemplateRuntimePageDefinition> {
  const pages: Record<string, WbTemplateRuntimePageDefinition> = {};

  for (const [pageId, page] of Object.entries(pkg.pages) as Array<
    [string, EnginePageBlueprint]
  >) {
    const layout = pkg.layouts[page.layoutId];
    pages[pageId] = {
      id: page.id,
      title: page.title,
      path: page.path,
      layoutId: page.layoutId,
      regionIds: orderPageRegionIds(layout?.regionOrder, page.regions),
      ...(page.description ? { description: page.description } : {}),
      ...(page.optional ? { optional: page.optional } : {}),
    };
  }

  return pages;
}

/**
 * Adapts a Template Engine resolved package into renderer contract input shape.
 * Does not mutate the source package.
 */
export function adaptResolvedTemplatePackage(
  pkg: WbTemplateResolvedPackage,
): WbTemplateRendererPackageInput {
  return {
    manifest: {
      specVersion: pkg.manifest.specVersion,
      id: pkg.manifest.id,
      version: pkg.manifest.version,
      name: pkg.manifest.name,
      description: pkg.manifest.description,
      metadata: pkg.manifest.metadata,
      media: pkg.manifest.media,
      compatibility: pkg.manifest.compatibility,
      responsive: pkg.manifest.responsive,
    },
    entry: {
      defaultPageId: pkg.entry.defaultPageId,
      defaultLayoutId: pkg.entry.defaultLayoutId,
    },
    canvas: pkg.canvas,
    placementRules: pkg.placementRules,
    ...(pkg.componentTypes ? { componentTypes: pkg.componentTypes } : {}),
    layouts: pkg.layouts,
    regions: pkg.regions,
    pages: adaptPages(pkg),
    mediaPaths: {
      thumbnail: pkg.mediaPaths.thumbnail,
      preview: pkg.mediaPaths.preview,
      gallery: [...pkg.mediaPaths.gallery],
    },
    loadedAt: pkg.loadedAt,
    rootDir: pkg.rootDir,
    packageDirName: pkg.packageDirName,
  };
}
