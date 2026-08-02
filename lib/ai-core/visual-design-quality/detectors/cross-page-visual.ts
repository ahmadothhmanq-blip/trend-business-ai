import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export function detectCrossPageVisualConsistency(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const pageFiles = context.files.filter((f) => /page\.tsx$/i.test(f.path));

  if (pageFiles.length >= 2) {
    const paddingPatterns = pageFiles.map((f) => {
      const match = f.content.match(/py-(16|20|24)/);
      return match?.[0] ?? "none";
    });
    const uniquePadding = new Set(paddingPatterns);
    if (uniquePadding.size > 2 && paddingPatterns.some((p) => p === "none")) {
      issues.push({
        id: "crosspage-padding-inconsistent",
        dimension: "crossPageConsistency",
        severity: "warning",
        message: "Inconsistent section padding across pages.",
        repairHint: "Standardize section py-* tokens across all pages.",
      });
    }
  }

  const layoutImports = pageFiles.map((f) => {
    const headerImport = f.content.match(/from\s+["']@\/components\/layout\/([^"']+)/);
    return headerImport?.[1] ?? "";
  });
  if (
    pageFiles.length >= 2 &&
    layoutImports.filter(Boolean).length > 0 &&
    new Set(layoutImports.filter(Boolean)).size > 1
  ) {
    issues.push({
      id: "crosspage-layout-mismatch",
      dimension: "crossPageConsistency",
      severity: "warning",
      message: "Pages use different layout/header imports.",
      repairHint: "Share the same Header/Footer layout shell across pages.",
    });
  }

  const tokenUsage = pageFiles.map((f) =>
    /--color-primary|var\(--color-primary\)/.test(f.content),
  );
  if (pageFiles.length >= 2 && tokenUsage.some(Boolean) && !tokenUsage.every(Boolean)) {
    issues.push({
      id: "crosspage-token-drift",
      dimension: "crossPageConsistency",
      severity: "warning",
      message: "Brand color tokens applied inconsistently across pages.",
      repairHint: "Use shared design tokens on every page template.",
    });
  }

  if (context.brandName) {
    const brand = context.brandName.toLowerCase();
    const pagesWithBrand = pageFiles.filter((f) =>
      f.content.toLowerCase().includes(brand),
    );
    if (pageFiles.length >= 2 && pagesWithBrand.length === 0) {
      issues.push({
        id: "crosspage-brand-visual",
        dimension: "crossPageConsistency",
        severity: "warning",
        message: `Brand "${context.brandName}" not visible in page templates.`,
        repairHint: "Show brand name/logo consistently in header across pages.",
      });
    }
  }

  return issues;
}
