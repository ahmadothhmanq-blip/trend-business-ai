import type { VisitorLocaleConfig } from "@/lib/website/site-plan/visitor-locales";
import { buildPublishedHreflangEntries } from "@/lib/website/site-plan/visitor-locales";

/** Build hreflang link tags for published static HTML. */
export function buildHreflangLinkTags(
  config: VisitorLocaleConfig,
  publicBaseUrl: string,
): string[] {
  const entries = buildPublishedHreflangEntries({ publicBaseUrl, config });
  if (!entries.length) return [];

  return entries.map(
    (entry) =>
      `<link rel="alternate" hreflang="${entry.locale}" href="${entry.href}" />`,
  );
}
