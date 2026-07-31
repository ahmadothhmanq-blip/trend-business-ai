import { renderWbTemplate } from "@/lib/website/template-engine/renderer";
import type {
  WbTemplatePackage,
  WbTemplatePreviewDocument,
  WbTemplateRenderContext,
} from "@/lib/website/template-engine/types";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

/**
 * Builds a standalone HTML preview document for a template package.
 */
export function buildWbTemplatePreviewDocument(
  pkg: WbTemplatePackage,
  context: WbTemplateRenderContext = {},
): WbTemplatePreviewDocument {
  const rendered = renderWbTemplate(pkg, context);
  const manifest = pkg.manifest;
  const locale = context.locale ?? "en";
  const dir = context.rtl ? ' dir="rtl"' : "";
  const title = escapeHtml(context.brandName ?? manifest.name);

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(locale)}"${dir} data-wb-template-engine="1" data-template-id="${escapeHtml(manifest.id)}" data-template-version="${escapeHtml(manifest.version)}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} · Template Preview</title>
  <style>${rendered.styleCss}</style>
</head>
<body>
${rendered.bodyHtml}
</body>
</html>`;

  return {
    html,
    templateId: manifest.id,
    version: manifest.version,
    pageId: rendered.meta.pageId,
  };
}

export function buildWbTemplateEmptyPreviewDocument(): WbTemplatePreviewDocument {
  const html = `<!DOCTYPE html>
<html lang="en" data-wb-template-engine="1" data-template-installed="false">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Website Builder · No Template Installed</title>
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: grid;
      place-items: center;
      background: #0b0b0f;
      color: #f5f5f7;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    .wb-tpl-empty {
      text-align: center;
      padding: 2rem;
      border: 1px dashed rgba(255,255,255,0.12);
      border-radius: 16px;
      max-width: 28rem;
    }
    .wb-tpl-empty h1 {
      margin: 0 0 0.5rem;
      font-size: 1.25rem;
    }
    .wb-tpl-empty p {
      margin: 0;
      color: rgba(245,245,247,0.55);
      font-size: 0.95rem;
    }
  </style>
</head>
<body>
  <div class="wb-tpl-empty">
    <h1>No templates installed yet</h1>
    <p>Install a website template package to preview its architecture.</p>
  </div>
</body>
</html>`;

  return {
    html,
    templateId: "",
    version: "0.0.0",
    pageId: "home",
  };
}
