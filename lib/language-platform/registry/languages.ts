import {
  getLocaleDefinition,
  normalizeLocale,
  SUPPORTED_LOCALES,
  type LocaleDefinition,
  type SupportedLocale,
} from "@/lib/i18n/config";
import type { GlsTypographyScriptFamily } from "@/lib/language-platform/core/types";

export type GlsWorldLanguage = LocaleDefinition & {
  scriptFamily: GlsTypographyScriptFamily;
  /** ISO 4217 default currency for locale-aware formatting. */
  defaultCurrency: string;
};

const SCRIPT_FAMILY_BY_LOCALE: Record<SupportedLocale, GlsTypographyScriptFamily> = {
  en: "latin",
  ar: "arabic",
  es: "latin",
  fr: "latin",
  de: "latin",
  it: "latin",
  pt: "latin",
  nl: "latin",
  tr: "latin",
  "zh-CN": "cjk",
  "zh-TW": "cjk",
  ja: "cjk",
  ko: "cjk",
  ru: "cyrillic",
  hi: "indic",
  id: "latin",
  vi: "vietnamese",
  th: "thai",
  pl: "latin",
  sv: "latin",
  no: "latin",
  da: "latin",
  fi: "latin",
  el: "greek",
  cs: "latin",
  ro: "latin",
  uk: "cyrillic",
  ms: "latin",
  bn: "indic",
  fa: "arabic",
  ur: "arabic",
};

const DEFAULT_CURRENCY_BY_LOCALE: Record<SupportedLocale, string> = {
  en: "USD",
  ar: "SAR",
  es: "EUR",
  fr: "EUR",
  de: "EUR",
  it: "EUR",
  pt: "EUR",
  nl: "EUR",
  tr: "TRY",
  "zh-CN": "CNY",
  "zh-TW": "TWD",
  ja: "JPY",
  ko: "KRW",
  ru: "RUB",
  hi: "INR",
  id: "IDR",
  vi: "VND",
  th: "THB",
  pl: "PLN",
  sv: "SEK",
  no: "NOK",
  da: "DKK",
  fi: "EUR",
  el: "EUR",
  cs: "CZK",
  ro: "RON",
  uk: "UAH",
  ms: "MYR",
  bn: "BDT",
  fa: "IRR",
  ur: "PKR",
};

/** Official GLS world language registry — extends platform i18n locales. */
export function getGlsWorldLanguageRegistry(): GlsWorldLanguage[] {
  return SUPPORTED_LOCALES.map((def) => ({
    ...def,
    scriptFamily: SCRIPT_FAMILY_BY_LOCALE[def.code],
    defaultCurrency: DEFAULT_CURRENCY_BY_LOCALE[def.code],
  }));
}

export function resolveGlsWorldLanguage(
  localeOrLanguage?: string | null,
): GlsWorldLanguage {
  const normalized = normalizeLocale(localeOrLanguage ?? "en");
  const def = getLocaleDefinition(normalized);
  return {
    ...def,
    scriptFamily: SCRIPT_FAMILY_BY_LOCALE[normalized],
    defaultCurrency: DEFAULT_CURRENCY_BY_LOCALE[normalized],
  };
}

export function resolveScriptFamilyFromLocale(
  localeCode: string,
): GlsTypographyScriptFamily {
  const lang = resolveGlsWorldLanguage(localeCode);
  return lang.scriptFamily;
}
