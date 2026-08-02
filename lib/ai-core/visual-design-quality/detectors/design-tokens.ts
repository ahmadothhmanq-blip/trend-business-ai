import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

const TOKEN_SIGNALS = [
  "--color-primary",
  "--color-secondary",
  "--color-accent",
  "--font-heading",
  "--font-body",
  "--section-y",
  "--radius-md",
  "var(--color-primary)",
  "var(--font-heading)",
];

export function detectDesignTokens(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const blob = context.files.map((f) => f.content).join("\n");
  const globals = context.files.find((f) => /globals\.css$/i.test(f.path));

  const tokenHits = TOKEN_SIGNALS.filter((token) => blob.includes(token));
  if (tokenHits.length < 3) {
    issues.push({
      id: "tokens-missing-core",
      dimension: "designTokens",
      severity: "warning",
      message: "Core design tokens are underused in generated styles.",
      filePath: globals?.path,
      repairHint:
        "Apply --color-primary, --font-heading, and --section-y tokens in globals.css and section components.",
    });
  }

  const primary = context.designSystem?.colors?.primary;
  if (primary && !blob.includes(primary) && !blob.includes("--color-primary")) {
    issues.push({
      id: "tokens-primary-mismatch",
      dimension: "designTokens",
      severity: "warning",
      message: "Planned primary brand color is not reflected in generated files.",
      repairHint: `Wire primary color ${primary} via CSS variables or Tailwind tokens.`,
    });
  }

  const headingFont = context.designSystem?.typography?.headingFont;
  if (
    headingFont &&
    !blob.toLowerCase().includes(headingFont.toLowerCase().slice(0, 8)) &&
    !blob.includes("--font-heading")
  ) {
    issues.push({
      id: "tokens-heading-font",
      dimension: "designTokens",
      severity: "warning",
      message: "Heading font from design system is not applied.",
      repairHint: `Use --font-heading or ${headingFont} for display typography.`,
    });
  }

  return issues;
}
