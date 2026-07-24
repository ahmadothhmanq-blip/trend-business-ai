import type { TemplateIntelligenceDefinition } from "@/lib/ai-core/template-intelligence/types";
import { resolveTemplateVisualPreset } from "@/lib/ai-core/template-intelligence/visual-preset";

/**
 * Lightweight structural preview for Template Intelligence chooser.
 */
export function buildTemplateIntelligencePreviewHtml(
  template: TemplateIntelligenceDefinition,
): string {
  const c = template.colors;
  const preset = resolveTemplateVisualPreset(template);
  const sections = template.components
    .filter((id) => !/Header|Footer|Nav/i.test(id))
    .slice(0, 5);

  const headerBg =
    preset.chrome.headerVariant === "transparent"
      ? "transparent"
      : preset.chrome.headerVariant === "minimal"
        ? c.background
        : c.surface;
  const btnBg =
    preset.buttons.primary === "ghost" || preset.buttons.primary === "outline"
      ? "transparent"
      : c.accent;
  const btnColor =
    preset.buttons.primary === "ghost" || preset.buttons.primary === "outline"
      ? c.accent
      : "#0a0a0a";
  const btnBorder =
    preset.buttons.primary === "outline" || preset.buttons.primary === "ghost"
      ? `2px solid ${c.accent}`
      : "none";
  const gridCols =
    preset.layout.sectionLayout === "editorial"
      ? "1fr"
      : preset.layout.sectionLayout === "asymmetric"
        ? "1.2fr 0.8fr"
        : preset.layout.sectionLayout === "bento"
          ? "repeat(3, minmax(0, 1fr))"
          : "repeat(2, minmax(0, 1fr))";
  const cardRadius =
    preset.layout.cardsStyle === "borderless"
      ? "0"
      : preset.layout.cardsStyle === "glass"
        ? "1rem"
        : "14px";
  const cardShadow =
    preset.layout.cardsStyle === "soft-shadow"
      ? `0 16px 32px color-mix(in srgb, ${c.primary} 20%, transparent)`
      : "none";

  return `<!DOCTYPE html>
<html lang="en" data-ti-template="${template.id}">
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
    --section-y: ${preset.spacing.sectionYMobile};
    --container-max: ${preset.spacing.containerMax};
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: "${template.typography.body}", system-ui, sans-serif;
    background: var(--bg);
    color: var(--fg);
  }
  .site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: ${headerBg};
    border-bottom: 1px solid color-mix(in srgb, var(--fg) 10%, transparent);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .site-header span { color: var(--accent); }
  .hero {
    min-height: 200px;
    padding: var(--section-y) 24px 28px;
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
    border-radius: ${preset.buttons.radius};
    background: ${btnBg};
    color: ${btnColor};
    border: ${btnBorder};
    font-size: ${preset.buttons.uppercase ? "10px" : "12px"};
    font-weight: ${preset.buttons.weight};
    letter-spacing: ${preset.buttons.uppercase ? "0.12em" : "0"};
    text-transform: ${preset.buttons.uppercase ? "uppercase" : "none"};
    text-decoration: none;
  }
  .grid {
    display: grid;
    gap: 10px;
    padding: 16px;
    grid-template-columns: ${gridCols};
    max-width: var(--container-max);
    margin-inline: auto;
  }
  .card {
    border: 1px solid color-mix(in srgb, var(--fg) 12%, transparent);
    background: var(--surface);
    border-radius: ${cardRadius};
    box-shadow: ${cardShadow};
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
  .site-footer {
    padding: 12px 16px 16px;
    font-size: 10px;
    opacity: 0.45;
    border-top: 1px solid color-mix(in srgb, var(--accent) 15%, transparent);
    text-align: ${preset.chrome.footerVariant === "editorial" ? "center" : "left"};
  }
</style>
</head>
<body>
  <header class="site-header">
    <span>${preset.chrome.headerComponent}</span>
    <span>${preset.chrome.navStyle} nav</span>
  </header>
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
          `<article class="card"><strong>${id}</strong><span>${preset.layout.sectionLayout} · ${preset.layout.cardsStyle}</span></article>`,
      )
      .join("")}
  </div>
  <p class="meta">${template.typography.display} / ${template.typography.body} · ${template.animations.label}</p>
  <footer class="site-footer">${preset.chrome.footerComponent} · ${preset.chrome.footerVariant}</footer>
</body>
</html>`;
}
