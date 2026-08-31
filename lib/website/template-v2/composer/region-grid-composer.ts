import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import { usesLlmLocalizedWebsiteCopy } from "@/lib/ai-core/content/content-language";
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
import {
  buildComponentProps,
  propsToJsx,
} from "@/lib/website/template-v2/composer/business-bindings";

export type RegionGridComposeParams = {
  bundle: TemplateV2PackageBundle;
  flowKey?: string;
  exportName?: string;
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
  /** Use flagship component scaffold defaults instead of generic production copy. */
  usePackageDefaults?: boolean;
};

/** Screen-reader-only page title class — works without Tailwind in static previews. */
function visuallyHiddenPageTitle(title: string): string {
  return `<h1 className="v2-sr-only text-4xl">${title}</h1>`;
}

function bindingContext(params: RegionGridComposeParams) {
  return {
    brandName: params.brandName ?? params.pageTitle ?? "Brand",
    packageId: params.bundle.packageId,
    content: params.content,
    language: params.language,
    heroHeadline: params.heroHeadline,
    heroSubheadline: params.heroSubheadline,
    heroEyebrow: params.heroEyebrow,
    pageDescription: params.pageDescription,
    primaryCta: params.primaryCta,
    secondaryCta: params.secondaryCta,
    usePackageDefaults: params.usePackageDefaults,
  };
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
  const props = buildComponentProps({
    componentId,
    role: role ?? component.role,
    packageId: params.bundle.packageId,
    ctx: bindingContext(params),
  });
  const jsxProps = propsToJsx(props, {
    localizedCopy: usesLlmLocalizedWebsiteCopy(params.language),
  });
  if (!jsxProps.trim()) {
    return `      <${exportName} />`;
  }
  return `      <${exportName}\n${jsxProps}      />`;
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
    return presentation.homeFlow?.regions ?? { main: [], utility: [], overlay: [] };
  }
  const flow = bundle.flows[flowKey];
  return (
    flow?.regions ??
    presentation.homeFlow?.regions ?? { main: [], utility: [], overlay: [] }
  );
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
  const idAttr = regionName === "main" ? ' id="main-content"' : "";
  return `      <${tag}${idAttr} data-v2-region="${regionName}"${cls}>\n${jsx}\n      </${tag}>`;
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
    : (baseRegions ?? { main: [], utility: [], overlay: [] });

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
  const exportName = params.exportName ?? "HomePage";

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
  const pageTitleMarkup = `        ${visuallyHiddenPageTitle(title)}\n`;

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
${renderRegionBlock("main", `${mainJsx ? `${pageTitleMarkup}${mainJsx}` : `        ${visuallyHiddenPageTitle(title)}`}`, "v2-main-canvas flex flex-col")}
${overlayJsx ? renderRegionBlock("overlay", overlayJsx, "v2-overlay-reveal") : ""}
${renderRegionBlock("footer", footerJsx)}`;
  } else if (fullBleedLayout) {
    body = `${renderRegionBlock("header", headerJsx)}
${overlayJsx ? renderRegionBlock("overlay", overlayJsx, "v2-overlay-canvas") : ""}
${utilityJsx ? renderRegionBlock("utility", utilityJsx) : ""}
${renderRegionBlock("main", `${mainJsx ? `${pageTitleMarkup}${mainJsx}` : `        ${visuallyHiddenPageTitle(title)}`}`, "v2-main-canvas flex flex-col")}
${renderRegionBlock("footer", footerJsx)}`;
  } else {
    body = `${renderRegionBlock("header", headerJsx)}
${renderRegionBlock("main", `${mainJsx ? `${pageTitleMarkup}${mainJsx}` : `        ${visuallyHiddenPageTitle(title)}`}`, "v2-region-grid flex flex-col")}
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

export default function ${exportName}() {
  return (
    <div className=${JSON.stringify(layoutClass)} data-v2-package=${JSON.stringify(bundle.packageId)} data-v2-composer="region-grid" data-v2-layout=${JSON.stringify(layoutId)}${params.websiteBlueprint ? ` data-v2-blueprint=${JSON.stringify(params.websiteBlueprint.meta.blueprintId)}` : ""}>
${body}
    </div>
  );
}
`;
}
