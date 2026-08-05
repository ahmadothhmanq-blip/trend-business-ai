import {
  resolveLocaleFromLanguage,
  usesLlmLocalizedWebsiteCopy,
  type SiteLocaleConfig,
} from "@/lib/i18n/website-output-locale";
import type { GlsLanguageContext } from "@/lib/language-platform/core/types";
import { getGlsWorldLanguageRegistry } from "@/lib/language-platform/registry/languages";

function matchGlsWorldLanguage(language?: string | null) {
  const key = (language ?? "").toLowerCase().trim();
  if (!key) return null;

  const registry = getGlsWorldLanguageRegistry();

  const byCode = registry.find((lang) => lang.code.toLowerCase() === key);
  if (byCode) return byCode;

  const byName = registry.find(
    (lang) =>
      lang.aiLanguage.toLowerCase() === key ||
      lang.name.toLowerCase() === key ||
      lang.nativeName.toLowerCase() === key,
  );
  if (byName) return byName;

  const byLocalePrefix = registry.find(
    (lang) =>
      key.startsWith(`${lang.code.toLowerCase()}-`) ||
      key.startsWith(`${lang.htmlLang.toLowerCase()}-`),
  );
  if (byLocalePrefix) return byLocalePrefix;

  return (
    registry.find((lang) => {
      const name = lang.name.toLowerCase();
      const aiLanguage = lang.aiLanguage.toLowerCase();
      return (
        (name.length > 3 && (key.includes(name) || name.includes(key))) ||
        (aiLanguage.length > 3 && (key.includes(aiLanguage) || aiLanguage.includes(key)))
      );
    }) ?? null
  );
}

/** Resolve website locale — GLS registry first, then legacy website-output-locale. */
export function resolveGlsWebsiteLocale(language?: string | null): SiteLocaleConfig {
  const gls = matchGlsWorldLanguage(language);
  if (gls) {
    return {
      language: gls.aiLanguage,
      localeCode: gls.code,
      dir: gls.dir,
      rtl: gls.dir === "rtl",
      htmlLang: gls.htmlLang,
    };
  }
  return resolveLocaleFromLanguage(language);
}

/** Bridge to website output locale — generation pipeline compatibility. */
export function bridgeWebsiteLocale(language?: string | null) {
  return resolveGlsWebsiteLocale(language);
}

export function enrichWebsiteContext(ctx: GlsLanguageContext) {
  const site = bridgeWebsiteLocale(ctx.website.language);
  return {
    ...ctx,
    website: {
      ...ctx.website,
      localeCode: site.localeCode,
      htmlLang: site.htmlLang,
      direction: site.dir,
      rtl: site.rtl,
    },
    content: {
      ...ctx.content,
      usesLlmLocalization: usesLlmLocalizedWebsiteCopy(ctx.website.language),
    },
  };
}
