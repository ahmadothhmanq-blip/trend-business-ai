import type { MetadataRoute } from "next";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function sitemapToXml(entries: MetadataRoute.Sitemap): string {
  const urls = entries
    .map((entry) => {
      const images =
        "images" in entry && Array.isArray(entry.images)
          ? entry.images
              .map(
                (image) =>
                  `    <image:image>\n      <image:loc>${escapeXml(image)}</image:loc>\n    </image:image>`,
              )
              .join("\n")
          : "";

      return [
        "  <url>",
        `    <loc>${escapeXml(entry.url)}</loc>`,
        entry.lastModified
          ? `    <lastmod>${new Date(entry.lastModified).toISOString()}</lastmod>`
          : null,
        entry.changeFrequency ? `    <changefreq>${entry.changeFrequency}</changefreq>` : null,
        typeof entry.priority === "number" ? `    <priority>${entry.priority}</priority>` : null,
        images || null,
        "  </url>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls}
</urlset>`;
}

export function xmlSitemapResponse(entries: MetadataRoute.Sitemap) {
  return new Response(sitemapToXml(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
