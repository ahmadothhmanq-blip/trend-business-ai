/** Public publish helpers with no preview SSR dependencies. */

export function isWebsitePublishEnabled() {
  return process.env.WEBSITE_PUBLISH_ENABLED !== "false";
}

export function buildPlannedPublicUrl(slug: string) {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
  const path = `/w/${slug}`;
  return {
    publicPath: path,
    plannedPublicUrl: siteUrl ? `${siteUrl}${path}` : path,
  };
}
