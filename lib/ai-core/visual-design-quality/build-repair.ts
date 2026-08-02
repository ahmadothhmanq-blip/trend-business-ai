import type { VisualDesignQualityReport } from "@/lib/ai-core/visual-design-quality/types";

export function buildVisualDesignRepairInstruction(
  report: VisualDesignQualityReport,
): string {
  const priority = report.issues.slice(0, 8);
  if (!priority.length) return "";

  const lines = [
    "[visual-design] Improve visual design and UX based on these findings:",
    ...priority.map((issue, index) => {
      const hint = issue.repairHint ? ` — ${issue.repairHint}` : "";
      const location = issue.filePath ? ` (${issue.filePath})` : "";
      return `${index + 1}. ${issue.message}${location}${hint}`;
    }),
    "Preserve business copy and routes. Focus on spacing, typography, responsive layout, hero composition, nav UX, and design tokens.",
  ];

  return lines.join("\n");
}
