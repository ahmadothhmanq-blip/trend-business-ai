import type {
  VisualDesignQualityReport,
  VisualQualityDimension,
  VisualQualityIssue,
  VisualQualityScores,
} from "@/lib/ai-core/visual-design-quality/types";

const DIMENSION_WEIGHTS: Record<
  Exclude<VisualQualityDimension, "overall" | "layout" | "ux">,
  number
> = {
  designTokens: 0.12,
  visualHierarchy: 0.12,
  responsiveLayout: 0.14,
  heroQuality: 0.14,
  navigationUx: 0.1,
  ctaPlacement: 0.1,
  componentSpacing: 0.1,
  typographyHierarchy: 0.1,
  crossPageConsistency: 0.08,
};

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function scoreDimension(
  issues: VisualQualityIssue[],
  dimension: Exclude<VisualQualityDimension, "overall" | "layout" | "ux">,
): number {
  const dimIssues = issues.filter((issue) => issue.dimension === dimension);
  if (!dimIssues.length) return 92;
  let score = 92;
  for (const issue of dimIssues) {
    score -= issue.severity === "error" ? 16 : 7;
  }
  return clamp(score);
}

export function computeVisualQualityScores(
  issues: VisualQualityIssue[],
): VisualQualityScores {
  const designTokens = scoreDimension(issues, "designTokens");
  const visualHierarchy = scoreDimension(issues, "visualHierarchy");
  const responsiveLayout = scoreDimension(issues, "responsiveLayout");
  const heroQuality = scoreDimension(issues, "heroQuality");
  const navigationUx = scoreDimension(issues, "navigationUx");
  const ctaPlacement = scoreDimension(issues, "ctaPlacement");
  const componentSpacing = scoreDimension(issues, "componentSpacing");
  const typographyHierarchy = scoreDimension(issues, "typographyHierarchy");
  const crossPageConsistency = scoreDimension(issues, "crossPageConsistency");

  const layout = clamp(
    responsiveLayout * 0.45 +
      componentSpacing * 0.35 +
      designTokens * 0.2,
  );

  const ux = clamp(
    navigationUx * 0.3 +
      ctaPlacement * 0.3 +
      visualHierarchy * 0.2 +
      heroQuality * 0.2,
  );

  const overall = clamp(
    designTokens * DIMENSION_WEIGHTS.designTokens +
      visualHierarchy * DIMENSION_WEIGHTS.visualHierarchy +
      responsiveLayout * DIMENSION_WEIGHTS.responsiveLayout +
      heroQuality * DIMENSION_WEIGHTS.heroQuality +
      navigationUx * DIMENSION_WEIGHTS.navigationUx +
      ctaPlacement * DIMENSION_WEIGHTS.ctaPlacement +
      componentSpacing * DIMENSION_WEIGHTS.componentSpacing +
      typographyHierarchy * DIMENSION_WEIGHTS.typographyHierarchy +
      crossPageConsistency * DIMENSION_WEIGHTS.crossPageConsistency,
  );

  return {
    designTokens,
    visualHierarchy,
    responsiveLayout,
    heroQuality,
    navigationUx,
    ctaPlacement,
    componentSpacing,
    typographyHierarchy,
    crossPageConsistency,
    layout,
    ux,
    overall,
  };
}

export function buildVisualDesignQualitySummary(
  report: Pick<VisualDesignQualityReport, "scores" | "issues">,
): string {
  const warnings = report.issues.length;
  return `Visual design quality ${report.scores.overall}/100 — ${warnings} UX/visual finding${warnings === 1 ? "" : "s"}.`;
}
