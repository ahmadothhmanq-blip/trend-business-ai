/**
 * Resolves a page canvas blueprint from a validated layout-driven package.
 * Internal helper — not connected to Website Builder UI or legacy systems.
 */
import type { WbTemplateResponsiveSpec } from "@/lib/website/template-engine/types";
import type {
  WbTemplatePageCanvasBlueprint,
  WbTemplateRegionPlacementRules,
  WbTemplateResolvedPackage,
} from "@/lib/website/template-engine/spec/types";

function mergePlacementRules(
  base: WbTemplateRegionPlacementRules,
  override?: Partial<WbTemplateRegionPlacementRules>,
): WbTemplateRegionPlacementRules {
  if (!override) return base;
  return {
    ...base,
    ...override,
    allowedComponentTypes:
      override.allowedComponentTypes ?? base.allowedComponentTypes,
    mutuallyExclusive: override.mutuallyExclusive ?? base.mutuallyExclusive,
    requiredTypes: override.requiredTypes ?? base.requiredTypes,
  };
}

export function resolvePackageBlueprint(
  pkg: WbTemplateResolvedPackage,
  pageId?: string,
): WbTemplatePageCanvasBlueprint & { responsive: WbTemplateResponsiveSpec } {
  const targetPageId = pageId ?? pkg.entry.defaultPageId;
  const page =
    pkg.pages[targetPageId] ??
    pkg.pages[pkg.entry.defaultPageId] ??
    Object.values(pkg.pages)[0];
  if (!page) {
    throw new Error(`page "${targetPageId}" not found in package "${pkg.manifest.id}"`);
  }

  const layout =
    pkg.layouts[page.layoutId] ??
    pkg.layouts[pkg.entry.defaultLayoutId] ??
    Object.values(pkg.layouts)[0];
  if (!layout) {
    throw new Error(`layout for page "${page.id}" not found`);
  }

  const activeRegionSet = new Set(page.regions);
  const regionOrder = layout.regionOrder.filter((regionId) =>
    activeRegionSet.has(regionId),
  );

  const responsive: WbTemplateResponsiveSpec = {
    breakpoints: Object.fromEntries(
      pkg.manifest.responsive.breakpoints.map((breakpoint) => [
        breakpoint.name,
        breakpoint.minWidth,
      ]),
    ),
    containerMaxWidth:
      pkg.manifest.responsive.containerMaxWidth ?? pkg.canvas.grid.maxWidth,
  };

  const regions = regionOrder.map((regionId) => {
    const region = pkg.regions[regionId];
    if (!region) {
      throw new Error(
        `region "${regionId}" referenced by page "${page.id}" is not defined`,
      );
    }
    return {
      id: region.id,
      role: region.role,
      label: region.label,
      layout: region.layout,
      placement: mergePlacementRules(
        region.placement,
        pkg.placementRules.regionOverrides?.[regionId],
      ),
      responsive: region.responsive,
    };
  });

  return {
    pageId: page.id,
    layoutId: layout.id,
    layoutKind: layout.kind,
    regionOrder,
    regions,
    canvas: pkg.canvas,
    placementRules: pkg.placementRules,
    responsive,
  };
}
