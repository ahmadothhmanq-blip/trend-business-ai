import type { GlsLocaleFormatting } from "@/lib/language-platform/core/types";
import { resolveGlsWorldLanguage } from "@/lib/language-platform/registry/languages";
import { resolveGcriProfile } from "@/lib/language-platform/gcri/resolve";

export type GlsLocaleResolveOptions = {
  localeCode?: string;
  timezone?: string;
  currencyCode?: string;
  calendar?: GlsLocaleFormatting["calendar"];
  countryCode?: string;
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
  const gcri = options.countryCode
    ? resolveGcriProfile({ language: world.aiLanguage, country: options.countryCode })
    : null;

  let pluralRules = "cardinal";
  try {
    pluralRules = new Intl.PluralRules(htmlLang).select(1);
  } catch {
    pluralRules = "other";
  }

  return {
    localeCode: world.code,
    htmlLang,
    numberLocale: gcri?.locale ?? numberLocale,
    dateLocale: gcri?.locale ?? dateLocale,
    currencyCode: options.currencyCode ?? gcri?.currencyCode ?? world.defaultCurrency,
    unitSystem: gcri?.measurementSystem ?? (world.code === "en" ? "imperial" : "metric"),
    timezone: options.timezone ?? gcri?.timezone ?? "UTC",
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
