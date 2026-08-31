import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { VisitorLocaleConfig } from "@/lib/website/site-plan/visitor-locales";

/** Stored in `website_publications.seo_json` at publish time. */
export type PublishedSeoJson = CoreSeoPackage & {
  visitorLocaleHtml?: Record<string, string>;
  visitorLocales?: VisitorLocaleConfig;
};

export function isPublishedSeoJson(value: unknown): value is PublishedSeoJson {
  return Boolean(value) && typeof value === "object";
}

export function extractVisitorLocaleHtml(
  seoJson: unknown,
): Record<string, string> | undefined {
  if (!isPublishedSeoJson(seoJson)) return undefined;
  const map = seoJson.visitorLocaleHtml;
  if (!map || typeof map !== "object") return undefined;
  return map;
}
