/**
 * Phase 9 — Multi-language + RTL support for Website Builder.
 */

export type SiteLocaleConfig = {
  language: string;
  localeCode: string;
  dir: "ltr" | "rtl";
  rtl: boolean;
  htmlLang: string;
  fontHint?: string;
};

const LANGUAGE_MAP: Record<string, SiteLocaleConfig> = {
  english: {
    language: "English",
    localeCode: "en",
    dir: "ltr",
    rtl: false,
    htmlLang: "en",
  },
  arabic: {
    language: "Arabic",
    localeCode: "ar",
    dir: "rtl",
    rtl: true,
    htmlLang: "ar",
    fontHint: "Noto Naskh Arabic, Tajawal, system-ui",
  },
  bilingual: {
    language: "Bilingual",
    localeCode: "en",
    dir: "ltr",
    rtl: false,
    htmlLang: "en",
  },
  spanish: {
    language: "Spanish",
    localeCode: "es",
    dir: "ltr",
    rtl: false,
    htmlLang: "es",
  },
  french: {
    language: "French",
    localeCode: "fr",
    dir: "ltr",
    rtl: false,
    htmlLang: "fr",
  },
  german: {
    language: "German",
    localeCode: "de",
    dir: "ltr",
    rtl: false,
    htmlLang: "de",
  },
  portuguese: {
    language: "Portuguese",
    localeCode: "pt",
    dir: "ltr",
    rtl: false,
    htmlLang: "pt",
  },
  hebrew: {
    language: "Hebrew",
    localeCode: "he",
    dir: "rtl",
    rtl: true,
    htmlLang: "he",
    fontHint: "Noto Sans Hebrew, system-ui",
  },
};

export function resolveLocaleFromLanguage(
  language?: string | null,
): SiteLocaleConfig {
  const key = (language || "English").toLowerCase().trim();
  if (LANGUAGE_MAP[key]) return { ...LANGUAGE_MAP[key]! };
  if (key.includes("arab")) return { ...LANGUAGE_MAP.arabic! };
  if (key.includes("hebr") || key.includes("rtl"))
    return { ...LANGUAGE_MAP.hebrew! };
  return { ...LANGUAGE_MAP.english! };
}

import type { GeneratedProjectFile } from "@/lib/ai/types";

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

/* Design Platform RTL */
html[dir="rtl"] {
  direction: rtl;
  text-align: right;
}
html[dir="rtl"] body {
  font-family: ${locale.fontHint || "system-ui"}, var(--font-body, system-ui);
}
html[dir="rtl"] .site-nav,
html[dir="rtl"] header nav {
  flex-direction: row-reverse;
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
