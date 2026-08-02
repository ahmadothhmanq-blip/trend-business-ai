import { analyzeHeadingStructure } from "@/lib/ai-core/seo-performance/headings";
import type {
  SemanticQualityContext,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

export function detectHeadingHierarchy(
  context: SemanticQualityContext,
): SemanticQualityIssue[] {
  const issues: SemanticQualityIssue[] = [];
  const pageFiles = context.files.filter((f) => /page\.tsx$/i.test(f.path));

  for (const file of pageFiles) {
    const report = analyzeHeadingStructure([file]);
    for (const issue of report.issues) {
      issues.push({
        id: `heading-${file.path}-${issue.slice(0, 12)}`,
        dimension: "headingHierarchy",
        severity: issue.includes("No H1") ? "error" : "warning",
        message: `${file.path}: ${issue}`,
        filePath: file.path,
        repairHint: report.suggestions[0],
      });
    }
  }

  if (pageFiles.length === 0) {
    const globalReport = analyzeHeadingStructure(context.files);
    for (const issue of globalReport.issues) {
      issues.push({
        id: `heading-global-${issue.slice(0, 12)}`,
        dimension: "headingHierarchy",
        severity: "warning",
        message: issue,
        repairHint: globalReport.suggestions[0],
      });
    }
  }

  return issues;
}
