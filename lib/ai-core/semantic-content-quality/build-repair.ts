import type { SemanticContentQualityReport } from "@/lib/ai-core/semantic-content-quality/types";

export function buildSemanticRepairInstruction(
  report: SemanticContentQualityReport,
): string {
  const priority = report.issues
    .filter((issue) => issue.severity === "error")
    .concat(report.issues.filter((issue) => issue.severity === "warning"))
    .slice(0, 8);

  if (!priority.length) return "";

  const lines = [
    "[semantic-quality] Improve website copy based on these content quality findings:",
    ...priority.map((issue, index) => {
      const hint = issue.repairHint ? ` — ${issue.repairHint}` : "";
      return `${index + 1}. ${issue.message}${hint}`;
    }),
    "Keep layout/components intact. Rewrite only user-facing copy, headings, CTAs, and metadata.",
  ];

  return lines.join("\n");
}
