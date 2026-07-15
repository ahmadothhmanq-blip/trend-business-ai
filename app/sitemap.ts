import type { MetadataRoute } from "next";
import { buildFullSitemap } from "@/lib/seo/sitemap-registry";

export default function sitemap(): MetadataRoute.Sitemap {
  return buildFullSitemap();
}
