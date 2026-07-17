import { buildSeoHealthReport } from "@/lib/seo/health";
import { validateSchema } from "@/lib/ai-search/schema-validator";
import { analyzeAeo } from "@/lib/ai-search/aeo";
import { analyzeGeo } from "@/lib/ai-search/geo";
import { REF_FAQ, MARKETING_PRODUCTS } from "@/lib/constants/marketing-content";
import { getPublishedProgrammaticPages, getProgrammaticPageDefs } from "@/lib/seo/programmatic";
import { getPublishedCities } from "@/lib/seo/cities";
import { getKnowledgeEntries } from "@/lib/seo/knowledge";
import { AI_SEARCH_ENGINES, clampScore, gradeFromScore } from "@/lib/ai-search/utils";
import type { AiVisibilityDashboard } from "@/types/ai-search";

export function buildAiVisibilityDashboard(): AiVisibilityDashboard {
  const health = buildSeoHealthReport();
  const schema = validateSchema();
  const sampleContent = [
    ...REF_FAQ.map((f) => `${f.question}\n${f.answer}`),
    ...getPublishedProgrammaticPages().flatMap((p) => [p.title, p.description, ...(p.body ?? [])]),
  ].join("\n\n");

  const aeo = analyzeAeo({
    title: "Trend Business AI — AI Business Planning Workspace",
    description: health.siteUrl,
    path: "/",
    content: sampleContent.slice(0, 12000),
    headings: [
      "What is Trend Business AI?",
      "How does AI Search optimization work?",
      ...REF_FAQ.slice(0, 4).map((f) => f.question),
    ],
    faqs: REF_FAQ.map((f) => ({ question: f.question, answer: f.answer })),
    internalLinkCount: Math.min(20, health.counts.publicRoutes),
  });

  const geo = analyzeGeo({
    title: "Trend Business AI",
    description: "AI business planning workspace",
    path: "/",
    content: sampleContent.slice(0, 12000),
    brandName: "Trend Business AI",
  });

  const technical = clampScore(
    (health.checks.find((c) => c.id === "sitemap-coverage")?.status === "pass" ? 30 : 18) +
      (health.checks.find((c) => c.id === "specialized-sitemaps")?.status === "pass" ? 25 : 15) +
      (health.checks.find((c) => c.id === "site-url")?.status === "pass" ? 25 : 10) +
      (health.checks.find((c) => c.id === "hreflang")?.status === "pass" ? 20 : 10),
  );

  const contentQuality = clampScore(
    (health.counts.blogPosts >= 1 ? 25 : 10) +
      (health.counts.products >= 10 ? 25 : 15) +
      (health.counts.programmaticPublished >= 3 ? 25 : 12) +
      (health.counts.knowledgePublished >= 1 ? 25 : 10),
  );

  const structuredData = schema.score;
  const seo = health.score;
  const overall = clampScore(
    seo * 0.25 + aeo.score * 0.2 + geo.score * 0.2 + technical * 0.15 + contentQuality * 0.1 + structuredData * 0.1,
  );

  const checks = [
    ...health.checks.map((c) => ({
      id: `seo-${c.id}`,
      label: c.label,
      status: c.status,
      detail: c.detail,
    })),
    ...schema.platformCoverage.map((c) => ({
      id: `schema-${c.type}`,
      label: `Schema: ${c.type}`,
      status: c.status,
      detail: c.detail,
    })),
    {
      id: "aeo-site",
      label: "Sitewide AEO readiness",
      status: aeo.score >= 75 ? ("pass" as const) : aeo.score >= 55 ? ("warn" as const) : ("fail" as const),
      detail: `AEO score ${aeo.score}/100`,
    },
    {
      id: "geo-site",
      label: "Sitewide GEO readiness",
      status: geo.score >= 75 ? ("pass" as const) : geo.score >= 55 ? ("warn" as const) : ("fail" as const),
      detail: `GEO score ${geo.score}/100`,
    },
  ];

  const engineCoverage = AI_SEARCH_ENGINES.map((engine) => {
    let readiness = overall;
    let notes = "Shared foundation: structured data, entities, FAQs, sitemaps.";
    if (engine.id === "google" || engine.id === "google-ai") {
      readiness = clampScore(seo * 0.5 + technical * 0.3 + structuredData * 0.2);
      notes = "Weighted toward technical SEO, sitemaps and schema.";
    } else if (engine.id === "perplexity" || engine.id === "chatgpt" || engine.id === "copilot") {
      readiness = clampScore(aeo.score * 0.45 + geo.score * 0.4 + contentQuality * 0.15);
      notes = "Weighted toward answer-first content, FAQs and citation readiness.";
    } else if (engine.id === "gemini" || engine.id === "claude") {
      readiness = clampScore(geo.score * 0.5 + aeo.score * 0.3 + structuredData * 0.2);
      notes = "Weighted toward entity graph, semantic coverage and schema.";
    }
    const status = readiness >= 75 ? ("pass" as const) : readiness >= 55 ? ("warn" as const) : ("fail" as const);
    return { engine: engine.label, readiness, status, notes };
  });

  const knowledge = getKnowledgeEntries();
  const programmaticAll = getProgrammaticPageDefs();

  return {
    generatedAt: new Date().toISOString(),
    siteUrl: health.siteUrl,
    isProduction: health.isProduction,
    scores: {
      overall,
      seo,
      aeo: aeo.score,
      geo: geo.score,
      technical,
      contentQuality,
      structuredData,
      grade: gradeFromScore(overall),
    },
    checks,
    engineCoverage,
    counts: {
      publicRoutes: health.counts.publicRoutes,
      sitemapUrls: health.counts.sitemapUrls,
      products: MARKETING_PRODUCTS.length,
      programmaticPublished: health.counts.programmaticPublished,
      programmaticDraft: programmaticAll.length - health.counts.programmaticPublished,
      industries: health.counts.industries,
      countries: health.counts.countries,
      cities: getPublishedCities().length,
      knowledgePublished: knowledge.filter((k) => k.status === "published").length,
      knowledgeDraft: knowledge.filter((k) => k.status === "draft").length,
      faqItems: REF_FAQ.length,
      schemaTypesAvailable: schema.platformCoverage.filter((c) => c.available).length,
    },
  };
}
