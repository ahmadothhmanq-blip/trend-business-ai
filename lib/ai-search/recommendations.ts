import { buildAiVisibilityDashboard } from "@/lib/ai-search/visibility";
import { buildAiSearchAnalytics } from "@/lib/ai-search/analytics";
import { buildProgrammaticManagerInventory } from "@/lib/ai-search/programmatic-manager";
import { buildKnowledgeManagerInventory } from "@/lib/ai-search/knowledge-manager";
import { buildCompetitorIntelligence } from "@/lib/ai-search/competitors";
import { validateSchema } from "@/lib/ai-search/schema-validator";
import { clampScore } from "@/lib/ai-search/utils";
import type { AiSearchRecommendation } from "@/types/ai-search";

export function buildAiSearchRecommendations(): AiSearchRecommendation[] {
  const visibility = buildAiVisibilityDashboard();
  const analytics = buildAiSearchAnalytics();
  const programmatic = buildProgrammaticManagerInventory();
  const knowledge = buildKnowledgeManagerInventory();
  const competitors = buildCompetitorIntelligence();
  const schema = validateSchema();

  const recs: AiSearchRecommendation[] = [];
  let i = 0;
  const push = (item: Omit<AiSearchRecommendation, "id">) => {
    recs.push({ id: `rec-${++i}`, ...item });
  };

  if (visibility.scores.aeo < 80) {
    push({
      category: "ai-search",
      priority: visibility.scores.aeo < 60 ? "critical" : "high",
      title: "Raise AEO score with answer-first FAQs",
      detail: `Current AEO score is ${visibility.scores.aeo}. Expand question coverage and direct answers.`,
      actionHref: "/faq",
    });
  }
  if (visibility.scores.geo < 80) {
    push({
      category: "ai-search",
      priority: "high",
      title: "Strengthen GEO entity coverage",
      detail: `Current GEO score is ${visibility.scores.geo}. Reinforce brand and product entities across clusters.`,
      actionHref: "/products/create",
    });
  }

  for (const gap of schema.platformCoverage.filter((c) => c.status !== "pass").slice(0, 4)) {
    push({
      category: "schema",
      priority: gap.status === "fail" ? "critical" : "medium",
      title: `Improve ${gap.type} schema coverage`,
      detail: gap.detail,
    });
  }

  for (const opp of analytics.contentOpportunities.slice(0, 5)) {
    push({
      category: "pages",
      priority: opp.priority === "high" ? "high" : "medium",
      title: `Publish opportunity: ${opp.title}`,
      detail: `Cluster “${opp.cluster}” has an unpublished or draft opportunity.`,
    });
  }

  for (const kw of analytics.keywordOpportunities.filter((k) => k.coverage === "missing").slice(0, 4)) {
    push({
      category: "keywords",
      priority: "medium",
      title: `Target keyword: ${kw.keyword}`,
      detail: "No published programmatic intent currently covers this opportunity.",
    });
  }

  for (const weak of analytics.weakPages.slice(0, 4)) {
    push({
      category: "content",
      priority: "medium",
      title: `Improve weak page ${weak.path}`,
      detail: weak.gaps.join(" · ") || `Score ${weak.score}/100`,
      actionHref: weak.path,
    });
  }

  for (const gap of knowledge.gaps.slice(0, 4)) {
    push({
      category: "faq",
      priority: gap.priority === "high" ? "high" : "low",
      title: `Knowledge gap: ${gap.kind}`,
      detail: gap.message,
      actionHref: "/learn",
    });
  }

  if (programmatic.duplicates.length) {
    push({
      category: "pages",
      priority: "high",
      title: "Resolve programmatic duplicate risks",
      detail: `${programmatic.duplicates.length} duplicate/intent conflicts detected.`,
    });
  }

  for (const linkHint of analytics.aiReadyPages.slice(0, 2)) {
    push({
      category: "internal-links",
      priority: "low",
      title: `Amplify internal links to ${linkHint.path}`,
      detail: "AI-ready page should receive contextual links from related clusters.",
      actionHref: linkHint.path,
    });
  }

  for (const opportunity of competitors.recommendations.slice(0, 3)) {
    push({
      category: "ai-search",
      priority: "medium",
      title: "Competitive AI search move",
      detail: opportunity,
    });
  }

  const priorityRank = { critical: 0, high: 1, medium: 2, low: 3 } as const;
  return recs.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority]).slice(0, 30);
}

export function buildAiSearchDashboardPayload() {
  const visibility = buildAiVisibilityDashboard();
  const analytics = buildAiSearchAnalytics();
  const programmatic = buildProgrammaticManagerInventory();
  const knowledge = buildKnowledgeManagerInventory();
  const competitors = buildCompetitorIntelligence();
  const recommendations = buildAiSearchRecommendations();

  const readinessScore = clampScore(
    visibility.scores.overall * 0.55 +
      (100 - Math.min(40, programmatic.duplicates.length * 8)) * 0.15 +
      (knowledge.gaps.length === 0 ? 90 : Math.max(40, 90 - knowledge.gaps.length * 8)) * 0.15 +
      (recommendations.filter((r) => r.priority === "critical").length === 0 ? 90 : 55) * 0.15,
  );

  return {
    visibility,
    analytics,
    programmatic,
    knowledge,
    competitors,
    recommendations,
    readinessScore,
  };
}
