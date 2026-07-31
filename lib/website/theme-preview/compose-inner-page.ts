/**
 * Compose theme-aware inner pages for static multi-page preview.
 */
import { getIndustryInnerPageRecipe } from "@/lib/website/builder/industry-inner-page-recipes";
import { isThemeChromeComponent } from "@/lib/website/builder/theme-component-registry";
import {
  isThemeBodyComponent,
  renderThemeComponent,
} from "@/lib/website/theme-preview/render-components";
import type { ThemePreviewContent, ThemePreviewContext } from "@/lib/website/theme-preview/types";
import { escapeHtml } from "@/lib/website/theme-preview/utils";

function renderInnerPageHero(
  recipe: { eyebrow: string; headline: string; subtitle: string },
  pageName: string,
): string {
  return `<section class="ti-inner-hero" data-theme-scaffold="inner-hero">
  <div class="ti-inner-hero__shell">
  <p class="ti-inner-hero__eyebrow">${escapeHtml(recipe.eyebrow)}</p>
  <h1 class="ti-inner-hero__title">${escapeHtml(recipe.headline)}</h1>
  <p class="ti-inner-hero__subtitle">${escapeHtml(recipe.subtitle)}</p>
  <p class="ti-inner-hero__page-label" aria-hidden="true">${escapeHtml(pageName)}</p>
  </div>
</section>`;
}

function renderPageSections(
  componentIds: string[],
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  contentSlotStart: number,
  files?: Array<{ path: string; content: string }>,
): string {
  let slot = contentSlotStart;
  const parts: string[] = [];
  for (const id of componentIds) {
    if (isThemeChromeComponent(id)) continue;
    parts.push(
      renderThemeComponent(id, previewCtx, content, slot, files),
    );
    if (isThemeBodyComponent(id)) slot += 3;
  }
  return parts.join("\n");
}

function renderPageChrome(
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  files?: Array<{ path: string; content: string }>,
): { header: string; footer: string } {
  const navId = previewCtx.componentIds.find((id) =>
    /Nav$/i.test(id),
  );
  const footerId = previewCtx.componentIds.find((id) =>
    /Footer$/i.test(id),
  );
  return {
    header: navId
      ? renderThemeComponent(navId, previewCtx, content, 0, files)
      : "",
    footer: footerId
      ? renderThemeComponent(footerId, previewCtx, content, 0, files)
      : "",
  };
}

/** Build a full inner page section for :target preview navigation. */
export function composeThemeInnerPage(
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  page: { name: string; slug: string },
  options?: {
    defaultSlug?: string;
    contentSlotStart?: number;
    files?: Array<{ path: string; content: string }>;
  },
): string {
  const tiId = previewCtx.templateIntelligenceId;
  if (!tiId) return "";

  const recipe = getIndustryInnerPageRecipe(tiId, page.slug, page.name);
  if (!recipe) return "";

  const chrome = renderPageChrome(previewCtx, content, options?.files);
  const heroHtml = renderInnerPageHero(recipe, page.name);
  const sectionsHtml = renderPageSections(
    recipe.componentIds,
    previewCtx,
    content,
    options?.contentSlotStart ?? 6,
    options?.files,
  );

  const templateClass = ` ti-template ti-${tiId.replace(/^ti-/, "")}`;
  const themeClass = ` ti-theme-${previewCtx.themeId}`;
  const topology = previewCtx.architecture.pageTopology;
  const topologyClass = ` ti-topology-${topology.replace(/-/g, "_")}`;

  return `<section class="page ti-inner-page${templateClass}${themeClass}${topologyClass}" id="${escapeHtml(page.slug)}">
${chrome.header}
<main class="ti-inner-page__main">
${heroHtml}
${sectionsHtml}
</main>
${chrome.footer}
</section>`;
}

/** Build all secondary pages for themed preview. */
export function composeThemeSecondaryPages(
  previewCtx: ThemePreviewContext,
  content: ThemePreviewContent,
  pages: Array<{ name: string; slug: string }>,
  options?: {
    defaultSlug?: string;
    files?: Array<{ path: string; content: string }>;
  },
): string {
  return pages
    .slice(1)
    .map((page, index) =>
      composeThemeInnerPage(previewCtx, content, page, {
        ...options,
        contentSlotStart: 6 + index * 9,
      }),
    )
    .join("\n");
}
