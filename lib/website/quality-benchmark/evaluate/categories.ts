import type {
  WqbsArtifactSignals,
  WqbsCategoryEvaluation,
  WqbsSubDimensionScore,
} from "@/lib/website/quality-benchmark/types";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function sub(
  id: string,
  label: string,
  score: number,
  signals: string[] = [],
  issues: string[] = [],
): WqbsSubDimensionScore {
  return { id, label, score: clamp(score), signals, issues };
}

function category(
  category: WqbsCategoryEvaluation["category"],
  subDimensions: WqbsSubDimensionScore[],
): WqbsCategoryEvaluation {
  const score =
    subDimensions.length === 0
      ? 0
      : clamp(subDimensions.reduce((n, s) => n + s.score, 0) / subDimensions.length);
  return { category, score, subDimensions };
}

export function evaluateVisualDesign(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const subs = [
    sub(
      "layout",
      "Layout",
      50 +
        (signals.hasHeader ? 10 : 0) +
        (signals.hasMain ? 12 : 0) +
        (signals.hasFooter ? 8 : 0) +
        (signals.pageCount >= 2 ? 8 : 0),
      ["header", "main", "footer"].filter((_, i) =>
        [signals.hasHeader, signals.hasMain, signals.hasFooter][i],
      ),
      !signals.hasMain ? ["Missing main content landmark"] : [],
    ),
    sub(
      "spacing",
      "Spacing",
      45 + Math.min(30, signals.whitespaceUtilityCount * 2) + (signals.cssVariableCount > 5 ? 15 : 0),
      signals.whitespaceUtilityCount > 0 ? ["spacing utilities detected"] : [],
      signals.whitespaceUtilityCount < 3 ? ["Limited spacing system"] : [],
    ),
    sub(
      "typography",
      "Typography",
      50 + Math.min(25, signals.fontFamilyDeclarations * 8) + (signals.headingLevels.length >= 3 ? 15 : 0),
      signals.fontFamilyDeclarations > 0 ? ["font families declared"] : [],
      signals.fontFamilyDeclarations === 0 ? ["No explicit typography system"] : [],
    ),
    sub(
      "hierarchy",
      "Hierarchy",
      40 +
        (signals.h1Count === 1 ? 20 : signals.h1Count > 0 ? 10 : 0) +
        Math.min(25, new Set(signals.headingLevels).size * 8),
      signals.h1Count === 1 ? ["single H1"] : [],
      signals.h1Count === 0 ? ["Missing H1"] : signals.h1Count > 1 ? ["Multiple H1 headings"] : [],
    ),
    sub(
      "consistency",
      "Consistency",
      55 + (signals.cssVariableCount >= 8 ? 20 : signals.cssVariableCount >= 4 ? 10 : 0),
      signals.cssVariableCount >= 4 ? ["design tokens via CSS variables"] : [],
      signals.cssVariableCount < 4 ? ["Weak design token consistency"] : [],
    ),
    sub(
      "whiteSpace",
      "White Space",
      50 + Math.min(35, signals.whitespaceUtilityCount * 3),
      [],
      signals.whitespaceUtilityCount < 5 ? ["Insufficient whitespace rhythm"] : [],
    ),
    sub(
      "balance",
      "Balance",
      50 +
        (signals.hasNav && signals.hasMain ? 15 : 0) +
        (signals.hasFooter ? 10 : 0) +
        (signals.mediaQueryCount >= 2 ? 15 : 0),
      signals.mediaQueryCount >= 2 ? ["responsive breakpoints"] : [],
      [],
    ),
  ];
  return category("visualDesign", subs);
}

export function evaluateUserExperience(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const subs = [
    sub(
      "navigation",
      "Navigation",
      45 + (signals.hasNav ? 25 : 0) + Math.min(20, signals.internalLinkCount * 2),
      signals.hasNav ? ["nav landmark present"] : [],
      !signals.hasNav ? ["Missing navigation"] : [],
    ),
    sub(
      "informationArchitecture",
      "Information Architecture",
      50 + Math.min(30, signals.pageCount * 8) + (signals.headingLevels.length >= 4 ? 12 : 0),
      signals.pageCount >= 2 ? ["multi-page structure"] : [],
      signals.pageCount < 2 ? ["Single-page only — limited IA depth"] : [],
    ),
    sub(
      "accessibilityUx",
      "Accessibility UX",
      50 + (signals.hasMain ? 15 : 0) + (signals.langAttribute ? 15 : 0) + (signals.ariaAttributeCount > 0 ? 10 : 0),
      [],
      !signals.langAttribute ? ["Missing language declaration"] : [],
    ),
    sub(
      "mobileUx",
      "Mobile UX",
      45 + Math.min(40, signals.mediaQueryCount * 10),
      signals.mediaQueryCount > 0 ? [`${signals.mediaQueryCount} media queries`] : [],
      signals.mediaQueryCount === 0 ? ["No responsive breakpoints detected"] : [],
    ),
    sub(
      "interaction",
      "Interaction",
      50 + Math.min(25, signals.ctaCount * 3) + (signals.formCount > 0 ? 15 : 0) + (signals.focusVisibleStyles ? 10 : 0),
      signals.ctaCount > 0 ? ["CTAs present"] : [],
      signals.ctaCount === 0 ? ["No clear interaction points"] : [],
    ),
  ];
  return category("userExperience", subs);
}

export function evaluateBusiness(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const subs = [
    sub(
      "trust",
      "Trust",
      45 + Math.min(25, signals.trustBadgeCount * 5) + (signals.testimonialCount > 0 ? 20 : 0),
      signals.testimonialCount > 0 ? ["social proof detected"] : [],
      signals.trustBadgeCount === 0 && signals.testimonialCount === 0 ? ["No trust signals"] : [],
    ),
    sub(
      "conversion",
      "Conversion",
      40 + Math.min(35, signals.ctaCount * 4) + (signals.formCount > 0 ? 15 : 0),
      signals.ctaCount > 0 ? ["conversion CTAs"] : [],
      signals.ctaCount < 2 ? ["Weak conversion path"] : [],
    ),
    sub("cta", "CTA", 45 + Math.min(40, signals.ctaCount * 5), [], signals.ctaCount === 0 ? ["No CTA detected"] : []),
    sub(
      "leadCapture",
      "Lead Capture",
      50 + (signals.formCount > 0 ? 30 : 0) + (signals.ctaCount > 1 ? 10 : 0),
      signals.formCount > 0 ? ["forms present"] : [],
      signals.formCount === 0 ? ["No lead capture forms"] : [],
    ),
    sub(
      "pricing",
      "Pricing",
      50 + Math.min(40, signals.pricingSectionCount * 8),
      signals.pricingSectionCount > 0 ? ["pricing content"] : [],
      signals.pricingSectionCount === 0 ? ["No pricing section"] : [],
    ),
    sub(
      "socialProof",
      "Social Proof",
      50 + Math.min(40, signals.testimonialCount * 10),
      signals.testimonialCount > 0 ? ["testimonials/reviews"] : [],
      signals.testimonialCount === 0 ? ["No social proof"] : [],
    ),
  ];
  return category("business", subs);
}

export function evaluateSeo(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const subs = [
    sub(
      "metadata",
      "Metadata",
      40 +
        (signals.metaTitleCount > 0 ? 25 : 0) +
        (signals.metaDescriptionCount > 0 ? 25 : 0),
      [],
      signals.metaTitleCount === 0 ? ["Missing page title"] : [],
    ),
    sub(
      "headings",
      "Headings",
      45 +
        (signals.h1Count === 1 ? 25 : 0) +
        Math.min(20, new Set(signals.headingLevels).size * 5),
      [],
      signals.h1Count !== 1 ? ["Heading structure needs improvement"] : [],
    ),
    sub(
      "schema",
      "Schema",
      50 + Math.min(40, signals.schemaMarkupCount * 20),
      signals.schemaMarkupCount > 0 ? ["structured data"] : [],
      signals.schemaMarkupCount === 0 ? ["No schema markup"] : [],
    ),
    sub(
      "internalLinks",
      "Internal Links",
      50 + Math.min(40, signals.internalLinkCount * 4),
      signals.internalLinkCount > 0 ? [`${signals.internalLinkCount} internal links`] : [],
      signals.internalLinkCount < 2 ? ["Weak internal linking"] : [],
    ),
    sub(
      "contentDepth",
      "Content Depth",
      45 + Math.min(40, Math.floor(signals.wordCount / 50)),
      signals.wordCount > 300 ? ["substantial content"] : [],
      signals.wordCount < 200 ? ["Thin content for SEO"] : [],
    ),
    sub(
      "technicalSeo",
      "Technical SEO",
      55 + (signals.langAttribute ? 15 : 0) + (signals.hasMain ? 10 : 0) + (signals.pageCount >= 2 ? 10 : 0),
      [],
      [],
    ),
  ];
  return category("seo", subs);
}

export function evaluatePerformance(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const altRatio =
    signals.imageCount === 0 ? 1 : signals.imagesWithAlt / signals.imageCount;
  const lazyRatio =
    signals.imageCount === 0 ? 1 : signals.lazyLoadCount / signals.imageCount;
  const bundlePenalty = signals.totalBytes > 200_000 ? 15 : signals.totalBytes > 100_000 ? 8 : 0;

  const subs = [
    sub(
      "images",
      "Images",
      55 + (signals.imageCount > 0 ? 15 : 10) + Math.round(altRatio * 20),
      signals.imageCount > 0 ? [`${signals.imageCount} images`] : [],
      signals.imageCount > 0 && altRatio < 0.8 ? ["Images missing alt text"] : [],
    ),
    sub(
      "rendering",
      "Rendering",
      70 - bundlePenalty + (signals.cssFiles.length <= 3 ? 10 : 0),
      [],
      bundlePenalty > 0 ? ["Large artifact size may slow rendering"] : [],
    ),
    sub(
      "criticalPath",
      "Critical Path",
      60 + (signals.cssVariableCount > 0 ? 10 : 0) + (signals.fontFamilyDeclarations <= 3 ? 15 : 0),
      [],
      signals.fontFamilyDeclarations > 4 ? ["Many font declarations — review critical path"] : [],
    ),
    sub(
      "lazyLoading",
      "Lazy Loading",
      50 + Math.round(lazyRatio * 40),
      signals.lazyLoadCount > 0 ? ["lazy loading detected"] : [],
      signals.imageCount > 2 && signals.lazyLoadCount === 0 ? ["No lazy loading on images"] : [],
    ),
    sub(
      "bundleSize",
      "Bundle Size",
      clamp(90 - bundlePenalty - Math.min(20, Math.floor(signals.totalBytes / 20_000))),
      [],
      signals.totalBytes > 150_000 ? ["Consider reducing generated file size"] : [],
    ),
  ];
  return category("performance", subs);
}

export function evaluateAccessibility(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const altRatio =
    signals.imageCount === 0 ? 1 : signals.imagesWithAlt / signals.imageCount;

  const subs = [
    sub(
      "wcag",
      "WCAG",
      50 +
        (signals.langAttribute ? 15 : 0) +
        (signals.hasMain ? 15 : 0) +
        (signals.h1Count === 1 ? 10 : 0),
      [],
      !signals.langAttribute ? ["WCAG 3.1.1 — missing lang"] : [],
    ),
    sub(
      "keyboard",
      "Keyboard",
      55 + (signals.focusVisibleStyles ? 25 : 0) + (signals.hasNav ? 10 : 0),
      signals.focusVisibleStyles ? ["focus styles present"] : [],
      !signals.focusVisibleStyles ? ["No focus-visible styles detected"] : [],
    ),
    sub(
      "aria",
      "ARIA",
      50 + Math.min(40, signals.ariaAttributeCount * 4),
      signals.ariaAttributeCount > 0 ? [`${signals.ariaAttributeCount} ARIA attributes`] : [],
      signals.ariaAttributeCount === 0 ? ["No ARIA attributes"] : [],
    ),
    sub(
      "contrast",
      "Contrast",
      65 + (signals.cssVariableCount >= 4 ? 15 : 0),
      signals.cssVariableCount >= 4 ? ["tokenized colors support contrast auditing"] : [],
      [],
    ),
    sub(
      "focus",
      "Focus",
      50 + (signals.focusVisibleStyles ? 35 : 0) + (signals.formCount > 0 ? 10 : 0),
      [],
      !signals.focusVisibleStyles ? ["Improve focus indicators"] : [],
    ),
  ];
  return category("accessibility", subs);
}

export function evaluateContent(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const subs = [
    sub(
      "clarity",
      "Clarity",
      50 + Math.min(35, Math.floor(signals.wordCount / 40)),
      signals.wordCount > 200 ? ["adequate copy volume"] : [],
      signals.wordCount < 100 ? ["Very little readable content"] : [],
    ),
    sub(
      "structure",
      "Structure",
      50 +
        (signals.h1Count === 1 ? 15 : 0) +
        Math.min(25, new Set(signals.headingLevels).size * 6),
      [],
      signals.headingLevels.length < 2 ? ["Weak content structure"] : [],
    ),
    sub(
      "readability",
      "Readability",
      55 + (signals.avgWordsPerSection >= 30 && signals.avgWordsPerSection <= 120 ? 25 : 10),
      [],
      signals.avgWordsPerSection < 20 ? ["Sections may be too sparse"] : [],
    ),
    sub(
      "brandVoice",
      "Brand Voice",
      60 + (signals.cssVariableCount > 0 ? 10 : 0) + (signals.hasHeader ? 10 : 0),
      [],
      [],
    ),
    sub(
      "consistency",
      "Consistency",
      55 + (signals.pageCount > 1 && signals.hasNav ? 20 : 10) + (signals.cssVariableCount >= 4 ? 10 : 0),
      [],
      [],
    ),
  ];
  return category("content", subs);
}

export function evaluateLocalization(signals: WqbsArtifactSignals): WqbsCategoryEvaluation {
  const subs = [
    sub(
      "language",
      "Language",
      50 + (signals.langAttribute ? 40 : 0),
      signals.langAttribute ? ["lang attribute set"] : [],
      !signals.langAttribute ? ["Missing language declaration"] : [],
    ),
    sub(
      "rtlLtr",
      "RTL/LTR",
      70 + (signals.dirAttribute ? 20 : 0) + (signals.rtlHints ? 5 : 0),
      signals.dirAttribute ? ["text direction declared"] : ["LTR default assumed"],
      signals.rtlHints && !signals.dirAttribute ? ["RTL content without dir attribute"] : [],
    ),
    sub(
      "typography",
      "Typography",
      55 + Math.min(30, signals.fontFamilyDeclarations * 8),
      [],
      [],
    ),
    sub(
      "formatting",
      "Formatting",
      60 + (signals.langAttribute ? 15 : 0) + (signals.cssVariableCount > 0 ? 10 : 0),
      [],
      [],
    ),
    sub(
      "locale",
      "Locale",
      55 + (signals.langAttribute ? 25 : 0) + (signals.metaDescriptionCount > 0 ? 10 : 0),
      [],
      !signals.langAttribute ? ["Locale metadata incomplete"] : [],
    ),
  ];
  return category("localization", subs);
}

export function evaluateAllCategories(
  signals: WqbsArtifactSignals,
): WqbsCategoryEvaluation[] {
  return [
    evaluateVisualDesign(signals),
    evaluateUserExperience(signals),
    evaluateBusiness(signals),
    evaluateSeo(signals),
    evaluatePerformance(signals),
    evaluateAccessibility(signals),
    evaluateContent(signals),
    evaluateLocalization(signals),
  ];
}
