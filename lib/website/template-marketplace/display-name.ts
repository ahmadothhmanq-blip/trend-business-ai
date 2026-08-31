import type { WbTemplateMarketplaceListing } from "@/lib/website/template-marketplace/types";

type LocalizedNames = {
  ar?: string;
  [locale: string]: string | undefined;
};

/**
 * Resolve a neutral template display name for the active UI locale.
 * Falls back to listing.name (English brand name from manifest).
 */
export function resolveTemplateListingDisplayName(
  listing: Pick<WbTemplateMarketplaceListing, "name" | "metadata"> & {
    id?: string;
  },
  locale?: string | null,
): string {
  const normalized = locale?.toLowerCase().split("-")[0];
  const localized = (
    listing.metadata as { localizedNames?: LocalizedNames } | undefined
  )?.localizedNames;

  if (normalized === "ar" && localized?.ar?.trim()) {
    return localized.ar.trim();
  }

  return listing.name;
}
