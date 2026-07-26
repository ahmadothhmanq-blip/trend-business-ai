/**
 * Resolve absolute public site origin for published website SEO artifacts.
 */
export function resolvePublishedSiteOrigin(): string | null {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").trim().replace(/\/$/, "");
  if (!siteUrl || !/^https?:\/\//i.test(siteUrl)) return null;
  return siteUrl;
}

export function resolvePublishedAbsoluteUrl(publicPathOrUrl: string): string {
  if (publicPathOrUrl.startsWith("http")) return publicPathOrUrl;
  const origin = resolvePublishedSiteOrigin();
  if (!origin) return publicPathOrUrl;
  const path = publicPathOrUrl.startsWith("/") ? publicPathOrUrl : `/${publicPathOrUrl}`;
  return `${origin}${path}`;
}
