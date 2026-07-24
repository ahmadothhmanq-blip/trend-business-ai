/**
 * Global i18n locale registry — Hebrew (he / he-IL) is intentionally excluded.
 */

export const DEFAULT_LOCALE = "en" as const;

export type SupportedLocale =
  | "en"
  | "ar"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "nl"
  | "tr"
  | "zh-CN"
  | "zh-TW"
  | "ja"
  | "ko"
  | "ru"
  | "hi"
  | "id"
  | "vi"
  | "th"
  | "pl"
  | "sv"
  | "no"
  | "da"
  | "fi"
  | "el"
  | "cs"
  | "ro"
  | "uk"
  | "ms"
  | "bn"
  | "fa"
  | "ur";

export type LocaleDirection = "ltr" | "rtl";

export type LocaleDefinition = {
  code: SupportedLocale;
  name: string;
  nativeName: string;
  dir: LocaleDirection;
  /** BCP-47 for html lang */
  htmlLang: string;
  /** Human language name for AI prompts */
  aiLanguage: string;
};

/** RTL locales (Hebrew excluded). */
export const RTL_LOCALES = new Set<SupportedLocale>(["ar", "fa", "ur"]);

export const LOCALE_COOKIE = "tba_locale";
export const LOCALE_HEADER = "x-tba-locale";

export const SUPPORTED_LOCALES: readonly LocaleDefinition[] = [
  { code: "en", name: "English", nativeName: "English", dir: "ltr", htmlLang: "en", aiLanguage: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية", dir: "rtl", htmlLang: "ar", aiLanguage: "Arabic" },
  { code: "es", name: "Spanish", nativeName: "Español", dir: "ltr", htmlLang: "es", aiLanguage: "Spanish" },
  { code: "fr", name: "French", nativeName: "Français", dir: "ltr", htmlLang: "fr", aiLanguage: "French" },
  { code: "de", name: "German", nativeName: "Deutsch", dir: "ltr", htmlLang: "de", aiLanguage: "German" },
  { code: "it", name: "Italian", nativeName: "Italiano", dir: "ltr", htmlLang: "it", aiLanguage: "Italian" },
  { code: "pt", name: "Portuguese", nativeName: "Português", dir: "ltr", htmlLang: "pt", aiLanguage: "Portuguese" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", dir: "ltr", htmlLang: "nl", aiLanguage: "Dutch" },
  { code: "tr", name: "Turkish", nativeName: "Türkçe", dir: "ltr", htmlLang: "tr", aiLanguage: "Turkish" },
  { code: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", dir: "ltr", htmlLang: "zh-Hans", aiLanguage: "Simplified Chinese" },
  { code: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", dir: "ltr", htmlLang: "zh-Hant", aiLanguage: "Traditional Chinese" },
  { code: "ja", name: "Japanese", nativeName: "日本語", dir: "ltr", htmlLang: "ja", aiLanguage: "Japanese" },
  { code: "ko", name: "Korean", nativeName: "한국어", dir: "ltr", htmlLang: "ko", aiLanguage: "Korean" },
  { code: "ru", name: "Russian", nativeName: "Русский", dir: "ltr", htmlLang: "ru", aiLanguage: "Russian" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", dir: "ltr", htmlLang: "hi", aiLanguage: "Hindi" },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", dir: "ltr", htmlLang: "id", aiLanguage: "Indonesian" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", dir: "ltr", htmlLang: "vi", aiLanguage: "Vietnamese" },
  { code: "th", name: "Thai", nativeName: "ไทย", dir: "ltr", htmlLang: "th", aiLanguage: "Thai" },
  { code: "pl", name: "Polish", nativeName: "Polski", dir: "ltr", htmlLang: "pl", aiLanguage: "Polish" },
  { code: "sv", name: "Swedish", nativeName: "Svenska", dir: "ltr", htmlLang: "sv", aiLanguage: "Swedish" },
  { code: "no", name: "Norwegian", nativeName: "Norsk", dir: "ltr", htmlLang: "nb", aiLanguage: "Norwegian" },
  { code: "da", name: "Danish", nativeName: "Dansk", dir: "ltr", htmlLang: "da", aiLanguage: "Danish" },
  { code: "fi", name: "Finnish", nativeName: "Suomi", dir: "ltr", htmlLang: "fi", aiLanguage: "Finnish" },
  { code: "el", name: "Greek", nativeName: "Ελληνικά", dir: "ltr", htmlLang: "el", aiLanguage: "Greek" },
  { code: "cs", name: "Czech", nativeName: "Čeština", dir: "ltr", htmlLang: "cs", aiLanguage: "Czech" },
  { code: "ro", name: "Romanian", nativeName: "Română", dir: "ltr", htmlLang: "ro", aiLanguage: "Romanian" },
  { code: "uk", name: "Ukrainian", nativeName: "Українська", dir: "ltr", htmlLang: "uk", aiLanguage: "Ukrainian" },
  { code: "ms", name: "Malay", nativeName: "Bahasa Melayu", dir: "ltr", htmlLang: "ms", aiLanguage: "Malay" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা", dir: "ltr", htmlLang: "bn", aiLanguage: "Bengali" },
  { code: "fa", name: "Persian", nativeName: "فارسی", dir: "rtl", htmlLang: "fa", aiLanguage: "Persian" },
  { code: "ur", name: "Urdu", nativeName: "اردو", dir: "rtl", htmlLang: "ur", aiLanguage: "Urdu" },
] as const;

const LOCALE_SET = new Set<string>(SUPPORTED_LOCALES.map((l) => l.code));

const BROWSER_ALIASES: Record<string, SupportedLocale> = {
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  ar: "ar",
  "ar-sa": "ar",
  es: "es",
  "es-es": "es",
  "es-mx": "es",
  fr: "fr",
  "fr-fr": "fr",
  de: "de",
  "de-de": "de",
  it: "it",
  pt: "pt",
  "pt-br": "pt",
  "pt-pt": "pt",
  nl: "nl",
  tr: "tr",
  zh: "zh-CN",
  "zh-cn": "zh-CN",
  "zh-hans": "zh-CN",
  "zh-tw": "zh-TW",
  "zh-hant": "zh-TW",
  ja: "ja",
  ko: "ko",
  ru: "ru",
  hi: "hi",
  id: "id",
  vi: "vi",
  th: "th",
  pl: "pl",
  sv: "sv",
  no: "no",
  nb: "no",
  da: "da",
  fi: "fi",
  el: "el",
  cs: "cs",
  ro: "ro",
  uk: "uk",
  ms: "ms",
  bn: "bn",
  fa: "fa",
  ur: "ur",
};

export function isSupportedLocale(value: string | null | undefined): value is SupportedLocale {
  return Boolean(value && LOCALE_SET.has(value));
}

export function normalizeLocale(value: string | null | undefined): SupportedLocale {
  if (!value) return DEFAULT_LOCALE;
  const trimmed = value.trim();
  if (isSupportedLocale(trimmed)) return trimmed;
  const lower = trimmed.toLowerCase();
  if (lower === "he" || lower === "he-il" || lower.startsWith("he-")) return DEFAULT_LOCALE;
  if (BROWSER_ALIASES[lower]) return BROWSER_ALIASES[lower]!;
  const base = lower.split("-")[0]!;
  if (BROWSER_ALIASES[base]) return BROWSER_ALIASES[base]!;
  return DEFAULT_LOCALE;
}

export function getLocaleDefinition(locale: SupportedLocale): LocaleDefinition {
  return SUPPORTED_LOCALES.find((l) => l.code === locale) ?? SUPPORTED_LOCALES[0]!;
}

export function detectLocaleFromAcceptLanguage(header: string | null): SupportedLocale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header.split(",").map((p) => p.split(";")[0]?.trim().toLowerCase()).filter(Boolean);
  for (const part of parts) {
    const resolved = normalizeLocale(part);
    if (resolved !== DEFAULT_LOCALE || part.startsWith("en")) return resolved;
    if (isSupportedLocale(part)) return part;
  }
  for (const part of parts) {
    const resolved = normalizeLocale(part);
    if (resolved) return resolved;
  }
  return DEFAULT_LOCALE;
}
