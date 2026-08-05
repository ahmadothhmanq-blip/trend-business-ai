import { randomUUID } from "node:crypto";
import type {
  ReviewInsights,
  ReviewIssue,
  ReviewOutput,
  ReviewStudioInput,
  WebsiteAnalysis,
} from "@/lib/website/review-studio/types";
import type { WqbsBenchmarkReport } from "@/lib/website/quality-benchmark";

const DIMENSION_TO_AREA: Record<string, import("@/lib/website/review-studio/types").ReviewArea> = {
  layout: "hero",
  sections: "content",
  components: "content",
  businessLogic: "cta",
  seo: "seo",
  accessibility: "accessibility",
  performance: "performance",
  content: "content",
  conversion: "cta",
  brandConsistency: "trust",
};

function priorityFromScore(score: number): import("@/lib/website/review-studio/types").ReviewPriority {
  if (score < 45) return "critical";
  if (score < 55) return "high";
  if (score < 65) return "medium";
  if (score < 75) return "low";
  return "nice-to-have";
}

function targetFilesForArea(
  area: import("@/lib/website/review-studio/types").ReviewArea,
  files: ReviewStudioInput["files"],
): string[] {
  const paths = files.map((f) => f.path);
  const areaPatterns: Record<string, RegExp> = {
    hero: /page\.(tsx|jsx)|layout/i,
    navigation: /layout|nav|header/i,
    cta: /page\.(tsx|jsx)|hero|cta/i,
    seo: /layout|page\.(tsx|jsx)|metadata/i,
    accessibility: /layout|globals\.css/i,
    performance: /globals\.css|page\.(tsx|jsx)/i,
    content: /page\.(tsx|jsx)/i,
    forms: /contact|form|page/i,
    footer: /footer|layout/i,
    pricing: /pricing|page/i,
    testimonials: /page|testimonial/i,
    trust: /page|about/i,
    localization: /layout/i,
  };
  const pattern = areaPatterns[area] ?? /page/i;
  return paths.filter((p) => pattern.test(p)).slice(0, 3);
}

export function detectIssues(
  analysis: WebsiteAnalysis,
  benchmark: WqbsBenchmarkReport,
  input: ReviewStudioInput,
): ReviewIssue[] {
  const issues: ReviewIssue[] = [];

  for (const dim of analysis.dimensions) {
    if (dim.score >= 75) continue;
    const area = DIMENSION_TO_AREA[dim.dimension] ?? "content";
    for (const issueText of dim.issues) {
      issues.push({
        id: randomUUID(),
        area,
        priority: priorityFromScore(dim.score),
        title: `${dim.dimension}: ${issueText}`,
        description: issueText,
        affectedFiles: targetFilesForArea(area, input.files),
        dimension: dim.dimension,
      });
    }
  }

  for (const cat of benchmark.categories) {
    for (const sub of cat.subDimensions) {
      if (sub.score >= 75) continue;
      for (const issueText of sub.issues) {
        issues.push({
          id: randomUUID(),
          area: mapCategoryToArea(cat.category),
          priority: priorityFromScore(sub.score),
          title: `${sub.label}: ${issueText}`,
          description: issueText,
          affectedFiles: targetFilesForArea(mapCategoryToArea(cat.category), input.files),
          dimension: "content",
        });
      }
    }
  }

  return dedupeIssues(issues).slice(0, 32);
}

function mapCategoryToArea(
  category: string,
): import("@/lib/website/review-studio/types").ReviewArea {
  const map: Record<string, import("@/lib/website/review-studio/types").ReviewArea> = {
    visualDesign: "hero",
    userExperience: "navigation",
    business: "cta",
    seo: "seo",
    performance: "performance",
    accessibility: "accessibility",
    content: "content",
    localization: "localization",
  };
  return map[category] ?? "content";
}

function dedupeIssues(issues: ReviewIssue[]): ReviewIssue[] {
  const seen = new Set<string>();
  return issues.filter((i) => {
    const key = `${i.area}:${i.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function buildReviewInsights(
  analysis: WebsiteAnalysis,
  benchmark: WqbsBenchmarkReport,
  input: ReviewStudioInput,
): ReviewInsights {
  const strengths = [
    ...benchmark.strengths.slice(0, 4),
    ...analysis.dimensions
      .filter((d) => d.score >= 80)
      .map((d) => `${d.dimension}: strong (${d.score}/100)`),
  ].slice(0, 8);

  const weaknesses = [
    ...benchmark.weaknesses.slice(0, 4),
    ...analysis.dimensions
      .filter((d) => d.score < 65)
      .map((d) => `${d.dimension}: needs work (${d.score}/100)`),
  ].slice(0, 8);

  const businessInsights = [
    analysis.detectedSections.includes("pricing")
      ? "Pricing section detected — good for B2B/SaaS conversion"
      : "Consider adding a pricing section for transparent conversion",
    analysis.detectedSections.includes("testimonials")
      ? "Social proof present — strengthens trust"
      : "Add testimonials or client logos to build credibility",
    input.businessProfile?.industry
      ? `Industry context: ${input.businessProfile.industry}`
      : input.industryId
        ? `Industry: ${input.industryId}`
        : "Define industry context for sharper business copy",
  ];

  const technicalInsights = [
    `Pages: ${analysis.pageCount} · Files: ${analysis.fileCount} · Components: ${analysis.componentCount}`,
    benchmark.scores.performance < 70
      ? "Performance optimizations recommended (lazy loading, bundle size)"
      : "Performance within acceptable range",
    benchmark.scores.accessibility < 70
      ? "Accessibility improvements needed (WCAG, ARIA, focus states)"
      : "Accessibility baseline met",
    input.upstreamContext?.awqeScore
      ? `AWQE pre-build score: ${input.upstreamContext.awqeScore}/100`
      : null,
  ].filter(Boolean) as string[];

  const designInsights = [
    benchmark.scores.visualDesign >= 75
      ? "Visual design hierarchy is well structured"
      : "Improve layout hierarchy, spacing, and typography consistency",
    analysis.detectedSections.includes("hero")
      ? "Hero section detected — ensure single H1 and clear CTA"
      : "Add a hero section with value proposition and primary CTA",
    input.designSystem?.colors?.primary
      ? "Design system colors provided — verify token usage in CSS"
      : "Consider defining design tokens for brand consistency",
  ];

  const overallReview = [
    `Overall quality score: ${benchmark.scores.overall}/100.`,
    benchmark.gateStatus === "pass"
      ? "This website meets the quality gate."
      : benchmark.gateStatus === "review"
        ? "This website is borderline — targeted improvements recommended."
        : "This website is below the quality gate — prioritize critical fixes.",
    `Detected ${analysis.detectedSections.length} sections across ${analysis.pageCount} page(s).`,
    weaknesses.length > 0
      ? `Key areas to address: ${weaknesses.slice(0, 2).join("; ")}.`
      : "No critical weaknesses detected.",
  ].join(" ");

  return {
    overallReview,
    strengths,
    weaknesses,
    businessInsights,
    technicalInsights,
    designInsights,
  };
}

export function buildReviewOutput(input: {
  analysis: WebsiteAnalysis;
  benchmark: WqbsBenchmarkReport;
  issues: ReviewIssue[];
  improvements: import("@/lib/website/review-studio/types").StudioImprovement[];
  studioInput: ReviewStudioInput;
}): ReviewOutput {
  const insights = buildReviewInsights(input.analysis, input.benchmark, input.studioInput);

  const expectedResults = input.improvements
    .filter((i) => i.priority === "critical" || i.priority === "high")
    .slice(0, 5)
    .map(
      (i) =>
        `${i.title}: +${i.impact.qualityGain} quality, +${i.impact.seoGain} SEO, +${i.impact.conversionGain} conversion (est.)`,
    );

  return {
    overallScore: input.benchmark.scores.overall,
    categoryScores: input.benchmark.scores,
    insights,
    issues: input.issues,
    improvements: input.improvements,
    expectedResults,
  };
}
