import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence/types";

/**
 * Lightweight structural preview for Template Intelligence chooser.
 */
export function buildTemplateIntelligencePreviewHtml(
  template: TemplateIntelligenceDefinition,
): string {
  const c = template.colors;
  const sections = template.components
    .filter((id) => !/Header|Footer|Nav/i.test(id))
    .slice(0, 5);

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${template.name}</title>
<style>
  :root {
    --bg: ${c.background};
    --fg: ${c.foreground};
    --surface: ${c.surface};
    --primary: ${c.primary};
    --accent: ${c.accent};
    --secondary: ${c.secondary};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "${template.typography.body}", system-ui, sans-serif;
    background: var(--bg);
    color: var(--fg);
  }
  .hero {
    min-height: 220px;
    padding: 28px 24px 36px;
    background:
      linear-gradient(135deg, color-mix(in srgb, var(--primary) 70%, black), color-mix(in srgb, var(--accent) 35%, var(--bg)));
  }
  .eyebrow {
    font-size: 10px;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    opacity: 0.75;
  }
  h1 {
    font-family: "${template.typography.display}", Georgia, serif;
    font-size: 34px;
    line-height: 1.05;
    margin: 10px 0 0;
    letter-spacing: -0.03em;
  }
  .tag { margin-top: 10px; font-size: 13px; opacity: 0.8; max-width: 36ch; }
  .cta {
    display: inline-block;
    margin-top: 18px;
    padding: 10px 16px;
    border-radius: 999px;
    background: var(--accent);
    color: #0a0a0a;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    text-decoration: none;
  }
  .grid {
    display: grid;
    gap: 10px;
    padding: 16px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .card {
    border: 1px solid color-mix(in srgb, var(--fg) 12%, transparent);
    background: var(--surface);
    border-radius: 14px;
    padding: 14px;
    min-height: 72px;
  }
  .card strong {
    display: block;
    font-size: 12px;
    margin-bottom: 4px;
  }
  .card span { font-size: 11px; opacity: 0.65; }
  .meta {
    padding: 0 16px 16px;
    font-size: 11px;
    opacity: 0.55;
  }
</style>
</head>
<body>
  <section class="hero">
    <div class="eyebrow">${template.category} · ${template.designPreset}</div>
    <h1>${template.name}</h1>
    <p class="tag">${template.tagline}</p>
    <a class="cta" href="#">Primary CTA</a>
  </section>
  <div class="grid">
    ${sections
      .map(
        (id) =>
          `<article class="card"><strong>${id}</strong><span>${template.layoutStructure}</span></article>`,
      )
      .join("")}
  </div>
  <p class="meta">${template.typography.display} / ${template.typography.body} · ${template.animations.label}</p>
</body>
</html>`;
}
