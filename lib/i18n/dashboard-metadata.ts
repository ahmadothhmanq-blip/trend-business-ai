import type { Metadata } from "next";
import { getServerLocale, getServerTranslator } from "@/lib/i18n/server";

/** Localized dashboard page metadata from `pages.{pageId}.title` keys. */
export async function dashboardPageMetadata(
  pageId: string,
  descriptionKey?: string,
): Promise<Metadata> {
  const { t } = await getServerTranslator();
  const title = t(`pages.${pageId}.title`);
  const description = descriptionKey
    ? t(descriptionKey)
    : t(`pages.${pageId}.description`);
  return {
    title,
    description,
  };
}

export async function getDashboardLocale() {
  return getServerLocale();
}
