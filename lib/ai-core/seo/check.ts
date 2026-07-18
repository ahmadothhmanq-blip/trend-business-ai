/**
 * SEO readiness checks against generated project files.
 */

import type { CoreProductStrategy } from "@/lib/ai-core/layers/types";
import type { CoreSeoPackage, CoreSeoReadiness } from "@/lib/ai-core/seo/types";

/** Minimal file shape — avoids coupling checks to full GeneratedProjectFile. */
export type SeoCheckFile = {
  path: string;
  content: string;
};

function allContent(files: SeoCheckFile[]): string {
  return files.map((f) => f.content).join("\n");
}

/**
 * Score SEO readiness of generated output vs Strategy / SEO package.
 */
export function checkSeoReadiness(params: {
  files: SeoCheckFile[];
  strategy?: CoreProductStrategy;
  seoPackage?: CoreSeoPackage;
}): CoreSeoReadiness {
  const { files, strategy, seoPackage } = params;
  const content = allContent(files);
  const issues: string[] = [];
  let score = 100;

  const hasMetadataSignal =
    /metadata|generateMetadata|metaTitle|title:\s*["'`]|description:\s*["'`]/i.test(
      content,
    );
  if (!hasMetadataSignal) {
    issues.push("Missing metadata / title / description signals in generated files");
    score -= 25;
  }

  const keywords =
    seoPackage?.keywords ??
    strategy?.seoFocus ??
    strategy?.contentStrategy.seoTopics ??
    [];
  const keywordHits = keywords.filter((k) =>
    content.toLowerCase().includes(k.toLowerCase().slice(0, 24)),
  );
  if (keywords.length > 0 && keywordHits.length === 0) {
    issues.push("SEO keywords from strategy are not reflected in content");
    score -= 20;
  } else if (keywords.length > 0 && keywordHits.length < Math.min(2, keywords.length)) {
    issues.push("Few strategy SEO keywords appear in generated content");
    score -= 10;
  }

  if (!/openGraph|og:|twitter/i.test(content) && !seoPackage) {
    issues.push("No Open Graph signals detected");
    score -= 10;
  }

  if (
    !/application\/ld\+json|@type|schema\.org/i.test(content) &&
    !(seoPackage?.structuredData.length)
  ) {
    issues.push("No structured data / schema signals detected");
    score -= 10;
  }

  const sitemapPaths = strategy?.sitemap?.length
    ? strategy.sitemap
    : seoPackage?.sitemap.map((s) => s.path) ?? [];
  if (sitemapPaths.length > 1) {
    const missing = sitemapPaths
      .slice(0, 5)
      .filter((p) => {
        if (p === "/" || p === "") return false;
        const slug = p.replace(/^\//, "").toLowerCase();
        return (
          slug &&
          !files.some((f) => f.path.toLowerCase().includes(slug)) &&
          !content.toLowerCase().includes(slug)
        );
      });
    if (missing.length > 0) {
      issues.push(`Sitemap paths weakly covered: ${missing.slice(0, 3).join(", ")}`);
      score -= 10;
    }
  }

  score = Math.max(0, Math.min(100, score));
  return {
    passed: score >= 60 && !issues.some((i) => i.startsWith("Missing metadata")),
    score,
    issues,
  };
}

/** Attach readiness onto an existing SEO package. */
export function withSeoReadiness(
  pkg: CoreSeoPackage,
  readiness: CoreSeoReadiness,
): CoreSeoPackage {
  return {
    ...pkg,
    readiness,
  };
}
