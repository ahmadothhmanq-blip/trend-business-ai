import type { GeneratedProjectFile } from "@/lib/ai/types";

export type AccessibilityIssue = {
  id: string;
  severity: "blocker" | "warning";
  rule: string;
  detail: string;
  autoFixable: boolean;
};

export type AccessibilityReport = {
  passed: boolean;
  score: number;
  issues: AccessibilityIssue[];
  summary: string;
};

function combinedContent(files: GeneratedProjectFile[]): string {
  return files.map((f) => f.content).join("\n");
}

/**
 * WCAG-oriented accessibility validation for generated websites.
 */
export function validateAccessibility(
  files: GeneratedProjectFile[],
): AccessibilityReport {
  const issues: AccessibilityIssue[] = [];
  const content = combinedContent(files);

  if (!/<html[^>]*\blang=/i.test(content) && !/lang:\s*["']/i.test(content)) {
    issues.push({
      id: "lang",
      severity: "blocker",
      rule: "WCAG 3.1.1",
      detail: "Missing lang attribute on html element",
      autoFixable: true,
    });
  }

  if (!/<main\b/i.test(content)) {
    issues.push({
      id: "main-landmark",
      severity: "blocker",
      rule: "WCAG 1.3.1",
      detail: "Missing <main> landmark",
      autoFixable: true,
    });
  }

  if (!/<nav\b/i.test(content)) {
    issues.push({
      id: "nav-landmark",
      severity: "warning",
      rule: "WCAG 1.3.1",
      detail: "Missing <nav> landmark",
      autoFixable: true,
    });
  }

  const h1count = (content.match(/<h1\b/gi) || []).length;
  if (h1count === 0) {
    issues.push({
      id: "h1-missing",
      severity: "blocker",
      rule: "WCAG 1.3.1",
      detail: "Page missing H1 heading",
      autoFixable: false,
    });
  } else if (h1count > 1) {
    issues.push({
      id: "h1-multiple",
      severity: "warning",
      rule: "WCAG 1.3.1",
      detail: `Multiple H1 headings (${h1count})`,
      autoFixable: false,
    });
  }

  const imgWithoutAlt = content.match(/<img\b(?![^>]*\balt=)[^>]*>/gi);
  if (imgWithoutAlt?.length) {
    issues.push({
      id: "img-alt",
      severity: "blocker",
      rule: "WCAG 1.1.1",
      detail: `${imgWithoutAlt.length} image(s) missing alt text`,
      autoFixable: true,
    });
  }

  if (!/focus-visible|focus:|:focus/i.test(content)) {
    issues.push({
      id: "focus-styles",
      severity: "warning",
      rule: "WCAG 2.4.7",
      detail: "No visible focus styles detected",
      autoFixable: true,
    });
  }

  if (!/aria-|role=/i.test(content) && /<button|<input|<select/i.test(content)) {
    issues.push({
      id: "aria-forms",
      severity: "warning",
      rule: "WCAG 4.1.2",
      detail: "Form elements may lack ARIA labels",
      autoFixable: true,
    });
  }

  if (!/prefers-reduced-motion/i.test(content)) {
    issues.push({
      id: "reduced-motion",
      severity: "warning",
      rule: "WCAG 2.3.3",
      detail: "No prefers-reduced-motion support",
      autoFixable: true,
    });
  }

  const blockers = issues.filter((i) => i.severity === "blocker");
  const score = Math.max(0, 100 - blockers.length * 20 - issues.length * 5);

  return {
    passed: blockers.length === 0,
    score,
    issues,
    summary:
      blockers.length === 0
        ? `Accessibility passed · score ${score}`
        : `Accessibility failed · ${blockers.length} blocker(s) · score ${score}`,
  };
}

/** Auto-fix common accessibility issues in generated files. */
export function repairAccessibility(
  files: GeneratedProjectFile[],
): GeneratedProjectFile[] {
  return files.map((file) => {
    let content = file.content;

    if (file.path.endsWith("layout.tsx") && !/<html[^>]*\blang=/i.test(content)) {
      content = content.replace(/<html\b/, '<html lang="en"');
    }

    content = content.replace(
      /<img\b((?![^>]*\balt=)[^>]*)>/gi,
      '<img alt=""$1>',
    );

    if (
      (file.path.includes("globals.css") || file.path.endsWith(".css")) &&
      !/prefers-reduced-motion/i.test(content)
    ) {
      content += `\n@media (prefers-reduced-motion: reduce) {\n  *, *::before, *::after {\n    animation-duration: 0.01ms !important;\n    transition-duration: 0.01ms !important;\n  }\n}\n`;
    }

    if (
      (file.path.includes("globals.css") || file.path.endsWith(".css")) &&
      !/:focus-visible/i.test(content)
    ) {
      content += `\n:focus-visible { outline: 2px solid var(--color-primary, #2563eb); outline-offset: 2px; }\n`;
    }

    return content === file.content ? file : { ...file, content };
  });
}
