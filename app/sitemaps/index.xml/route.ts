import { buildSitemapIndexEntries } from "@/lib/seo/sitemap-registry";
import { xmlSitemapIndexResponse } from "@/lib/seo/sitemap-xml";

/** Dynamic sitemap index listing all specialized sitemaps. */
export function GET() {
  return xmlSitemapIndexResponse(buildSitemapIndexEntries());
}
