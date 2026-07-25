"use client";

import { useCallback, useMemo } from "react";
import { useTranslation } from "@/lib/i18n/client";
import {
  formatCurrency,
  formatCurrencyMajor,
  formatDate,
  formatDateTime,
  formatNumber,
  formatRelativeTime,
} from "@/lib/i18n/format";

/** Locale-aware formatters bound to the active UI locale. */
export function useFormatter() {
  const { locale } = useTranslation();

  return useMemo(
    () => ({
      locale,
      formatDate: (
        value: Date | string | number | null | undefined,
        options?: Intl.DateTimeFormatOptions,
      ) => formatDate(value, locale, options),
      formatDateTime: (
        value: Date | string | number | null | undefined,
        options?: Intl.DateTimeFormatOptions,
      ) => formatDateTime(value, locale, options),
      formatNumber: (
        value: number | null | undefined,
        options?: Intl.NumberFormatOptions,
      ) => formatNumber(value, locale, options),
      formatCurrency: (
        cents: number | null | undefined,
        currency?: string,
      ) => formatCurrency(cents, locale, currency),
      formatCurrencyMajor: (
        amount: number | null | undefined,
        currency?: string,
      ) => formatCurrencyMajor(amount, locale, currency),
      formatRelativeTime: (value: Date | string | number) =>
        formatRelativeTime(value, locale),
    }),
    [locale],
  );
}

/** Shorthand for money from cents in the active locale. */
export function useFormatMoney(currency = "USD") {
  const { locale } = useTranslation();
  return useCallback(
    (cents: number | null | undefined) => formatCurrency(cents, locale, currency),
    [locale, currency],
  );
}
