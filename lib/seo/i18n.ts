import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  absoluteUrl,
  type SupportedLocaleCode,
} from "@/lib/seo/site";

/**
 * International SEO foundation — hreflang + locale-aware helpers.
 * Ready for future locale segments (/ar, /es) without generating empty pages.
 */
export function getDefaultLocale(): SupportedLocaleCode {
  return DEFAULT_LOCALE;
}

export function isSupportedLocale(code: string): code is SupportedLocaleCode {
  return SUPPORTED_LOCALES.some((locale) => locale.code === code);
}

export function localizePath(path: string, locale: SupportedLocaleCode = DEFAULT_LOCALE): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === "/") return `/${locale}`;
  return `/${locale}${normalized}`;
}

/** Next.js Metadata `alternates.languages` map including x-default. */
export function buildHreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    languages[locale.hreflang] = absoluteUrl(localizePath(path, locale.code));
  }

  languages["x-default"] = absoluteUrl(localizePath(path, DEFAULT_LOCALE));
  return languages;
}

export function localeAwareTitle(title: string, _locale: SupportedLocaleCode = DEFAULT_LOCALE) {
  void _locale;
  // Placeholder for future translation catalogs — keep English identity today.
  return title;
}

export function localeAwareDescription(
  description: string,
  _locale: SupportedLocaleCode = DEFAULT_LOCALE,
) {
  void _locale;
  return description;
}
