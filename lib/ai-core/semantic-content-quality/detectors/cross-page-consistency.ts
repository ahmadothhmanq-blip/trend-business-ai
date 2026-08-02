import type {
  SemanticQualityContext,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

function extractH1Texts(content: string): string[] {
  return [...content.matchAll(/<h1[^>]*>([^<]{4,120})<\/h1>/gi)].map((m) =>
    (m[1] ?? "").trim().toLowerCase(),
  );
}

function extractNavLabels(content: string): string[] {
  return [
    ...content.matchAll(/(?:nav|menu|links)\s*[:=]\s*\[([^\]]+)\]/gi),
    ...content.matchAll(/<(?:Link|a)[^>]*>([^<]{2,40})<\//gi),
  ]
    .map((m) => (m[1] ?? "").trim().toLowerCase())
    .filter((label) => label.length >= 2);
}

export function detectCrossPageConsistency(
  context: SemanticQualityContext,
): SemanticQualityIssue[] {
  const issues: SemanticQualityIssue[] = [];
  const pageFiles = context.files.filter((f) => /page\.tsx$/i.test(f.path));
  const h1s = pageFiles.flatMap((f) => extractH1Texts(f.content));
  const uniqueH1 = [...new Set(h1s)];

  if (uniqueH1.length >= 2 && new Set(h1s).size < h1s.length) {
    issues.push({
      id: "crosspage-duplicate-h1",
      dimension: "crossPageConsistency",
      severity: "warning",
      message: "Duplicate H1 headlines detected across multiple pages.",
      repairHint: "Give each page a unique, descriptive H1.",
    });
  }

  if (context.brandName) {
    const brand = context.brandName.toLowerCase();
    const pagesWithBrand = pageFiles.filter((f) =>
      f.content.toLowerCase().includes(brand),
    );
    if (pageFiles.length >= 2 && pagesWithBrand.length === 0) {
      issues.push({
        id: "crosspage-brand-missing",
        dimension: "crossPageConsistency",
        severity: "warning",
        message: `Brand name "${context.brandName}" is not reflected across pages.`,
        repairHint: "Use consistent brand naming in headers and footers.",
      });
    }
  }

  const navLabels = context.files.flatMap((f) => extractNavLabels(f.content));
  const navSet = new Set(navLabels);
  if (navLabels.length >= 4 && navSet.size < navLabels.length * 0.6) {
    issues.push({
      id: "crosspage-nav-repetition",
      dimension: "crossPageConsistency",
      severity: "warning",
      message: "Navigation labels appear highly repetitive across files.",
      repairHint: "Ensure nav labels map cleanly to distinct page intents.",
    });
  }

  const heroSnippets = pageFiles.map((f) => {
    const match = f.content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    return match?.[1]?.trim().toLowerCase() ?? "";
  });
  const nonEmptyHero = heroSnippets.filter(Boolean);
  if (
    nonEmptyHero.length >= 2 &&
    nonEmptyHero.every((h) => h === nonEmptyHero[0])
  ) {
    issues.push({
      id: "crosspage-identical-hero",
      dimension: "crossPageConsistency",
      severity: "warning",
      message: "Multiple pages share identical hero headlines.",
      repairHint: "Differentiate page headlines by intent and audience.",
    });
  }

  return issues;
}
