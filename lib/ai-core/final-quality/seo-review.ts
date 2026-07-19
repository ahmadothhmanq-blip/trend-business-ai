/**
 * Final SEO Review — metadata, headings, keywords, structure, content quality.
 */

import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { SeoPerformanceReport } from "@/lib/ai-core/seo-performance/types";
import type {
  FinalQualityFinding,
  FinalSeoReviewReport,
} from "@/lib/ai-core/final-quality/types";

export type SeoReviewFile = { path: string; content: string };

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function allContent(files: SeoReviewFile[]): string {
  return files.map((f) => f.content).join("\n");
}

/**
 * SEO review layer used by Final Website Quality Intelligence.
 */
export function runFinalSeoReview(params: {
  files: SeoReviewFile[];
  seoPackage?: CoreSeoPackage | null;
  seoPerformance?: SeoPerformanceReport | null;
}): FinalSeoReviewReport {
  const content = allContent(params.files);
  const findings: FinalQualityFinding[] = [];
  let n = 0;
  const id = (k: string) => `seo-review-${k}-${++n}`;

  let score =
    params.seoPerformance?.scores.seo ??
    params.seoPackage?.readiness?.score ??
    72;

  const meta =
    Boolean(params.seoPackage?.metadata?.title) &&
    Boolean(params.seoPackage?.metadata?.description);
  const metaInFiles =
    /metadata|og:title|og:description|generateMetadata|<title/i.test(content);
  const metadataOk = meta || metaInFiles;
  if (!metadataOk) {
    findings.push({
      id: id("meta"),
      dimension: "seo",
      severity: "critical",
      title: "Missing SEO metadata",
      detail: "Title and description are required before publish.",
      action: "Add metadata title/description and Open Graph tags.",
      source: "seo",
    });
    score -= 18;
  } else if (
    (params.seoPackage?.metadata?.title?.length ?? 0) > 65 ||
    (params.seoPackage?.metadata?.description?.length ?? 0) > 170
  ) {
    findings.push({
      id: id("meta-len"),
      dimension: "seo",
      severity: "minor",
      title: "Meta title or description may be too long",
      detail: "Keep title ≤60 and description ≤160 characters.",
      action: "Tighten meta title and description length.",
      source: "seo",
    });
    score -= 4;
  }

  const h1 = (content.match(/<h1\b/gi) || []).length;
  const h2 = (content.match(/<h2\b/gi) || []).length;
  const headingsOk = h1 === 1 && h2 >= 2;
  if (!headingsOk) {
    findings.push({
      id: id("headings"),
      dimension: "seo",
      severity: h1 === 0 ? "critical" : "major",
      title: "Heading structure needs work",
      detail: `H1=${h1}, H2=${h2}. Prefer one H1 and clear H2 sections.`,
      action: "Fix heading hierarchy for crawlability and scanability.",
      source: "seo",
    });
    score -= h1 === 0 ? 14 : 8;
  }

  const keywords = params.seoPackage?.keywords ?? params.seoPerformance?.keywordPlan;
  const primary =
    params.seoPerformance?.keywordPlan?.primary ||
    (Array.isArray(keywords) ? keywords[0] : "");
  const keywordsOk = Boolean(primary && String(primary).length > 2);
  if (!keywordsOk) {
    findings.push({
      id: id("kw"),
      dimension: "seo",
      severity: "major",
      title: "Primary keyword plan missing",
      detail: "Keyword focus improves rankings and copy clarity.",
      action: "Set a primary keyword and weave it into H1 + meta.",
      source: "seo",
    });
    score -= 10;
  } else if (
    primary &&
    !content.toLowerCase().includes(String(primary).toLowerCase().slice(0, 12))
  ) {
    findings.push({
      id: id("kw-use"),
      dimension: "seo",
      severity: "minor",
      title: "Primary keyword underused on page",
      detail: `Primary “${primary}” should appear in hero/H1 context.`,
      action: "Include the primary keyword naturally in the hero headline.",
      source: "seo",
    });
    score -= 5;
  }

  const structureOk =
    /sitemap|robots|structured-data|jsonLd|application\/ld\+json/i.test(content) ||
    Boolean(params.seoPackage?.structuredData?.length) ||
    Boolean(params.seoPackage?.sitemap?.length);
  if (!structureOk) {
    findings.push({
      id: id("struct"),
      dimension: "seo",
      severity: "major",
      title: "Technical SEO structure incomplete",
      detail: "Sitemap, robots, or structured data missing.",
      action: "Inject SEO artifacts (sitemap, robots, JSON-LD).",
      source: "seo",
    });
    score -= 10;
  }

  const thinCopy =
    content.replace(/\s+/g, " ").length < 4000 ||
    /Lorem ipsum|TODO|Coming soon|Sample text/i.test(content);
  const contentOk = !thinCopy;
  if (/Lorem ipsum|TODO|Coming soon|Sample text/i.test(content)) {
    findings.push({
      id: id("content"),
      dimension: "content",
      severity: "critical",
      title: "Placeholder content hurts SEO quality",
      detail: "Dummy copy will not rank and damages trust.",
      action: "Rewrite sections with industry-specific content.",
      source: "seo",
    });
    score -= 16;
  } else if (content.replace(/\s+/g, " ").length < 3500) {
    findings.push({
      id: id("content-thin"),
      dimension: "content",
      severity: "major",
      title: "Content may be too thin for SEO",
      detail: "Thin pages underperform for competitive queries.",
      action: "Expand service/feature copy with concrete benefits.",
      source: "seo",
    });
    score -= 8;
  }

  // Merge SEO performance engine findings (top)
  for (const r of params.seoPerformance?.recommendations?.slice(0, 6) ?? []) {
    findings.push({
      id: `seo-perf-${r.id}`,
      dimension: "seo",
      severity:
        r.severity === "critical"
          ? "critical"
          : r.severity === "major"
            ? "major"
            : r.severity === "minor"
              ? "minor"
              : "opportunity",
      title: r.title,
      detail: r.detail,
      action: r.action,
      source: "seo",
    });
  }

  score = clamp(score);

  return {
    score,
    findings,
    metadataOk,
    headingsOk,
    keywordsOk,
    structureOk,
    contentOk,
    summary: `SEO Review ${score}/100 — meta ${metadataOk ? "ok" : "fix"}, headings ${headingsOk ? "ok" : "fix"}, structure ${structureOk ? "ok" : "fix"}`,
  };
}
