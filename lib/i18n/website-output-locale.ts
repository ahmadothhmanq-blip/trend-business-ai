/**
 * Website output language → locale metadata (RTL, html lang, etc.).
 * Client-safe — used by dashboard i18n and Website Builder AI pipeline.
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
  italian: {
    language: "Italian",
    localeCode: "it",
    dir: "ltr",
    rtl: false,
    htmlLang: "it",
  },
  portuguese: {
    language: "Portuguese",
    localeCode: "pt",
    dir: "ltr",
    rtl: false,
    htmlLang: "pt",
  },
  persian: {
    language: "Persian",
    localeCode: "fa",
    dir: "rtl",
    rtl: true,
    htmlLang: "fa",
  },
  urdu: {
    language: "Urdu",
    localeCode: "ur",
    dir: "rtl",
    rtl: true,
    htmlLang: "ur",
  },
};

export function resolveLocaleFromLanguage(
  language?: string | null,
): SiteLocaleConfig {
  const key = (language || "English").toLowerCase().trim();
  if (LANGUAGE_MAP[key]) return { ...LANGUAGE_MAP[key]! };
  if (key.includes("arab")) return { ...LANGUAGE_MAP.arabic! };
  if (key.includes("persian") || key.includes("farsi"))
    return { ...LANGUAGE_MAP.persian! };
  if (key.includes("urdu")) return { ...LANGUAGE_MAP.urdu! };
  if (key.includes("italian") || key === "it" || key.startsWith("it-")) {
    return { ...LANGUAGE_MAP.italian! };
  }
  if (key.includes("portug") || key === "pt" || key.startsWith("pt-")) {
    return { ...LANGUAGE_MAP.portuguese! };
  }
  if (key.includes("rtl")) return { ...LANGUAGE_MAP.arabic! };
  return { ...LANGUAGE_MAP.english! };
}

/** True only for explicit English — all other languages use LLM-native copy. */
export function isEnglishWebsiteLanguage(language?: string | null): boolean {
  const key = (language || "english").toLowerCase().trim();
  if (!key || key === "en" || key === "english" || key.startsWith("en-")) {
    return true;
  }
  return false;
}

/** When true, the LLM must author all visible UI copy in the selected language. */
export function usesLlmLocalizedWebsiteCopy(language?: string | null): boolean {
  return !isEnglishWebsiteLanguage(language);
}
