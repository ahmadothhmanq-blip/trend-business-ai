/**
 * Unified SEO + Performance analysis for generated websites.
 */

import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import { runPerformanceChecks } from "@/lib/ai-core/performance/check";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import { checkSeoReadiness } from "@/lib/ai-core/seo/check";
import { analyzeHeadingStructure } from "@/lib/ai-core/seo-performance/headings";
import {
  buildKeywordPlan,
  resolveIndustryId,
} from "@/lib/ai-core/seo-performance/keywords";
import type {
  SeoPerformanceRecommendation,
  SeoPerformanceReport,
  TechnicalSeoChecklist,
} from "@/lib/ai-core/seo-performance/types";

export type AnalyzeSeoPerformanceInput = {
  files: Array<{ path: string; content: string }>;
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string | null;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  assetManifest?: CoreAssetManifest;
  premiumSeoTopics?: string[];
  premiumKeywords?: string[];
  /** Conversion score (0–100) soft-influences publish readiness. */
  conversionScore?: number | null;
};

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function allContent(files: Array<{ path: string; content: string }>): string {
  return files.map((f) => f.content).join("\n");
}

function detectTechnicalSeo(
  files: Array<{ path: string; content: string }>,
  seoPackage?: CoreSeoPackage,
): TechnicalSeoChecklist {
  const content = allContent(files);
  const paths = files.map((f) => f.path.toLowerCase());

  return {
    hasMetadata:
      /metadata|generateMetadata|metaTitle|title:\s*["'`]/i.test(content) ||
      Boolean(seoPackage?.metadata?.title),
    hasOpenGraph:
      /openGraph|og:|ogTitle/i.test(content) || Boolean(seoPackage?.openGraph),
    hasTwitterCard:
      /twitter:|twitterCard|card:\s*["']summary/i.test(content) ||
      Boolean(seoPackage && "twitter" in seoPackage),
    hasSitemap:
      paths.some((p) => p.includes("sitemap")) ||
      Boolean(seoPackage?.sitemap?.length),
    hasRobotsTxt:
      paths.some((p) => p.includes("robots")) ||
      Boolean(seoPackage?.metadata?.robots),
    hasStructuredData:
      /application\/ld\+json|schema\.org|@type/i.test(content) ||
      Boolean(seoPackage?.structuredData?.length),
    hasCanonical:
      /canonical/i.test(content) ||
      Boolean(seoPackage?.metadata?.canonicalPath),
  };
}

function buildRecommendations(params: {
  seoScore: number;
  perfScore: number;
  mobileScore: number;
  headings: ReturnType<typeof analyzeHeadingStructure>;
  technical: TechnicalSeoChecklist;
  keywordPlan: ReturnType<typeof buildKeywordPlan>;
  seoPackage?: CoreSeoPackage;
  performanceReport?: CorePerformanceReport;
  content: string;
}): SeoPerformanceRecommendation[] {
  const recs: SeoPerformanceRecommendation[] = [];
  let n = 0;
  const id = (area: string) => `seo-perf-${area}-${++n}`;

  const title = params.seoPackage?.metadata.title ?? "";
  const description = params.seoPackage?.metadata.description ?? "";

  if (!title || title.length < 15) {
    recs.push({
      id: id("title"),
      area: "title-meta",
      severity: "critical",
      title: "SEO title is missing or too short",
      detail: "Titles under ~15 characters underperform in SERPs.",
      action: `Set a 50–60 character title including “${params.keywordPlan.primary}”.`,
      target: "metadata.title",
    });
  } else if (title.length > 60) {
    recs.push({
      id: id("title-long"),
      area: "title-meta",
      severity: "minor",
      title: "SEO title may be truncated in search results",
      detail: `Current title is ${title.length} characters.`,
      action: "Trim the title to ≤60 characters while keeping the primary keyword near the front.",
      target: "metadata.title",
    });
  }

  if (!description || description.length < 50) {
    recs.push({
      id: id("meta"),
      area: "title-meta",
      severity: "critical",
      title: "Meta description is weak or missing",
      detail: "Descriptions under ~50 characters rarely earn strong CTR.",
      action: `Write a 140–160 character description with “${params.keywordPlan.primary}” and a clear CTA.`,
      target: "metadata.description",
    });
  } else if (description.length > 160) {
    recs.push({
      id: id("meta-long"),
      area: "title-meta",
      severity: "minor",
      title: "Meta description may be truncated",
      detail: `Current description is ${description.length} characters.`,
      action: "Trim the meta description to ≤160 characters.",
      target: "metadata.description",
    });
  }

  for (const issue of params.headings.issues) {
    recs.push({
      id: id("heading"),
      area: "headings",
      severity: issue.includes("No H1") ? "critical" : "major",
      title: issue,
      detail: "Heading hierarchy helps crawlers and users scan the page.",
      action:
        params.headings.suggestions[0] ||
        "Use one H1, then H2/H3 for sections.",
      target: "hero / page headings",
    });
  }
  for (const suggestion of params.headings.suggestions.slice(0, 2)) {
    if (params.headings.issues.some((i) => suggestion.includes(i.slice(0, 12)))) {
      continue;
    }
    recs.push({
      id: id("heading-opp"),
      area: "headings",
      severity: "opportunity",
      title: "Improve heading hierarchy",
      detail: suggestion,
      action: suggestion,
      target: "section headings",
    });
  }

  if (params.keywordPlan.secondary.length < 3) {
    recs.push({
      id: id("kw"),
      area: "keywords",
      severity: "major",
      title: "Thin keyword coverage for industry intent",
      detail: "Few secondary keywords mapped from industry / strategy.",
      action: `Expand content around: ${params.keywordPlan.industryKeywords.slice(0, 4).join(", ") || params.keywordPlan.primary}.`,
    });
  } else {
    const hits = [params.keywordPlan.primary, ...params.keywordPlan.secondary.slice(0, 5)].filter(
      (k) => params.content.toLowerCase().includes(k.toLowerCase().slice(0, 18)),
    );
    if (hits.length < 2) {
      recs.push({
        id: id("kw-content"),
        area: "keywords",
        severity: "major",
        title: "Primary keywords underused in page content",
        detail: "Strategy keywords are not clearly reflected in copy.",
        action: `Naturally include “${params.keywordPlan.primary}” in the hero, an H2, and body copy.`,
        target: "content",
      });
    }
  }

  if (!params.technical.hasSitemap) {
    recs.push({
      id: id("sitemap"),
      area: "technical-seo",
      severity: "critical",
      title: "Sitemap missing",
      detail: "Search engines need a sitemap for multi-page discovery.",
      action: "Ship public/sitemap.xml covering all strategy pages.",
      target: "public/sitemap.xml",
    });
  }
  if (!params.technical.hasRobotsTxt) {
    recs.push({
      id: id("robots"),
      area: "technical-seo",
      severity: "major",
      title: "robots.txt not detected",
      detail: "Crawlers benefit from an explicit robots policy.",
      action: "Add public/robots.txt allowing indexing and pointing to the sitemap.",
      target: "public/robots.txt",
    });
  }
  if (!params.technical.hasStructuredData) {
    recs.push({
      id: id("schema"),
      area: "structured-data",
      severity: "major",
      title: "Schema.org structured data missing",
      detail: "Rich results require Organization / LocalBusiness / Product JSON-LD.",
      action: "Inject industry-appropriate JSON-LD (Organization + WebSite + vertical type).",
      target: "seo/structured-data.html",
    });
  }
  if (!params.technical.hasOpenGraph) {
    recs.push({
      id: id("og"),
      area: "social",
      severity: "major",
      title: "Open Graph metadata missing",
      detail: "Social previews rely on og:title, og:description, and og:image.",
      action: "Add Open Graph fields aligned with the SEO title and hero image.",
    });
  }
  if (!params.technical.hasTwitterCard) {
    recs.push({
      id: id("twitter"),
      area: "social",
      severity: "opportunity",
      title: "Twitter / X card metadata not detected",
      detail: "summary_large_image cards improve share CTR.",
      action: "Add twitter:card, twitter:title, and twitter:description.",
    });
  }
  if (!params.technical.hasCanonical) {
    recs.push({
      id: id("canonical"),
      area: "technical-seo",
      severity: "minor",
      title: "Canonical URL not detected",
      detail: "Canonicals prevent duplicate-content dilution.",
      action: "Set metadata.canonicalPath (usually “/” for the homepage).",
    });
  }

  // Performance-sourced recommendations
  for (const check of params.performanceReport?.checks ?? []) {
    for (const issue of check.issues.slice(0, 2)) {
      const area =
        check.name === "image_optimization"
          ? "images"
          : check.name === "loading_performance"
            ? "lazy-loading"
            : check.name === "mobile_responsiveness"
              ? "mobile"
              : check.name === "core_web_vitals"
                ? "core-web-vitals"
                : "images";
      recs.push({
        id: id(check.name),
        area,
        severity: check.score < 50 ? "critical" : check.score < 70 ? "major" : "minor",
        title: issue,
        detail: `${check.name.replace(/_/g, " ")} check scored ${check.score}.`,
        action: check.recommendations[0] || "Follow performance best practices.",
      });
    }
  }

  if (params.mobileScore < 70) {
    recs.push({
      id: id("mobile"),
      area: "mobile",
      severity: "critical",
      title: "Mobile-first experience needs work",
      detail: `Mobile score is ${params.mobileScore}.`,
      action: "Ensure viewport export, responsive breakpoints, and tap-friendly CTAs.",
    });
  }

  if (params.seoScore >= 75 && params.perfScore >= 75) {
    recs.push({
      id: id("internal"),
      area: "internal-seo",
      severity: "opportunity",
      title: "Add internal links between key pages",
      detail: "Internal linking distributes authority and clarifies site architecture.",
      action: "Link Home → Services/Products → Contact/Booking with descriptive anchors.",
      target: "navigation / in-content links",
    });
  }

  // Deduplicate by title
  const seen = new Set<string>();
  return recs.filter((r) => {
    if (seen.has(r.title)) return false;
    seen.add(r.title);
    return true;
  });
}

/**
 * Analyze SEO + performance readiness and produce a unified quality report.
 */
export function analyzeSeoPerformance(
  input: AnalyzeSeoPerformanceInput,
): SeoPerformanceReport {
  const industryId = resolveIndustryId(input.industryId, input.profile);
  const keywordPlan = buildKeywordPlan({
    strategy: input.strategy,
    profile: input.profile,
    industryId,
    premiumSeoTopics: input.premiumSeoTopics,
    premiumKeywords: input.premiumKeywords,
  });

  const headings = analyzeHeadingStructure(input.files);
  const technical = detectTechnicalSeo(input.files, input.seoPackage);

  const seoReadiness =
    input.seoPackage?.readiness ??
    checkSeoReadiness({
      files: input.files,
      strategy: input.strategy,
      seoPackage: input.seoPackage,
    });

  const performanceReport =
    input.performanceReport ??
    runPerformanceChecks({
      files: input.files,
      assetManifest: input.assetManifest,
    });

  const mobileCheck = performanceReport.checks.find(
    (c) => c.name === "mobile_responsiveness",
  );
  const cwvCheck = performanceReport.checks.find(
    (c) => c.name === "core_web_vitals",
  );

  let seoScore = seoReadiness.score;
  if (!headings.hasSingleH1) seoScore -= 12;
  if (!technical.hasSitemap) seoScore -= 8;
  if (!technical.hasRobotsTxt) seoScore -= 5;
  if (!technical.hasStructuredData) seoScore -= 8;
  if (!technical.hasOpenGraph) seoScore -= 6;
  if (!technical.hasTwitterCard) seoScore -= 3;
  seoScore = clamp(seoScore);

  const perfScore = clamp(performanceReport.score);
  const mobileScore = clamp(
    mobileCheck
      ? (mobileCheck.score * 0.7 + (cwvCheck?.score ?? mobileCheck.score) * 0.3)
      : perfScore,
  );

  const overall = clamp(
    seoScore * 0.4 + perfScore * 0.35 + mobileScore * 0.25,
  );

  const brand = input.profile?.projectName || "Business";
  const suggestedTitle =
    input.seoPackage?.metadata.title ||
    truncate(`${brand} | ${keywordPlan.primary}`, 60);
  const suggestedDescription =
    input.seoPackage?.metadata.description ||
    truncate(
      `${input.strategy?.positioning || input.profile?.summary || brand}. ${keywordPlan.longTail[0] || ""}`.trim(),
      160,
    );

  const content = allContent(input.files);
  const recommendations = buildRecommendations({
    seoScore,
    perfScore,
    mobileScore,
    headings,
    technical,
    keywordPlan,
    seoPackage: input.seoPackage,
    performanceReport,
    content,
  });

  const critical = recommendations.filter((r) => r.severity === "critical").length;
  const publishReady =
    overall >= 65 &&
    critical === 0 &&
    headings.hasSingleH1 &&
    technical.hasMetadata &&
    (input.conversionScore == null || input.conversionScore >= 50);

  const improveThemes = [
    !headings.hasSingleH1
      ? "Fix heading structure: one keyword-rich H1, clear H2 section titles"
      : "",
    seoScore < 75
      ? `Strengthen on-page SEO around “${keywordPlan.primary}” and secondary keywords`
      : "",
    !technical.hasSitemap || !technical.hasRobotsTxt
      ? "Ensure sitemap.xml and robots.txt are present and accurate"
      : "",
    !technical.hasStructuredData
      ? "Add Schema.org JSON-LD for Organization / industry entity"
      : "",
    perfScore < 75
      ? "Optimize images (next/image), lazy-load below-fold media, protect Core Web Vitals"
      : "",
    mobileScore < 75
      ? "Mobile-first polish: viewport, responsive layout, tap targets"
      : "",
    !technical.hasOpenGraph
      ? "Complete Open Graph + social sharing metadata"
      : "",
  ].filter(Boolean);

  const summary = `SEO ${seoScore} · Performance ${perfScore} · Mobile ${mobileScore} · Overall ${overall}${
    publishReady ? " — ready for publish review" : " — improve before publishing"
  }. Primary keyword: “${keywordPlan.primary}”.`;

  return {
    scores: {
      seo: seoScore,
      performance: perfScore,
      mobile: mobileScore,
      overall,
    },
    keywordPlan,
    headingStructure: headings,
    technicalSeo: technical,
    recommendations,
    improveThemes,
    summary,
    publishReady,
    industryId,
    generatedAt: new Date().toISOString(),
    suggestedMeta: {
      title: suggestedTitle,
      description: suggestedDescription,
    },
  };
}
