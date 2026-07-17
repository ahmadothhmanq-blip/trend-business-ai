import type { GeneratedProjectFile } from "@/plugins/website/types";

const PREVIEW_PATH = "preview/index.html";

type StaticPreviewInput = {
  title?: string;
  description?: string;
  pages?: string[];
  sections?: string[];
  colorPalette?: string[];
  typography?: string[];
  content?: string[];
  components?: string[];
};

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
  // Accept "#hex" or "Name #hex" / "Name: #hex"
  const match = raw.match(/#([0-9a-fA-F]{3,8})\b/);
  if (match) return `#${match[1]}`;
  if (/^[a-zA-Z]+$/.test(raw)) return raw;
  return fallback;
}

/**
 * Build a self-contained marketing preview HTML from blueprint metadata.
 * Safe for iframe srcdoc — no scripts, no external network except system fonts.
 */
export function buildStaticPreviewHtml(input: StaticPreviewInput): string {
  const title = escapeHtml(input.title?.trim() || "Website Preview");
  const description = escapeHtml(
    input.description?.trim() || "AI-generated website concept preview.",
  );
  const pages = (input.pages ?? []).map((p) => p.trim()).filter(Boolean).slice(0, 8);
  const sections = (input.sections ?? []).map((s) => s.trim()).filter(Boolean).slice(0, 10);
  const content = (input.content ?? []).map((c) => c.trim()).filter(Boolean).slice(0, 8);
  const components = (input.components ?? []).map((c) => c.trim()).filter(Boolean).slice(0, 6);
  const typography = (input.typography ?? []).map((t) => t.trim()).filter(Boolean);

  const bg = pickColor(input.colorPalette, 0, "#0a0a0a");
  const surface = pickColor(input.colorPalette, 1, "#141414");
  const accent = pickColor(input.colorPalette, 2, "#d4af37");
  const text = pickColor(input.colorPalette, 3, "#f5f5f5");
  const muted = pickColor(input.colorPalette, 4, "#a3a3a3");

  const headingFont = escapeHtml(typography[0] || "Georgia, serif");
  const bodyFont = escapeHtml(typography[1] || "system-ui, sans-serif");

  const navItems = (pages.length ? pages : ["Home", "About", "Services", "Contact"])
    .map(
      (page) =>
        `<a href="#${escapeHtml(page.toLowerCase().replace(/\s+/g, "-"))}">${escapeHtml(page)}</a>`,
    )
    .join("");

  const sectionBlocks = (sections.length ? sections : ["Hero", "Features", "About", "CTA"])
    .map((section, index) => {
      const body =
        content[index] ||
        content[0] ||
        "Professional content generated for this section of your website.";
      return `
      <section class="block" id="${escapeHtml(section.toLowerCase().replace(/\s+/g, "-"))}">
        <p class="eyebrow">${escapeHtml(section)}</p>
        <h2>${escapeHtml(section)}</h2>
        <p class="copy">${escapeHtml(body)}</p>
      </section>`;
    })
    .join("\n");

  const componentChips = components
    .map((c) => `<span class="chip">${escapeHtml(c)}</span>`)
    .join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — Preview</title>
  <style>
    :root {
      --bg: ${bg};
      --surface: ${surface};
      --accent: ${accent};
      --text: ${text};
      --muted: ${muted};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: ${bodyFont};
      background: var(--bg);
      color: var(--text);
      line-height: 1.55;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1.1rem 1.5rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.25);
      background: var(--surface);
      position: sticky;
      top: 0;
      z-index: 2;
    }
    .brand {
      font-family: ${headingFont};
      font-weight: 700;
      letter-spacing: 0.02em;
      color: var(--accent);
    }
    nav { display: flex; flex-wrap: wrap; gap: 0.85rem; }
    nav a {
      color: var(--muted);
      text-decoration: none;
      font-size: 0.85rem;
    }
    nav a:hover { color: var(--accent); }
    .hero {
      padding: 3.5rem 1.5rem 2.5rem;
      max-width: 920px;
    }
    .hero h1 {
      font-family: ${headingFont};
      font-size: clamp(2rem, 4vw, 3.2rem);
      line-height: 1.1;
      margin: 0 0 1rem;
    }
    .hero p { color: var(--muted); max-width: 48ch; margin: 0 0 1.5rem; }
    .cta {
      display: inline-block;
      background: var(--accent);
      color: #111;
      font-weight: 700;
      padding: 0.75rem 1.2rem;
      border-radius: 999px;
      text-decoration: none;
    }
    main { padding: 0 1.5rem 3rem; display: grid; gap: 1rem; max-width: 920px; }
    .block {
      background: var(--surface);
      border: 1px solid rgba(212, 175, 55, 0.18);
      border-radius: 1.25rem;
      padding: 1.35rem 1.4rem;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.12em;
      font-size: 0.7rem;
      color: var(--accent);
      margin: 0 0 0.4rem;
    }
    .block h2 {
      font-family: ${headingFont};
      margin: 0 0 0.55rem;
      font-size: 1.35rem;
    }
    .copy { margin: 0; color: var(--muted); }
    .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; padding: 0 1.5rem 2rem; max-width: 920px; }
    .chip {
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: var(--accent);
      border-radius: 999px;
      padding: 0.35rem 0.75rem;
      font-size: 0.75rem;
    }
    footer {
      padding: 1rem 1.5rem 2rem;
      color: var(--muted);
      font-size: 0.75rem;
      border-top: 1px solid rgba(212, 175, 55, 0.15);
    }
  </style>
</head>
<body>
  <header>
    <div class="brand">${title}</div>
    <nav>${navItems}</nav>
  </header>
  <section class="hero">
    <h1>${title}</h1>
    <p>${description}</p>
    <a class="cta" href="#${escapeHtml((sections[0] || "hero").toLowerCase().replace(/\s+/g, "-"))}">Explore</a>
  </section>
  <main>
    ${sectionBlocks}
  </main>
  ${componentChips ? `<div class="chips">${componentChips}</div>` : ""}
  <footer>Interactive product preview · Full Next.js source available via ZIP export</footer>
</body>
</html>`;
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
    // Strip scripts for srcdoc safety even if present.
    return preview.content.replace(
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      "",
    );
  }
  return buildStaticPreviewHtml(fallback);
}

export { PREVIEW_PATH };
