"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useTransition,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { loadMessages } from "@/lib/i18n/load-messages";
import { createTranslator, type TranslateFn } from "@/lib/i18n/translate";
import { switchLocaleInPath } from "@/lib/i18n/paths";
import type { TranslationMessages } from "@/lib/i18n/messages";
import en from "@/locales/en.json";

const LOCALE_STORAGE_KEY = "tba_locale";

type I18nContextValue = {
  locale: SupportedLocale;
  messages: TranslationMessages;
  t: TranslateFn;
  setLocale: (locale: SupportedLocale) => Promise<void>;
  isPending: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function persistLocaleClient(locale: SupportedLocale) {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore */
  }
  document.cookie = `${LOCALE_COOKIE}=${locale};path=/;max-age=31536000;samesite=lax`;
}

type I18nProviderProps = {
  locale: SupportedLocale;
  messages: TranslationMessages;
  children: ReactNode;
};

export function I18nProvider({
  locale,
  messages,
  children,
}: I18nProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const t = useMemo(
    () => createTranslator(messages, en as TranslationMessages),
    [messages],
  );

  const setLocale = useCallback(
    async (nextLocale: SupportedLocale) => {
      persistLocaleClient(nextLocale);

      try {
        await fetch("/api/i18n/locale", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ locale: nextLocale }),
        });
      } catch {
        /* cookie + localStorage still apply */
      }

      const nextPath = switchLocaleInPath(pathname || "/", nextLocale);
      startTransition(() => {
        router.push(nextPath);
        router.refresh();
      });
    },
    [pathname, router],
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      messages,
      t,
      setLocale,
      isPending,
    }),
    [isPending, locale, messages, setLocale, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

export function useTranslation() {
  const { t, locale } = useI18n();
  return { t, locale };
}

export function useOptionalI18n() {
  return useContext(I18nContext);
}

/** Client-side locale read for hydration sync. */
export function readStoredLocale(): SupportedLocale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (!stored) return null;
    return stored === DEFAULT_LOCALE ? DEFAULT_LOCALE : (stored as SupportedLocale);
  } catch {
    return null;
  }
}
