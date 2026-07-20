/**
 * Brand guidelines export (PDF-ready markdown + ZIP manifest).
 */

import type { BrandIdentityModel } from "@/lib/ai-core/brand-studio/types";

export function buildBrandGuidelinesMarkdown(model: BrandIdentityModel): string {
  const lines = [
    `# ${model.brandName} Brand Guidelines`,
    "",
    `Generated: ${model.generatedAt}`,
    "",
    "## Positioning",
    model.positioning.statement,
    "",
    `**Tagline:** ${model.positioning.tagline || model.voice.tagline}`,
    "",
    "## Mission & Vision",
    `**Mission:** ${model.strategy.mission}`,
    `**Vision:** ${model.strategy.vision}`,
    "",
    "## Core Values",
    ...model.strategy.values.map((v) => `- ${v}`),
    "",
    "## Color Palette",
    ...model.colors.map((c) => `- **${c.name}** (${c.hex}) — ${c.role}: ${c.usage}`),
    "",
    "## Typography",
    `- Primary: ${model.typography.primary}`,
    `- Secondary: ${model.typography.secondary}`,
    `- Notes: ${model.typography.notes}`,
    "",
    "## Voice & Tone",
    `Tone: ${model.voice.tone}`,
    "",
    "### Do",
    ...model.voice.doExamples.map((e) => `- ${e}`),
    "",
    "### Don't",
    ...model.voice.dontExamples.map((e) => `- ${e}`),
    "",
    "## Logo Usage",
    model.logoDirection.guidelinesDocument || "See logo variants in brand kit.",
    "",
    "## Quality Score",
    `${model.qualityScore}/100`,
  ];
  return lines.join("\n");
}

export function buildExportManifest(model: BrandIdentityModel) {
  const guidelines = buildBrandGuidelinesMarkdown(model);
  const files = [
    { path: "brand-guidelines.md", content: guidelines, language: "markdown" },
    { path: "color-system.json", content: JSON.stringify(model.colors, null, 2), language: "json" },
    { path: "typography.json", content: JSON.stringify(model.typography, null, 2), language: "json" },
    { path: "tokens.json", content: JSON.stringify(model.tokens, null, 2), language: "json" },
    ...model.files,
    ...model.logoVariants
      .filter((v) => v.svg)
      .map((v) => ({
        path: `logos/${v.variant}-${v.name.replace(/\s+/g, "-").toLowerCase()}.svg`,
        content: v.svg!,
        language: "svg",
      })),
  ];
  return { guidelines, files };
}

/** Simple PDF-like export as structured HTML (print-to-PDF friendly). */
export function buildBrandGuidelinesHtml(model: BrandIdentityModel): string {
  const md = buildBrandGuidelinesMarkdown(model);
  const escaped = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${model.brandName} Brand Guidelines</title>
  <style>
    body { font-family: Georgia, serif; max-width: 720px; margin: 2rem auto; color: #111; line-height: 1.6; }
    h1 { color: ${model.tokens.primary}; border-bottom: 2px solid ${model.tokens.accent}; padding-bottom: 0.5rem; }
    h2 { color: ${model.tokens.secondary}; margin-top: 2rem; }
    li { margin: 0.25rem 0; }
  </style>
</head>
<body><p>${escaped}</p></body>
</html>`;
}
