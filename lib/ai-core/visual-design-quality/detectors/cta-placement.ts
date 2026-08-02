import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export function detectCtaPlacement(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const heroBlob = context.files
    .filter(
      (f) =>
        /Hero|hero|app\/page\.tsx/i.test(f.path) ||
        /components\/sections\//i.test(f.path),
    )
    .map((f) => f.content)
    .join("\n");
  const fullBlob = context.files.map((f) => f.content).join("\n");

  const ctaPattern =
    /<Button\b|<button\b|className=.*btn|cta|Get started|Book|Contact|Shop/i;
  const heroHasCta = ctaPattern.test(heroBlob);
  const siteHasCta = ctaPattern.test(fullBlob);

  if (!siteHasCta) {
    issues.push({
      id: "cta-missing",
      dimension: "ctaPlacement",
      severity: "warning",
      message: "No visible CTA buttons detected in generated UI.",
      repairHint: "Add primary and secondary CTAs in hero and contact sections.",
    });
    return issues;
  }

  if (!heroHasCta) {
    issues.push({
      id: "cta-not-in-hero",
      dimension: "ctaPlacement",
      severity: "warning",
      message: "Primary CTA is not placed in the hero section.",
      repairHint: "Place the main conversion CTA above the fold in the hero.",
    });
  }

  const footerOnly =
    !heroHasCta &&
    /Footer|footer/i.test(fullBlob) &&
    ctaPattern.test(
      context.files
        .filter((f) => /footer/i.test(f.path))
        .map((f) => f.content)
        .join("\n"),
    );
  if (footerOnly) {
    issues.push({
      id: "cta-footer-only",
      dimension: "ctaPlacement",
      severity: "warning",
      message: "CTAs appear only in footer — weak above-the-fold conversion.",
      repairHint: "Duplicate or elevate primary CTA into hero and mid-page sections.",
    });
  }

  const ctaCount = (fullBlob.match(/<Button\b|<button\b/gi) || []).length;
  if (ctaCount > 8) {
    issues.push({
      id: "cta-overloaded",
      dimension: "ctaPlacement",
      severity: "warning",
      message: `High CTA density (${ctaCount} buttons) may reduce visual clarity.`,
      repairHint: "Limit to 1 primary + 1–2 secondary CTAs per viewport band.",
    });
  }

  return issues;
}
