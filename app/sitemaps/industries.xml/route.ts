import { buildIndustrySitemap } from "@/lib/seo/sitemap-registry";
import { xmlSitemapResponse } from "@/lib/seo/sitemap-xml";

export function GET() {
  return xmlSitemapResponse(buildIndustrySitemap());
}
