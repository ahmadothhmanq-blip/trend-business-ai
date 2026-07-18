import type { GeneratedProjectFile } from "@/plugins/website/types";

const PREVIEW_PATH = "preview/index.html";

export type StaticPreviewInput = {
  title?: string;
  description?: string;
  pages?: string[];
  sections?: string[];
  colorPalette?: string[];
  typography?: string[];
  content?: string[];
  components?: string[];
  heroImageUrl?: string | null;
  primaryCta?: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "page";
}

function pickColor(palette: string[] | undefined, index: number, fallback: string) {
  const raw = palette?.[index]?.trim();
  if (!raw) return fallback;
  const match = raw.match(/#([0-9a-fA-F]{3,8})\b/);
  if (match) return `#${match[1]}`;
  if (/^[a-zA-Z]+$/.test(raw)) return raw;
  return fallback;
}

function sanitizePreviewHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/javascript:/gi, "");
}

/**
 * Build a self-contained multi-page website preview (CSS :target navigation).
 * No scripts — safe for sandboxed iframe / live-preview route.
 */
export function buildStaticPreviewHtml(input: StaticPreviewInput): string {
  const title = escapeHtml(input.title?.trim() || "Website Preview");
  const description = escapeHtml(
    input.description?.trim() || "AI-generated website product preview.",
  );
  const pageNames = (input.pages ?? [])
    .map((p) => p.trim())
    .filter(Boolean)
    .slice(0, 8);
  const pages = (pageNames.length ? pageNames : ["Home", "About", "Services", "Contact"]).map(
    (name, index) => ({
      name,
      slug: slugify(name) || `page-${index + 1}`,
    }),
  );
  const sections = (input.sections ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 10);
  const content = (input.content ?? []).map((c) => c.trim()).filter(Boolean).slice(0, 12);
  const components = (input.components ?? []).map((c) => c.trim()).filter(Boolean).slice(0, 8);
  const typography = (input.typography ?? []).map((t) => t.trim()).filter(Boolean);

  // designSystemToPalette order: primary, secondary, accent, neutral, surface, background, foreground
  const accent = pickColor(input.colorPalette, 0, "#d4af37");
  const bg = pickColor(input.colorPalette, 5, "#0a0a0a");
  const surface = pickColor(input.colorPalette, 4, "#141414");
  const text = pickColor(input.colorPalette, 6, "#f5f5f5");
  const muted = pickColor(input.colorPalette, 3, "#a3a3a3");
  const headingFont = escapeHtml(typography[0] || "Georgia, serif");
  const bodyFont = escapeHtml(typography[1] || "system-ui, sans-serif");
  const heroImage = input.heroImageUrl?.trim();
  const ctaLabel = escapeHtml(input.primaryCta?.trim() || "Continue");

  const navItems = pages
    .map(
      (page) =>
        `<a href="#${escapeHtml(page.slug)}">${escapeHtml(page.name)}</a>`,
    )
    .join("");

  const pageViews = pages
    .map((page, pageIndex) => {
      const pageSections =
        sections.length > 0
          ? sections.slice(0, 4)
          : ["Overview", "Details", "Benefits", "Get started"];
      const sectionHtml = pageSections
        .map((section, sectionIndex) => {
          const body =
            content[pageIndex * 2 + sectionIndex] ||
            content[sectionIndex] ||
            content[0] ||
            `${page.name}: professional content for the ${section} section.`;
          return `
          <article class="block">
            <p class="eyebrow">${escapeHtml(section)}</p>
            <h2>${escapeHtml(section)}</h2>
            <p class="copy">${escapeHtml(body)}</p>
          </article>`;
        })
        .join("\n");

      const isHome = pageIndex === 0;
      const heroMedia =
        isHome && heroImage
          ? `<div class="hero-media" style="background-image:url('${escapeHtml(heroImage)}')"></div>`
          : "";
      return `
      <section class="page" id="${escapeHtml(page.slug)}">
        ${heroMedia}
        <div class="hero">
          <p class="eyebrow">${escapeHtml(page.name)}</p>
          <h1>${isHome ? title : escapeHtml(page.name)}</h1>
          <p>${isHome ? description : escapeHtml(`${page.name} page for ${input.title?.trim() || "your website"}.`)}</p>
          <a class="cta" href="#${escapeHtml(pages[Math.min(1, pages.length - 1)]?.slug || page.slug)}">${ctaLabel}</a>
        </div>
        <div class="grid">${sectionHtml}</div>
      </section>`;
    })
    .join("\n");

  const componentChips = components
    .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)
    .join("");

  const defaultSlug = pages[0]?.slug || "home";

  return sanitizePreviewHtml(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Live Preview</title>
  <style>
    :root {
      --bg: ${bg};
      --surface: ${surface};
      --accent: ${accent};
      --text: ${text};
      --muted: ${muted};
    }
    * { box-sizing: border-box; }
    html { scroll-behavior: smooth; }
    body {
      margin: 0;
      font-family: ${bodyFont};
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
      min-height: 100vh;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.25);
      background: var(--surface);
      position: sticky;
      top: 0;
      z-index: 5;
    }
    .brand {
      font-family: ${headingFont};
      font-weight: 700;
      color: var(--accent);
      text-decoration: none;
    }
    nav { display: flex; flex-wrap: wrap; gap: 0.75rem; }
    nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.85rem;
      padding: 0.35rem 0.55rem;
      border-radius: 999px;
    }
    nav a:hover { color: var(--accent); background: rgba(212,175,55,0.08); }
    .page { display: none; padding-bottom: 2.5rem; min-height: calc(100vh - 72px); }
    .page:target { display: block; }
    body:not(:has(.page:target)) .page#${defaultSlug} { display: block; }
    .hero-media {
      width: 100%;
      min-height: 42vh;
      background-size: cover;
      background-position: center;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2);
    }
    .hero { padding: 3rem 1.5rem 1.5rem; max-width: 960px; }
    .hero h1 {
      font-family: ${headingFont};
      font-size: clamp(2rem, 4vw, 3.1rem);
      line-height: 1.1;
      margin: 0 0 1rem;
    }
    .hero p { color: var(--muted); max-width: 52ch; margin: 0 0 1.4rem; }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.7rem;
      color: var(--accent);
      margin: 0 0 0.45rem;
    }
    .cta {
      display: inline-block;
      background: var(--accent);
      color: #111;
      font-weight: 700;
      padding: 0.75rem 1.2rem;
      border-radius: 999px;
      text-decoration: none;
    }
    .grid {
      padding: 0 1.5rem;
      display: grid;
      gap: 1rem;
      max-width: 960px;
    }
    @media (min-width: 800px) {
      .grid { grid-template-columns: 1fr 1fr; }
    }
    .block {
      background: var(--surface);
      border: 1px solid rgba(212, 175, 55, 0.18);
      border-radius: 1.25rem;
      padding: 1.25rem 1.35rem;
    }
    .block h2 {
      font-family: ${headingFont};
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
    }
    .copy { margin: 0; color: var(--muted); }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 1.25rem 1.5rem 0;
      max-width: 960px;
    }
    .chip {
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: var(--accent);
      border-radius: 999px;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
    }
    footer {
      margin-top: 2rem;
      padding: 1rem 1.5rem 2rem;
      color: var(--muted);
      font-size: 0.75rem;
      border-top: 1px solid rgba(212, 175, 55, 0.15);
    }
  </style>
</head>
<body>
  <header>
    <a class="brand" href="#${escapeHtml(defaultSlug)}">${title}</a>
    <nav>${navItems}</nav>
  </header>
  ${pageViews}
  ${componentChips ? `<div class="chips">${componentChips}</div>` : ""}
  <footer>Live product preview inside Trend Business AI · Navigate pages above · Export ZIP for full Next.js source</footer>
</body>
</html>`);
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

export function extractStaticPreviewHtml(
  files: GeneratedProjectFile[] | undefined,
  fallback: StaticPreviewInput,
): string {
  const preview = files?.find(
    (file) => file.path.replaceAll("\\", "/") === PREVIEW_PATH,
  );
  if (preview?.content?.includes("<html")) {
    return sanitizePreviewHtml(preview.content);
  }
  return buildStaticPreviewHtml(fallback);
}

export { PREVIEW_PATH, sanitizePreviewHtml, slugify };
