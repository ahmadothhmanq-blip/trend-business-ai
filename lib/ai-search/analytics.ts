import { MARKETING_PRODUCTS, REF_FAQ } from "@/lib/constants/marketing-content";
import { getPublishedBlogPosts } from "@/lib/seo/content/blog";
import { getPublishedCountries } from "@/lib/seo/countries";
import { getPublishedIndustries } from "@/lib/seo/industries";
import { getCities, getPublishedCities } from "@/lib/seo/cities";
import { getKnowledgeEntries } from "@/lib/seo/knowledge";
import {
  getProgrammaticPageDefs,
  getPublishedProgrammaticPages,
} from "@/lib/seo/programmatic";
import { PUBLIC_ROUTES } from "@/lib/seo/site";
import { getTemplateCatalog } from "@/lib/seo/content/templates";
import { clampScore } from "@/lib/ai-search/utils";
import type { AiSearchAnalytics } from "@/types/ai-search";

type ScoredPage = {
  path: string;
  title: string;
  score: number;
  reasons: string[];
  gaps: string[];
};

function scoreRoute(path: string, title: string, description: string): ScoredPage {
  const reasons: string[] = [];
  const gaps: string[] = [];
  let score = 40;

  if (title.length >= 25) {
    score += 15;
    reasons.push("Descriptive title");
  } else gaps.push("Strengthen title specificity");

  if (description.length >= 80) {
    score += 20;
    reasons.push("Solid description depth");
  } else gaps.push("Expand description to 80+ characters");

  if (path.split("/").filter(Boolean).length >= 2) {
    score += 10;
    reasons.push("Clear URL hierarchy");
  }

  if (/product|use-case|industry|service|compare|learn|docs|faq|blog/.test(path)) {
    score += 10;
    reasons.push("High-intent cluster path");
  }

  if (description.length < 40) score -= 10;
  return { path, title, score: clampScore(score), reasons, gaps };
}

export function buildAiSearchAnalytics(): AiSearchAnalytics {
  const products = MARKETING_PRODUCTS;
  const programmatic = getProgrammaticPageDefs();
  const publishedProgrammatic = getPublishedProgrammaticPages();
  const industries = getPublishedIndustries();
  const countries = getPublishedCountries();
  const cities = getCities();
  const knowledge = getKnowledgeEntries();
  const blog = getPublishedBlogPosts();
  const templates = getTemplateCatalog();

  const scored: ScoredPage[] = [
    ...PUBLIC_ROUTES.map((route) =>
      scoreRoute(route.path, route.path === "/" ? "Home" : route.path, route.path),
    ),
    ...products.map((p) =>
      scoreRoute(`/products/${p.slug}`, p.title, p.description),
    ),
    ...programmatic.map((p) => scoreRoute(p.path, p.title, p.description)),
    ...industries.map((i) => scoreRoute(`/industries/${i.slug}`, i.title, i.description)),
    ...countries.map((c) => scoreRoute(`/countries/${c.slug}`, c.title, c.description)),
    ...knowledge.map((k) => scoreRoute(k.path, k.title, k.description)),
    ...blog.map((b) => scoreRoute(b.path, b.title, b.description)),
  ];

  // Dedupe by path keeping highest score
  const byPath = new Map<string, ScoredPage>();
  for (const page of scored) {
    const prev = byPath.get(page.path);
    if (!prev || page.score > prev.score) byPath.set(page.path, page);
  }
  const unique = Array.from(byPath.values()).sort((a, b) => b.score - a.score);

  const topicSignals = [
    ...publishedProgrammatic.map((p) => ({
      topic: p.intent,
      signal: 70 + Math.min(25, Math.floor(p.description.length / 10)),
      sources: [p.cluster, p.path],
    })),
    ...products.map((p) => ({
      topic: p.title,
      signal: 80,
      sources: ["products", `/products/${p.slug}`],
    })),
    ...REF_FAQ.slice(0, 8).map((f) => ({
      topic: f.question,
      signal: 65,
      sources: ["faq", "/faq"],
    })),
    ...industries.map((i) => ({
      topic: i.intent,
      signal: 72,
      sources: ["industries", `/industries/${i.slug}`],
    })),
  ].sort((a, b) => b.signal - a.signal);

  const contentOpportunities = [
    ...programmatic
      .filter((p) => p.status === "draft")
      .map((p) => ({
        id: p.id,
        title: p.title,
        cluster: p.cluster,
        priority: "high" as const,
      })),
    ...cities
      .filter((c) => c.status === "draft")
      .map((c) => ({
        id: `city-${c.slug}`,
        title: c.title,
        cluster: "cities",
        priority: "medium" as const,
      })),
    ...knowledge
      .filter((k) => k.status === "draft")
      .map((k) => ({
        id: k.id,
        title: k.title,
        cluster: k.kind,
        priority: "medium" as const,
      })),
  ];

  const coveredIntents = new Set(publishedProgrammatic.map((p) => p.intent.toLowerCase()));
  const keywordOpportunities = [
    ...publishedProgrammatic.map((p) => ({
      keyword: p.intent,
      intent: p.cluster,
      coverage: "covered" as const,
    })),
    ...programmatic
      .filter((p) => p.status === "draft")
      .map((p) => ({
        keyword: p.intent,
        intent: p.cluster,
        coverage: "partial" as const,
      })),
    ...[
      "ai website builder vs framer",
      "ai logo maker for agencies",
      "feasibility study generator",
      "ai search optimization platform",
    ]
      .filter((kw) => !Array.from(coveredIntents).some((i) => kw.includes(i) || i.includes(kw.slice(0, 12))))
      .map((keyword) => ({
        keyword,
        intent: "opportunity",
        coverage: "missing" as const,
      })),
  ];

  return {
    generatedAt: new Date().toISOString(),
    mostSearchedTopics: topicSignals.slice(0, 12),
    topPerformingPages: unique.slice(0, 10).map(({ path, title, score, reasons }) => ({
      path,
      title,
      score,
      reasons,
    })),
    aiReadyPages: unique
      .filter((p) => p.score >= 75)
      .slice(0, 12)
      .map(({ path, title, score }) => ({ path, title, score })),
    weakPages: unique
      .filter((p) => p.score < 60)
      .slice(-12)
      .reverse()
      .map(({ path, title, score, gaps }) => ({ path, title, score, gaps })),
    contentOpportunities: contentOpportunities.slice(0, 16),
    keywordOpportunities: keywordOpportunities.slice(0, 16),
    searchTrends: [
      {
        label: "Programmatic SEO clusters",
        direction: publishedProgrammatic.length >= 5 ? "up" : "opportunity",
        detail: `${publishedProgrammatic.length} published programmatic pages`,
      },
      {
        label: "Industry coverage",
        direction: industries.length >= 3 ? "stable" : "opportunity",
        detail: `${industries.length} published industries`,
      },
      {
        label: "Knowledge depth",
        direction: knowledge.filter((k) => k.status === "published").length >= 3 ? "up" : "opportunity",
        detail: `${knowledge.filter((k) => k.status === "published").length} published knowledge entries`,
      },
      {
        label: "Local / city pages",
        direction: getPublishedCities().length > 0 ? "up" : "opportunity",
        detail: `${getPublishedCities().length} published / ${cities.length} total city defs`,
      },
      {
        label: "Template & product graph",
        direction: templates.length + products.length >= 15 ? "stable" : "opportunity",
        detail: `${products.length} products · ${templates.length} templates`,
      },
      {
        label: "FAQ answer surface",
        direction: REF_FAQ.length >= 5 ? "up" : "opportunity",
        detail: `${REF_FAQ.length} FAQ items on /faq`,
      },
    ],
  };
}
