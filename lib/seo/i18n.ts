import type { MetadataRoute } from "next";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  absoluteUrl,
  type SupportedLocaleCode,
} from "@/lib/seo/site";
import { loadMessages } from "@/lib/i18n/load-messages";
import { getNestedMessage } from "@/lib/i18n/messages";
import type { SupportedLocale } from "@/lib/i18n/config";

/**
 * International SEO — hreflang + locale-aware metadata helpers.
 */
export function getDefaultLocale(): SupportedLocaleCode {
  return DEFAULT_LOCALE;
}

export function isSupportedLocale(code: string): code is SupportedLocaleCode {
  return SUPPORTED_LOCALES.some((locale) => locale.code === code);
}

export function localizePath(
  path: string,
  locale: SupportedLocaleCode = DEFAULT_LOCALE,
): string {
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

function seoMessage(
  locale: SupportedLocaleCode,
  key: string,
  fallback: string,
): string {
  try {
    const messages = loadMessages(locale as SupportedLocale);
    const value = getNestedMessage(messages, key);
    return typeof value === "string" && value.trim() ? value : fallback;
  } catch {
    return fallback;
  }
}

export function localeAwareTitle(
  title: string,
  locale: SupportedLocaleCode = DEFAULT_LOCALE,
  titleKey?: string,
) {
  if (titleKey) {
    return seoMessage(locale, titleKey, title);
  }
  return title;
}

export function localeAwareDescription(
  description: string,
  locale: SupportedLocaleCode = DEFAULT_LOCALE,
  descriptionKey?: string,
) {
  if (descriptionKey) {
    return seoMessage(locale, descriptionKey, description);
  }
  return description;
}

/** Expand sitemap entries with locale-prefixed URLs for non-default locales. */
export function expandSitemapLocales(
  entries: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const expanded: MetadataRoute.Sitemap = [];
  for (const entry of entries) {
    expanded.push(entry);
    const path = entry.url.replace(/^https?:\/\/[^/]+/, "");
    for (const locale of SUPPORTED_LOCALES) {
      if (locale.code === DEFAULT_LOCALE) continue;
      const localized = localizePath(path, locale.code);
      expanded.push({
        ...entry,
        url: absoluteUrl(localized),
        priority: Math.max(0.1, (entry.priority ?? 0.5) * 0.85),
      });
    }
  }
  return expanded;
}
