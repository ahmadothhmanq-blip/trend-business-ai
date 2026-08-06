import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import type { TemplateV2ComponentDefinition } from "@/lib/website/template-v2/contracts/component-registry";
import type { TemplateV2PackageBundle } from "@/lib/website/template-v2/contracts/package";
import type { TemplateV2PresentationProfile } from "@/lib/website/template-v2/contracts/presentation";
import type { BlueprintRegionPlan } from "@/lib/website/template-v2/integration/section-component-map";
import { getVariantForComponent } from "@/lib/website/template-v2/integration/section-component-map";
import type { WebsiteBlueprint } from "@/lib/website/template-v2/blueprint/types";
import type { SectionKind } from "@/lib/website/template-v2/variants/types";
import {
  componentIdToExportName,
  componentIdToProjectPath,
} from "@/lib/website/template-v2/utils/component-naming";
import { getComposeUiFallbacks } from "@/lib/ai-core/content/content-language";

export type RegionGridComposeParams = {
  bundle: TemplateV2PackageBundle;
  flowKey?: string;
  brandName?: string;
  pageTitle?: string;
  pageDescription?: string;
  content?: ProductionContentPack | null;
  heroHeadline?: string;
  heroSubheadline?: string;
  heroEyebrow?: string;
  primaryCta?: string;
  secondaryCta?: string;
  language?: string | null;
  /** Optimized Website Blueprint — drives section order and variants when set. */
  websiteBlueprint?: WebsiteBlueprint;
  /** Pre-resolved region plan from blueprint (optional). */
  blueprintRegionPlan?: BlueprintRegionPlan;
};

const GENERIC_ENGLISH_CTAS = new Set([
  "get started",
  "learn more",
  "contact us",
  "book a demo",
  "schedule consultation",
]);

/** Screen-reader-only page title class — works without Tailwind in static previews. */
function visuallyHiddenPageTitle(title: string): string {
  return `<h1 className="v2-sr-only">${title}</h1>`;
}

const PACKAGE_CTA_DEFAULTS: Record<string, { primary: string; secondary: string }> = {
  "corporate-business": { primary: "Schedule consultation", secondary: "Our capabilities" },
  "saas-enterprise": { primary: "Book a demo", secondary: "View platform tour" },
  "restaurant-premium": { primary: "Reserve your table", secondary: "View tasting menu" },
  "ecommerce-premium": { primary: "Shop collection", secondary: "Our story" },
  "medical-premium": { primary: "Book appointment", secondary: "Our specialties" },
  "real-estate-premium": { primary: "Schedule viewing", secondary: "View collection" },
  "creative-agency-premium": { primary: "Start a project", secondary: "View work" },
  "education-premium": { primary: "Apply now", secondary: "Explore programs" },
  "finance-premium": { primary: "Speak with an advisor", secondary: "Our services" },
  "hotel-resort-premium": { primary: "Book your stay", secondary: "Explore suites" },
};

function packageCtaDefaults(
  packageId: string,
  language: string | null | undefined,
): { primary: string; secondary: string } {
  const branded = PACKAGE_CTA_DEFAULTS[packageId];
  if (branded) return branded;
  const ui = getComposeUiFallbacks(language);
  return { primary: ui.primaryCta, secondary: ui.learnMore };
}

function coerceCta(
  value: string | undefined,
  packageId: string,
  language: string | null | undefined,
  kind: "primary" | "secondary",
): string {
  const defaults = packageCtaDefaults(packageId, language);
  if (!value?.trim()) {
    return kind === "primary" ? defaults.primary : defaults.secondary;
  }
  const normalized = value.trim().toLowerCase();
  if (GENERIC_ENGLISH_CTAS.has(normalized)) {
    return kind === "primary" ? defaults.primary : defaults.secondary;
  }
  return value.trim();
}

function isGenericHeroSubtitle(
  subtitle: string | undefined,
  brand: string,
): boolean {
  if (!subtitle?.trim()) return true;
  const s = subtitle.trim();
  if (s === brand) return true;
  return s.length < 72;
}

function jsxProp(name: string, value: unknown): string {
  if (value === undefined || value === null || value === "") return "";
  if (Array.isArray(value) && value.length === 0) return "";
  if (typeof value === "string") {
    return `        ${name}={${JSON.stringify(value)}}\n`;
  }
  if (Array.isArray(value)) {
    return `        ${name}={${JSON.stringify(value)}}\n`;
  }
  return `        ${name}={${JSON.stringify(value)}}\n`;
}

function defaultNavLinks(packageId: string, language?: string | null) {
  const ui = getComposeUiFallbacks(language);
  if (packageId === "restaurant-signature" || packageId === "restaurant-premium" || packageId === "hotel-resort-premium") {
    if (language && !/english|^en$/i.test(language)) {
      return [
        { href: "#menu", label: ui.navServices },
        { href: "#chef", label: ui.navFeatures },
        { href: "#gallery", label: ui.navPricing },
        { href: "#reservation", label: ui.navContact },
      ];
    }
    return [
      { href: "#menu", label: "Menu" },
      { href: "#chef", label: "Chef" },
      { href: "#gallery", label: "Gallery" },
      { href: "#reservation", label: "Reserve" },
    ];
  }
  if (packageId === "corporate-business") {
    if (language && !/english|^en$/i.test(language)) {
      return [
        { href: "#about", label: ui.navServices },
        { href: "#features", label: ui.navFeatures },
        { href: "#customers", label: ui.navPricing },
        { href: "#contact", label: ui.navContact },
      ];
    }
    return [
      { href: "#about", label: "About" },
      { href: "#features", label: "Capabilities" },
      { href: "#customers", label: "Outcomes" },
      { href: "#contact", label: "Contact" },
    ];
  }
  if (packageId === "real-estate-prestige" || packageId === "real-estate-premium") {
    return [
      { href: "#collection", label: "Collection" },
      { href: "#neighborhoods", label: "Neighborhoods" },
      { href: "#advisors", label: "Advisors" },
      { href: "#inquire", label: "Inquire" },
    ];
  }
  if (packageId === "medical-premium") {
    return [
      { href: "#specialties", label: "Specialties" },
      { href: "#physicians", label: "Physicians" },
      { href: "#care", label: "Care journey" },
      { href: "#appointments", label: "Appointments" },
    ];
  }
  if (packageId === "creative-portfolio" || packageId === "creative-agency-premium") {
    return [
      { href: "#work", label: "Work" },
      { href: "#studio", label: "Studio" },
      { href: "#process", label: "Process" },
      { href: "#contact", label: "Contact" },
    ];
  }
  if (packageId === "ecommerce-premium") {
    return [
      { href: "#shop", label: language && !/english|^en$/i.test(language) ? ui.navServices : "Shop" },
      { href: "#collections", label: "Collections" },
      { href: "#story", label: "About" },
      { href: "#contact", label: language && !/english|^en$/i.test(language) ? ui.navContact : "Contact" },
    ];
  }
  if (packageId === "education-premium") {
    return [
      { href: "#academics", label: "Academics" },
      { href: "#admissions", label: "Admissions" },
      { href: "#campus", label: "Campus" },
      { href: "#contact", label: "Contact" },
    ];
  }
  if (packageId === "finance-premium") {
    return [
      { href: "#services", label: "Services" },
      { href: "#approach", label: "Approach" },
      { href: "#insights", label: "Insights" },
      { href: "#contact", label: "Contact" },
    ];
  }
  return [
    { href: "#features", label: language && !/english|^en$/i.test(language) ? ui.navFeatures : "Platform" },
    { href: "#platform", label: language && !/english|^en$/i.test(language) ? ui.navServices : "Integrations" },
    { href: "#pricing", label: language && !/english|^en$/i.test(language) ? ui.navPricing : "Pricing" },
    { href: "#contact", label: language && !/english|^en$/i.test(language) ? ui.navContact : "Contact" },
  ];
}

const FLAGSHIP_PACKAGE_IDS = new Set([
  "saas-enterprise",
  "corporate-business",
  "restaurant-premium",
  "ecommerce-premium",
  "medical-premium",
  "real-estate-premium",
  "creative-agency-premium",
  "education-premium",
  "finance-premium",
  "hotel-resort-premium",
]);

function isGenericBusinessContent(
  content: ProductionContentPack | null | undefined,
): boolean {
  if (!content) return true;
  return (
    content.heroEyebrow === "Professional presence" ||
    content.featuresSubtitle?.includes("Webflow-caliber") === true ||
    content.servicesTitle === "What we deliver for clients"
  );
}

function useFlagshipComponentDefaults(
  packageId: string,
  content?: ProductionContentPack | null,
): boolean {
  return FLAGSHIP_PACKAGE_IDS.has(packageId) && isGenericBusinessContent(content);
}

function findComponent(
  registry: TemplateV2ComponentDefinition[],
  componentId: string,
): TemplateV2ComponentDefinition | undefined {
  return registry.find((c) => c.id === componentId);
}

function renderComponentJsx(
  componentId: string,
  registry: TemplateV2ComponentDefinition[],
  params: RegionGridComposeParams,
  role?: string,
): string {
  const component = findComponent(registry, componentId);
  if (!component) return "";
  const exportName = componentIdToExportName(componentId);
  const content = params.content;
  const brand = params.brandName ?? "Brand";
  const language = params.language;
  const primaryCta = coerceCta(
    params.primaryCta ?? content?.primaryCta,
    params.bundle.packageId,
    language,
    "primary",
  );
  const secondaryCta = coerceCta(
    params.secondaryCta ?? content?.secondaryCta,
    params.bundle.packageId,
    language,
    "secondary",
  );
  const flagshipDefaults = useFlagshipComponentDefaults(
    params.bundle.packageId,
    content,
  );
  const rawNavLinks = content?.navLinks
    ?.filter((l) => l.href?.trim() && l.label?.trim())
    .map((l) => ({ href: l.href, label: l.label }));
  const navLinks =
    flagshipDefaults || !rawNavLinks?.length
      ? defaultNavLinks(params.bundle.packageId, language)
      : rawNavLinks;

  let props = "";
  if (role === "navigation" || component.role === "navigation") {
    props =
      jsxProp("brandName", brand) +
      jsxProp("ctaLabel", primaryCta) +
      jsxProp("links", navLinks);
  } else if (flagshipDefaults) {
    if (role === "footer" || component.role === "footer") {
      props = jsxProp("brandName", brand) + jsxProp("links", navLinks);
    } else if (role === "hero" || component.role === "hero") {
      const headline =
        params.heroHeadline ?? content?.heroHeadline ?? params.pageTitle;
      const subtitleRaw =
        params.heroSubheadline ??
        content?.heroSubheadline ??
        params.pageDescription;
      const subtitle = isGenericHeroSubtitle(subtitleRaw, brand)
        ? undefined
        : subtitleRaw;
      const eyebrow = params.heroEyebrow ?? content?.heroEyebrow;
      const safeEyebrow =
        eyebrow && eyebrow !== "Professional presence" ? eyebrow : undefined;
      const useCustomHero =
        Boolean(headline && headline !== brand) ||
        Boolean(subtitle && subtitle !== headline);
      props =
        jsxProp("primaryCta", primaryCta) +
        jsxProp("secondaryCta", secondaryCta);
      if (useCustomHero) {
        props +=
          jsxProp("title", headline !== brand ? headline : undefined) +
          jsxProp("subtitle", subtitle) +
          jsxProp("eyebrow", safeEyebrow);
      }
    }
  } else if (role === "hero" || component.role === "hero") {
    const headline = params.heroHeadline ?? content?.heroHeadline;
    const subtitleRaw = params.heroSubheadline ?? content?.heroSubheadline ?? params.pageDescription;
    const subtitle = isGenericHeroSubtitle(subtitleRaw, brand) ? undefined : subtitleRaw;
    const eyebrowRaw = params.heroEyebrow ?? content?.heroEyebrow;
    const eyebrow =
      eyebrowRaw && eyebrowRaw !== "Professional presence" ? eyebrowRaw : undefined;
    props =
      jsxProp(
        "title",
        headline && headline !== brand ? headline : undefined,
      ) +
      jsxProp("subtitle", subtitle ?? params.pageDescription) +
      jsxProp("eyebrow", eyebrow) +
      jsxProp("primaryCta", primaryCta) +
      jsxProp("secondaryCta", secondaryCta);
  } else if (role === "footer" || component.role === "footer") {
    props =
      jsxProp("brandName", brand) +
      jsxProp("tagline", content?.brandTagline ?? params.pageDescription) +
      jsxProp("links", navLinks);
  } else if (component.role === "faq" && content?.faqs?.length) {
    props =
      jsxProp("eyebrow", content.faqEyebrow) +
      jsxProp("title", content.faqTitle) +
      jsxProp("subtitle", content.faqSubtitle) +
      jsxProp("items", content.faqs);
  } else if (component.role === "pricing" && content) {
    props =
      jsxProp("eyebrow", content.pricingEyebrow) +
      jsxProp("title", content.pricingTitle) +
      jsxProp("subtitle", content.pricingSubtitle);
  } else if (component.role === "features" && content?.features?.length) {
    props =
      jsxProp("eyebrow", content.featuresEyebrow) +
      jsxProp("title", content.featuresTitle) +
      jsxProp("subtitle", content.featuresSubtitle) +
      jsxProp("items", content.features);
  } else if (component.role === "gallery") {
    props =
      jsxProp("eyebrow", content?.galleryEyebrow) +
      jsxProp("title", content?.galleryTitle ?? "Gallery") +
      jsxProp("subtitle", content?.gallerySubtitle);
  } else if (component.role === "story") {
    props =
      jsxProp("eyebrow", content?.servicesEyebrow ?? "Our chef") +
      jsxProp("title", content?.servicesTitle ?? "A story of fire and season") +
      jsxProp("subtitle", content?.servicesSubtitle);
  } else if (component.role === "services" && content?.services?.length) {
    props =
      jsxProp("eyebrow", content.servicesEyebrow) +
      jsxProp("title", content.servicesTitle ?? "Tasting menu") +
      jsxProp("subtitle", content.servicesSubtitle) +
      jsxProp("items", content.services);
  } else if (component.role === "contact") {
    props =
      jsxProp("title", content?.contactTitle ?? "Reserve your table") +
      jsxProp("subtitle", content?.contactSubtitle) +
      jsxProp("ctaLabel", primaryCta);
  } else if (component.role === "integrations") {
    props = jsxProp("title", content?.featuresTitle ?? "Integrations");
  } else if (component.role === "portfolio") {
    props = jsxProp("title", content?.galleryTitle ?? "Signature dishes");
  } else if (component.role === "testimonials" && content?.testimonials?.length) {
    props =
      jsxProp("eyebrow", content.testimonialsEyebrow) +
      jsxProp("title", content.testimonialsTitle) +
      jsxProp("subtitle", content.testimonialsSubtitle) +
      jsxProp("items", content.testimonials);
  } else if (component.role === "process") {
    props =
      jsxProp("eyebrow", content?.servicesEyebrow ?? "Your care journey") +
      jsxProp("title", content?.servicesTitle ?? "From first call to follow-up") +
      jsxProp("subtitle", content?.servicesSubtitle);
  } else if (component.role === "team") {
    props =
      jsxProp("eyebrow", content?.servicesEyebrow ?? "Advisors") +
      jsxProp("title", content?.servicesTitle ?? "Your private advisory team") +
      jsxProp("subtitle", content?.servicesSubtitle);
  } else if (component.role === "cta" || component.role === "custom") {
    props =
      jsxProp("primaryCta", primaryCta) +
      jsxProp("secondaryCta", secondaryCta) +
      jsxProp("title", content?.ctaTitle) +
      jsxProp("subtitle", content?.ctaBody);
  }

  return `      <${exportName}\n${props}      />`;
}

function wrapWithBlueprintVariant(
  jsx: string,
  sectionKind?: SectionKind,
  variantId?: string,
): string {
  if (!jsx.trim() || !sectionKind || !variantId) return jsx;
  return `      <div data-v2-section="${sectionKind}" data-v2-variant="${variantId}">\n${jsx}\n      </div>`;
}

function renderBlueprintComponentJsx(
  componentId: string,
  registry: TemplateV2ComponentDefinition[],
  params: RegionGridComposeParams,
  plan: BlueprintRegionPlan | undefined,
  role?: string,
): string {
  const jsx = renderComponentJsx(componentId, registry, params, role);
  if (!plan) return jsx;
  const meta = getVariantForComponent(plan, componentId);
  return wrapWithBlueprintVariant(jsx, meta?.sectionKind, meta?.variantId);
}

function collectImports(
  componentIds: string[],
  registry: TemplateV2ComponentDefinition[],
  packageId: string,
): string[] {
  const imports: string[] = [];
  for (const id of componentIds) {
    const component = findComponent(registry, id);
    if (!component) continue;
    const exportName = componentIdToExportName(id);
    const importPath = `@/${componentIdToProjectPath(packageId, component.scaffold).replace(/\.tsx$/, "")}`;
    imports.push(`import { ${exportName} } from "${importPath}";`);
  }
  return [...new Set(imports)];
}

function resolveFlowRegions(
  presentation: TemplateV2PresentationProfile,
  bundle: TemplateV2PackageBundle,
  flowKey: string,
): Record<string, string[]> {
  if (flowKey === "home") {
    return presentation.homeFlow.regions;
  }
  const flow = bundle.flows[flowKey];
  return flow?.regions ?? presentation.homeFlow.regions;
}

function renderRegionBlock(
  regionName: string,
  jsx: string,
  className?: string,
): string {
  if (!jsx.trim()) return "";
  const cls = className ? ` className=${JSON.stringify(className)}` : "";
  const tag =
    regionName === "sidebar"
      ? "aside"
      : regionName === "overlay"
        ? "div"
        : regionName;
  return `      <${tag} data-v2-region="${regionName}"${cls}>\n${jsx}\n      </${tag}>`;
}

function usesSidebarLayout(
  presentation: TemplateV2PresentationProfile,
  regions: Record<string, string[]>,
): boolean {
  const layoutId = presentation.layout.defaultLayoutId;
  return (
    layoutId === "sidebar-left" ||
    layoutId === "sidebar-right" ||
    Boolean(regions.sidebar?.length) ||
    Boolean(presentation.layout.regions.sidebar)
  );
}

function isSidebarRightLayout(presentation: TemplateV2PresentationProfile): boolean {
  return presentation.layout.defaultLayoutId === "sidebar-right";
}

function isFullBleedLayout(presentation: TemplateV2PresentationProfile): boolean {
  const id = presentation.layout.defaultLayoutId;
  return id === "full-bleed" || id === "editorial-reveal";
}

function isEditorialRevealLayout(presentation: TemplateV2PresentationProfile): boolean {
  return presentation.layout.defaultLayoutId === "editorial-reveal";
}

/**
 * Region Grid Composer — generates app/page.tsx from V2 presentation profile.
 */
export function composeRegionGridPage(params: RegionGridComposeParams): string {
  const { bundle } = params;
  const flowKey = params.flowKey ?? "home";
  const presentation = bundle.presentation;
  const registry = bundle.componentRegistry.components;
  const blueprintPlan = params.blueprintRegionPlan;

  const baseRegions = resolveFlowRegions(presentation, bundle, flowKey);
  const regions = blueprintPlan
    ? {
        ...baseRegions,
        main: blueprintPlan.main,
        utility: blueprintPlan.utility,
        overlay: blueprintPlan.overlay,
      }
    : baseRegions;

  const layoutId =
    blueprintPlan?.layoutId ?? presentation.layout.defaultLayoutId;
  const presentationForLayout = {
    ...presentation,
    layout: { ...presentation.layout, defaultLayoutId: layoutId },
  };

  const sidebarLayout = usesSidebarLayout(presentationForLayout, regions);
  const sidebarRight = isSidebarRightLayout(presentationForLayout);
  const fullBleedLayout = isFullBleedLayout(presentationForLayout);
  const editorialReveal = isEditorialRevealLayout(presentationForLayout);

  const renderComponent = (id: string, role?: string) =>
    blueprintPlan
      ? renderBlueprintComponentJsx(id, registry, params, blueprintPlan, role)
      : renderComponentJsx(id, registry, params, role);

  const allComponentIds = new Set<string>();
  for (const ids of Object.values(regions)) {
    for (const id of ids) allComponentIds.add(id);
  }
  if (presentation.navigation.componentId) allComponentIds.add(presentation.navigation.componentId);
  if (presentation.hero.componentId) allComponentIds.add(presentation.hero.componentId);
  if (presentation.footer.componentId) allComponentIds.add(presentation.footer.componentId);

  const imports = collectImports([...allComponentIds], registry, bundle.packageId);
  const title = params.pageTitle ?? params.brandName ?? "Home";
  const description = params.pageDescription ?? "";

  const headerJsx = renderComponent(
    presentation.navigation.componentId,
    "navigation",
  );
  const footerJsx = renderComponent(
    presentation.footer.componentId,
    "footer",
  );

  const sidebarIds = regions.sidebar ?? [];
  const sidebarJsx = sidebarIds
    .map((id) => renderComponent(id))
    .filter(Boolean)
    .join("\n");

  const mainIds = regions.main ?? regions[presentation.hero.region] ?? [];
  const mainJsx = mainIds
    .map((id) => renderComponent(id))
    .filter(Boolean)
    .join("\n");

  const utilityIds = regions.utility ?? [];
  const utilityJsx = utilityIds
    .map((id) => renderComponent(id))
    .filter(Boolean)
    .join("\n");

  const overlayIds = regions.overlay ?? [];
  const overlayJsx = overlayIds
    .map((id) => renderComponent(id))
    .filter(Boolean)
    .join("\n");

  const layoutClass = sidebarLayout
    ? `flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-${bundle.packageId} v2-layout-${sidebarRight ? "sidebar-right" : "sidebar-left"}`
    : editorialReveal
      ? `flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-${bundle.packageId} v2-layout-editorial-reveal`
      : fullBleedLayout
        ? `flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-${bundle.packageId} v2-layout-full-bleed`
        : `flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-foreground)] antialiased v2-template v2-${bundle.packageId}`;

  let body = "";
  if (sidebarLayout) {
    const sidebarBlock = renderRegionBlock(
      "sidebar",
      sidebarJsx,
      "v2-sidebar-rail hidden shrink-0 lg:block lg:w-56 xl:w-64",
    );
    const mainBlock = renderRegionBlock("main", mainJsx, "v2-main-canvas min-w-0 flex-1");
    const shellContent = sidebarRight
      ? `${mainBlock}\n${sidebarBlock}`
      : `${sidebarBlock}\n${mainBlock}`;
    body = `${renderRegionBlock("header", headerJsx)}
      <div className="v2-sidebar-shell mx-auto flex w-full max-w-[var(--container-max,82rem)] flex-col lg:flex-row">
        ${visuallyHiddenPageTitle(title)}
${shellContent}
      </div>
${utilityJsx ? renderRegionBlock("utility", utilityJsx) : ""}
${renderRegionBlock("footer", footerJsx)}
${overlayJsx ? `      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">\n${overlayJsx}\n      </div>` : ""}`;
  } else if (editorialReveal) {
    body = `${renderRegionBlock("header", headerJsx)}
${renderRegionBlock("main", `${mainJsx ? `        ${visuallyHiddenPageTitle(title)}\n${mainJsx}` : `        ${visuallyHiddenPageTitle(title)}`}`, "v2-main-canvas flex flex-col")}
${overlayJsx ? renderRegionBlock("overlay", overlayJsx, "v2-overlay-reveal") : ""}
${renderRegionBlock("footer", footerJsx)}`;
  } else if (fullBleedLayout) {
    body = `${renderRegionBlock("header", headerJsx)}
${overlayJsx ? renderRegionBlock("overlay", overlayJsx, "v2-overlay-canvas") : ""}
${utilityJsx ? renderRegionBlock("utility", utilityJsx) : ""}
${renderRegionBlock("main", `${mainJsx ? `        ${visuallyHiddenPageTitle(title)}\n${mainJsx}` : `        ${visuallyHiddenPageTitle(title)}`}`, "v2-main-canvas flex flex-col")}
${renderRegionBlock("footer", footerJsx)}`;
  } else {
    body = `${renderRegionBlock("header", headerJsx)}
${renderRegionBlock("main", `${mainJsx ? `        ${visuallyHiddenPageTitle(title)}\n${mainJsx}` : `        ${visuallyHiddenPageTitle(title)}`}`, "v2-region-grid flex flex-col")}
${utilityJsx ? renderRegionBlock("utility", utilityJsx) : ""}
${renderRegionBlock("footer", footerJsx)}
${overlayJsx ? `      <div data-v2-region="overlay" className="pointer-events-none fixed inset-x-0 bottom-0 z-50">\n${overlayJsx}\n      </div>` : ""}`;
  }

  return `import type { Metadata } from "next";
${imports.join("\n")}

export const metadata: Metadata = {
  title: ${JSON.stringify(title)},
  description: ${JSON.stringify(description)},
};

export default function HomePage() {
  return (
    <div className=${JSON.stringify(layoutClass)} data-v2-package=${JSON.stringify(bundle.packageId)} data-v2-composer="region-grid" data-v2-layout=${JSON.stringify(layoutId)}${params.websiteBlueprint ? ` data-v2-blueprint=${JSON.stringify(params.websiteBlueprint.meta.blueprintId)}` : ""}>
${body}
    </div>
  );
}
`;
}
