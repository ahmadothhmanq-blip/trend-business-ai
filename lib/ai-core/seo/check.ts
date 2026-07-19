/**
 * SEO readiness checks against generated project files.
 */

import type { CoreProductStrategy } from "@/lib/ai-core/layers/types";
import { analyzeHeadingStructure } from "@/lib/ai-core/seo-performance/headings";
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
  const paths = files.map((f) => f.path.toLowerCase());
  const issues: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const hasMetadataSignal =
    /metadata|generateMetadata|metaTitle|title:\s*["'`]|description:\s*["'`]/i.test(
      content,
    ) || Boolean(seoPackage?.metadata?.title);
  if (!hasMetadataSignal) {
    issues.push("Missing metadata / title / description signals in generated files");
    score -= 25;
  } else {
    const titleLen = seoPackage?.metadata.title?.length ?? 0;
    const descLen = seoPackage?.metadata.description?.length ?? 0;
    if (titleLen > 0 && (titleLen < 15 || titleLen > 65)) {
      issues.push("SEO title length outside the 15–60 character sweet spot");
      score -= 8;
      recommendations.push("Tune the SEO title to 50–60 characters with the primary keyword");
    }
    if (descLen > 0 && (descLen < 50 || descLen > 165)) {
      issues.push("Meta description length outside the 50–160 character range");
      score -= 8;
      recommendations.push("Write a compelling 140–160 character meta description");
    }
  }

  const headings = analyzeHeadingStructure(files);
  if (!headings.hasSingleH1) {
    issues.push(...headings.issues.slice(0, 2));
    score -= headings.h1Count === 0 ? 15 : 10;
  }
  recommendations.push(...headings.suggestions.slice(0, 2));

  const keywords = (
    seoPackage?.keywords ??
    strategy?.seoFocus ??
    strategy?.contentStrategy?.seoTopics ??
    []
  ).filter((k): k is string => typeof k === "string" && Boolean(k.trim()));
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

  if (!/openGraph|og:|twitter/i.test(content) && !seoPackage?.openGraph) {
    issues.push("No Open Graph signals detected");
    score -= 10;
  }
  if (!seoPackage?.twitter && !/twitter:|twitterCard/i.test(content)) {
    recommendations.push("Add Twitter/X card metadata for social sharing");
    score -= 3;
  }

  if (
    !/application\/ld\+json|@type|schema\.org/i.test(content) &&
    !(seoPackage?.structuredData.length)
  ) {
    issues.push("No structured data / schema signals detected");
    score -= 10;
  }

  if (!paths.some((p) => p.includes("sitemap")) && !(seoPackage?.sitemap.length)) {
    issues.push("Sitemap artifact not detected");
    score -= 8;
  }
  if (!paths.some((p) => p.includes("robots")) && !seoPackage?.metadata?.robots) {
    issues.push("robots.txt not detected");
    score -= 5;
    recommendations.push("Add public/robots.txt with Sitemap directive");
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

  recommendations.push(
    "Link key pages from the homepage for internal SEO",
    "Keep a single clear H1 and descriptive H2 section titles",
  );

  score = Math.max(0, Math.min(100, score));
  return {
    passed: score >= 60 && !issues.some((i) => i.startsWith("Missing metadata")),
    score,
    issues,
    recommendations: Array.from(new Set(recommendations)).slice(0, 8),
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
