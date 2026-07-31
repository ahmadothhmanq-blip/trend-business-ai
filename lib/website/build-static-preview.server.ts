import { getTemplateIntelligence } from "@/lib/ai-core/template-intelligence/catalog";
import { resolveTemplateVisualPreset } from "@/lib/ai-core/template-intelligence/visual-preset";
import {
  resolveLocaleFromLanguage,
  type SiteLocaleConfig,
} from "@/lib/ai-core/website-design-platform/i18n";
import { getComposeUiFallbacks, getDefaultPreviewPageNames } from "@/lib/ai-core/content/content-language";
import type { StaticPreviewInput } from "@/lib/website/preview-input";
import {
  PREVIEW_PATH,
  sanitizePreviewHtml,
  slugify,
} from "@/lib/website/preview-shared";
import {
  resolveThemePreviewContext,
  themePreviewCacheSignature,
  buildThemePreviewContent,
} from "@/lib/website/theme-preview/resolve";
import { composeThemeSecondaryPages } from "@/lib/website/theme-preview/compose-inner-page";
import { buildThemePreviewDocument } from "@/lib/website/theme-preview/document.server";
import {
  renderTemplateDrivenPageBody,
  resolvePreviewSections,
  type TemplatePreviewTheme,
} from "@/lib/website/template-preview-renderer";
import type { GeneratedProjectFile } from "@/plugins/website/types";

const PREVIEW_RENDER_VERSION = "v5";
const LEGACY_PREVIEW_RENDER_VERSION = "v2";
const TAILWIND_CDN_MARKER = "cdn.tailwindcss.com";

export type { StaticPreviewInput } from "@/lib/website/preview-input";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function pickColor(palette: string[] | undefined, index: number, fallback: string) {
  const raw = palette?.[index]?.trim();
  if (!raw) return fallback;
  const match = raw.match(/#([0-9a-fA-F]{3,8})\b/);
  if (match) return `#${match[1]}`;
  if (/^[a-zA-Z]+$/.test(raw)) return raw;
  return fallback;
}

function resolvePreviewTheme(input: StaticPreviewInput): TemplatePreviewTheme {
  const template = input.templateIntelligenceId
    ? getTemplateIntelligence(input.templateIntelligenceId)
    : null;
  const preset = template ? resolveTemplateVisualPreset(template) : null;
  const typography = (input.typography ?? []).map((t) => t.trim()).filter(Boolean);

  const colors = template?.colors;
  const primary = colors?.primary || pickColor(input.colorPalette, 0, "#0F172A");
  const secondary = colors?.secondary || pickColor(input.colorPalette, 1, "#334155");
  const accent = colors?.accent || pickColor(input.colorPalette, 2, "#2563EB");
  const bg = colors?.background || pickColor(input.colorPalette, 5, "#F8FAFC");
  const surface = colors?.surface || pickColor(input.colorPalette, 4, "#FFFFFF");
  const text = colors?.foreground || pickColor(input.colorPalette, 6, "#0F172A");
  const muted = pickColor(input.colorPalette, 3, secondary);

  return {
    primary,
    secondary,
    accent,
    bg,
    surface,
    text,
    muted,
    headingFont: escapeHtml(
      template?.typography.heading || typography[0] || "Georgia, serif",
    ),
    bodyFont: escapeHtml(
      template?.typography.body || typography[1] || "system-ui, sans-serif",
    ),
    displayFont: escapeHtml(
      template?.typography.display || typography[0] || "Georgia, serif",
    ),
    sectionY: preset?.spacing.sectionY || "5rem",
    sectionYMobile: preset?.spacing.sectionYMobile || "3rem",
    containerMax: preset?.spacing.containerMax || "68rem",
    btnPrimary: preset?.buttons.primary || "filled",
    btnRadius: preset?.buttons.radius || "999px",
    btnUppercase: preset?.buttons.uppercase ?? false,
    btnWeight: preset?.buttons.weight ?? 700,
    preset: preset ?? {
      spacing: {
        sectionY: "5rem",
        sectionYMobile: "3rem",
        containerMax: "68rem",
        stack: "1.25rem",
        density: "balanced",
      },
      buttons: {
        primary: "filled",
        secondary: "outline",
        radius: "999px",
        uppercase: false,
        weight: 700,
      },
      chrome: {
        headerVariant: "solid",
        headerComponent: "SiteHeader",
        footerVariant: "multi-column",
        footerComponent: "SiteFooter",
        navStyle: "pill",
      },
      layout: {
        heroLayout: "HeroSplit",
        sectionLayout: "grid",
        cardsStyle: "structured",
        componentStyle: "default",
        layoutVariant: "product-saas",
        heroVariant: "saas-split",
        cardVariant: "structured",
        navigationVariant: "pill-modern",
        footerVariant: "multi-column",
      },
      sections: [],
    },
    templateId: template?.id ?? null,
    templateName: template?.name ?? null,
  };
}

function buildPreviewStyles(theme: TemplatePreviewTheme): string {
  const ctaBg =
    theme.btnPrimary === "ghost" || theme.btnPrimary === "outline"
      ? "transparent"
      : theme.accent;
  const ctaColor =
    theme.btnPrimary === "ghost" || theme.btnPrimary === "outline"
      ? theme.accent
      : theme.bg === "#F8FAFC" || theme.bg === "#FFFFFF"
        ? "#FFFFFF"
        : "#111111";
  const ctaBorder =
    theme.btnPrimary === "outline" || theme.btnPrimary === "ghost"
      ? `2px solid ${theme.accent}`
      : "none";
  const layout = theme.preset.layout.sectionLayout;
  const cardVariant = theme.preset.layout.cardVariant;

  const gridCols =
    layout === "editorial"
      ? "1fr"
      : layout === "asymmetric"
        ? "1.2fr 0.8fr"
        : layout === "bento"
          ? "repeat(3, minmax(0, 1fr))"
          : "repeat(2, minmax(0, 1fr))";

  const cardRadius =
    cardVariant === "borderless"
      ? "0"
      : cardVariant === "glass"
        ? "1rem"
        : "1.25rem";
  const cardShadow =
    cardVariant === "soft-shadow"
      ? `0 24px 48px color-mix(in srgb, ${theme.primary} 22%, transparent)`
      : cardVariant === "glass"
        ? `inset 0 1px 0 color-mix(in srgb, ${theme.text} 8%, transparent)`
        : cardVariant === "premium-red"
          ? `0 20px 40px color-mix(in srgb, ${theme.accent} 28%, transparent)`
          : "none";

  return `
    :root {
      --bg: ${theme.bg};
      --surface: ${theme.surface};
      --primary: ${theme.primary};
      --secondary: ${theme.secondary};
      --accent: ${theme.accent};
      --text: ${theme.text};
      --muted: ${theme.muted};
      --section-y: ${theme.sectionY};
      --section-y-mobile: ${theme.sectionYMobile};
      --container-max: ${theme.containerMax};
      --ease-premium: cubic-bezier(0.22, 1, 0.36, 1);
      --shadow-premium: 0 24px 64px color-mix(in srgb, ${theme.primary} 16%, transparent);
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: ${theme.bodyFont};
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      min-height: 100vh;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    .ti-site-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.5rem;
      position: sticky;
      top: 0;
      z-index: 10;
      background: color-mix(in srgb, var(--surface) 88%, transparent);
      border-bottom: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }
    .ti-header-transparent { background: transparent; border-bottom: none; position: absolute; width: 100%; }
    .ti-nav-red-bold .brand { color: var(--accent); }
    .brand {
      font-family: ${theme.displayFont};
      font-weight: 700;
      color: var(--accent);
      text-decoration: none;
    }
    nav { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; }
    nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.85rem;
      padding: 0.35rem 0.55rem;
    }
    nav a:hover { color: var(--accent); }
    .ti-btn {
      display: inline-block;
      padding: 0.75rem 1.35rem;
      border-radius: ${theme.btnRadius};
      font-weight: ${theme.btnWeight};
      text-decoration: none;
      ${theme.btnUppercase ? "text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.75rem;" : ""}
    }
    .ti-btn-primary {
      background: ${ctaBg};
      color: ${ctaColor};
      border: ${ctaBorder};
      transition: transform 0.35s var(--ease-premium), box-shadow 0.35s var(--ease-premium);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 20%, transparent);
    }
    .ti-btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-premium);
    }
    .ti-btn-secondary {
      background: transparent;
      color: var(--accent);
      border: 1px solid color-mix(in srgb, var(--accent) 50%, transparent);
    }
    .ti-hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      align-items: center;
      margin-top: 0.25rem;
    }
    .ti-trust-badges {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      margin-top: 1.5rem;
      font-size: 0.75rem;
      color: var(--muted);
    }
    .ti-hero { position: relative; overflow: hidden; }
    .ti-hero--luxury, .ti-hero--red-premium, .ti-hero--cinematic { min-height: 72vh; }
    .ti-hero-media {
      position: absolute;
      inset: 0;
      background-size: cover;
      background-position: center;
      opacity: 0.55;
    }
    .ti-hero-media--luxury-editorial {
      background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 80%, black), color-mix(in srgb, var(--accent) 30%, var(--bg)));
    }
    .ti-hero-media--red-premium {
      background: linear-gradient(135deg, #7F1D1D, #DC2626 45%, #0C0A0A);
    }
    .ti-hero-media--cinematic-full {
      background: linear-gradient(160deg, var(--primary), var(--accent));
    }
    .ti-hero-media--saas-split {
      background: linear-gradient(135deg, color-mix(in srgb, var(--accent) 25%, var(--surface)), var(--surface));
    }
    .ti-hero-overlay, .ti-hero-editorial, .ti-hero-inner, .ti-hero-copy {
      position: relative;
      z-index: 1;
      max-width: var(--container-max);
      margin-inline: auto;
      padding: 4rem 1.5rem 3rem;
    }
    .ti-hero--saas-split .ti-hero-inner {
      display: grid;
      gap: 2rem;
      align-items: center;
    }
    @media (min-width: 900px) {
      .ti-hero--saas-split .ti-hero-inner { grid-template-columns: 1fr 1fr; }
    }
    .ti-hero h1 {
      font-family: ${theme.displayFont};
      font-size: clamp(2.2rem, 4.5vw, 3.8rem);
      line-height: 1.05;
      margin: 0 0 1rem;
      letter-spacing: -0.03em;
    }
    .ti-hero--minimal { padding: 5rem 1.5rem 3rem; max-width: var(--container-max); margin-inline: auto; }
    .lead { color: var(--muted); max-width: 52ch; margin: 0 0 1.25rem; }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.7rem;
      color: var(--accent);
      margin: 0 0 0.45rem;
    }
    .ti-block {
      padding: var(--section-y-mobile) 1.5rem;
      max-width: var(--container-max);
      margin-inline: auto;
    }
    @media (min-width: 768px) {
      .ti-block { padding-block: var(--section-y); }
    }
    .ti-block-head h2 {
      font-family: ${theme.headingFont};
      font-size: clamp(1.5rem, 3vw, 2.2rem);
      margin: 0.25rem 0 1.5rem;
    }
    .copy { color: var(--muted); margin: 0; }
    .ti-card {
      background: ${
        cardVariant === "glass"
          ? `color-mix(in srgb, var(--surface) 75%, transparent)`
          : "var(--surface)"
      };
      border-radius: ${cardRadius};
      box-shadow: ${cardShadow};
      border: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
      padding: 1.35rem 1.5rem;
      transition: transform 0.45s var(--ease-premium), box-shadow 0.45s var(--ease-premium);
      ${cardVariant === "glass" ? "backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);" : ""}
    }
    .ti-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-premium);
    }
    .ti-card--featured { border-color: var(--accent); }
    .ti-features-grid, .ti-services-row, .ti-pricing-grid, .ti-cases-grid {
      display: grid;
      gap: 1rem;
      grid-template-columns: ${gridCols};
    }
    .ti-layout-asymmetric .ti-gallery-grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: 1.2fr 0.8fr;
      grid-template-rows: auto auto;
    }
    .ti-gallery-grid {
      display: grid;
      gap: 0.75rem;
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .ti-gallery-cell {
      min-height: 120px;
      background: color-mix(in srgb, var(--accent) 12%, var(--surface));
      border-radius: ${cardRadius};
      display: flex;
      align-items: flex-end;
      padding: 1rem;
      margin: 0;
    }
    .ti-gallery-cell--hero { grid-row: span 2; min-height: 260px; }
    .ti-testimonial-track {
      display: grid;
      gap: 1rem;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    }
    .ti-testimonial-track blockquote { margin: 0; }
    .ti-testimonial-track footer { margin-top: 0.75rem; font-size: 0.75rem; color: var(--muted); }
    .ti-faq-item {
      border-top: 1px solid color-mix(in srgb, var(--text) 10%, transparent);
      padding: 0.75rem 0;
    }
    .ti-faq-item summary { cursor: pointer; font-weight: 600; }
    .ti-block--cta, .ti-cta--red-premium {
      background: color-mix(in srgb, var(--accent) 12%, var(--surface));
      border-radius: ${cardRadius};
      margin: 1rem 1.5rem;
      max-width: calc(var(--container-max) - 3rem);
    }
    .ti-cta-inner { padding: 2rem 1.5rem; text-align: center; }
    .ti-editorial-split {
      display: grid;
      gap: 1.5rem;
    }
    @media (min-width: 800px) {
      .ti-editorial-split { grid-template-columns: 1fr 1.2fr; align-items: start; }
    }
    .ti-editorial-body { font-size: 1.05rem; }
    .ti-contact-form { display: grid; gap: 0.75rem; max-width: 480px; margin-top: 1rem; }
    .ti-field {
      border: 1px solid color-mix(in srgb, var(--text) 12%, transparent);
      border-radius: 0.5rem;
      padding: 0.75rem 1rem;
      color: var(--muted);
      background: var(--bg);
    }
    .ti-field--wide { min-height: 96px; }
    .price { font-size: 1.75rem; font-weight: 800; color: var(--accent); margin: 0.5rem 0; }
    .ti-site-footer {
      margin-top: 2rem;
      padding: 1.25rem 1.5rem 2rem;
      color: var(--muted);
      font-size: 0.75rem;
      border-top: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    }
    .ti-footer-cols { display: flex; flex-wrap: wrap; gap: 1.5rem; justify-content: space-between; }
    .ti-footer-editorial { text-align: center; letter-spacing: 0.08em; text-transform: uppercase; }
    .page { display: none; padding-bottom: 2rem; }
    .page:target { display: block; }
  `;
}

function buildRtlPreviewStyles(locale: SiteLocaleConfig, bodyFont: string): string {
  if (!locale.rtl) return "";
  const fontStack = locale.fontHint
    ? `${locale.fontHint}, ${bodyFont}`
    : bodyFont;
  return `
    html[dir="rtl"] { direction: rtl; }
    html[dir="rtl"] body {
      text-align: right;
      font-family: ${fontStack};
    }
    html[dir="rtl"] .ti-site-header {
      flex-direction: row-reverse;
    }
    html[dir="rtl"] nav {
      flex-direction: row-reverse;
      justify-content: flex-start;
    }
    html[dir="rtl"] .ti-hero-inner,
    html[dir="rtl"] .ti-hero-editorial,
    html[dir="rtl"] .ti-hero-copy,
    html[dir="rtl"] .ti-block,
    html[dir="rtl"] .ti-block-head,
    html[dir="rtl"] .lead,
    html[dir="rtl"] .copy {
      text-align: right;
    }
    html[dir="rtl"] .ti-hero--saas-split .ti-hero-inner {
      direction: rtl;
    }
    html[dir="rtl"] .ti-grid,
    html[dir="rtl"] .ti-bento {
      direction: rtl;
    }
    html[dir="rtl"] .ti-btn-secondary {
      margin-left: 0;
      margin-right: 0.5rem;
    }
    html[dir="rtl"] .ti-footer-cols {
      flex-direction: row-reverse;
    }
    html[dir="rtl"] .ti-footer-editorial {
      text-align: center;
    }
  `;
}

function buildSecondaryPagesHtml(
  input: StaticPreviewInput,
  pages: Array<{ name: string; slug: string }>,
  defaultSlug: string,
  ctaLabel: string,
  locale: ReturnType<typeof resolveLocaleFromLanguage>,
): string {
  const previewCtx = resolveThemePreviewContext(input);
  if (previewCtx?.templateIntelligenceId) {
    const content = buildThemePreviewContent(input);
    const files = input.files?.map((f) => ({ path: f.path, content: f.content }));
    return composeThemeSecondaryPages(previewCtx, content, pages, {
      defaultSlug,
      files,
    });
  }

  const content = (input.content ?? []).map((c) => c.trim()).filter(Boolean);
  return pages
    .slice(1)
    .map((page, pageIndex) => {
      const fallbackBody = locale.rtl
        ? `محتوى صفحة ${page.name} لموقع ${input.title || "الموقع"}.`
        : `${page.name} — ${input.title || "Website"}.`;
      const body = pickContent(content, pageIndex + 1, fallbackBody);
      return `<section class="page" id="${escapeHtml(page.slug)}">
  <div class="tp-section-shell theme-secondary-page">
    <div class="tp-section-container">
      <p class="tp-section-eyebrow">${escapeHtml(page.name)}</p>
      <h1 class="tp-section-title">${escapeHtml(page.name)}</h1>
      <p class="tp-section-subtitle">${escapeHtml(body)}</p>
      <a class="tp-btn-primary" href="#${escapeHtml(defaultSlug)}">${escapeHtml(ctaLabel)}</a>
    </div>
  </div>
</section>`;
    })
    .join("\n");
}

/**
 * Build a self-contained multi-page website preview (CSS :target navigation).
 * Theme projects render from Theme* architecture; legacy projects use TI fallback.
 */
export function buildStaticPreviewHtml(input: StaticPreviewInput): string {
  const locale = resolveLocaleFromLanguage(input.language);
  const ui = getComposeUiFallbacks(input.language);
  const defaultPageNames = getDefaultPreviewPageNames(input.language);
  const pageNames = (input.pages ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);
  const pages = (pageNames.length ? pageNames : defaultPageNames).map(
    (name, index) => ({
      name,
      slug: slugify(name) || `page-${index + 1}`,
    }),
  );
  const defaultSlug = pages[0]?.slug || "home";
  const ctaLabel = input.primaryCta?.trim() || ui.primaryCta;
  const secondaryPages = buildSecondaryPagesHtml(
    input,
    pages,
    defaultSlug,
    ctaLabel,
    locale,
  );

  if (resolveThemePreviewContext(input)) {
    const themed = buildThemePreviewDocument(input, {
      defaultSlug,
      secondaryPagesHtml: secondaryPages,
    });
    if (themed) return sanitizePreviewHtml(themed);
  }

  const theme = resolvePreviewTheme(input);
  const title = input.title?.trim() || (locale.rtl ? "معاينة الموقع" : "Website Preview");
  const description =
    input.description?.trim() ||
    (locale.rtl
      ? "معاينة منتج الموقع المُنشأ بالذكاء الاصطناعي."
      : "AI-generated website product preview.");
  const content = (input.content ?? []).map((c) => c.trim()).filter(Boolean);

  const navItems = pages
    .map(
      (page) =>
        `<a href="#${escapeHtml(page.slug)}">${escapeHtml(page.name)}</a>`,
    )
    .join("");

  const sectionSpecs = resolvePreviewSections({
    templateIntelligenceId: input.templateIntelligenceId,
    components: input.components,
    language: input.language,
    content,
    industryId: input.industryId,
  });

  const homeBody = renderTemplateDrivenPageBody({
    sections: sectionSpecs,
    ctx: {
      title,
      description,
      content,
      primaryCta: ctaLabel,
      secondaryCta: ui.secondaryCta,
      heroImageUrl: input.heroImageUrl,
      pages: pageNames,
      defaultSlug,
      language: input.language,
    },
    theme,
    navHtml: navItems,
  });

  const templateAttr = theme.templateId
    ? ` data-ti-template="${escapeHtml(theme.templateId)}" data-ti-render="${LEGACY_PREVIEW_RENDER_VERSION}"`
    : ` data-ti-render="${LEGACY_PREVIEW_RENDER_VERSION}"`;
  const htmlDir = locale.rtl ? ` dir="rtl"` : "";
  const htmlLang = escapeHtml(locale.htmlLang);

  return sanitizePreviewHtml(`<!DOCTYPE html>
<html lang="${htmlLang}"${htmlDir}${templateAttr}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — Live Preview</title>
  <style>${buildPreviewStyles(theme)}${buildRtlPreviewStyles(locale, theme.bodyFont)}
    body:not(:has(.page:target)) .page#${escapeHtml(defaultSlug)} { display: block; }
  </style>
</head>
<body>
  <div class="page" id="${escapeHtml(defaultSlug)}">
    ${homeBody}
  </div>
  ${secondaryPages}
</body>
</html>`);
}

function pickContent(content: string[], index: number, fallback: string): string {
  return content[index]?.trim() || fallback;
}

export function ensureStaticPreviewFile(
  project: StaticPreviewInput & { files: GeneratedProjectFile[] },
): GeneratedProjectFile[] {
  const html = buildStaticPreviewHtml(project);
  const previewFile: GeneratedProjectFile = {
    path: PREVIEW_PATH,
    language: "html",
    content: html,
  };

  const without = project.files.filter(
    (file) => file.path.replaceAll("\\", "/") !== PREVIEW_PATH,
  );
  return [...without, previewFile];
}

function previewNeedsTailwindRegeneration(content: string): boolean {
  return (
    content.includes(`data-ti-render="${PREVIEW_RENDER_VERSION}"`) &&
    !content.includes(TAILWIND_CDN_MARKER)
  );
}

export function extractStaticPreviewHtml(
  files: GeneratedProjectFile[] | undefined,
  fallback: StaticPreviewInput,
): string {
  const preview = files?.find(
    (file) => file.path.replaceAll("\\", "/") === PREVIEW_PATH,
  );
  const themeSignature = themePreviewCacheSignature(fallback);

  if (preview?.content?.includes("<html")) {
    if (previewNeedsTailwindRegeneration(preview.content)) {
      return buildStaticPreviewHtml(fallback);
    }

    const hasV4 = preview.content.includes(`data-ti-render="${PREVIEW_RENDER_VERSION}"`);
    if (hasV4 && themeSignature) {
      const themeId = fallback.websiteThemeId?.trim();
      const matchesTheme =
        preview.content.includes(`data-theme="${themeId}"`) ||
        preview.content.includes(`data-theme="${themeSignature.split("|")[0]}"`);
      const matchesSignature = preview.content.includes(
        `data-ti-template="${fallback.templateIntelligenceId?.trim() || themeSignature.split("|")[0]}"`,
      );
      if (matchesTheme && matchesSignature) {
        return sanitizePreviewHtml(preview.content);
      }
    }

    const tiId = fallback.templateIntelligenceId?.trim();
    const hasLegacy = preview.content.includes(
      `data-ti-render="${LEGACY_PREVIEW_RENDER_VERSION}"`,
    );
    if (!themeSignature && hasLegacy) {
      if (tiId) {
        const matchesTemplate = preview.content.includes(
          `data-ti-template="${tiId}"`,
        );
        if (matchesTemplate) {
          return sanitizePreviewHtml(preview.content);
        }
      } else if (!preview.content.includes("data-ti-template=")) {
        return sanitizePreviewHtml(preview.content);
      }
    }
  }
  return buildStaticPreviewHtml(fallback);
}

export { PREVIEW_PATH, sanitizePreviewHtml, slugify } from "@/lib/website/preview-shared";
