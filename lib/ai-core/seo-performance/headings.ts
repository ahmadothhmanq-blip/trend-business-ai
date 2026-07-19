/**
 * Heading structure (H1/H2/H3) analysis for generated website files.
 */

import type { HeadingStructureReport } from "@/lib/ai-core/seo-performance/types";

export type HeadingCheckFile = {
  path: string;
  content: string;
};

function countTag(content: string, tag: "h1" | "h2" | "h3"): number {
  const re = new RegExp(`<${tag}\\b`, "gi");
  const jsxRe = new RegExp(`<${tag.toUpperCase()}\\b`, "g");
  // Also count JSX <h1> and components that render headings via class patterns
  return (content.match(re) || []).length + (content.match(jsxRe) || []).length;
}

/**
 * Analyze heading hierarchy for SEO readiness.
 */
export function analyzeHeadingStructure(
  files: HeadingCheckFile[],
): HeadingStructureReport {
  const pageLike = files.filter(
    (f) =>
      /page\.tsx$|layout\.tsx$|Hero|hero/i.test(f.path) ||
      /\.tsx$|\.jsx$|\.html$/i.test(f.path),
  );
  const content = (pageLike.length ? pageLike : files)
    .map((f) => f.content)
    .join("\n");

  const h1Count = countTag(content, "h1");
  const h2Count = countTag(content, "h2");
  const h3Count = countTag(content, "h3");

  const issues: string[] = [];
  const suggestions: string[] = [];

  if (h1Count === 0) {
    issues.push("No H1 heading detected — search engines need a clear page topic");
    suggestions.push("Add exactly one H1 in the hero that includes the primary keyword");
  } else if (h1Count > 1) {
    issues.push(`Multiple H1 headings detected (${h1Count}) — prefer a single H1 per page`);
    suggestions.push("Keep one H1; demote secondary titles to H2/H3");
  }

  if (h2Count === 0) {
    issues.push("No H2 section headings detected");
    suggestions.push("Use H2 for major sections (features, services, pricing, FAQ)");
  } else if (h2Count < 2) {
    suggestions.push("Add more H2 headings to structure key sections for scanners and SEO");
  }

  if (h2Count > 0 && h3Count === 0 && h2Count >= 3) {
    suggestions.push("Consider H3 under dense H2 sections for clearer content hierarchy");
  }

  // Weak keyword-in-heading signal (soft)
  if (h1Count === 1 && !/<h1[^>]*>[^<]{8,}/i.test(content)) {
    suggestions.push("Ensure the H1 contains a descriptive, keyword-rich phrase");
  }

  return {
    h1Count,
    h2Count,
    h3Count,
    hasSingleH1: h1Count === 1,
    issues,
    suggestions,
  };
}
