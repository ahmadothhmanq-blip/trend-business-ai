import { WB_TEMPLATE_RENDERER_CONTRACT_VERSION } from "@/lib/website/template-renderer-contract/constants";
import type {
  WbTemplateRendererPackageInput,
  WbTemplateRendererScope,
  WbTemplateRuntimeModel,
  WbTemplateRuntimeRegion,
  WbTemplateRuntimeRegionPlacement,
} from "@/lib/website/template-renderer-contract/types";

function sortRecord<T>(record: Record<string, T>): Record<string, T> {
  return Object.fromEntries(
    Object.keys(record)
      .sort((a, b) => a.localeCompare(b))
      .map((key) => [key, record[key]]),
  );
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function mergePlacementRules(
  base: WbTemplateRuntimeRegionPlacement,
  override?: Partial<WbTemplateRuntimeRegionPlacement>,
): WbTemplateRuntimeRegionPlacement {
  if (!override) {
    return clone(base);
  }

  return {
    ...base,
    ...override,
    allowedComponentTypes: override.allowedComponentTypes ?? [...base.allowedComponentTypes],
    mutuallyExclusive: override.mutuallyExclusive
      ? override.mutuallyExclusive.map((group) => [...group])
      : base.mutuallyExclusive
        ? base.mutuallyExclusive.map((group) => [...group])
        : undefined,
    requiredTypes: override.requiredTypes
      ? [...override.requiredTypes]
      : base.requiredTypes
        ? [...base.requiredTypes]
        : undefined,
  };
}

function normalizePlacementRules(
  pkg: WbTemplateRendererPackageInput,
): WbTemplateRuntimeModel["placementRules"] {
  const rules = clone(pkg.placementRules);

  if (rules.regionOverrides) {
    rules.regionOverrides = sortRecord(rules.regionOverrides);
  }

  if (rules.constraints) {
    rules.constraints = [...rules.constraints].sort((a, b) =>
      a.id.localeCompare(b.id),
    );
  }

  return rules;
}

function normalizeRegions(
  pkg: WbTemplateRendererPackageInput,
): Record<string, WbTemplateRuntimeRegion> {
  const regions: Record<string, WbTemplateRuntimeRegion> = {};

  for (const regionId of Object.keys(pkg.regions).sort((a, b) => a.localeCompare(b))) {
    const region = pkg.regions[regionId];
    regions[regionId] = {
      id: region.id,
      role: region.role,
      ...(region.label ? { label: region.label } : {}),
      ...(region.description ? { description: region.description } : {}),
      layout: clone(region.layout),
      placement: mergePlacementRules(
        region.placement,
        pkg.placementRules.regionOverrides?.[regionId],
      ),
      ...(region.responsive ? { responsive: clone(region.responsive) } : {}),
    };
  }

  return regions;
}

function normalizeLayouts(
  pkg: WbTemplateRendererPackageInput,
): WbTemplateRuntimeModel["layouts"] {
  const layouts: WbTemplateRuntimeModel["layouts"] = {};

  for (const layoutId of Object.keys(pkg.layouts).sort((a, b) => a.localeCompare(b))) {
    const layout = pkg.layouts[layoutId];
    layouts[layoutId] = {
      id: layout.id,
      kind: layout.kind,
      ...(layout.label ? { label: layout.label } : {}),
      ...(layout.description ? { description: layout.description } : {}),
      regionOrder: [...layout.regionOrder],
      ...(layout.rules ? { rules: clone(layout.rules) } : {}),
      ...(layout.grid ? { grid: clone(layout.grid) } : {}),
    };
  }

  return layouts;
}

function orderPageRegionIds(
  layoutRegionOrder: string[] | undefined,
  pageRegionIds: string[],
): string[] {
  const active = new Set(pageRegionIds);
  if (layoutRegionOrder) {
    return layoutRegionOrder.filter((regionId) => active.has(regionId));
  }
  return [...pageRegionIds].sort((a, b) => a.localeCompare(b));
}

function normalizePages(
  pkg: WbTemplateRendererPackageInput,
): WbTemplateRuntimeModel["pages"] {
  const pages: WbTemplateRuntimeModel["pages"] = {};

  for (const pageId of Object.keys(pkg.pages).sort((a, b) => a.localeCompare(b))) {
    const page = pkg.pages[pageId];
    const layout = pkg.layouts[page.layoutId];
    pages[pageId] = {
      id: page.id,
      title: page.title,
      path: page.path,
      layoutId: page.layoutId,
      regionIds: orderPageRegionIds(layout?.regionOrder, page.regionIds),
      ...(page.description ? { description: page.description } : {}),
      ...(page.optional ? { optional: page.optional } : {}),
    };
  }

  return pages;
}

export function buildRuntimeTemplateModel(
  pkg: WbTemplateRendererPackageInput,
  options?: {
    contractVersion?: string;
    scope?: WbTemplateRendererScope;
  },
): WbTemplateRuntimeModel {
  const contractVersion =
    options?.contractVersion ?? WB_TEMPLATE_RENDERER_CONTRACT_VERSION;

  const model: WbTemplateRuntimeModel = {
    contractVersion,
    template: {
      id: pkg.manifest.id,
      version: pkg.manifest.version,
      name: pkg.manifest.name,
      description: pkg.manifest.description,
      specVersion: pkg.manifest.specVersion,
    },
    metadata: clone(pkg.manifest.metadata),
    entry: clone(pkg.entry),
    responsive: clone(pkg.manifest.responsive),
    canvas: clone(pkg.canvas),
    layouts: normalizeLayouts(pkg),
    regions: normalizeRegions(pkg),
    pages: normalizePages(pkg),
    placementRules: normalizePlacementRules(pkg),
    media: {
      thumbnail: pkg.mediaPaths.thumbnail,
      preview: pkg.mediaPaths.preview,
      gallery: [...pkg.mediaPaths.gallery].sort((a, b) => a.localeCompare(b)),
    },
  };

  if (pkg.componentTypes) {
    model.componentTypes = {
      types: [...pkg.componentTypes.types].sort((a, b) => a.id.localeCompare(b.id)),
    };
  }

  return model;
}
