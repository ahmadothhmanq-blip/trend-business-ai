import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { WqbsArtifactSignals } from "@/lib/website/quality-benchmark/types";

function isHtmlLike(path: string): boolean {
  return /\.(html|tsx|jsx|vue|svelte)$/i.test(path);
}

function isCssLike(path: string): boolean {
  return /\.(css|scss|sass|less)$/i.test(path);
}

function countMatches(content: string, pattern: RegExp): number {
  return (content.match(pattern) ?? []).length;
}

function extractHeadingLevels(content: string): number[] {
  const levels: number[] = [];
  const re = /<h([1-6])\b/gi;
  let match: RegExpExecArray | null;
  while ((match = re.exec(content)) !== null) {
    levels.push(Number(match[1]));
  }
  return levels;
}

function estimateWordCount(content: string): number {
  const text = content
    .replace(/<[^>]+>/g, " ")
    .replace(/[{}\[\]();]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return 0;
  return text.split(" ").filter((w) => w.length > 1).length;
}

/**
 * Extract deterministic signals from generated website artifacts.
 * Provider and framework independent — operates on file content only.
 */
export function extractArtifactSignals(
  files: GeneratedProjectFile[],
): WqbsArtifactSignals {
  const htmlFiles = files.filter((f) => isHtmlLike(f.path)).map((f) => f.content);
  const cssFiles = files.filter((f) => isCssLike(f.path)).map((f) => f.content);
  const tsxFiles = files.filter((f) => /\.tsx$/i.test(f.path)).map((f) => f.content);
  const combinedContent = files.map((f) => f.content).join("\n");

  const pagePaths = files.filter(
    (f) =>
      /page\.(tsx|jsx|html)$/i.test(f.path) ||
      /\/index\.(html|tsx|jsx)$/i.test(f.path),
  );

  const headingLevels = extractHeadingLevels(combinedContent);
  const wordCount = estimateWordCount(combinedContent);
  const sectionEstimate = Math.max(1, countMatches(combinedContent, /<section\b/gi) + pagePaths.length);

  return {
    combinedContent,
    htmlFiles,
    cssFiles,
    tsxFiles,
    pageCount: Math.max(1, pagePaths.length),
    totalBytes: combinedContent.length,
    hasNav: /<nav\b/i.test(combinedContent),
    hasMain: /<main\b/i.test(combinedContent),
    hasFooter: /<footer\b/i.test(combinedContent),
    hasHeader: /<header\b/i.test(combinedContent),
    h1Count: countMatches(combinedContent, /<h1\b/gi),
    headingLevels,
    metaTitleCount:
      countMatches(combinedContent, /<title>/gi) +
      countMatches(combinedContent, /metadata\.title|metaTitle/gi),
    metaDescriptionCount:
      countMatches(combinedContent, /name=["']description["']/gi) +
      countMatches(combinedContent, /metadata\.description|metaDescription/gi),
    schemaMarkupCount:
      countMatches(combinedContent, /application\/ld\+json/gi) +
      countMatches(combinedContent, /schema\.org/gi),
    internalLinkCount: countMatches(combinedContent, /<a\b[^>]*href=["']\/[^"']*["']/gi),
    imageCount: countMatches(combinedContent, /<img\b/gi),
    imagesWithAlt: countMatches(combinedContent, /<img\b[^>]*\balt=["'][^"']+["']/gi),
    lazyLoadCount:
      countMatches(combinedContent, /loading=["']lazy["']/gi) +
      countMatches(combinedContent, /lazy|LazyLoad/gi),
    ariaAttributeCount: countMatches(combinedContent, /\baria-[a-z]+=/gi),
    focusVisibleStyles: /:focus-visible|:focus\b/.test(combinedContent),
    ctaCount:
      countMatches(combinedContent, /\b(cta|call-to-action|get started|sign up|book now|contact us)\b/gi) +
      countMatches(combinedContent, /<button\b/gi),
    formCount: countMatches(combinedContent, /<form\b/gi),
    pricingSectionCount: countMatches(
      combinedContent,
      /\b(pricing|price|plans|subscription)\b/gi,
    ),
    testimonialCount: countMatches(
      combinedContent,
      /\b(testimonial|review|trusted by|social proof)\b/gi,
    ),
    trustBadgeCount: countMatches(
      combinedContent,
      /\b(certified|secure|trusted|award|guarantee|ssl)\b/gi,
    ),
    cssVariableCount: countMatches(combinedContent, /--[a-z0-9-]+:/gi),
    mediaQueryCount: countMatches(combinedContent, /@media\b/gi),
    fontFamilyDeclarations: countMatches(combinedContent, /font-family:/gi),
    whitespaceUtilityCount: countMatches(
      combinedContent,
      /\b(p-|m-|gap-|space-|padding|margin)\b/g,
    ),
    langAttribute:
      /<html[^>]*\blang=/i.test(combinedContent) || /lang:\s*["']/i.test(combinedContent),
    dirAttribute: /\bdir=["'](rtl|ltr)["']/i.test(combinedContent),
    rtlHints: /\bdir=["']rtl["']|direction:\s*rtl/i.test(combinedContent),
    wordCount,
    avgWordsPerSection: Math.round(wordCount / sectionEstimate),
  };
}
