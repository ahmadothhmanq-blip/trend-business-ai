import {
  isThemeFloatingCtaComponent,
  isThemeFooterComponent,
  isThemeHeroComponent,
  isThemeNavComponent,
  isThemeChromeComponent,
} from "@/lib/website/builder/theme-component-registry";
import { heroLayoutClass } from "@/lib/website/builder/industry-preview-profiles";
import {
  isThemeBodyComponent,
  renderThemeComponent,
} from "@/lib/website/theme-preview/render-components";
import type { ThemePreviewContent, ThemePreviewContext } from "@/lib/website/theme-preview/types";

function renderComponentMarkup(
  componentId: string,
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  contentSlot: number,
  files?: Array<{ path: string; content: string }>,
): string {
  return renderThemeComponent(
    componentId,
    previewCtx,
    content,
    contentSlot,
    files,
  );
}

function renderBodySections(
  ids: string[],
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  files?: Array<{ path: string; content: string }>,
): string {
  let slot = 0;
  const parts: string[] = [];
  for (const id of ids) {
    if (isThemeChromeComponent(id)) continue;
    parts.push(renderComponentMarkup(id, previewCtx, content, slot, files));
    if (isThemeBodyComponent(id)) slot += 3;
  }
  return parts.join("\n");
}

/** Compose home page HTML body mirroring composeHomePage topology. */
export function composeThemePreviewPageBody(
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  files?: Array<{ path: string; content: string }>,
): string {
  const ids = previewCtx.componentIds;
  const topology = previewCtx.architecture.pageTopology;
  const floatingCta =
    previewCtx.architecture.floatingCta ||
    ids.some((id) => isThemeFloatingCtaComponent(id));

  const headerId = ids.find((id) => isThemeNavComponent(id));
  const footerId = ids.find((id) => isThemeFooterComponent(id));
  const heroId = ids.find((id) => isThemeHeroComponent(id));
  const floatingId = ids.find((id) => isThemeFloatingCtaComponent(id));

  const headerHtml = headerId
    ? renderComponentMarkup(headerId, previewCtx, content, 0, files)
    : "";
  const footerHtml = footerId
    ? renderComponentMarkup(footerId, previewCtx, content, 0, files)
    : "";
  const floatingHtml =
    floatingCta && floatingId
      ? renderComponentMarkup(floatingId, previewCtx, content, 0, files)
      : floatingCta
        ? renderComponentMarkup("ThemeTechFloatingCta", previewCtx, content, 0, files)
        : "";

  const sectionIds = ids.filter((id) => !isThemeChromeComponent(id));
  const bodySectionsHtml = renderBodySections(sectionIds, previewCtx, content, files);

  const afterHeroIds = sectionIds.filter((id) => id !== heroId);
  const afterHeroHtml = renderBodySections(afterHeroIds, previewCtx, content, files);
  const heroHtml = heroId
    ? renderComponentMarkup(heroId, previewCtx, content, 0, files)
    : "";

  const templateClass = previewCtx.templateIntelligenceId
    ? ` ti-template ti-${previewCtx.templateIntelligenceId.replace(/^ti-/, "")}`
    : "";
  const themeClass = ` ti-theme-${previewCtx.themeId}`;
  const topologyClass = ` ti-topology-${topology.replace(/-/g, "_")}`;
  const heroLayout = heroLayoutClass(previewCtx.templateIntelligenceId);
  const rootClass = `min-h-screen bg-[var(--color-background)] text-[var(--color-foreground)] antialiased${templateClass}${themeClass}${topologyClass}${heroLayout ? ` ${heroLayout}` : ""}`;

  if (topology === "sidebar-rail") {
    return `<div class="${rootClass} lg:pl-[min(18rem,88vw)]">
${headerHtml}
<main class="relative">
${heroHtml}
${afterHeroHtml}
${footerHtml}
</main>
${floatingHtml}
</div>`;
  }

  if (topology === "fullscreen-editorial") {
    return `<main class="${rootClass}">
${headerHtml}
${heroHtml}
<div class="relative z-10 bg-[var(--color-background)]">
${afterHeroHtml}
${footerHtml}
</div>
${floatingHtml}
</main>`;
  }

  if (topology === "card-first-masonry") {
    return `<main class="${rootClass} ti-card-first">
${headerHtml}
<div class="divide-y divide-[var(--color-foreground)]/6">
${bodySectionsHtml}
</div>
${footerHtml}
${floatingHtml}
</main>`;
  }

  return `<main class="${rootClass}">
${headerHtml}
${bodySectionsHtml}
${footerHtml}
${floatingHtml}
</main>`;
}
