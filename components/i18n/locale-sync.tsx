"use client";

import { useEffect } from "react";
import { normalizeLocale, type SupportedLocale } from "@/lib/i18n/config";
import { readStoredLocale } from "@/lib/i18n/client";

const LOCALE_STORAGE_KEY = "tba_locale";

type LocaleSyncProps = {
  profileLocale?: string | null;
};

/** Sync profile locale to browser storage on dashboard load. */
export function LocaleSync({ profileLocale }: LocaleSyncProps) {
  useEffect(() => {
    const normalized = profileLocale
      ? normalizeLocale(profileLocale)
      : readStoredLocale();
    if (!normalized) return;

    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, normalized);
    } catch {
      /* ignore */
    }

    if (profileLocale && normalizeLocale(profileLocale) !== readStoredLocale()) {
      void fetch("/api/i18n/locale", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale: normalized as SupportedLocale }),
      });
    }
  }, [profileLocale]);

  return null;
}
