import {
  DEFAULT_LOCALE,
  getLocaleDefinition,
  normalizeLocale,
  type SupportedLocale,
} from "@/lib/i18n/config";

export type FormatLocaleInput = SupportedLocale | string | null | undefined;

function resolveLocale(locale?: FormatLocaleInput): SupportedLocale {
  if (!locale) return DEFAULT_LOCALE;
  return normalizeLocale(locale);
}

function bcp47(locale: SupportedLocale): string {
  return getLocaleDefinition(locale).htmlLang;
}

/** Format a date for the active locale. */
export function formatDate(
  value: Date | string | number | null | undefined,
  locale?: FormatLocaleInput,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value == null || value === "") return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(bcp47(resolveLocale(locale)), {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...options,
  }).format(date);
}

/** Format a date with time. */
export function formatDateTime(
  value: Date | string | number | null | undefined,
  locale?: FormatLocaleInput,
  options?: Intl.DateTimeFormatOptions,
): string {
  if (value == null || value === "") return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat(bcp47(resolveLocale(locale)), {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(date);
}

/** Format a number for the active locale. */
export function formatNumber(
  value: number | null | undefined,
  locale?: FormatLocaleInput,
  options?: Intl.NumberFormatOptions,
): string {
  if (value == null || Number.isNaN(value)) return "—";
  return new Intl.NumberFormat(bcp47(resolveLocale(locale)), options).format(
    value,
  );
}

/** Format currency from minor units (cents). */
export function formatCurrency(
  cents: number | null | undefined,
  locale?: FormatLocaleInput,
  currency = "USD",
): string {
  if (cents == null || Number.isNaN(cents)) return "—";
  return new Intl.NumberFormat(bcp47(resolveLocale(locale)), {
    style: "currency",
    currency,
  }).format(cents / 100);
}

/** Format currency from major units. */
export function formatCurrencyMajor(
  amount: number | null | undefined,
  locale?: FormatLocaleInput,
  currency = "USD",
): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  return new Intl.NumberFormat(bcp47(resolveLocale(locale)), {
    style: "currency",
    currency,
  }).format(amount);
}

/** Relative time (e.g. "3 days ago") when supported. */
export function formatRelativeTime(
  value: Date | string | number,
  locale?: FormatLocaleInput,
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const loc = bcp47(resolveLocale(locale));
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1],
  ];
  const rtf = new Intl.RelativeTimeFormat(loc, { numeric: "auto" });
  for (const [unit, seconds] of units) {
    if (abs >= seconds || unit === "second") {
      const count = Math.round(diffSec / seconds);
      return rtf.format(count, unit);
    }
  }
  return formatDate(date, locale);
}
