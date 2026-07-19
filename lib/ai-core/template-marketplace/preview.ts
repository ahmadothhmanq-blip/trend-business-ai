/**
 * Static preview HTML for marketplace templates (desktop / tablet / mobile frames).
 */

import type { MarketplaceTemplate } from "@/lib/ai-core/template-marketplace/types";

/**
 * Build a self-contained HTML preview string for iframe srcDoc.
 */
export function buildMarketplacePreviewHtml(template: MarketplaceTemplate): string {
  const c = template.colorSystem;
  const sections = template.previewSections
    .map((s, i) => {
      if (s.kind === "hero") {
        return `
<section class="hero">
  <p class="eyebrow">${escapeHtml(template.category.replace("-", " "))}</p>
  <h1>${escapeHtml(template.tagline)}</h1>
  <p class="lead">${escapeHtml(template.recommendedAudience)}</p>
  <div class="cta-row">
    <span class="btn primary">Primary CTA</span>
    <span class="btn ghost">Learn more</span>
  </div>
  <div class="hero-media" aria-hidden="true"></div>
</section>`;
      }
      if (s.kind === "media") {
        return `
<section class="band">
  <h2>${escapeHtml(s.label)}</h2>
  <div class="media-grid">
    <div class="tile"></div><div class="tile"></div><div class="tile"></div>
  </div>
</section>`;
      }
      if (s.kind === "proof") {
        return `
<section class="band proof">
  <h2>${escapeHtml(s.label)}</h2>
  <div class="quotes">
    <blockquote>“Clear, premium, conversion-ready.”</blockquote>
    <blockquote>“Feels like a real agency site.”</blockquote>
  </div>
</section>`;
      }
      if (s.kind === "pricing") {
        return `
<section class="band">
  <h2>${escapeHtml(s.label)}</h2>
  <div class="pricing">
    <div class="plan"><strong>Starter</strong><span>$49</span></div>
    <div class="plan featured"><strong>Growth</strong><span>$129</span></div>
    <div class="plan"><strong>Scale</strong><span>Custom</span></div>
  </div>
</section>`;
      }
      if (s.kind === "cta" || s.kind === "contact") {
        return `
<section class="band cta">
  <h2>${escapeHtml(s.label)}</h2>
  <p>Ready when you are — one clear next step.</p>
  <span class="btn primary">Get started</span>
</section>`;
      }
      return `
<section class="band ${i % 2 ? "alt" : ""}">
  <div class="split">
    <div>
      <h2>${escapeHtml(s.label)}</h2>
      <p>${escapeHtml(template.features[i % template.features.length] || "Premium section narrative")}</p>
    </div>
    <div class="panel"></div>
  </div>
</section>`;
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  :root {
    --primary: ${c.primary};
    --secondary: ${c.secondary};
    --accent: ${c.accent};
    --bg: ${c.background};
    --fg: ${c.foreground};
    --display: "${template.typography.display}", Georgia, serif;
    --body: "${template.typography.body}", system-ui, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: var(--body);
    background: var(--bg);
    color: var(--fg);
    line-height: 1.5;
  }
  header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1.5rem;
    border-bottom: 1px solid color-mix(in srgb, var(--fg) 10%, transparent);
    position: sticky;
    top: 0;
    backdrop-filter: blur(12px);
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    z-index: 2;
  }
  .brand { font-family: var(--display); font-weight: 600; letter-spacing: -0.02em; }
  nav { display: flex; gap: 1rem; font-size: 0.75rem; opacity: 0.7; }
  .hero {
    padding: 3.5rem 1.5rem 2.5rem;
    display: grid;
    gap: 1rem;
    background:
      radial-gradient(120% 80% at 80% 0%, color-mix(in srgb, var(--secondary) 28%, transparent), transparent 55%),
      var(--bg);
  }
  .eyebrow { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.65rem; opacity: 0.55; margin: 0; }
  h1 {
    font-family: var(--display);
    font-size: clamp(1.75rem, 4vw, 2.75rem);
    line-height: 1.1;
    letter-spacing: -0.03em;
    margin: 0;
    max-width: 16ch;
  }
  .lead { max-width: 42ch; opacity: 0.72; margin: 0; }
  .cta-row { display: flex; flex-wrap: wrap; gap: 0.6rem; margin-top: 0.5rem; }
  .btn {
    display: inline-flex;
    align-items: center;
    padding: 0.65rem 1rem;
    border-radius: 0.65rem;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .btn.primary { background: var(--secondary); color: #fff; }
  .btn.ghost { border: 1px solid color-mix(in srgb, var(--fg) 18%, transparent); }
  .hero-media {
    margin-top: 1.25rem;
    height: clamp(140px, 28vw, 220px);
    border-radius: 1rem;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--primary) 85%, #000), color-mix(in srgb, var(--secondary) 55%, var(--primary)));
    box-shadow: 0 24px 60px color-mix(in srgb, var(--primary) 25%, transparent);
  }
  .band { padding: 2.25rem 1.5rem; }
  .band.alt { background: color-mix(in srgb, var(--fg) 3%, var(--bg)); }
  h2 {
    font-family: var(--display);
    font-size: 1.35rem;
    letter-spacing: -0.02em;
    margin: 0 0 0.75rem;
  }
  .split {
    display: grid;
    gap: 1rem;
    grid-template-columns: 1.2fr 1fr;
    align-items: center;
  }
  .panel, .tile {
    border-radius: 0.9rem;
    min-height: 120px;
    background: linear-gradient(160deg, color-mix(in srgb, var(--secondary) 35%, var(--bg)), color-mix(in srgb, var(--accent) 25%, var(--bg)));
  }
  .media-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; }
  .quotes { display: grid; gap: 0.75rem; grid-template-columns: 1fr 1fr; }
  blockquote {
    margin: 0;
    padding: 1rem;
    border-radius: 0.85rem;
    background: color-mix(in srgb, var(--fg) 4%, var(--bg));
    border: 1px solid color-mix(in srgb, var(--fg) 8%, transparent);
    font-size: 0.9rem;
  }
  .pricing { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.65rem; }
  .plan {
    padding: 1rem;
    border-radius: 0.85rem;
    border: 1px solid color-mix(in srgb, var(--fg) 10%, transparent);
    display: grid;
    gap: 0.35rem;
  }
  .plan.featured {
    border-color: color-mix(in srgb, var(--secondary) 55%, transparent);
    background: color-mix(in srgb, var(--secondary) 10%, var(--bg));
  }
  .cta { text-align: center; background: color-mix(in srgb, var(--primary) 92%, #000); color: #f8fafc; }
  .cta h2, .cta p { color: inherit; }
  footer {
    padding: 1.5rem;
    font-size: 0.7rem;
    opacity: 0.5;
    border-top: 1px solid color-mix(in srgb, var(--fg) 8%, transparent);
  }
  @media (max-width: 720px) {
    nav { display: none; }
    .split, .media-grid, .quotes, .pricing { grid-template-columns: 1fr; }
  }
</style>
</head>
<body>
  <header>
    <div class="brand">${escapeHtml(template.name.split("·")[0]?.trim() || "Brand")}</div>
    <nav>
      ${template.previewSections
        .slice(1, 5)
        .map((s) => `<span>${escapeHtml(s.label)}</span>`)
        .join("")}
    </nav>
    <span class="btn primary">Use template</span>
  </header>
  ${sections}
  <footer>
    Preview · ${escapeHtml(template.style)} · ${escapeHtml(template.layoutType)} ·
    seeds Design Intelligence, Brand Identity, Assets, Editor, Final Quality
  </footer>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
