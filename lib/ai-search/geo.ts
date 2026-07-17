import { z } from "zod";
import { SITE_NAME } from "@/lib/seo/site";
import { getPublishedProgrammaticPages } from "@/lib/seo/programmatic";
import { getPublishedIndustries } from "@/lib/seo/industries";
import { MARKETING_PRODUCTS } from "@/lib/constants/marketing-content";
import {
  BRAND_ENTITIES,
  clampScore,
  gradeFromScore,
  wordCount,
} from "@/lib/ai-search/utils";
import type { AiSearchIssue, GeoAnalyzeResult } from "@/types/ai-search";

export const geoAnalyzeBodySchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  path: z.string().max(300).optional(),
  content: z.string().max(30000).optional(),
  brandName: z.string().max(120).optional(),
  entities: z.array(z.string().max(80)).max(40).optional(),
  useAi: z.boolean().optional(),
});

export type GeoAnalyzeBody = z.infer<typeof geoAnalyzeBodySchema>;

function detectEntities(text: string, extra: string[] = []): string[] {
  const hay = text.toLowerCase();
  const found = new Set<string>();
  for (const entity of [...BRAND_ENTITIES, ...extra]) {
    if (hay.includes(entity.toLowerCase())) found.add(entity);
  }
  for (const product of MARKETING_PRODUCTS) {
    if (hay.includes(product.title.toLowerCase()) || hay.includes(product.slug.replace(/-/g, " "))) {
      found.add(product.title);
    }
  }
  return Array.from(found).slice(0, 24);
}

export function analyzeGeo(input: GeoAnalyzeBody): GeoAnalyzeResult {
  const issues: AiSearchIssue[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const brand = input.brandName?.trim() || SITE_NAME;
  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const content = input.content?.trim() ?? "";
  const path = input.path?.trim() ?? "";
  const text = [title, description, content, path].join("\n");
  const words = wordCount(content);
  const entitiesDetected = detectEntities(text, input.entities ?? []);
  const brandMentions =
    (text.toLowerCase().match(new RegExp(brand.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? [])
      .length;

  const programmatic = getPublishedProgrammaticPages();
  const industries = getPublishedIndustries();
  const topicClusters = Array.from(
    new Set([
      ...programmatic.map((p) => p.cluster),
      ...industries.map((i) => i.slug),
      ...MARKETING_PRODUCTS.map((p) => p.categoryId),
    ]),
  );

  const entityCoverage = clampScore((entitiesDetected.length / Math.max(BRAND_ENTITIES.length * 0.45, 1)) * 100);
  if (entityCoverage < 40) {
    score -= 14;
    issues.push({
      id: "entity-coverage",
      severity: "critical",
      message: "Entity coverage is weak for generative engines.",
      recommendation: "Mention product entities, category terms and brand aliases clearly.",
    });
  } else {
    strengths.push("Entity coverage supports GEO grounding.");
  }

  const semanticHits = MARKETING_PRODUCTS.filter((p) =>
    text.toLowerCase().includes(p.slug.replace(/-/g, " ")) ||
    text.toLowerCase().includes(p.title.toLowerCase().slice(0, 18)),
  ).length;
  const semanticRelevance = clampScore((semanticHits / Math.max(MARKETING_PRODUCTS.length * 0.25, 1)) * 100);
  if (semanticRelevance < 35) {
    score -= 10;
    issues.push({
      id: "semantic-relevance",
      severity: "warning",
      message: "Semantic relevance to product graph is limited.",
      recommendation: "Align copy with product and industry terminology already in the SEO graph.",
    });
  } else {
    strengths.push("Semantic relevance to the product graph looks healthy.");
  }

  if (brandMentions === 0) {
    score -= 12;
    issues.push({
      id: "brand-authority",
      severity: "warning",
      message: "Brand name is absent from the analyzed text.",
      recommendation: `Include “${brand}” early and consistently for citation attribution.`,
    });
  } else if (brandMentions >= 2) {
    strengths.push("Brand authority signals are present.");
  }

  const topicClusterStrength = clampScore(40 + topicClusters.length * 6);
  if (programmatic.length < 3) {
    score -= 8;
    issues.push({
      id: "topic-clusters",
      severity: "warning",
      message: "Published topic clusters are still limited.",
      recommendation: "Publish more use-case, comparison and industry pages with unique intent.",
    });
  } else {
    strengths.push("Topic cluster foundation is active.");
  }

  const citationReadiness = clampScore(
    (entitiesDetected.length >= 3 ? 30 : 10) +
      (brandMentions > 0 ? 25 : 0) +
      (words >= 200 ? 25 : words >= 80 ? 15 : 0) +
      (description.length >= 80 ? 20 : 5),
  );
  if (citationReadiness < 55) {
    score -= 10;
    issues.push({
      id: "citation-readiness",
      severity: "warning",
      message: "Page is not yet citation-ready for generative engines.",
      recommendation: "Add definitive statements, entity clarity and source-worthy explanations.",
    });
  } else {
    strengths.push("Citation readiness is improving.");
  }

  const aiDiscoverability = clampScore(
    (path ? 20 : 0) +
      (title.length >= 25 ? 20 : 8) +
      Math.min(30, programmatic.length * 4) +
      Math.min(30, entitiesDetected.length * 5),
  );
  if (aiDiscoverability < 50) {
    score -= 8;
    issues.push({
      id: "ai-discoverability",
      severity: "info",
      message: "AI discoverability signals need reinforcement.",
      recommendation: "Strengthen titles, entities and cluster linking for LLM retrieval.",
    });
  }

  score = clampScore(score);

  if (entityCoverage < 70) recommendations.push("Expand entity mentions across products, categories and brand.");
  if (citationReadiness < 70) recommendations.push("Add quotable definitions and evidence-style statements.");
  if (programmatic.length < 5) recommendations.push("Grow published programmatic clusters to reinforce topical authority.");
  recommendations.push("Cross-link industry, use-case and product pages so generative engines can map your entity graph.");

  return {
    score,
    grade: gradeFromScore(score),
    issues: issues.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 } as const;
      return order[a.severity] - order[b.severity];
    }),
    strengths,
    metrics: {
      entityCoverage,
      semanticRelevance,
      brandMentions,
      topicClusterStrength,
      citationReadiness,
      aiDiscoverability,
    },
    entitiesDetected,
    topicClusters,
    recommendations: recommendations.slice(0, 8),
    source: "rules",
  };
}

export async function enrichGeoWithAi(
  result: GeoAnalyzeResult,
  input: GeoAnalyzeBody,
): Promise<GeoAnalyzeResult> {
  try {
    const { providerManager } = await import("@/lib/ai/provider-manager");
    const providerName = providerManager.resolve();
    if (!providerName) return result;

    const insights = await providerManager.generateText(
      {
        system:
          "You are a Generative Engine Optimization (GEO) strategist. Optimize for ChatGPT, Gemini, Claude, Perplexity and Copilot citations. 4-6 concise sentences. No markdown headings.",
        prompt: `GEO score ${result.score}/100 (${result.grade})
Title: ${input.title ?? ""}
Entities: ${result.entitiesDetected.join(", ") || "none"}
Issues: ${result.issues
          .slice(0, 5)
          .map((i) => i.message)
          .join("; ")}
Excerpt: ${(input.content ?? "").slice(0, 900)}

Recommend GEO improvements for generative AI search.`,
        temperature: 0.35,
      },
      providerName,
    );

    return { ...result, aiInsights: insights.trim(), source: "rules+ai" };
  } catch {
    return result;
  }
}
