/**
 * Inject SEO package artifacts into a generated file list (Website / Next apps).
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import {
  seoPackageToSerializable,
} from "@/lib/ai-core/seo/build";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";

function languageForPath(path: string): string {
  if (path.endsWith(".ts") || path.endsWith(".tsx")) return "typescript";
  if (path.endsWith(".json")) return "json";
  if (path.endsWith(".xml")) return "xml";
  if (path.endsWith(".html")) return "html";
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
 */
export function injectSeoArtifacts(
  files: GeneratedProjectFile[],
  pkg: CoreSeoPackage,
): GeneratedProjectFile[] {
  const serializable = seoPackageToSerializable(pkg);
  const json = JSON.stringify(serializable, null, 2);

  let next = upsertFile(files, "seo/site-seo.json", `${json}\n`);

  const ts = `/**
 * Auto-generated SEO package (AI Core SEO Engine).
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

  return next;
}
