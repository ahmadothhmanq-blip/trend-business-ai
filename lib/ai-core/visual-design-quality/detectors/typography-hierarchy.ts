import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export function detectTypographyHierarchy(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const blob = context.files.map((f) => f.content).join("\n");

  const hasDisplayFont =
    /font-\[family-name:var\(--font|font-display|font-heading|--font-heading|Playfair|Cormorant|Space Grotesk|Manrope|Inter/i.test(
      blob,
    );
  if (!hasDisplayFont) {
    issues.push({
      id: "type-no-display",
      dimension: "typographyHierarchy",
      severity: "warning",
      message: "Display/heading typography identity is not established.",
      repairHint: "Wire --font-heading or a premium display font for headlines.",
    });
  }

  const hasBodyScale = /text-base|text-lg|leading-relaxed|prose/i.test(blob);
  if (!hasBodyScale) {
    issues.push({
      id: "type-no-body-scale",
      dimension: "typographyHierarchy",
      severity: "warning",
      message: "Body copy typography scale (text-base/lg, leading) is weak.",
      repairHint: "Use text-base/lg with leading-relaxed for readable body copy.",
    });
  }

  const h2Count = (blob.match(/<h2\b/gi) || []).length;
  if (h2Count === 0) {
    issues.push({
      id: "type-no-h2",
      dimension: "typographyHierarchy",
      severity: "warning",
      message: "No H2 section headings — weak typographic structure.",
      repairHint: "Add H2 headings for each major content band.",
    });
  }

  const hasMuted = /text-muted|text-foreground\/|opacity-70|text-slate-5/i.test(blob);
  if (!hasMuted) {
    issues.push({
      id: "type-no-muted",
      dimension: "typographyHierarchy",
      severity: "warning",
      message: "Muted/subhead text styles not detected for hierarchy contrast.",
      repairHint: "Use text-muted-foreground or opacity for supporting copy.",
    });
  }

  return issues;
}
