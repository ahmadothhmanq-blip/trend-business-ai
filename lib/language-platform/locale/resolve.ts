import type { GlsLocaleFormatting } from "@/lib/language-platform/core/types";
import { resolveGlsWorldLanguage } from "@/lib/language-platform/registry/languages";

export type GlsLocaleResolveOptions = {
  localeCode?: string;
  timezone?: string;
  currencyCode?: string;
  calendar?: GlsLocaleFormatting["calendar"];
};

/** Locale engine — numbers, dates, currencies, units, timezone, calendars, pluralization. */
export function resolveLocaleFormatting(
  localeCode: string,
  options: GlsLocaleResolveOptions = {},
): GlsLocaleFormatting {
  const world = resolveGlsWorldLanguage(localeCode);
  const htmlLang = world.htmlLang;
  const numberLocale = htmlLang;
  const dateLocale = htmlLang;

  let pluralRules = "cardinal";
  try {
    pluralRules = new Intl.PluralRules(htmlLang).select(1);
  } catch {
    pluralRules = "other";
  }

  return {
    localeCode: world.code,
    htmlLang,
    numberLocale,
    dateLocale,
    currencyCode: options.currencyCode ?? world.defaultCurrency,
    unitSystem: world.code === "en" ? "imperial" : "metric",
    timezone: options.timezone ?? "UTC",
    calendar: options.calendar ?? "gregory",
    pluralRules,
  };
}

export function formatGlsNumber(
  value: number,
  locale: GlsLocaleFormatting,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(locale.numberLocale, options).format(value);
}

export function formatGlsCurrency(
  amount: number,
  locale: GlsLocaleFormatting,
): string {
  return new Intl.NumberFormat(locale.numberLocale, {
    style: "currency",
    currency: locale.currencyCode,
  }).format(amount);
}

export function formatGlsDate(
  value: Date,
  locale: GlsLocaleFormatting,
  options?: Intl.DateTimeFormatOptions,
): string {
  return new Intl.DateTimeFormat(locale.dateLocale, {
    timeZone: locale.timezone,
    ...options,
  }).format(value);
}

export function pluralizeGls(
  count: number,
  locale: GlsLocaleFormatting,
  forms: { zero?: string; one?: string; two?: string; few?: string; many?: string; other: string },
): string {
  const rule = new Intl.PluralRules(locale.htmlLang).select(count);
  return forms[rule as keyof typeof forms] ?? forms.other;
}
