/**
 * Deep SEO audit wrapping SEO Performance Engine + file heuristics.
 */

import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { CoreSeoPackage } from "@/lib/ai-core/seo/types";
import type { CorePerformanceReport } from "@/lib/ai-core/performance/types";
import type { CoreAssetManifest } from "@/lib/ai-core/layers/types";
import { runSeoPerformanceEngine } from "@/lib/ai-core/seo-performance/engine";
import type {
  SeoAnalysisReport,
  SeoAreaScore,
  SeoAuditArea,
  SeoIssue,
} from "@/lib/ai-core/seo-analysis/types";
import type { WebsiteAnalyticsSummary } from "@/lib/ai-core/analytics/types";

export type RunSeoAnalysisParams = {
  files: GeneratedProjectFile[];
  strategy?: CoreProductStrategy;
  profile?: CoreBusinessProfile;
  industryId?: string | null;
  seoPackage?: CoreSeoPackage | null;
  performanceReport?: CorePerformanceReport | null;
  assetManifest?: CoreAssetManifest | null;
  premiumSeoTopics?: string[];
  premiumKeywords?: string[];
  conversionScore?: number | null;
  analytics?: WebsiteAnalyticsSummary | null;
  generationId?: string;
};

function joinedContent(files: GeneratedProjectFile[]): string {
  return files.map((f) => f.content || "").join("\n");
}

function countMatches(content: string, pattern: RegExp): number {
  return (content.match(pattern) || []).length;
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function issue(
  partial: Omit<SeoIssue, "id"> & { id?: string },
): SeoIssue {
  return {
    id: partial.id || `seo-${partial.area}-${Math.random().toString(36).slice(2, 8)}`,
    ...partial,
  };
}

/**
 * Analyze generated website files for Google + modern SEO readiness.
 */
export function runSeoAnalysis(params: RunSeoAnalysisParams): SeoAnalysisReport {
  const perf = runSeoPerformanceEngine({
    files: params.files,
    strategy: params.strategy,
    profile: params.profile,
    industryId: params.industryId,
    seoPackage: params.seoPackage || undefined,
    performanceReport: params.performanceReport || undefined,
    assetManifest: params.assetManifest || undefined,
    premiumSeoTopics: params.premiumSeoTopics,
    premiumKeywords: params.premiumKeywords,
    conversionScore: params.conversionScore,
  });

  const content = joinedContent(params.files);
  const lower = content.toLowerCase();
  const issues: SeoIssue[] = [];

  // Titles / meta
  const hasTitle =
    /title\s*[:=]|metadata\s*=|<title>|og:title/i.test(content) ||
    Boolean(params.seoPackage?.metadata.title);
  const titleLen = params.seoPackage?.metadata.title?.length || 0;
  const descLen = params.seoPackage?.metadata.description?.length || 0;

  let titleScore = hasTitle ? 78 : 35;
  if (titleLen > 0 && titleLen <= 60) titleScore += 12;
  if (titleLen > 60) {
    titleScore -= 15;
    issues.push(
      issue({
        area: "titles",
        severity: "major",
        title: "SEO title too long",
        detail: `Title is ${titleLen} characters (ideal ≤60).`,
        recommendation: "Shorten the SEO title to under 60 characters with primary keyword first.",
        fixId: "fix-seo-title",
      }),
    );
  }
  if (!hasTitle || titleLen === 0) {
    issues.push(
      issue({
        area: "titles",
        severity: "critical",
        title: "Missing SEO title",
        detail: "No clear page title / metadata title detected.",
        recommendation: "Generate an SEO title with brand + primary keyword.",
        fixId: "fix-seo-title",
      }),
    );
    titleScore = Math.min(titleScore, 40);
  }

  let metaScore = descLen > 0 ? 75 : 30;
  if (descLen >= 120 && descLen <= 160) metaScore += 15;
  if (descLen > 0 && (descLen < 70 || descLen > 165)) {
    issues.push(
      issue({
        area: "meta-descriptions",
        severity: "major",
        title: "Meta description length off-target",
        detail: `Description is ${descLen} characters (ideal 120–160).`,
        recommendation: "Rewrite meta description for CTR with primary keyword and clear CTA.",
        fixId: "fix-meta-description",
      }),
    );
    metaScore -= 12;
  }
  if (descLen === 0) {
    issues.push(
      issue({
        area: "meta-descriptions",
        severity: "critical",
        title: "Missing meta description",
        detail: "Search snippets need a compelling meta description.",
        recommendation: "Generate a 120–160 character meta description.",
        fixId: "fix-meta-description",
      }),
    );
  }

  // Headings
  let headingScore = perf.headingStructure.hasSingleH1 ? 82 : 48;
  if (!perf.headingStructure.hasSingleH1) {
    issues.push(
      issue({
        area: "headings",
        severity: "critical",
        title: "Heading structure needs a single H1",
        detail: perf.headingStructure.issues[0] || `H1 count: ${perf.headingStructure.h1Count}`,
        recommendation: "Use exactly one H1 with the primary keyword; nest H2/H3 for sections.",
        fixId: "fix-headings",
      }),
    );
  }
  if (perf.headingStructure.h2Count < 2) {
    headingScore -= 10;
    issues.push(
      issue({
        area: "headings",
        severity: "minor",
        title: "Thin H2 structure",
        detail: "Few H2 headings detected for topical coverage.",
        recommendation: "Add H2s for services, proof, FAQ, and CTA sections.",
        fixId: "fix-headings",
      }),
    );
  }

  // Keywords
  const primary = perf.keywordPlan.primary.toLowerCase();
  const primaryHits = primary
    ? countMatches(lower, new RegExp(primary.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"))
    : 0;
  let keywordScore = primaryHits >= 2 ? 80 : 50;
  if (primaryHits < 2) {
    issues.push(
      issue({
        area: "keywords",
        severity: "major",
        title: "Primary keyword underused",
        detail: `“${perf.keywordPlan.primary}” appears ${primaryHits} time(s) in generated files.`,
        recommendation: "Weave the primary keyword into H1, intro, and one service section naturally.",
        fixId: "fix-keywords",
      }),
    );
  }

  // Content quality
  const wordApprox = content.split(/\s+/).filter(Boolean).length;
  let contentScore = wordApprox > 800 ? 78 : wordApprox > 400 ? 62 : 42;
  const contentQualityNotes: string[] = [];
  if (wordApprox < 500) {
    contentQualityNotes.push("Content volume is low for competitive ranking.");
    issues.push(
      issue({
        area: "content-quality",
        severity: "major",
        title: "Thin content risk",
        detail: `Approximate word count across files: ${wordApprox}.`,
        recommendation: "Expand service explanations and add FAQ + blog topic clusters.",
        fixId: "fix-faq-section",
      }),
    );
  } else {
    contentQualityNotes.push("Content volume is reasonable for a marketing site.");
  }
  if (!/testimonial|review|case study|client/i.test(content)) {
    contentQualityNotes.push("Trust/proof language is limited.");
    contentScore -= 8;
  }

  // Internal links
  const hrefCount = countMatches(content, /href\s*=\s*["'][^"']+["']/gi);
  const internalLinkNotes: string[] = [];
  let linkScore = hrefCount >= 6 ? 80 : hrefCount >= 3 ? 60 : 40;
  if (hrefCount < 4) {
    internalLinkNotes.push("Few internal links detected between pages/sections.");
    issues.push(
      issue({
        area: "internal-links",
        severity: "major",
        title: "Weak internal linking",
        detail: `Only ~${hrefCount} href links found.`,
        recommendation: "Link homepage CTAs to Pricing, Services, About, and Contact.",
        fixId: "fix-internal-links",
      }),
    );
  } else {
    internalLinkNotes.push(`Detected ~${hrefCount} links — reinforce money-page paths.`);
  }

  // Image alt
  const imgTags = countMatches(content, /<img\b/gi) + countMatches(content, /next\/image|Image\s+from/gi);
  const altCount = countMatches(content, /alt\s*=\s*["'][^"']+["']/gi);
  const imageAltNotes: string[] = [];
  let imageScore = imgTags === 0 ? 70 : clamp((altCount / Math.max(1, imgTags)) * 100);
  if (imgTags > 0 && altCount < imgTags) {
    imageAltNotes.push(`${altCount}/${imgTags} images appear to have alt text.`);
    issues.push(
      issue({
        area: "image-alt",
        severity: "major",
        title: "Missing image alt text",
        detail: "Some images lack descriptive alt attributes for accessibility and image SEO.",
        recommendation: "Generate keyword-aware alt text for hero and product images.",
        fixId: "fix-image-alt",
      }),
    );
  } else {
    imageAltNotes.push("Image alt coverage looks acceptable or no images detected.");
  }

  // Page speed (from performance report + heuristics)
  const pageSpeedNotes: string[] = [];
  let speedScore = perf.scores.performance;
  if (perf.scores.performance < 70) {
    pageSpeedNotes.push("Performance score suggests CWV / asset optimization work.");
    issues.push(
      issue({
        area: "page-speed",
        severity: "major",
        title: "Page speed / CWV risk",
        detail: `Performance score ${perf.scores.performance}/100.`,
        recommendation: "Compress hero media, lazy-load below-fold images, reduce unused JS.",
        fixId: "fix-page-speed",
      }),
    );
  } else {
    pageSpeedNotes.push("Performance signals are in a healthy range for launch.");
  }

  // Mobile
  const mobileNotes: string[] = [];
  let mobileScore = perf.scores.mobile;
  if (perf.scores.mobile < 75) {
    mobileNotes.push("Mobile SEO score needs improvement.");
    issues.push(
      issue({
        area: "mobile-seo",
        severity: "major",
        title: "Mobile SEO gaps",
        detail: `Mobile score ${perf.scores.mobile}/100.`,
        recommendation: "Ensure responsive typography, tap targets, and viewport meta.",
        fixId: "fix-mobile-seo",
      }),
    );
  } else {
    mobileNotes.push("Mobile SEO baseline looks solid.");
  }
  if (params.analytics) {
    const mobileShare =
      params.analytics.devices.find((d) => d.key === "mobile")?.share ?? 0;
    if (mobileShare >= 45 && mobileScore < 85) {
      mobileNotes.push(`${mobileShare}% of analytics traffic is mobile — prioritize mobile fixes.`);
      mobileScore -= 5;
    }
  }

  // Schema
  const schemaNotes: string[] = [];
  const hasOrg = /"@type"\s*:\s*"Organization"|type:\s*"Organization"/i.test(content);
  const hasFaq = /"@type"\s*:\s*"FAQPage"|FAQPage/i.test(content);
  const hasLocal = /LocalBusiness|Restaurant|MedicalBusiness/i.test(content);
  const hasProduct = /"@type"\s*:\s*"Product"|SoftwareApplication/i.test(content);
  let schemaScore = 45;
  if (perf.technicalSeo.hasStructuredData || hasOrg) schemaScore += 20;
  if (hasFaq) schemaScore += 15;
  if (hasLocal || hasProduct) schemaScore += 10;
  schemaScore = clamp(schemaScore);

  if (!perf.technicalSeo.hasStructuredData && !hasOrg) {
    schemaNotes.push("No Organization / WebSite schema detected.");
    issues.push(
      issue({
        area: "schema-markup",
        severity: "critical",
        title: "Missing structured data",
        detail: "Schema.org JSON-LD helps Google and AI search engines understand the brand.",
        recommendation: "Inject Organization, WebSite, FAQ, and industry schema.",
        fixId: "fix-schema-pack",
      }),
    );
  } else {
    schemaNotes.push("Base structured data present.");
  }
  if (!hasFaq) {
    schemaNotes.push("FAQPage schema missing — important for AI Overviews.");
    issues.push(
      issue({
        area: "schema-markup",
        severity: "opportunity",
        title: "Add FAQ schema for AI search",
        detail: "FAQPage markup improves eligibility for rich results and AI answers.",
        recommendation: "Generate FAQ content + FAQPage JSON-LD.",
        fixId: "fix-faq-schema",
      }),
    );
  }

  // AI search / entity-brand
  let aiSearchScore = 55;
  const brand = params.profile?.projectName || "Brand";
  if (lower.includes(brand.toLowerCase())) aiSearchScore += 10;
  if (hasOrg) aiSearchScore += 10;
  if (hasFaq) aiSearchScore += 10;
  if (params.seoPackage?.keywords?.length) aiSearchScore += 5;
  aiSearchScore = clamp(aiSearchScore);
  if (aiSearchScore < 75) {
    issues.push(
      issue({
        area: "ai-search",
        severity: "major",
        title: "AI search / entity signals incomplete",
        detail:
          "Google AI Overviews, ChatGPT Search, Gemini, and Perplexity need clear entities + FAQs.",
        recommendation:
          "Strengthen Organization schema, brand sameAs hints, FAQ answers, and entity-rich copy.",
        fixId: "fix-ai-search",
      }),
    );
  }

  let entityScore = hasOrg ? 72 : 40;
  if (params.profile?.geography) entityScore += 8;
  if (params.profile?.offer) entityScore += 8;
  entityScore = clamp(entityScore);
  if (entityScore < 70) {
    issues.push(
      issue({
        area: "entity-brand",
        severity: "minor",
        title: "Brand knowledge signals weak",
        detail: "Entity clarity (who / what / where) helps AI citation and Knowledge panels.",
        recommendation: "Add About entity copy, areaServed, and Organization knowsAbout topics.",
        fixId: "fix-entity-brand",
      }),
    );
  }

  // Map performance recommendations into issues (dedupe by title)
  const seenTitles = new Set(issues.map((i) => i.title));
  for (const rec of perf.recommendations.slice(0, 8)) {
    if (seenTitles.has(rec.title)) continue;
    seenTitles.add(rec.title);
    const areaMap: Record<string, SeoAuditArea> = {
      "title-meta": "titles",
      headings: "headings",
      keywords: "keywords",
      "technical-seo": "schema-markup",
      "structured-data": "schema-markup",
      images: "image-alt",
      mobile: "mobile-seo",
      "core-web-vitals": "page-speed",
      "content-structure": "content-quality",
      "internal-seo": "internal-links",
      social: "meta-descriptions",
      "lazy-loading": "page-speed",
    };
    issues.push(
      issue({
        id: `perf-${rec.id}`,
        area: areaMap[rec.area] || "content-quality",
        severity: rec.severity,
        title: rec.title,
        detail: rec.detail,
        recommendation: rec.action,
        fixId: `perf-${rec.id}`,
      }),
    );
  }

  const severityRank = { critical: 0, major: 1, minor: 2, opportunity: 3 } as const;
  issues.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);

  const areaScores: SeoAreaScore[] = [
    { area: "titles", score: clamp(titleScore), label: "Titles" },
    { area: "meta-descriptions", score: clamp(metaScore), label: "Meta descriptions" },
    { area: "headings", score: clamp(headingScore), label: "Headings" },
    { area: "keywords", score: clamp(keywordScore), label: "Keywords" },
    { area: "content-quality", score: clamp(contentScore), label: "Content quality" },
    { area: "internal-links", score: clamp(linkScore), label: "Internal links" },
    { area: "image-alt", score: clamp(imageScore), label: "Image alt text" },
    { area: "page-speed", score: clamp(speedScore), label: "Page speed" },
    { area: "mobile-seo", score: clamp(mobileScore), label: "Mobile SEO" },
    { area: "schema-markup", score: clamp(schemaScore), label: "Schema markup" },
    { area: "ai-search", score: clamp(aiSearchScore), label: "AI search" },
    { area: "entity-brand", score: clamp(entityScore), label: "Entity / brand" },
  ];

  const overallScore = clamp(
    areaScores.reduce((s, a) => s + a.score, 0) / areaScores.length * 0.55 +
      perf.scores.overall * 0.45,
  );

  const brandName = params.profile?.projectName || "Website";
  const summary = `${brandName} SEO analysis: ${overallScore}/100. ${
    issues.filter((i) => i.severity === "critical" || i.severity === "major").length
  } high-priority issues. Primary keyword “${perf.keywordPlan.primary}”. Optimize for Google Search + AI Overviews.`;

  return {
    generationId: params.generationId,
    overallScore,
    areaScores,
    issues: issues.slice(0, 24),
    keywordPlan: perf.keywordPlan,
    headingStructure: perf.headingStructure,
    technicalSeo: perf.technicalSeo,
    performanceReport: perf,
    contentQualityNotes,
    internalLinkNotes,
    imageAltNotes,
    pageSpeedNotes,
    mobileNotes,
    schemaNotes,
    summary,
    generatedAt: new Date().toISOString(),
  };
}
