import { extractArtifactSignals } from "@/lib/website/quality-benchmark";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type {
  AnalyzerDimensionResult,
  ReviewStudioInput,
  WebsiteAnalysis,
} from "@/lib/website/review-studio/types";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function dim(
  dimension: AnalyzerDimensionResult["dimension"],
  score: number,
  findings: string[],
  issues: string[],
): AnalyzerDimensionResult {
  return { dimension, score: clamp(score), findings, issues };
}

function detectSections(content: string): string[] {
  const sections: string[] = [];
  if (/\bhero\b|<h1\b/i.test(content)) sections.push("hero");
  if (/<nav\b/i.test(content)) sections.push("navigation");
  if (/\b(pricing|price|plans)\b/i.test(content)) sections.push("pricing");
  if (/\b(testimonial|review)\b/i.test(content)) sections.push("testimonials");
  if (/<form\b/i.test(content)) sections.push("forms");
  if (/<footer\b/i.test(content)) sections.push("footer");
  if (/\b(cta|get started|sign up|contact)\b/i.test(content)) sections.push("cta");
  if (/\b(trust|certified|secure|award)\b/i.test(content)) sections.push("trust");
  return sections;
}

function detectComponents(files: GeneratedProjectFile[]): string[] {
  const components = new Set<string>();
  for (const file of files) {
    const matches = file.content.match(/(?:export\s+(?:default\s+)?function|const)\s+([A-Z][A-Za-z0-9]+)/g);
    if (matches) {
      for (const m of matches) {
        const name = m.replace(/^(?:export\s+(?:default\s+)?function|const)\s+/, "");
        if (name.length > 2) components.add(name);
      }
    }
  }
  return [...components].slice(0, 20);
}

/**
 * Website Analyzer — layout, sections, components, business logic, SEO, a11y, performance, content, conversion, brand.
 */
export function analyzeWebsite(input: ReviewStudioInput): WebsiteAnalysis {
  const signals = extractArtifactSignals(input.files);
  const combined = signals.combinedContent;
  const detectedSections = detectSections(combined);
  const detectedComponents = detectComponents(input.files);
  const sectionCount = Math.max(
    detectedSections.length,
    (combined.match(/<section\b/gi) ?? []).length,
  );

  const dimensions: AnalyzerDimensionResult[] = [
    dim(
      "layout",
      50 +
        (signals.hasHeader ? 12 : 0) +
        (signals.hasMain ? 15 : 0) +
        (signals.hasFooter ? 10 : 0) +
        (signals.mediaQueryCount >= 2 ? 10 : 0),
      [
        signals.hasMain ? "main landmark present" : "",
        signals.mediaQueryCount > 0 ? `${signals.mediaQueryCount} breakpoints` : "",
      ].filter(Boolean),
      !signals.hasMain ? ["Missing main content landmark"] : [],
    ),
    dim(
      "sections",
      45 + Math.min(40, detectedSections.length * 8),
      detectedSections.map((s) => `section: ${s}`),
      detectedSections.length < 3 ? ["Few page sections detected"] : [],
    ),
    dim(
      "components",
      50 + Math.min(35, detectedComponents.length * 5),
      detectedComponents.slice(0, 5).map((c) => `component: ${c}`),
      detectedComponents.length < 2 ? ["Limited component structure"] : [],
    ),
    dim(
      "businessLogic",
      45 +
        (signals.formCount > 0 ? 15 : 0) +
        (signals.pricingSectionCount > 0 ? 15 : 0) +
        (signals.ctaCount > 1 ? 15 : 0),
      [],
      signals.ctaCount === 0 ? ["No conversion path"] : [],
    ),
    dim(
      "seo",
      40 +
        (signals.metaTitleCount > 0 ? 20 : 0) +
        (signals.metaDescriptionCount > 0 ? 20 : 0) +
        (signals.h1Count === 1 ? 15 : 0),
      signals.schemaMarkupCount > 0 ? ["structured data"] : [],
      signals.metaTitleCount === 0 ? ["Missing metadata"] : [],
    ),
    dim(
      "accessibility",
      50 +
        (signals.langAttribute ? 15 : 0) +
        (signals.ariaAttributeCount > 0 ? 10 : 0) +
        (signals.focusVisibleStyles ? 15 : 0),
      [],
      !signals.langAttribute ? ["Missing lang attribute"] : [],
    ),
    dim(
      "performance",
      60 -
        (signals.totalBytes > 150_000 ? 15 : 0) +
        (signals.lazyLoadCount > 0 ? 15 : 0),
      [],
      signals.imageCount > 2 && signals.lazyLoadCount === 0 ? ["No lazy loading"] : [],
    ),
    dim(
      "content",
      50 + Math.min(35, Math.floor(signals.wordCount / 40)),
      signals.wordCount > 200 ? [`${signals.wordCount} words`] : [],
      signals.wordCount < 100 ? ["Thin content"] : [],
    ),
    dim(
      "conversion",
      45 + Math.min(35, signals.ctaCount * 5) + (signals.formCount > 0 ? 15 : 0),
      signals.ctaCount > 0 ? [`${signals.ctaCount} CTAs`] : [],
      signals.ctaCount < 2 ? ["Weak CTA presence"] : [],
    ),
    dim(
      "brandConsistency",
      55 +
        (signals.cssVariableCount >= 4 ? 20 : 0) +
        (signals.fontFamilyDeclarations >= 2 ? 10 : 0),
      signals.cssVariableCount >= 4 ? ["design tokens"] : [],
      signals.cssVariableCount < 4 ? ["Weak brand token system"] : [],
    ),
  ];

  return {
    analyzedAt: new Date().toISOString(),
    pageCount: signals.pageCount,
    sectionCount,
    componentCount: detectedComponents.length,
    fileCount: input.files.length,
    dimensions,
    detectedSections,
    detectedComponents,
  };
}
