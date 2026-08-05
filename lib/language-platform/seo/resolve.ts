import type { GlsSeoLocalization, GlsLocalizedSlugStrategy } from "@/lib/language-platform/core/types";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";

export type GlsSeoResolveInput = {
  localeCode: string;
  htmlLang: string;
  slugStrategy?: GlsLocalizedSlugStrategy;
};

/** SEO localization — hreflang, slugs, sitemap, schema.org. */
export function resolveSeoLocalization(input: GlsSeoResolveInput): GlsSeoLocalization {
  const hreflang = input.htmlLang;
  const alternateLocales = SUPPORTED_LOCALES.map((l) => l.htmlLang).filter(
    (h) => h !== hreflang,
  );

  return {
    hreflang,
    alternateLocales: alternateLocales.slice(0, 10),
    localizedSlugStrategy: input.slugStrategy ?? "latin",
    schemaOrgLanguage: input.htmlLang,
    sitemapLocalePrefix: `/${input.localeCode}`,
  };
}

export function buildHreflangAlternates(
  baseUrl: string,
  paths: Record<string, string>,
): Array<{ hreflang: string; href: string }> {
  return Object.entries(paths).map(([hreflang, path]) => ({
    hreflang,
    href: `${baseUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`,
  }));
}
