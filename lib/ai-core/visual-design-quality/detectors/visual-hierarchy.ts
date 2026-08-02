import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export function detectVisualHierarchy(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const pageFiles = context.files.filter((f) => /page\.tsx$/i.test(f.path));

  for (const file of pageFiles) {
    const h1 = (file.content.match(/<h1\b/gi) || []).length;
    if (h1 === 0) {
      issues.push({
        id: `hierarchy-no-h1-${file.path}`,
        dimension: "visualHierarchy",
        severity: "warning",
        message: `${file.path}: Missing H1 — weak visual hierarchy.`,
        filePath: file.path,
        repairHint: "Lead each page with one decisive H1 in the hero.",
      });
    } else if (h1 > 1) {
      issues.push({
        id: `hierarchy-multi-h1-${file.path}`,
        dimension: "visualHierarchy",
        severity: "warning",
        message: `${file.path}: Multiple H1 headings dilute hierarchy (${h1}).`,
        filePath: file.path,
        repairHint: "Keep one H1; demote secondary titles to H2/H3.",
      });
    }

    const hasScale =
      /text-(4xl|5xl|6xl|7xl)|text-\[var\(--text-hero/i.test(file.content);
    if (h1 > 0 && !hasScale) {
      issues.push({
        id: `hierarchy-hero-scale-${file.path}`,
        dimension: "visualHierarchy",
        severity: "warning",
        message: `${file.path}: Hero headline lacks prominent type scale.`,
        filePath: file.path,
        repairHint: "Use text-4xl+ or hero typography tokens for the main headline.",
      });
    }
  }

  const blob = context.files.map((f) => f.content).join("\n");
  if (!/z-\d+|relative|absolute|sticky/i.test(blob)) {
    issues.push({
      id: "hierarchy-layering",
      dimension: "visualHierarchy",
      severity: "warning",
      message: "Limited layering/positioning signals for visual depth.",
      repairHint: "Use relative/absolute/sticky positioning for hero overlays and nav.",
    });
  }

  return issues;
}
