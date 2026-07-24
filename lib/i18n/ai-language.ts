import {
  DEFAULT_LOCALE,
  getLocaleDefinition,
  normalizeLocale,
  type SupportedLocale,
} from "@/lib/i18n/config";

/** Map UI locale to human language name for AI generation prompts. */
export function resolveAiLanguageFromLocale(
  locale?: string | null,
): string {
  const normalized = normalizeLocale(locale);
  return getLocaleDefinition(normalized).aiLanguage;
}

/** Resolve language for AI when request may pass locale or language. */
export function resolveAiLanguage(input?: {
  locale?: string | null;
  language?: string | null;
}): string {
  if (input?.language?.trim()) {
    const lang = input.language.trim();
    const asLocale = normalizeLocale(lang);
    if (asLocale !== DEFAULT_LOCALE || lang.toLowerCase().startsWith("en")) {
      return getLocaleDefinition(asLocale).aiLanguage;
    }
    return lang;
  }
  return resolveAiLanguageFromLocale(input?.locale);
}

export function resolveAiLocaleCode(locale?: string | null): SupportedLocale {
  return normalizeLocale(locale);
}
