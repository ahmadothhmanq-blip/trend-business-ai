"use client";

import { useMemo } from "react";
import { RTL_LOCALES, type LocaleDirection } from "@/lib/i18n/config";
import { useTranslation } from "@/lib/i18n/client";
import { useProductT } from "@/lib/i18n/use-scoped-t";

export function useBuilderLocale() {
  const wb = useProductT("websiteBuilder");
  const { locale } = useTranslation();
  const dir: LocaleDirection = useMemo(
    () => (RTL_LOCALES.has(locale) ? "rtl" : "ltr"),
    [locale],
  );
  return { wb, dir, locale };
}
