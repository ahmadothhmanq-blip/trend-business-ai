import { detectComponentSpacing } from "@/lib/ai-core/visual-design-quality/detectors/component-spacing";
import { detectCrossPageVisualConsistency } from "@/lib/ai-core/visual-design-quality/detectors/cross-page-visual";
import { detectCtaPlacement } from "@/lib/ai-core/visual-design-quality/detectors/cta-placement";
import { detectDesignTokens } from "@/lib/ai-core/visual-design-quality/detectors/design-tokens";
import { detectHeroQuality } from "@/lib/ai-core/visual-design-quality/detectors/hero-quality";
import { detectNavigationUx } from "@/lib/ai-core/visual-design-quality/detectors/navigation-ux";
import { detectResponsiveLayout } from "@/lib/ai-core/visual-design-quality/detectors/responsive-layout";
import { detectTypographyHierarchy } from "@/lib/ai-core/visual-design-quality/detectors/typography-hierarchy";
import { detectVisualHierarchy } from "@/lib/ai-core/visual-design-quality/detectors/visual-hierarchy";
import { isVisualDesignQualityEnabled } from "@/lib/ai-core/visual-design-quality/flags";
import { buildVisualDesignQualityContext } from "@/lib/ai-core/visual-design-quality/policies";
import {
  buildVisualDesignQualitySummary,
  computeVisualQualityScores,
} from "@/lib/ai-core/visual-design-quality/score";
import type {
  VisualDesignQualityReport,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export type RunVisualDesignQualityParams = {
  files: Array<{ path: string; content: string }>;
  designSystem?: {
    colors?: { primary?: string; secondary?: string; accent?: string };
    typography?: { headingFont?: string; bodyFont?: string };
    spacingScale?: string;
  };
  brandName?: string;
  pages?: string[];
};

function dedupeIssues(issues: VisualQualityIssue[]): VisualQualityIssue[] {
  const seen = new Set<string>();
  return issues.filter((issue) => {
    if (seen.has(issue.id)) return false;
    seen.add(issue.id);
    return true;
  });
}

/**
 * Visual Design Audit Engine — deterministic UX/visual analysis (no LLM by default).
 */
export function runVisualDesignQuality(
  params: RunVisualDesignQualityParams,
): VisualDesignQualityReport {
  if (!isVisualDesignQualityEnabled()) {
    return {
      passed: true,
      scores: {
        designTokens: 100,
        visualHierarchy: 100,
        responsiveLayout: 100,
        heroQuality: 100,
        navigationUx: 100,
        ctaPlacement: 100,
        componentSpacing: 100,
        typographyHierarchy: 100,
        crossPageConsistency: 100,
        layout: 100,
        ux: 100,
        overall: 100,
      },
      issues: [],
      weakSections: [],
      summary: "Visual design quality checks disabled.",
    };
  }

  const context = buildVisualDesignQualityContext(params);
  const issues = dedupeIssues([
    ...detectDesignTokens(context),
    ...detectVisualHierarchy(context),
    ...detectResponsiveLayout(context),
    ...detectHeroQuality(context),
    ...detectNavigationUx(context),
    ...detectCtaPlacement(context),
    ...detectComponentSpacing(context),
    ...detectTypographyHierarchy(context),
    ...detectCrossPageVisualConsistency(context),
  ]);

  const scores = computeVisualQualityScores(issues);
  const weakSections = [
    ...new Set(issues.map((issue) => issue.message)),
  ].slice(0, 12);

  return {
    passed: issues.filter((i) => i.severity === "error").length === 0,
    scores,
    issues,
    weakSections,
    summary: buildVisualDesignQualitySummary({ scores, issues }),
  };
}
