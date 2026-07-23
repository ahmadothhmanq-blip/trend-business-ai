/**
 * Read-only SEO Engine bridge — does not modify SEO service files.
 */

import { analyzeSeo } from "@/lib/seo/analyzer";

export type MarketingSeoInsights = {
  score: number;
  grade: string;
  keywordSuggestions: string[];
  contentIdeas: string[];
  competitorInsights: string[];
  issues: Array<{ severity: string; message: string; recommendation: string }>;
};

export function getMarketingSeoInsights(input: {
  topic: string;
  content?: string;
  keywords?: string[];
}): MarketingSeoInsights {
  const result = analyzeSeo({
    title: input.topic,
    content: input.content ?? input.topic,
    keywords: input.keywords ?? [],
    headings: input.content ? [input.topic] : [],
    hasH1: true,
  });

  const words = input.topic.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
  const keywordSuggestions = [
    ...words.map((w) => `${w} strategy`),
    ...words.map((w) => `best ${w}`),
    `${input.topic} guide`,
    `${input.topic} tips`,
  ].slice(0, 8);

  const contentIdeas = result.issues
    .filter((i) => i.severity !== "critical")
    .map((i) => `Blog: ${i.recommendation}`)
    .slice(0, 5);

  const competitorInsights = [
    "Analyze top 3 SERP competitors for content gaps",
    "Compare backlink profiles for authority keywords",
    `Target long-tail variations of "${input.topic}"`,
  ];

  return {
    score: result.score,
    grade: result.grade,
    keywordSuggestions,
    contentIdeas: contentIdeas.length ? contentIdeas : [`How to ${input.topic}`, `${input.topic} checklist`],
    competitorInsights,
    issues: result.issues.map((i) => ({
      severity: i.severity,
      message: i.message,
      recommendation: i.recommendation,
    })),
  };
}
