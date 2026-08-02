import type {
  VisualDesignQualityContext,
  VisualQualityIssue,
} from "@/lib/ai-core/visual-design-quality/types";

export function detectNavigationUx(
  context: VisualDesignQualityContext,
): VisualQualityIssue[] {
  const issues: VisualQualityIssue[] = [];
  const navFiles = context.files.filter(
    (f) =>
      /Header|Nav|navbar|navigation/i.test(f.path) ||
      /components\/layout\//i.test(f.path),
  );
  const blob = navFiles.map((f) => f.content).join("\n");
  const layout = context.files.find((f) => /layout\.tsx$/i.test(f.path));

  if (!navFiles.length && layout && !/<nav\b|Header|Navbar/i.test(layout.content)) {
    issues.push({
      id: "nav-missing",
      dimension: "navigationUx",
      severity: "warning",
      message: "No navigation/header component detected.",
      filePath: layout.path,
      repairHint: "Add a header with logo, primary links, and mobile menu toggle.",
    });
  }

  if (navFiles.length > 0) {
    const hasLinks = /<Link\b|<a\b|href=/i.test(blob);
    if (!hasLinks) {
      issues.push({
        id: "nav-no-links",
        dimension: "navigationUx",
        severity: "warning",
        message: "Navigation component lacks visible links.",
        filePath: navFiles[0]?.path,
        repairHint: "Add primary nav links to key pages (Home, Services, Contact).",
      });
    }

    const hasMobileMenu =
      /md:hidden|lg:hidden|mobile|Menu|Sheet|hamburger|aria-label=["']Menu/i.test(
        blob,
      );
    if (!hasMobileMenu && !/flex-col.*md:flex-row/i.test(blob)) {
      issues.push({
        id: "nav-no-mobile",
        dimension: "navigationUx",
        severity: "warning",
        message: "Mobile navigation pattern not detected.",
        filePath: navFiles[0]?.path,
        repairHint: "Add a mobile menu (md:hidden toggle + Sheet/drawer).",
      });
    }

    const hasSticky = /sticky|fixed.*top-0|backdrop-blur/i.test(blob);
    if (!hasSticky) {
      issues.push({
        id: "nav-not-sticky",
        dimension: "navigationUx",
        severity: "warning",
        message: "Navigation is not sticky/fixed — scroll UX may feel basic.",
        filePath: navFiles[0]?.path,
        repairHint: "Use sticky top-0 with backdrop-blur for premium nav UX.",
      });
    }
  }

  return issues;
}
