import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export function detectComponentSpacing(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const blob = context.files.map((f) => f.content).join("\n");
  const sectionFiles = context.files.filter(
    (f) => /components\/sections\//i.test(f.path) || /page\.tsx$/i.test(f.path),
  );

  const hasSectionRhythm =
    /py-16|py-20|py-24|section-y|--section-y|SectionShell|gap-8|gap-10|space-y-12/i.test(
      blob,
    );
  if (!hasSectionRhythm) {
    issues.push({
      id: "spacing-no-rhythm",
      dimension: "componentSpacing",
      severity: "warning",
      message: "Section vertical rhythm (py-16+, gap, SectionShell) is weak.",
      repairHint: "Apply consistent section padding via --section-y or py-20 tokens.",
    });
  }

  const tightSections = sectionFiles.filter(
    (f) =>
      /section|Section/i.test(f.content) &&
      !/py-|padding|gap-|space-y-/i.test(f.content),
  );
  if (tightSections.length >= 2) {
    issues.push({
      id: "spacing-tight-sections",
      dimension: "componentSpacing",
      severity: "warning",
      message: `${tightSections.length} sections lack explicit spacing utilities.`,
      filePath: tightSections[0]?.path,
      repairHint: "Add py-16+ and gap-* between stacked content blocks.",
    });
  }

  if (!/rounded-|shadow-|border-border/i.test(blob)) {
    issues.push({
      id: "spacing-no-surface-depth",
      dimension: "componentSpacing",
      severity: "warning",
      message: "Card/surface depth (rounded, shadow) is underused.",
      repairHint: "Use rounded-lg/xl and subtle shadows on feature cards.",
    });
  }

  return issues;
}
