import type {
  SemanticQualityContext,
  SemanticQualityIssue,
} from "@/lib/ai-core/semantic-content-quality/types";

function extractMetaDescription(content: string): string | null {
  const match =
    content.match(/description:\s*["']([^"']+)["']/i) ??
    content.match(/metaDescription\s*[:=]\s*["']([^"']+)["']/i);
  return match?.[1]?.trim() ?? null;
}

function extractTitle(content: string): string | null {
  const match =
    content.match(/title:\s*["']([^"']+)["']/i) ??
    content.match(/<title>([^<]+)<\/title>/i);
  return match?.[1]?.trim() ?? null;
}

export function detectSemanticSeo(
  context: SemanticQualityContext,
): SemanticQualityIssue[] {
  const issues: SemanticQualityIssue[] = [];
  const layout = context.files.find((f) => f.path.includes("layout.tsx"));
  const home = context.files.find((f) => f.path.endsWith("app/page.tsx"));
  const blob = context.files.map((f) => f.content).join("\n");

  const title = extractTitle(layout?.content ?? "") ?? extractTitle(home?.content ?? "");
  const description =
    extractMetaDescription(layout?.content ?? "") ??
    extractMetaDescription(home?.content ?? "");

  if (!title) {
    issues.push({
      id: "seo-missing-title",
      dimension: "semanticSeo",
      severity: "warning",
      message: "Page title metadata is missing or not detected.",
      repairHint: "Export metadata with a keyword-rich title in layout.tsx.",
      filePath: layout?.path ?? home?.path,
    });
  } else if (title.length < 12) {
    issues.push({
      id: "seo-short-title",
      dimension: "semanticSeo",
      severity: "warning",
      message: "Page title is too short for semantic SEO.",
      filePath: layout?.path,
      repairHint: "Expand title to 30–60 characters with primary keyword.",
    });
  }

  if (!description) {
    issues.push({
      id: "seo-missing-description",
      dimension: "semanticSeo",
      severity: "warning",
      message: "Meta description is missing.",
      filePath: layout?.path,
      repairHint: "Add a unique meta description (120–160 characters).",
    });
  } else if (description.length < 50) {
    issues.push({
      id: "seo-short-description",
      dimension: "semanticSeo",
      severity: "warning",
      message: "Meta description is too short.",
      repairHint: "Expand description with benefits and primary keyword.",
    });
  }

  const keywords = context.seoFocus ?? [];
  if (keywords.length > 0) {
    const lowerBlob = blob.toLowerCase();
    const missing = keywords.filter((kw) => !lowerBlob.includes(kw.toLowerCase()));
    if (missing.length === keywords.length) {
      issues.push({
        id: "seo-keywords-missing",
        dimension: "semanticSeo",
        severity: "warning",
        message: "SEO focus keywords are not reflected in generated copy.",
        repairHint: `Include keywords: ${keywords.slice(0, 4).join(", ")}.`,
      });
    }
  }

  const h1Match = blob.match(/<h1[^>]*>([^<]{4,120})<\/h1>/i);
  if (h1Match?.[1] && title) {
    const h1 = h1Match[1].toLowerCase();
    const titleWords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const overlap = titleWords.filter((w) => h1.includes(w));
    if (overlap.length === 0) {
      issues.push({
        id: "seo-h1-title-mismatch",
        dimension: "semanticSeo",
        severity: "warning",
        message: "H1 topic does not align with page title keywords.",
        repairHint: "Align H1 and title around the same primary keyword.",
      });
    }
  }

  return issues;
}
