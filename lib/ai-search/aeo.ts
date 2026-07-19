import { z } from "zod";
import {
  clampScore,
  detectAnswerFirst,
  estimateReadability,
  extractQuestions,
  gradeFromScore,
  wordCount,
} from "@/lib/ai-search/utils";
import type { AeoAnalyzeResult, AiSearchIssue } from "@/types/ai-search";

export const aeoAnalyzeBodySchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  path: z.string().max(300).optional(),
  content: z.string().max(30000).optional(),
  headings: z.array(z.string().max(200)).max(50).optional(),
  faqs: z
    .array(
      z.object({
        question: z.string().max(300),
        answer: z.string().max(2000),
      }),
    )
    .max(30)
    .optional(),
  internalLinkCount: z.number().int().min(0).max(500).optional(),
  useAi: z.boolean().optional(),
});

export type AeoAnalyzeBody = z.infer<typeof aeoAnalyzeBodySchema>;

export function analyzeAeo(input: AeoAnalyzeBody): AeoAnalyzeResult {
  const issues: AiSearchIssue[] = [];
  const strengths: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  const title = input.title?.trim() ?? "";
  const description = input.description?.trim() ?? "";
  const content = input.content?.trim() ?? "";
  const headings = input.headings ?? [];
  const faqs = input.faqs ?? [];
  const combined = [title, description, content, ...headings, ...faqs.map((f) => `${f.question} ${f.answer}`)].join(
    "\n",
  );
  const questions = extractQuestions(combined);
  const answerFirst = detectAnswerFirst(content || description);
  const readability = estimateReadability(content || description);
  const words = wordCount(content);
  const linkCount = input.internalLinkCount ?? 0;

  let faqQuality = 0;
  if (faqs.length === 0 && questions.length === 0) {
    score -= 18;
    issues.push({
      id: "faq-missing",
      severity: "critical",
      message: "No FAQ or question coverage detected.",
      recommendation: "Add 3–8 FAQ pairs that mirror real search questions.",
    });
  } else {
    const answered = faqs.filter((f) => f.question.trim() && f.answer.trim().length >= 40);
    faqQuality = clampScore((answered.length / Math.max(faqs.length || questions.length, 1)) * 100);
    if (answered.length >= 3) {
      strengths.push("FAQ answers are present with usable length.");
    } else {
      score -= 10;
      issues.push({
        id: "faq-thin",
        severity: "warning",
        message: "FAQ coverage is thin for answer engines.",
        recommendation: "Expand FAQ answers to 40+ words with direct, citable statements.",
      });
    }
  }

  if (!answerFirst) {
    score -= 12;
    issues.push({
      id: "answer-first",
      severity: "warning",
      message: "Content does not open with a direct answer.",
      recommendation: "Lead with a 1–2 sentence definition or answer before narrative detail.",
    });
  } else {
    strengths.push("Answer-first opening detected.");
  }

  const headingDepth = headings.length;
  if (headingDepth < 2) {
    score -= 8;
    issues.push({
      id: "heading-structure",
      severity: "warning",
      message: "Heading structure is shallow for AEO extraction.",
      recommendation: "Use clear H2 question-style headings that AI systems can cite.",
    });
  } else {
    strengths.push("Heading structure supports scannable answers.");
  }

  const questionHeadings = headings.filter((h) => /\?$/.test(h) || /^(what|how|why|when|where|who)\b/i.test(h));
  if (questionHeadings.length === 0 && questions.length < 2) {
    score -= 8;
    issues.push({
      id: "question-coverage",
      severity: "warning",
      message: "Low question coverage for answer engines.",
      recommendation: "Frame key sections as natural-language questions users ask.",
    });
  } else {
    strengths.push("Question coverage signals are present.");
  }

  if (readability < 60) {
    score -= 8;
    issues.push({
      id: "readability",
      severity: "info",
      message: "Readability may hinder answer extraction.",
      recommendation: "Shorten sentences and use plain, definitive language.",
    });
  } else if (readability >= 80) {
    strengths.push("Readability is strong for AI citation.");
  }

  if (linkCount < 2) {
    score -= 5;
    issues.push({
      id: "internal-links",
      severity: "info",
      message: "Internal links are limited.",
      recommendation: "Link related tools, FAQs and guides to strengthen topical context.",
    });
  } else {
    strengths.push("Internal links support topical grounding.");
  }

  if (words > 0 && words < 150) {
    score -= 6;
    issues.push({
      id: "thin-answer-content",
      severity: "warning",
      message: "On-page copy is thin for durable AI answers.",
      recommendation: "Expand with definitions, steps and evidence AI engines can quote.",
    });
  }

  const directAnswerDensity = clampScore(
    ((answerFirst ? 35 : 0) + Math.min(40, questions.length * 8) + Math.min(25, faqs.length * 5)),
  );

  score = clampScore(score);

  if (faqQuality < 70) recommendations.push("Improve FAQ answer depth and uniqueness.");
  if (!answerFirst) recommendations.push("Rewrite the intro as an answer-first summary.");
  if (headingDepth < 3) recommendations.push("Add question-led H2 sections for ChatGPT/Perplexity extraction.");
  if (linkCount < 3) recommendations.push("Add contextual internal links to related product and knowledge pages.");

  return {
    score,
    grade: gradeFromScore(score),
    issues: issues.sort((a, b) => {
      const order = { critical: 0, warning: 1, info: 2 } as const;
      return order[a.severity] - order[b.severity];
    }),
    strengths,
    metrics: {
      questionCount: Math.max(questions.length, faqs.length),
      answerFirstDetected: answerFirst,
      faqQuality,
      headingDepth,
      readabilityScore: readability,
      internalLinkCount: linkCount,
      directAnswerDensity,
    },
    recommendations: recommendations.slice(0, 8),
    source: "rules",
  };
}

export async function enrichAeoWithAi(
  result: AeoAnalyzeResult,
  input: AeoAnalyzeBody,
): Promise<AeoAnalyzeResult> {
  try {
    const { providerManager } = await import("@/lib/ai/provider-manager");
    const { getDefaultTextProvider } = await import("@/lib/ai/provider-config");
    const providerName = providerManager.resolve(getDefaultTextProvider());
    if (!providerName) return result;

    const insights = await providerManager.generateText(
      {
        system:
          "You are an Answer Engine Optimization (AEO) specialist. Advise for Google AI Mode, ChatGPT, Perplexity and Copilot. 4-6 concise actionable sentences. No markdown headings.",
        prompt: `AEO score ${result.score}/100 (${result.grade})
Title: ${input.title ?? ""}
Path: ${input.path ?? ""}
FAQ count: ${input.faqs?.length ?? 0}
Issues: ${result.issues
          .slice(0, 5)
          .map((i) => i.message)
          .join("; ")}
Excerpt: ${(input.content ?? "").slice(0, 900)}

Recommend AEO improvements for AI answer engines.`,
        temperature: 0.35,
      },
      providerName,
    );

    return { ...result, aiInsights: insights.trim(), source: "rules+ai" };
  } catch {
    return result;
  }
}
