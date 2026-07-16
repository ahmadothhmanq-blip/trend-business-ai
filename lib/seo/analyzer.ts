/**
 * SEO Analyzer — deterministic health scoring + optional AI enrichment.
 */
import { z } from "zod";
import {
  generateDynamicDescription,
  generateDynamicTitle,
} from "@/lib/seo/dynamic-engine";

export type SeoIssueSeverity = "critical" | "warning" | "info";

export type SeoIssue = {
  id: string;
  severity: SeoIssueSeverity;
  message: string;
  recommendation: string;
};

export type SeoAnalyzeInput = {
  title?: string;
  description?: string;
  path?: string;
  content?: string;
  headings?: string[];
  keywords?: string[];
  hasCanonical?: boolean;
  hasOpenGraph?: boolean;
  hasTwitterCard?: boolean;
  hasJsonLd?: boolean;
  hasH1?: boolean;
  internalLinkCount?: number;
  imageAltMissing?: number;
};

export type SeoAnalyzeResult = {
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  issues: SeoIssue[];
  strengths: string[];
  suggestions: {
    title: string;
    description: string;
  };
  metrics: {
    titleLength: number;
    descriptionLength: number;
    wordCount: number;
    headingCount: number;
  };
  aiInsights?: string;
  source: "rules" | "rules+ai";
};

function gradeFromScore(score: number): SeoAnalyzeResult["grade"] {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 55) return "D";
  return "F";
}

function wordCount(text: string) {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

export function analyzeSeo(input: SeoAnalyzeInput): SeoAnalyzeResult {
  const issues: SeoIssue[] = [];
  const strengths: string[] = [];
  let score = 100;

  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const path = input.path?.trim() ?? "";
  const content = input.content?.trim() ?? "";
  const headings = input.headings ?? [];
  const keywords = (input.keywords ?? []).map((k) => k.toLowerCase());

  const titleLen = title.length;
  const descLen = description.length;
  const words = wordCount(content);

  if (!title) {
    score -= 20;
    issues.push({
      id: "title-missing",
      severity: "critical",
      message: "Title is missing.",
      recommendation: "Add a unique primary title under 60 characters.",
    });
  } else if (titleLen < 20) {
    score -= 10;
    issues.push({
      id: "title-short",
      severity: "warning",
      message: "Title is too short for strong SERP presence.",
      recommendation: "Expand the title to 30–60 characters with a clear intent.",
    });
  } else if (titleLen > 60) {
    score -= 8;
    issues.push({
      id: "title-long",
      severity: "warning",
      message: "Title may truncate in search results.",
      recommendation: "Keep titles at or under 60 characters.",
    });
  } else {
    strengths.push("Title length is within the recommended range.");
  }

  if (!description) {
    score -= 18;
    issues.push({
      id: "description-missing",
      severity: "critical",
      message: "Meta description is missing.",
      recommendation: "Write a compelling 120–160 character description.",
    });
  } else if (descLen < 80) {
    score -= 8;
    issues.push({
      id: "description-short",
      severity: "warning",
      message: "Meta description is short.",
      recommendation: "Aim for 120–160 characters with a clear value proposition.",
    });
  } else if (descLen > 160) {
    score -= 6;
    issues.push({
      id: "description-long",
      severity: "warning",
      message: "Meta description may truncate.",
      recommendation: "Trim to 160 characters or fewer.",
    });
  } else {
    strengths.push("Meta description length looks healthy.");
  }

  if (!path) {
    score -= 6;
    issues.push({
      id: "path-missing",
      severity: "warning",
      message: "Canonical path is missing.",
      recommendation: "Provide a stable absolute path for canonicalization.",
    });
  } else if (!path.startsWith("/")) {
    score -= 4;
    issues.push({
      id: "path-format",
      severity: "info",
      message: "Path should start with /.",
      recommendation: "Use root-relative paths like /products/website-builder.",
    });
  } else if (path.length > 90) {
    score -= 4;
    issues.push({
      id: "path-long",
      severity: "info",
      message: "URL path is relatively long.",
      recommendation: "Prefer concise, readable slugs.",
    });
  } else {
    strengths.push("URL path format looks clean.");
  }

  if (input.hasCanonical === false) {
    score -= 10;
    issues.push({
      id: "canonical-missing",
      severity: "critical",
      message: "Canonical URL is not set.",
      recommendation: "Emit a self-referencing canonical for every indexable page.",
    });
  } else if (input.hasCanonical) {
    strengths.push("Canonical tag is present.");
  }

  if (input.hasOpenGraph === false) {
    score -= 6;
    issues.push({
      id: "og-missing",
      severity: "warning",
      message: "Open Graph tags appear incomplete.",
      recommendation: "Include og:title, og:description, og:url and og:image.",
    });
  } else if (input.hasOpenGraph) {
    strengths.push("Open Graph metadata is present.");
  }

  if (input.hasTwitterCard === false) {
    score -= 4;
    issues.push({
      id: "twitter-missing",
      severity: "info",
      message: "Twitter Card metadata missing.",
      recommendation: "Add twitter:card summary_large_image tags.",
    });
  }

  if (input.hasJsonLd === false) {
    score -= 8;
    issues.push({
      id: "jsonld-missing",
      severity: "warning",
      message: "Structured data (JSON-LD) is missing.",
      recommendation: "Add Organization, WebPage, Breadcrumb or Product schema as relevant.",
    });
  } else if (input.hasJsonLd) {
    strengths.push("JSON-LD structured data is present.");
  }

  if (input.hasH1 === false) {
    score -= 8;
    issues.push({
      id: "h1-missing",
      severity: "warning",
      message: "No H1 detected.",
      recommendation: "Use exactly one descriptive H1 matching page intent.",
    });
  } else if (input.hasH1) {
    strengths.push("Primary heading (H1) is present.");
  }

  if (content && words < 120) {
    score -= 8;
    issues.push({
      id: "thin-content",
      severity: "warning",
      message: "Content looks thin for competitive rankings.",
      recommendation: "Expand useful on-page copy to at least 300+ words where appropriate.",
    });
  } else if (words >= 300) {
    strengths.push("On-page content volume looks substantial.");
  }

  if (typeof input.internalLinkCount === "number") {
    if (input.internalLinkCount < 2) {
      score -= 5;
      issues.push({
        id: "internal-links-low",
        severity: "info",
        message: "Few internal links detected.",
        recommendation: "Add contextual links to related tools, guides and templates.",
      });
    } else {
      strengths.push("Internal linking signals are present.");
    }
  }

  if (typeof input.imageAltMissing === "number" && input.imageAltMissing > 0) {
    score -= Math.min(10, input.imageAltMissing * 2);
    issues.push({
      id: "image-alt",
      severity: "warning",
      message: `${input.imageAltMissing} image(s) missing alt text.`,
      recommendation: "Add descriptive alt attributes for accessibility and image SEO.",
    });
  }

  if (keywords.length && title) {
    const hit = keywords.some((k) => title.toLowerCase().includes(k));
    if (!hit) {
      score -= 4;
      issues.push({
        id: "keyword-title",
        severity: "info",
        message: "Primary keywords are not reflected in the title.",
        recommendation: "Include the primary keyword naturally in the title.",
      });
    } else {
      strengths.push("Primary keyword appears in the title.");
    }
  }

  if (headings.length === 0 && content) {
    score -= 3;
    issues.push({
      id: "headings-missing",
      severity: "info",
      message: "No subheadings provided.",
      recommendation: "Use H2/H3 structure to improve scannability.",
    });
  }

  score = Math.max(0, Math.min(100, score));

  return {
    score,
    grade: gradeFromScore(score),
    issues: issues.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 } as const;
      return order[a.severity] - order[b.severity];
    }),
    strengths,
    suggestions: {
      title: generateDynamicTitle({
        primary: title || "Untitled page",
        suffix: keywords[0],
      }),
      description: generateDynamicDescription({
        summary: description || content.slice(0, 140) || "Describe the page value clearly.",
        keywords,
      }),
    },
    metrics: {
      titleLength: titleLen,
      descriptionLength: descLen,
      wordCount: words,
      headingCount: headings.length,
    },
    source: "rules",
  };
}

export const seoAnalyzeBodySchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  path: z.string().max(300).optional(),
  content: z.string().max(20000).optional(),
  headings: z.array(z.string().max(200)).max(40).optional(),
  keywords: z.array(z.string().max(80)).max(20).optional(),
  hasCanonical: z.boolean().optional(),
  hasOpenGraph: z.boolean().optional(),
  hasTwitterCard: z.boolean().optional(),
  hasJsonLd: z.boolean().optional(),
  hasH1: z.boolean().optional(),
  internalLinkCount: z.number().int().min(0).max(500).optional(),
  imageAltMissing: z.number().int().min(0).max(100).optional(),
  useAi: z.boolean().optional(),
});

export type SeoAnalyzeBody = z.infer<typeof seoAnalyzeBodySchema>;

/** Optional AI narrative on top of rule-based scoring. */
export async function enrichSeoAnalysisWithAi(
  result: SeoAnalyzeResult,
  input: SeoAnalyzeInput,
): Promise<SeoAnalyzeResult> {
  try {
    const { providerManager } = await import("@/lib/ai/provider-manager");
    const providerName = providerManager.resolve();
    if (!providerName) return result;

    const insights = await providerManager.generateText(
      {
        system:
          "You are an enterprise SEO strategist. Give concise, actionable advice in 4-6 bullet-like sentences. No markdown headings.",
        prompt: `Score: ${result.score}/100 (${result.grade})
Title: ${input.title ?? ""}
Description: ${input.description ?? ""}
Path: ${input.path ?? ""}
Top issues: ${result.issues
          .slice(0, 5)
          .map((i) => i.message)
          .join("; ")}
Content excerpt: ${(input.content ?? "").slice(0, 800)}

Provide prioritized SEO improvements for this page.`,
        temperature: 0.4,
      },
      providerName,
    );

    return {
      ...result,
      aiInsights: insights.trim(),
      source: "rules+ai",
    };
  } catch {
    return result;
  }
}
