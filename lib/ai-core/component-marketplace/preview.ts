/**
 * Lightweight preview HTML for marketplace component cards / drag ghost.
 */

import type { MarketplaceComponent } from "@/lib/ai-core/component-marketplace/types";

export function buildComponentPreviewHtml(component: MarketplaceComponent): string {
  return `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { margin:0; font-family: system-ui, sans-serif; background:#0a0a0a; color:#f5f5f5; }
  .frame { min-height: 180px; padding: 1.25rem; background: ${component.previewGradient}; }
  .label { font-size: 0.65rem; letter-spacing: 0.14em; text-transform: uppercase; opacity: 0.7; }
  h1 { margin: 0.5rem 0 0; font-size: 1.35rem; letter-spacing: -0.02em; max-width: 14ch; }
  p { margin: 0.5rem 0 0; font-size: 0.8rem; opacity: 0.75; max-width: 36ch; }
  .meta { margin-top: 1rem; display:flex; gap:0.4rem; flex-wrap:wrap; }
  .chip { font-size: 0.65rem; padding: 0.2rem 0.5rem; border-radius: 999px; background: rgba(0,0,0,0.35); }
</style></head>
<body>
  <div class="frame">
    <div class="label">${escape(component.category)} · ${escape(component.styleVariant)}</div>
    <h1>${escape(component.name)}</h1>
    <p>${escape(component.previewLabel)}</p>
    <div class="meta">
      ${component.industries
        .slice(0, 3)
        .map((i) => `<span class="chip">${escape(i)}</span>`)
        .join("")}
      <span class="chip">responsive</span>
    </div>
  </div>
</body></html>`;
}

function escape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
