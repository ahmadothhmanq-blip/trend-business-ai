import { detectCtaQuality } from "@/lib/ai-core/semantic-content-quality/detectors/cta-quality";
import { detectCrossPageConsistency } from "@/lib/ai-core/semantic-content-quality/detectors/cross-page-consistency";
import { detectGenericCopy } from "@/lib/ai-core/semantic-content-quality/detectors/generic-copy";
import { detectHeadingHierarchy } from "@/lib/ai-core/semantic-content-quality/detectors/heading-hierarchy";
import { detectIndustryAlignment } from "@/lib/ai-core/semantic-content-quality/detectors/industry-alignment";
import { detectLocalizationQuality } from "@/lib/ai-core/semantic-content-quality/detectors/localization";
import { detectSemanticSeo } from "@/lib/ai-core/semantic-content-quality/detectors/semantic-seo";
import { isSemanticQualityEnabled } from "@/lib/ai-core/semantic-content-quality/flags";
import { runSemanticLlmScorer } from "@/lib/ai-core/semantic-content-quality/llm-scorer";
import { buildSemanticQualityContext } from "@/lib/ai-core/semantic-content-quality/policies";
import {
  buildSemanticQualitySummary,
  computeSemanticQualityScores,
} from "@/lib/ai-core/semantic-content-quality/score";
import type { AIProvider } from "@/lib/ai/types";
import type {
  SemanticContentQualityReport,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

export type RunSemanticContentQualityParams = {
  files: Array<{ path: string; content: string }>;
  prompt?: string;
  language?: string;
  industryId?: string;
  industry?: string;
  brandName?: string;
  seoFocus?: string[];
  primaryCta?: string;
  forbiddenSubjects?: string[];
  toneKeywords?: string[];
  requiredSections?: string[];
  provider?: AIProvider;
};

function dedupeIssues(issues: SemanticQualityIssue[]): SemanticQualityIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.id)) return false;
    seen.add(issue.id);
    return true;
  });
}

export async function runSemanticContentQuality(
  params: RunSemanticContentQualityParams,
): Promise<SemanticContentQualityReport> {
  if (!isSemanticQualityEnabled()) {
    return {
      passed: true,
      scores: {
        genericCopy: 100,
        industryRelevance: 100,
        ctaQuality: 100,
        headingHierarchy: 100,
        semanticSeo: 100,
        crossPageConsistency: 100,
        localization: 100,
        overall: 100,
      },
      issues: [],
      weakSections: [],
      summary: "Semantic quality checks disabled.",
    };
  }

  const context = buildSemanticQualityContext(params);
  const issues = dedupeIssues([
    ...detectGenericCopy(context),
    ...detectIndustryAlignment(context),
    ...detectCtaQuality(context),
    ...detectHeadingHierarchy(context),
    ...detectSemanticSeo(context),
    ...detectCrossPageConsistency(context),
    ...detectLocalizationQuality(context),
  ]);

  const llmScore = await runSemanticLlmScorer({
    context,
    provider: params.provider,
  });

  const scores = computeSemanticQualityScores(issues, {
    genericScore: llmScore.genericScore,
    industryScore: llmScore.industryScore,
  });

  const weakSections = [
    ...new Set(
      issues
        .filter((issue) => issue.severity === "error" || issue.severity === "warning")
        .map((issue) => issue.message),
    ),
  ].slice(0, 12);

  const report: SemanticContentQualityReport = {
    passed: issues.filter((i) => i.severity === "error").length === 0,
    scores,
    issues,
    weakSections,
    summary: buildSemanticQualitySummary({ scores, issues }),
    llmScore: llmScore.applied ? llmScore : undefined,
  };

  return report;
}
