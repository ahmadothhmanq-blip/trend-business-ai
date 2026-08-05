import {
  resolveLocaleFromLanguage,
  type SiteLocaleConfig,
} from "@/lib/ai-core/website-design-platform/i18n";
import type { StaticPreviewInput } from "@/lib/website/preview-input";
import { slugify } from "@/lib/website/preview-shared";
import { escapeHtml } from "@/lib/website/theme-preview/utils";
import {
  extractV2LayoutFromPage,
  extractV2PackageIdFromPage,
  renderV2PageMarkup,
  type ProjectFileRef,
} from "@/lib/website/template-v2/preview/v2-preview-compiler";
import {
  isV2PreviewInput,
  resolveV2PackageId,
  V2_PREVIEW_RENDER_VERSION,
} from "@/lib/website/template-v2/preview/v2-preview-input";

const TAILWIND_CDN = "https://cdn.tailwindcss.com";

function normalizePath(filePath: string): string {
  return filePath.replaceAll("\\", "/");
}

function prepareGlobalsCss(content: string): string {
  return content.replace(/@tailwind\s+[^;]+;?\s*/g, "").trim();
}

function resolvePreviewLocale(
  input: StaticPreviewInput,
  files: ProjectFileRef[],
): SiteLocaleConfig {
  const locale = resolveLocaleFromLanguage(input.language);
  const layout = files.find((f) => normalizePath(f.path) === "app/layout.tsx");
  if (
    layout?.content.includes('dir="rtl"') ||
    layout?.content.includes("dir='rtl'")
  ) {
    return { ...locale, dir: "rtl" };
  }
  return locale;
}

function buildV2RtlStyles(locale: SiteLocaleConfig): string {
  if (locale.dir !== "rtl") return "";
  const fontStack = locale.fontHint
    ? `${locale.fontHint}, var(--font-body, system-ui)`
    : "var(--font-body, system-ui)";
  return `
    html[dir="rtl"] { direction: rtl; }
    html[dir="rtl"] body {
      text-align: right;
      font-family: ${fontStack};
    }
    html[dir="rtl"] .v2-sidebar-shell {
      flex-direction: row-reverse;
    }
    html[dir="rtl"] header nav,
    html[dir="rtl"] aside nav {
      flex-direction: row-reverse;
    }
  `;
}

function buildV2SecondaryPages(
  input: StaticPreviewInput,
  files: ProjectFileRef[],
  pages: Array<{ name: string; slug: string }>,
  defaultSlug: string,
  locale: SiteLocaleConfig,
): string {
  const cta =
    input.primaryCta?.trim() ||
    (locale.rtl ? "العودة للرئيسية" : "Back to home");

  return pages
    .slice(1)
    .map((page) => {
      const routePath = `app/${page.slug}/page.tsx`;
      const routeFile = files.find(
        (f) => normalizePath(f.path) === routePath,
      );
      if (routeFile?.content?.trim()) {
        return `<section class="page v2-secondary-page" id="${escapeHtml(page.slug)}">
  <div class="mx-auto max-w-3xl px-6 py-16">
    <p class="text-xs uppercase tracking-widest text-[var(--color-foreground)]/50">${escapeHtml(page.name)}</p>
    <pre class="mt-4 overflow-x-auto rounded border border-[var(--color-foreground)]/10 p-4 text-xs text-[var(--color-foreground)]/70">${escapeHtml(routeFile.content.slice(0, 1200))}</pre>
    <a class="mt-6 inline-block text-sm text-[var(--color-accent,#B87333)]" href="#${escapeHtml(defaultSlug)}">${escapeHtml(cta)}</a>
  </div>
</section>`;
      }

      const fallbackBody = locale.rtl
        ? `محتوى صفحة ${page.name}`
        : `${page.name} — ${input.title || "Website"}`;
      return `<section class="page v2-secondary-page" id="${escapeHtml(page.slug)}">
  <div class="mx-auto max-w-3xl px-6 py-16">
    <p class="text-xs uppercase tracking-widest text-[var(--color-foreground)]/50">${escapeHtml(page.name)}</p>
    <h1 class="mt-4 text-3xl font-semibold text-[var(--color-foreground)]">${escapeHtml(page.name)}</h1>
    <p class="mt-4 text-[var(--color-foreground)]/70">${escapeHtml(fallbackBody)}</p>
    <a class="mt-8 inline-block text-sm text-[var(--color-accent,#B87333)]" href="#${escapeHtml(defaultSlug)}">${escapeHtml(cta)}</a>
  </div>
</section>`;
    })
    .join("\n");
}

/**
 * Build self-contained HTML preview from V2 project.files — no Theme* scaffold path.
 */
export function buildV2PreviewDocument(input: StaticPreviewInput): string | null {
  if (!isV2PreviewInput(input)) return null;

  const files: ProjectFileRef[] = (input.files ?? []).map((f) => ({
    path: f.path,
    content: f.content,
  }));
  if (!files.some((f) => normalizePath(f.path) === "app/page.tsx")) {
    return null;
  }

  const locale = resolvePreviewLocale(input, files);
  const pageSource =
    files.find((f) => normalizePath(f.path) === "app/page.tsx")?.content ?? "";
  const packageId =
    resolveV2PackageId(input) ?? extractV2PackageIdFromPage(pageSource) ?? "v2";
  const layoutId = extractV2LayoutFromPage(pageSource);

  let homeBody: string;
  try {
    homeBody = renderV2PageMarkup(files, input.heroImageUrl);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "V2 preview render failed";
    homeBody = `<div data-v2-preview-error="${escapeHtml(message)}"></div>`;
  }

  const globals =
    files.find((f) => normalizePath(f.path) === "app/globals.css")?.content ??
    "";
  const globalsCss = prepareGlobalsCss(globals);

  const pageNames = (input.pages ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);
  const pages = (pageNames.length ? pageNames : ["Home"]).map((name, index) => ({
    name,
    slug: slugify(name) || `page-${index + 1}`,
  }));
  const defaultSlug = pages[0]?.slug || "home";
  const secondaryPages = buildV2SecondaryPages(
    input,
    files,
    pages,
    defaultSlug,
    locale,
  );

  const title = escapeHtml(input.title?.trim() || "Website Preview");
  const layoutAttr = layoutId
    ? ` data-v2-layout="${escapeHtml(layoutId)}"`
    : "";
  const htmlDir = locale.dir === "rtl" ? ` dir="rtl"` : "";
  const htmlLang = escapeHtml(locale.htmlLang);

  return `<!DOCTYPE html>
<html lang="${htmlLang}"${htmlDir} data-v2-render="${V2_PREVIEW_RENDER_VERSION}" data-v2-package="${escapeHtml(packageId)}"${layoutAttr}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Live Preview</title>
  <style>${globalsCss}
${buildV2RtlStyles(locale)}
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    .sr-only, .v2-sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    }
    [class*="animate-"] { animation-fill-mode: both; }
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--color-background, #0f172a);
      color: var(--color-foreground, #f8fafc);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .page { display: none; padding-bottom: 2rem; }
    .page:target { display: block; }
    body:not(:has(.page:target)) .page#${escapeHtml(defaultSlug)} { display: block; }
    img { max-width: 100%; height: auto; display: block; }
    a { color: inherit; }
  </style>
  <script src="${TAILWIND_CDN}"></script>
</head>
<body>
  <div class="page" id="${escapeHtml(defaultSlug)}">
    ${homeBody}
  </div>
  ${secondaryPages}
</body>
</html>`;
}
