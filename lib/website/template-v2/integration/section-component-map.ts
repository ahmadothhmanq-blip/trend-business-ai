import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import type { TemplateV2ComponentDefinition } from "@/lib/website/template-v2/contracts/component-registry";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";
import { isStructureFirstEnabled } from "@/lib/website/generation-flags";

/** Section kind → component registry roles (first match wins). */
const SECTION_ROLE_PRIORITY: Record<SectionKind, string[]> = {
  hero: ["hero"],
  features: ["features", "integrations"],
  about: ["story", "custom"],
  services: ["services", "process", "team", "story"],
  portfolio: ["portfolio", "gallery", "custom"],
  pricing: ["pricing"],
  testimonials: ["testimonials"],
  cta: ["cta"],
  contact: ["contact"],
  footer: ["footer"],
};

/** Package-specific section → component overrides. */
const PACKAGE_SECTION_COMPONENT: Record<string, Partial<Record<SectionKind, string>>> = {
  "corporate-business": {
    about: "corporate-business-about",
    portfolio: "corporate-business-portfolio",
    services: "corporate-business-stats",
    cta: "corporate-business-floating-cta",
  },
  "saas-enterprise": {
    services: "saas-enterprise-integrations",
  },
  "restaurant-premium": {
    about: "restaurant-premium-chef-story",
    services: "restaurant-premium-tasting-menu",
    portfolio: "restaurant-premium-gallery",
    cta: "restaurant-premium-reservation-cta",
  },
  "medical-premium": {
    services: "medical-premium-care-journey",
  },
  "real-estate-premium": {
    portfolio: "real-estate-premium-collection",
  },
  "creative-agency-premium": {
    portfolio: "creative-agency-premium-work",
  },
};

/** Optional extras kept from presentation when density allows. */
const PACKAGE_DENSITY_EXTRAS: Record<string, string[]> = {
  "corporate-business": ["corporate-business-faq", "corporate-business-stats"],
  "saas-enterprise": ["saas-enterprise-integrations"],
  "medical-premium": ["medical-premium-physicians"],
};

function findByRole(
  registry: TemplateV2ComponentDefinition[],
  roles: string[],
): TemplateV2ComponentDefinition | undefined {
  for (const role of roles) {
    const match = registry.find((c) => c.role === role);
    if (match) return match;
  }
  return undefined;
}

function resolveSectionComponentId(
  sectionKind: SectionKind,
  bundle: TemplateV2PackageBundle,
): string | null {
  const override = PACKAGE_SECTION_COMPONENT[bundle.packageId]?.[sectionKind];
  if (override) {
    const exists = bundle.componentRegistry.components.some(
      (c) => c.id === override,
    );
    if (exists) return override;
  }

  const roles = SECTION_ROLE_PRIORITY[sectionKind];
  const component = findByRole(bundle.componentRegistry.components, roles);
  return component?.id ?? null;
}

export type BlueprintRegionPlan = {
  main: string[];
  utility: string[];
  overlay: string[];
  layoutId?: string;
  sectionVariants: Map<string, { sectionKind: SectionKind; variantId: string }>;
};

/** Preserve template homeFlow order while including blueprint-driven sections. */
export function mergeHomeFlowMainSections(
  blueprintMain: string[],
  homeFlowMain: string[],
): string[] {
  if (!homeFlowMain.length) return blueprintMain;
  if (!blueprintMain.length) return homeFlowMain;

  const merged: string[] = [];
  const seen = new Set<string>();

  for (const componentId of homeFlowMain) {
    if (seen.has(componentId)) continue;
    merged.push(componentId);
    seen.add(componentId);
  }

  for (const componentId of blueprintMain) {
    if (seen.has(componentId)) continue;
    merged.push(componentId);
    seen.add(componentId);
  }

  return merged;
}

function appendUniqueComponents(
  target: string[],
  source: string[],
  exclude?: string,
): void {
  const seen = new Set(target);
  for (const componentId of source) {
    if (componentId === exclude || seen.has(componentId)) continue;
    target.push(componentId);
    seen.add(componentId);
  }
}

/** Use presentation.json homeFlow as the project home page (matches skin preview). */
export function hasPresentationHomeFlow(
  presentation: TemplateV2PackageBundle["presentation"],
): boolean {
  return (presentation.homeFlow?.regions?.main?.length ?? 0) > 0;
}

function resolveBlueprintLayoutId(
  presentation: TemplateV2PackageBundle["presentation"],
  blueprint: WebsiteBlueprint,
): string {
  if (
    blueprint.heroComposition.layout === "full-bleed" ||
    blueprint.navigationStyle.layout === "transparent-overlay"
  ) {
    return "full-bleed";
  }
  if (blueprint.visualStyle === "editorial") {
    return "editorial-reveal";
  }
  return presentation.layout.defaultLayoutId;
}

function buildPresentationHomeFlowPlan(
  presentation: TemplateV2PackageBundle["presentation"],
  sectionVariants: BlueprintRegionPlan["sectionVariants"],
  layoutId?: string,
): BlueprintRegionPlan {
  const homeRegions = presentation.homeFlow?.regions ?? {
    main: [],
    utility: [],
    overlay: [],
  };
  return {
    main: homeRegions.main ?? [],
    utility: homeRegions.utility ?? [],
    overlay: homeRegions.overlay ?? [],
    layoutId: layoutId ?? presentation.layout.defaultLayoutId,
    sectionVariants,
  };
}

export type ResolveBlueprintRegionPlanOptions = {
  structureFirst?: boolean;
};

/**
 * Build region component order from optimized Website Blueprint.
 * Falls back to presentation profile for unmapped sections.
 */
export function resolveBlueprintRegionPlan(
  blueprint: WebsiteBlueprint,
  bundle: TemplateV2PackageBundle,
  options?: ResolveBlueprintRegionPlanOptions,
): BlueprintRegionPlan {
  const structureFirst = options?.structureFirst ?? isStructureFirstEnabled();
  const presentation = bundle.presentation;
  const homeRegions = presentation.homeFlow?.regions ?? {
    main: [],
    utility: [],
    overlay: [],
  };
  const fallbackMain = homeRegions.main ?? [];
  const sectionVariants = new Map<
    string,
    { sectionKind: SectionKind; variantId: string }
  >();

  const main: string[] = [];
  const seen = new Set<string>();

  for (const section of blueprint.sectionOrder) {
    if (section === "footer" || section === "cta") continue;

    const componentId = resolveSectionComponentId(section, bundle);
    if (!componentId || seen.has(componentId)) continue;

    main.push(componentId);
    seen.add(componentId);

    const variant = blueprint.sectionVariants.find(
      (s) => s.sectionKind === section,
    );
    if (variant) {
      sectionVariants.set(componentId, {
        sectionKind: section,
        variantId: variant.variantId,
      });
    }
  }

  if (hasPresentationHomeFlow(presentation)) {
    return buildPresentationHomeFlowPlan(
      presentation,
      sectionVariants,
      resolveBlueprintLayoutId(presentation, blueprint),
    );
  }

  if (main.length === 0) {
    return {
      main: fallbackMain,
      utility: homeRegions.utility ?? [],
      overlay: homeRegions.overlay ?? [],
      sectionVariants,
    };
  }

  const density = blueprint.sectionDensity;
  const isDense = Object.values(density).filter((d) => d === "dense").length >= 2;
  const extras = PACKAGE_DENSITY_EXTRAS[bundle.packageId] ?? [];
  const sectionOrderSet = new Set(blueprint.sectionOrder);
  for (const extraId of extras) {
    if (!isDense && extraId.includes("faq")) continue;
    if (structureFirst) {
      const mapsToIncludedSection = blueprint.sectionOrder.some((section) => {
        const componentId = resolveSectionComponentId(section, bundle);
        return componentId === extraId;
      });
      if (!mapsToIncludedSection && !sectionOrderSet.has("features")) continue;
    }
    if (!seen.has(extraId) && fallbackMain.includes(extraId)) {
      main.push(extraId);
      seen.add(extraId);
    }
  }

  const ctaComponent =
    PACKAGE_SECTION_COMPONENT[bundle.packageId]?.cta ??
    resolveSectionComponentId("cta", bundle);
  const utility: string[] = [];
  const overlay: string[] = [];

  const homeUtility = homeRegions.utility ?? [];
  const homeOverlay = homeRegions.overlay ?? [];

  if (ctaComponent) {
    if (blueprint.ctaStrategy.placement === "pre-footer") {
      overlay.push(ctaComponent);
    } else {
      utility.push(ctaComponent);
    }
    const ctaVariant = blueprint.sectionVariants.find(
      (s) => s.sectionKind === "cta",
    );
    if (ctaVariant) {
      sectionVariants.set(ctaComponent, {
        sectionKind: "cta",
        variantId: ctaVariant.variantId,
      });
    }
    appendUniqueComponents(utility, homeUtility, ctaComponent);
    appendUniqueComponents(overlay, homeOverlay, ctaComponent);
  } else {
    utility.push(...homeUtility);
    overlay.push(...homeOverlay);
  }

  const mergedMain = structureFirst
    ? main
    : mergeHomeFlowMainSections(main, fallbackMain);

  const layoutId = resolveBlueprintLayoutId(presentation, blueprint);

  return { main: mergedMain, utility, overlay, layoutId, sectionVariants };
}

export function getVariantForComponent(
  plan: BlueprintRegionPlan,
  componentId: string,
): { sectionKind: SectionKind; variantId: string } | undefined {
  return plan.sectionVariants.get(componentId);
}
