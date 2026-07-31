import { resolveLocaleFromLanguage } from "@/lib/ai-core/website-design-platform/i18n";
import type { StaticPreviewInput } from "@/lib/website/preview-input";
import { composeThemePreviewPageBody } from "@/lib/website/theme-preview/compose-page";
import {
  buildThemePreviewContent,
  resolveThemePreviewContext,
} from "@/lib/website/theme-preview/resolve";
import { buildThemePreviewStyles, buildThemeRtlStyles } from "@/lib/website/theme-preview/styles";
import { escapeHtml } from "@/lib/website/theme-preview/utils";

function previewFiles(input: StaticPreviewInput) {
  return input.files?.map((file) => ({
    path: file.path,
    content: file.content,
  }));
}

export function renderThemePreviewHomeBody(
  input: StaticPreviewInput,
): string | null {
  const previewCtx = resolveThemePreviewContext(input);
  if (!previewCtx) return null;
  const content = buildThemePreviewContent(input);
  return composeThemePreviewPageBody(previewCtx, content, previewFiles(input));
}

export function buildThemePreviewDocument(
  input: StaticPreviewInput,
  options?: {
    defaultSlug?: string;
    secondaryPagesHtml?: string;
    titleSuffix?: string;
  },
): string | null {
  const previewCtx = resolveThemePreviewContext(input);
  if (!previewCtx) return null;

  const locale = resolveLocaleFromLanguage(input.language);
  const content = buildThemePreviewContent(input);
  const homeBody = composeThemePreviewPageBody(
    previewCtx,
    content,
    previewFiles(input),
  );
  const title = escapeHtml(content.title);
  const defaultSlug = options?.defaultSlug || "home";
  const themeAttr = ` data-theme="${escapeHtml(previewCtx.themeId)}" data-ti-template="${escapeHtml(previewCtx.templateIntelligenceId || previewCtx.themeId)}"`;
  const htmlDir = locale.rtl ? ` dir="rtl"` : "";
  const htmlLang = escapeHtml(locale.htmlLang);
  const styles = buildThemePreviewStyles(previewCtx);
  const rtlStyles = buildThemeRtlStyles(
    locale.rtl,
    previewCtx.typography.body,
    locale.fontHint,
  );
  const tailwindScript = buildTailwindPreviewScript(previewCtx);

  return `<!DOCTYPE html>
<html lang="${htmlLang}"${htmlDir}${themeAttr} data-ti-render="v5">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} — ${escapeHtml(options?.titleSuffix || "Live Preview")}</title>
  <style>${styles}${rtlStyles}
    body:not(:has(.page:target)) .page#${escapeHtml(defaultSlug)} { display: block; }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>${tailwindScript}</script>
</head>
<body>
  <div class="page" id="${escapeHtml(defaultSlug)}">
    ${homeBody}
  </div>
  ${options?.secondaryPagesHtml || ""}
</body>
</html>`;
}

function buildTailwindPreviewScript(
  ctx: ReturnType<typeof resolveThemePreviewContext>,
): string {
  if (!ctx) return "";
  const display = JSON.stringify(ctx.typography.display);
  const heading = JSON.stringify(ctx.typography.heading);
  const body = JSON.stringify(ctx.typography.body);
  return `
tailwind.config = {
  theme: {
    extend: {
      fontFamily: {
        display: [${display}, "Georgia", "serif"],
        heading: [${heading}, "Georgia", "serif"],
        body: [${body}, "system-ui", "sans-serif"],
      },
    },
  },
};
`;
}
