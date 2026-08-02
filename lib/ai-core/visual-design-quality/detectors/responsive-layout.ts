import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export function detectResponsiveLayout(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const blob = context.files.map((f) => f.content).join("\n");
  const layout = context.files.find((f) => /layout\.tsx$/i.test(f.path));

  if (!/\b(sm|md|lg|xl):/.test(blob)) {
    issues.push({
      id: "responsive-no-breakpoints",
      dimension: "responsiveLayout",
      severity: "warning",
      message: "No responsive breakpoint utilities (sm/md/lg) detected.",
      repairHint: "Add sm/md/lg grid and flex adjustments for hero, nav, and sections.",
    });
  }

  if (!/viewport/i.test(blob)) {
    issues.push({
      id: "responsive-no-viewport",
      dimension: "responsiveLayout",
      severity: "warning",
      message: "Viewport meta configuration not detected.",
      filePath: layout?.path,
      repairHint: "Ensure mobile viewport is configured in root layout metadata.",
    });
  }

  const home = context.files.find((f) => f.path.endsWith("app/page.tsx"));
  if (home && !/flex-col|grid-cols-1|md:grid|md:flex/i.test(home.content)) {
    issues.push({
      id: "responsive-home-stack",
      dimension: "responsiveLayout",
      severity: "warning",
      message: "Home layout may not stack cleanly on mobile.",
      filePath: home.path,
      repairHint: "Use flex-col / grid-cols-1 with md: breakpoints on the hero.",
    });
  }

  if (!/max-w-|container|mx-auto/i.test(blob)) {
    issues.push({
      id: "responsive-no-container",
      dimension: "responsiveLayout",
      severity: "warning",
      message: "Content width constraints (container/max-w) not detected.",
      repairHint: "Wrap sections in container/max-w-* for readable line lengths.",
    });
  }

  return issues;
}
