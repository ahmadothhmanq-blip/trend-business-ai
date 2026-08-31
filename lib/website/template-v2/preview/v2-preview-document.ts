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
  PROJECT_FILES_PREVIEW_RENDER_VERSION,
  resolveV2PackageId,
  V2_PREVIEW_RENDER_VERSION,
} from "@/lib/website/template-v2/preview/v2-preview-input";

const TAILWIND_CDN = "https://cdn.tailwindcss.com";

/** Layout utilities for static previews when Tailwind CDN is blocked/unavailable. */
function buildPreviewLayoutUtilitiesCss(): string {
  return `
    .flex { display: flex; }
    .inline-flex { display: inline-flex; }
    .grid { display: grid; }
    .hidden { display: none; }
    .block { display: block; }
    .inline-block { display: inline-block; }
    .relative { position: relative; }
    .absolute { position: absolute; }
    .fixed { position: fixed; }
    .inset-0 { inset: 0; }
    .flex-1 { flex: 1 1 0%; }
    .flex-col { flex-direction: column; }
    .flex-wrap { flex-wrap: wrap; }
    .shrink-0 { flex-shrink: 0; }
    .items-center { align-items: center; }
    .items-start { align-items: start; }
    .items-end { align-items: end; }
    .justify-between { justify-content: space-between; }
    .justify-center { justify-content: center; }
    .gap-1 { gap: 0.25rem; }
    .gap-1\\.5 { gap: 0.375rem; }
    .gap-2 { gap: 0.5rem; }
    .gap-3 { gap: 0.75rem; }
    .gap-4 { gap: 1rem; }
    .gap-5 { gap: 1.25rem; }
    .gap-6 { gap: 1.5rem; }
    .gap-8 { gap: 2rem; }
    .gap-10 { gap: 2.5rem; }
    .gap-12 { gap: 3rem; }
    .gap-14 { gap: 3.5rem; }
    .mx-auto { margin-left: auto; margin-right: auto; }
    .mt-1 { margin-top: 0.25rem; }
    .mt-2 { margin-top: 0.5rem; }
    .mt-3 { margin-top: 0.75rem; }
    .mt-4 { margin-top: 1rem; }
    .mt-5 { margin-top: 1.25rem; }
    .mt-6 { margin-top: 1.5rem; }
    .mt-8 { margin-top: 2rem; }
    .mt-10 { margin-top: 2.5rem; }
    .mt-12 { margin-top: 3rem; }
    .mb-3 { margin-bottom: 0.75rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mb-10 { margin-bottom: 2.5rem; }
    .mb-12 { margin-bottom: 3rem; }
    .px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
    .px-4 { padding-left: 1rem; padding-right: 1rem; }
    .px-5 { padding-left: 1.25rem; padding-right: 1.25rem; }
    .px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
    .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
    .py-1\\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
    .py-2 { padding-top: 0.5rem; padding-bottom: 0.5rem; }
    .py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
    .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
    .py-16 { padding-top: 4rem; padding-bottom: 4rem; }
    .py-20 { padding-top: 5rem; padding-bottom: 5rem; }
    .pt-3 { padding-top: 0.75rem; }
    .pt-14 { padding-top: 3.5rem; }
    .pb-12 { padding-bottom: 3rem; }
    .p-4 { padding: 1rem; }
    .p-5 { padding: 1.25rem; }
    .p-6 { padding: 1.5rem; }
    .p-7 { padding: 1.75rem; }
    .h-1\\.5 { height: 0.375rem; }
    .h-2\\.5 { height: 0.625rem; }
    .h-10 { height: 2.5rem; }
    .h-16 { height: 4rem; }
    .h-24 { height: 6rem; }
    .w-1\\.5 { width: 0.375rem; }
    .w-2\\.5 { width: 0.625rem; }
    .w-5 { width: 1.25rem; }
    .w-10 { width: 2.5rem; }
    .w-full { width: 100%; }
    .min-h-screen { min-height: 100vh; }
    .min-h-\\[22rem\\] { min-height: 22rem; }
    .min-h-\\[min\\(88vh\\,52rem\\)\\] { min-height: min(88vh, 52rem); }
    .max-w-xs { max-width: 20rem; }
    .max-w-lg { max-width: 32rem; }
    .max-w-xl { max-width: 36rem; }
    .max-w-2xl { max-width: 42rem; }
    .max-w-3xl { max-width: 48rem; }
    .max-w-\\[13ch\\] { max-width: 13ch; }
    .max-w-\\[82rem\\], .max-w-\\[88rem\\] { max-width: 88rem; }
    .col-span-6 { grid-column: span 6 / span 6; }
    .sticky { position: sticky; }
    .top-0 { top: 0; }
    .bottom-0 { bottom: 0; }
    .z-50 { z-index: 50; }
    .overflow-hidden { overflow: hidden; }
    .overflow-x-auto { overflow-x: auto; }
    .rounded-lg { border-radius: 0.5rem; }
    .rounded-xl { border-radius: 0.75rem; }
    .rounded-2xl { border-radius: 1rem; }
    .rounded-full { border-radius: 9999px; }
    .border { border-width: 1px; border-style: solid; }
    .border-t { border-top-width: 1px; border-top-style: solid; }
    .border-y { border-top-width: 1px; border-bottom-width: 1px; border-style: solid; }
    .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
    .text-xs { font-size: 0.75rem; line-height: 1rem; }
    .text-lg { font-size: 1.125rem; line-height: 1.75rem; }
    .text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
    .text-\\[0\\.625rem\\] { font-size: 0.625rem; }
    .text-\\[0\\.6875rem\\] { font-size: 0.6875rem; }
    .font-medium { font-weight: 500; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .uppercase { text-transform: uppercase; }
    .tracking-wider { letter-spacing: 0.05em; }
    .tracking-widest { letter-spacing: 0.1em; }
    .leading-relaxed { line-height: 1.625; }
    .text-center { text-align: center; }
    .text-start { text-align: start; }
    .pointer-events-none { pointer-events: none; }
    .origin-bottom { transform-origin: bottom; }
    /* Static HTML previews: never leave reveal nodes stuck invisible when JS is blocked */
    html[data-v2-render] [class*="-reveal"],
    html[data-v2-render] [class*="-reveal-stagger"] > * {
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }
    /* Entrance Tailwind anims use opacity:0 + fill-mode both; iframes often
       throttle animations and leave the first viewport permanently blank. */
    html[data-v2-render] [class*="animate-["] {
      animation: none !important;
      opacity: 1 !important;
      transform: none !important;
      filter: none !important;
    }
    @media (min-width: 640px) {
      .sm\\:px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
      .sm\\:px-8 { padding-left: 2rem; padding-right: 2rem; }
      .sm\\:p-8 { padding: 2rem; }
      .sm\\:pt-16 { padding-top: 4rem; }
      .sm\\:py-28 { padding-top: 7rem; padding-bottom: 7rem; }
      .sm\\:inline-flex { display: inline-flex; }
      .sm\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .sm\\:col-span-3 { grid-column: span 3 / span 3; }
    }
    @media (min-width: 768px) {
      .md\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .md\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }
    @media (min-width: 1024px) {
      .lg\\:flex { display: flex; }
      .lg\\:hidden { display: none; }
      .lg\\:sticky { position: sticky; }
      .lg\\:top-28 { top: 7rem; }
      .lg\\:gap-10 { gap: 2.5rem; }
      .lg\\:grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .lg\\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .lg\\:grid-cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .lg\\:grid-cols-12 { grid-template-columns: repeat(12, minmax(0, 1fr)); }
      .lg\\:col-span-5 { grid-column: span 5 / span 5; }
      .lg\\:col-span-7 { grid-column: span 7 / span 7; }
      .lg\\:items-start { align-items: start; }
    }
  `;
}

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
      text-align: start;
      font-family: ${fontStack};
      line-height: 1.75;
      letter-spacing: 0.01em;
    }
    html[dir="rtl"] h1,
    html[dir="rtl"] h2,
    html[dir="rtl"] h3 {
      line-height: 1.3;
      letter-spacing: 0;
    }
    html[dir="rtl"] .v2-sidebar-shell {
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
  return buildFilesPreviewDocument(input, "v2");
}

/** Render TBGE / unified home pages from generated files without a V2 template package. */
export function buildProjectFilesPreviewDocument(
  input: StaticPreviewInput,
): string | null {
  return buildFilesPreviewDocument(input, "project");
}

function buildFilesPreviewDocument(
  input: StaticPreviewInput,
  mode: "v2" | "project",
): string | null {
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
    homeBody = `<div class="v2-preview-error" role="alert" data-v2-preview-error="${escapeHtml(message)}">
      <p class="v2-preview-error-title">Preview could not render this page</p>
      <p class="v2-preview-error-detail">${escapeHtml(message)}</p>
    </div>`;
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
  const rootAttrs =
    mode === "v2"
      ? `data-v2-render="${V2_PREVIEW_RENDER_VERSION}" data-v2-package="${escapeHtml(packageId)}"${layoutAttr}`
      : `data-project-files-render="${PROJECT_FILES_PREVIEW_RENDER_VERSION}"`;

  return `<!DOCTYPE html>
<html lang="${htmlLang}"${htmlDir} ${rootAttrs}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Live Preview</title>
  <style>${globalsCss}
${buildV2RtlStyles(locale)}
${buildPreviewLayoutUtilitiesCss()}
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
    /* Do not force fill-mode:both — it holds opacity:0 keyframes when
       animations are throttled inside the Live Preview iframe. */
    body {
      margin: 0;
      min-height: 100vh;
      background: var(--color-background, #0f172a);
      color: var(--color-foreground, #f8fafc);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    /* Never blank: home is visible by default. :has() only swaps secondary pages. */
    .page { display: none; padding-bottom: 2rem; }
    .page#${escapeHtml(defaultSlug)} { display: block; }
    .page:target { display: block; }
    @supports selector(body:has(.page:target)) {
      body:has(.page:target) .page#${escapeHtml(defaultSlug)}:not(:target) {
        display: none;
      }
    }
    img { max-width: 100%; height: auto; display: block; }
    a { color: inherit; }
    .v2-preview-error {
      margin: 2rem auto;
      max-width: 36rem;
      padding: 1.5rem 1.75rem;
      border: 1px solid color-mix(in srgb, var(--color-foreground, #f8fafc) 12%, transparent);
      border-radius: 0.75rem;
      background: color-mix(in srgb, var(--color-surface, #1e293b) 88%, transparent);
      text-align: center;
    }
    .v2-preview-error-title {
      margin: 0 0 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-foreground, #f8fafc);
    }
    .v2-preview-error-detail {
      margin: 0;
      font-size: 0.8125rem;
      line-height: 1.5;
      color: color-mix(in srgb, var(--color-foreground, #f8fafc) 72%, transparent);
      word-break: break-word;
    }
  </style>
  <script src="${TAILWIND_CDN}"></script>
</head>
<body>
  <div class="page" id="${escapeHtml(defaultSlug)}">
    ${homeBody}
  </div>
  ${secondaryPages}
  <script>
    /* __V2_REVEAL_BOOT__ */
    (function () {
      var nodes = Array.prototype.slice.call(
        document.querySelectorAll('[class*="-reveal"]')
      );
      if (!nodes.length) return;
      var reveal = function (el) {
        el.classList.add("df-is-visible");
        el.classList.add("is-visible");
      };
      // Static HTML previews have no React FlagshipRevealInit — reveal immediately
      // so sections are never stuck at opacity:0. Live apps still use the React hook.
      nodes.forEach(function (node) {
        node.classList.add("df-reveal-js");
        reveal(node);
      });
    })();
  </script>
</body>
</html>`;
}
