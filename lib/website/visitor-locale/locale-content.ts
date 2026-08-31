import { resolveLocaleFromLanguage } from "@/lib/i18n/website-output-locale";
import {
  buildPublishedLanguageSwitcherHtml,
  injectLanguageSwitcherIntoHtml,
} from "@/lib/website/growth/language-switcher";
import {
  applyHtmlDirAttribute,
  applyHtmlLangAttribute,
} from "@/lib/website/public-site";
import type { VisitorLocaleConfig } from "@/lib/website/site-plan/visitor-locales";
import {
  translateVisiblePhrases,
} from "@/lib/website/visitor-locale/phrase-dictionary";
import { translateHtmlForLanguage } from "@/lib/website/visitor-locale/llm-translate";
import { PRIMARY_SITE_LANGUAGE } from "@/lib/language-platform/generation/options";

function replaceLanguageSwitcher(
  html: string,
  switcherHtml: string,
): string {
  const withoutSwitcher = html.replace(
    /<!-- tb-language-switcher -->[\s\S]*?<\/nav>\s*/i,
    "",
  );
  return injectLanguageSwitcherIntoHtml(withoutSwitcher, switcherHtml);
}

export function localizeHtmlForVisitorLocale(params: {
  html: string;
  targetLanguage: string;
  localeCode: string;
  publicBaseUrl: string;
  config: VisitorLocaleConfig;
  /** When false, only lang/dir/switcher — for LLM translation pass. */
  usePhraseTranslation?: boolean;
}): string {
  const localeMeta = resolveLocaleFromLanguage(params.targetLanguage);
  const isContentLocale =
    params.config.contentLocale === params.targetLanguage;
  const usePhrases = params.usePhraseTranslation !== false;

  let localized = params.html;
  localized = applyHtmlLangAttribute(localized, params.localeCode);
  localized = applyHtmlDirAttribute(localized, localeMeta.dir);

  if (usePhrases && !isContentLocale) {
    localized = translateVisiblePhrases(localized, params.targetLanguage);
  }

  const switcher = buildPublishedLanguageSwitcherHtml({
    publicBaseUrl: params.publicBaseUrl.replace(/\/$/, ""),
    config: params.config,
    currentLocale: params.localeCode,
  });
  localized = replaceLanguageSwitcher(localized, switcher);

  const marker = `<!-- tb-locale:${params.localeCode} -->`;
  if (!localized.includes(marker)) {
    localized = localized.replace(
      /<body([^>]*)>/i,
      `<body$1>\n${marker}`,
    );
  }

  return localized;
}

/** Build per-locale HTML variants for alternate visitor routes. */
export function buildVisitorLocaleHtmlVariants(params: {
  primaryHtml: string;
  config: VisitorLocaleConfig;
  publicBaseUrl: string;
}): Record<string, string> {
  if (!params.config.enabled) return {};

  const variants: Record<string, string> = {};
  for (const language of params.config.alternates) {
    const localeCode = resolveLocaleFromLanguage(language).htmlLang.slice(0, 2);
    if (!localeCode || localeCode === "en") continue;
    variants[localeCode] = localizeHtmlForVisitorLocale({
      html: params.primaryHtml,
      targetLanguage: language,
      localeCode,
      publicBaseUrl: params.publicBaseUrl,
      config: params.config,
    });
  }
  return variants;
}

/** Async variant — LLM translation when provider configured, else phrase dictionary. */
export async function buildVisitorLocaleHtmlVariantsAsync(params: {
  primaryHtml: string;
  config: VisitorLocaleConfig;
  publicBaseUrl: string;
  sourceLanguage?: string;
}): Promise<Record<string, string>> {
  if (!params.config.enabled) return {};

  const source =
    params.sourceLanguage ??
    params.config.contentLocale ??
    PRIMARY_SITE_LANGUAGE;

  const variants: Record<string, string> = {};
  for (const language of params.config.alternates) {
    const localeCode = resolveLocaleFromLanguage(language).htmlLang.slice(0, 2);
    if (!localeCode || localeCode === "en") continue;

    const shell = localizeHtmlForVisitorLocale({
      html: params.primaryHtml,
      targetLanguage: language,
      localeCode,
      publicBaseUrl: params.publicBaseUrl,
      config: params.config,
      usePhraseTranslation: language === params.config.contentLocale,
    });

    variants[localeCode] =
      language === params.config.contentLocale
        ? shell
        : await translateHtmlForLanguage({
            html: shell,
            targetLanguage: language,
            sourceLanguage: source,
          });
  }
  return variants;
}
