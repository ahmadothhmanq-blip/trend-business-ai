import {
  getLocaleDefinition,
  normalizeLocale,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";

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
    if (lang.toLowerCase() === "bilingual") return "Bilingual";
    const fromName = resolveLocaleFromLanguage(lang);
    if (fromName.language !== "English" || /^en/i.test(lang)) {
      return fromName.language;
    }
    return lang;
  }
  if (input?.locale?.trim()) {
    return resolveLocaleFromLanguage(input.locale).language;
  }
  return resolveAiLanguageFromLocale(input?.locale);
}

export function resolveAiLocaleCode(locale?: string | null): SupportedLocale {
  return normalizeLocale(locale);
}
