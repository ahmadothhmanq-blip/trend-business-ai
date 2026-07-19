/**
 * Inject SEO package artifacts into a generated file list (Website / Next apps).
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import { seoPackageToSerializable } from "@/lib/ai-core/seo/build";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";

function languageForPath(path: string): string {
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".xml")) return "xml";
  if (path.endsWith(".html")) return "html";
  if (path.endsWith(".txt")) return "text";
  return "text";
}

function upsertFile(
  files: GeneratedProjectFile[],
  path: string,
  content: string,
): GeneratedProjectFile[] {
  const next = files.filter((f) => f.path !== path);
  next.push({ path, content, language: languageForPath(path) });
  return next;
}

/**
 * Adds machine-readable SEO helpers without rewriting product generators.
 * Includes sitemap, robots.txt, structured data, and social metadata package.
 */
export function injectSeoArtifacts(
  files: GeneratedProjectFile[],
  pkg: CoreSeoPackage,
): GeneratedProjectFile[] {
  const serializable = seoPackageToSerializable(pkg);
  const json = JSON.stringify(serializable, null, 2);

  let next = upsertFile(files, "seo/site-seo.json", `${json}\n`);

  const ts = `/**
 * Auto-generated SEO package (AI Core SEO + Performance Engine).
 * Import from layout/metadata helpers as needed.
 */
export const siteSeo = ${json} as const;

export default siteSeo;
`;
  next = upsertFile(next, "seo/site-seo.ts", ts);

  const sitemapXml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...pkg.sitemap.map(
      (entry) =>
        `  <url><loc>${entry.path}</loc><changefreq>${entry.changefreq}</changefreq><priority>${entry.priority}</priority></url>`,
    ),
    `</urlset>`,
    ``,
  ].join("\n");
  next = upsertFile(next, "public/sitemap.xml", sitemapXml);

  const robotsTxt = [
    `User-agent: *`,
    `Allow: /`,
    ``,
    `Sitemap: /sitemap.xml`,
    ``,
  ].join("\n");
  next = upsertFile(next, "public/robots.txt", robotsTxt);

  // Next.js App Router helpers (optional imports for generated sites)
  const robotsTs = `import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "/sitemap.xml",
  };
}
`;
  next = upsertFile(next, "app/robots.ts", robotsTs);

  const sitemapTs = `import type { MetadataRoute } from "next";
import { siteSeo } from "@/seo/site-seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = siteSeo.sitemap as ReadonlyArray<{
    path: string;
    priority: number;
    changefreq: string;
  }>;
  return entries.map((entry) => ({
    url: entry.path,
    changeFrequency: entry.changefreq as MetadataRoute.Sitemap[number]["changeFrequency"],
    priority: entry.priority,
  }));
}
`;
  next = upsertFile(next, "app/sitemap.ts", sitemapTs);

  const jsonLdBlocks = pkg.structuredData
    .map(
      (item) =>
        `<script type="application/ld+json">${JSON.stringify(item.jsonLd)}</script>`,
    )
    .join("\n");
  next = upsertFile(
    next,
    "seo/structured-data.html",
    `<!-- Auto-generated structured data snippets -->\n${jsonLdBlocks}\n`,
  );

  const twitter = pkg.twitter ?? {
    card: "summary_large_image" as const,
    title: pkg.openGraph.title,
    description: pkg.openGraph.description,
    imageAlt: pkg.openGraph.imageAlt,
  };
  const socialHtml = `<!-- Open Graph + Twitter / X -->
<meta property="og:title" content=${JSON.stringify(pkg.openGraph.title)} />
<meta property="og:description" content=${JSON.stringify(pkg.openGraph.description)} />
<meta property="og:type" content=${JSON.stringify(pkg.openGraph.type)} />
<meta property="og:site_name" content=${JSON.stringify(pkg.openGraph.siteName)} />
<meta property="og:locale" content=${JSON.stringify(pkg.openGraph.locale)} />
${
    pkg.openGraph.imagePath
      ? `<meta property="og:image" content=${JSON.stringify(pkg.openGraph.imagePath)} />\n`
      : ""
  }<meta property="og:image:alt" content=${JSON.stringify(pkg.openGraph.imageAlt)} />
<meta name="twitter:card" content=${JSON.stringify(twitter.card)} />
<meta name="twitter:title" content=${JSON.stringify(twitter.title)} />
<meta name="twitter:description" content=${JSON.stringify(twitter.description)} />
${
    pkg.openGraph.imagePath
      ? `<meta name="twitter:image" content=${JSON.stringify(pkg.openGraph.imagePath)} />\n`
      : ""
  }<meta name="twitter:image:alt" content=${JSON.stringify(twitter.imageAlt)} />
`;
  next = upsertFile(next, "seo/social-meta.html", socialHtml);

  return next;
}
