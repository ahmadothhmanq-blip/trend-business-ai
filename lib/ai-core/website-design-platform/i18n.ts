/**
 * Phase 9 — Multi-language + RTL support for Website Builder.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  resolveLocaleFromLanguage,
  type SiteLocaleConfig,
} from "@/lib/i18n/website-output-locale";

export type { SiteLocaleConfig } from "@/lib/i18n/website-output-locale";
export { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";

/**
 * Inject dir/lang attributes and RTL CSS tokens into generated site files.
 * Preserves design tokens — only adds locale consistency.
 */
export function applyLocaleToWebsiteFiles(
  files: GeneratedProjectFile[],
  locale: SiteLocaleConfig,
): GeneratedProjectFile[] {
  return files.map((file) => {
    let content = file.content;
    if (file.path.endsWith("layout.tsx") || file.path.endsWith("layout.jsx")) {
      if (/<html[\s>]/.test(content)) {
        content = content.replace(
          /<html([^>]*)>/,
          `<html$1 lang="${locale.htmlLang}" dir="${locale.dir}">`,
        );
        content = content.replace(/lang="[^"]*"\s+lang="/, `lang="`);
      } else if (/htmlLang|lang:\s*["']/.test(content) === false) {
        content = content.replace(
          /return\s*\(\s*<html([^>]*)>/,
          `return (\n    <html$1 lang="${locale.htmlLang}" dir="${locale.dir}">`,
        );
      }
    }

    if (
      locale.rtl &&
      (file.path.endsWith("globals.css") || file.path.includes("globals.css"))
    ) {
      if (!content.includes("/* Design Platform RTL */")) {
        content += `

/* Design Platform RTL + Arabic typography */
html[dir="rtl"] {
  direction: rtl;
}
html[dir="rtl"] body {
  text-align: start;
  font-family: var(--font-body, ${locale.fontHint || "Noto Sans Arabic, system-ui"});
  line-height: 1.75;
  letter-spacing: 0.01em;
}
html[dir="rtl"] h1,
html[dir="rtl"] h2,
html[dir="rtl"] h3 {
  line-height: 1.3;
  letter-spacing: 0;
  text-wrap: pretty;
}
html[dir="rtl"] p,
html[dir="rtl"] .df-body,
html[dir="rtl"] .df-prose {
  line-height: 1.85;
}
html[dir="rtl"] button,
html[dir="rtl"] input,
html[dir="rtl"] textarea {
  text-align: start;
}
`;
      }
    }

    return { ...file, content };
  });
}

export function buildTranslationBrief(params: {
  sourceLanguage: string;
  targetLanguage: string;
  preserveDesign?: boolean;
}): string {
  return [
    `[i18n] Translate all user-facing website copy from ${params.sourceLanguage} to ${params.targetLanguage}.`,
    "Keep brand names, product names, and URLs unchanged.",
    params.preserveDesign !== false
      ? "Do not change layout, colors, components, spacing, or visual design — copy only."
      : "",
    resolveLocaleFromLanguage(params.targetLanguage).rtl
      ? "Ensure RTL direction, mirrored navigation, and Arabic/Hebrew-friendly typography."
      : "Keep LTR layout.",
  ]
    .filter(Boolean)
    .join(" ");
}
