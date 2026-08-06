import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import type { TemplateV2ComponentDefinition } from "@/lib/website/template-v2/contracts/component-registry";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";

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

/**
 * Build region component order from optimized Website Blueprint.
 * Falls back to presentation profile for unmapped sections.
 */
export function resolveBlueprintRegionPlan(
  blueprint: WebsiteBlueprint,
  bundle: TemplateV2PackageBundle,
): BlueprintRegionPlan {
  const presentation = bundle.presentation;
  const fallbackMain = presentation.homeFlow.regions.main ?? [];
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

  if (main.length === 0) {
    return {
      main: fallbackMain,
      utility: presentation.homeFlow.regions.utility ?? [],
      overlay: presentation.homeFlow.regions.overlay ?? [],
      sectionVariants,
    };
  }

  const density = blueprint.sectionDensity;
  const isDense = Object.values(density).filter((d) => d === "dense").length >= 2;
  const extras = PACKAGE_DENSITY_EXTRAS[bundle.packageId] ?? [];
  for (const extraId of extras) {
    if (!isDense && extraId.includes("faq")) continue;
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
  } else {
    utility.push(...(presentation.homeFlow.regions.utility ?? []));
    overlay.push(...(presentation.homeFlow.regions.overlay ?? []));
  }

  let layoutId = presentation.layout.defaultLayoutId;
  if (
    blueprint.heroComposition.layout === "full-bleed" ||
    blueprint.navigationStyle.layout === "transparent-overlay"
  ) {
    layoutId = "full-bleed";
  } else if (blueprint.visualStyle === "editorial") {
    layoutId = "editorial-reveal";
  }

  return { main, utility, overlay, layoutId, sectionVariants };
}

export function getVariantForComponent(
  plan: BlueprintRegionPlan,
  componentId: string,
): { sectionKind: SectionKind; variantId: string } | undefined {
  return plan.sectionVariants.get(componentId);
}
