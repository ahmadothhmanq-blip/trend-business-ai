import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  normalizeLocale,
  type SupportedLocale,
} from "@/lib/i18n/config";
import { loadMessages } from "@/lib/i18n/load-messages";
import { createTranslator, type TranslateFn } from "@/lib/i18n/translate";
import en from "@/locales/en.json";
import type { TranslationMessages } from "@/lib/i18n/messages";

export async function getServerLocale(): Promise<SupportedLocale> {
  const headerStore = await headers();
  const headerLocale = headerStore.get(LOCALE_HEADER);
  if (headerLocale) {
    return normalizeLocale(headerLocale);
  }

  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  return normalizeLocale(cookieLocale);
}

export async function getServerMessages(
  locale?: SupportedLocale,
): Promise<TranslationMessages> {
  const resolved = locale ?? (await getServerLocale());
  return loadMessages(resolved);
}

export async function getServerTranslator(
  locale?: SupportedLocale,
): Promise<{ locale: SupportedLocale; t: TranslateFn }> {
  const resolved = locale ?? (await getServerLocale());
  const messages = loadMessages(resolved);
  const fallback = en as TranslationMessages;
  return {
    locale: resolved,
    t: createTranslator(messages, fallback),
  };
}
