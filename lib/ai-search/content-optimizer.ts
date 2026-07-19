import { z } from "zod";
import {
  generateDynamicDescription,
  generateDynamicTitle,
} from "@/lib/seo/dynamic-engine";
import { faqPageJsonLd, webPageJsonLd } from "@/lib/seo/json-ld";
import { getRelatedTools, getRelatedProgrammaticLinks } from "@/lib/seo/internal-links";
import { SITE_NAME } from "@/lib/seo/site";
import { extractQuestions } from "@/lib/ai-search/utils";
import type { ContentOptimizeResult } from "@/types/ai-search";
import type { MarketingProductSlug } from "@/lib/constants/marketing-content";

export const contentOptimizeBodySchema = z.object({
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  path: z.string().max(300).optional(),
  content: z.string().max(30000).optional(),
  keywords: z.array(z.string().max(80)).max(20).optional(),
  productSlug: z.string().max(80).optional(),
  useAi: z.boolean().optional(),
});

export type ContentOptimizeBody = z.infer<typeof contentOptimizeBodySchema>;

function buildFaqs(input: ContentOptimizeBody): Array<{ question: string; answer: string }> {
  const content = input.content?.trim() ?? "";
  const title = input.title?.trim() || "this page";
  const description = input.description?.trim() || "";
  const extracted = extractQuestions([title, description, content].join("\n")).slice(0, 4);

  if (extracted.length) {
    return extracted.map((question) => ({
      question,
      answer:
        description ||
        content.slice(0, 220) ||
        `${SITE_NAME} helps teams accomplish this with AI-assisted planning and creation workflows.`,
    }));
  }

  return [
    {
      question: `What is ${title}?`,
      answer:
        description ||
        `${title} is part of ${SITE_NAME}, an AI business workspace for planning, creation and growth.`,
    },
    {
      question: `How does ${SITE_NAME} help with ${title}?`,
      answer:
        content.slice(0, 260) ||
        `${SITE_NAME} generates structured outputs, saves them to your dashboard, and connects related tools so teams move faster.`,
    },
    {
      question: "Who is this for?",
      answer:
        "Founders, marketers, agencies and operators who need AI-assisted websites, branding, content and business planning in one place.",
    },
  ];
}

export function optimizeContent(input: ContentOptimizeBody): ContentOptimizeResult {
  const keywords = input.keywords ?? [];
  const path = input.path?.trim() || "/";
  const seedTitle = input.title?.trim() || "Untitled page";
  const seedDescription =
    input.description?.trim() ||
    input.content?.trim().slice(0, 150) ||
    `${SITE_NAME} page for ${seedTitle}`;

  const title = generateDynamicTitle({
    primary: seedTitle,
    suffix: keywords[0],
  }).slice(0, 60);

  const metaDescription = generateDynamicDescription({
    summary: seedDescription,
    keywords,
  }).slice(0, 160);

  const faq = buildFaqs(input);
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      (() => {
        const page = webPageJsonLd({
          name: title,
          description: metaDescription,
          path,
        });
        const { ["@context"]: _ignoredContext, ...rest } = page;
        void _ignoredContext;
        return rest;
      })(),
      (() => {
        const faqNode = faqPageJsonLd(faq);
        const { ["@context"]: _ignoredContext, ...rest } = faqNode;
        void _ignoredContext;
        return rest;
      })(),
    ],
  };

  const related =
    input.productSlug
      ? getRelatedTools(input.productSlug as MarketingProductSlug, 4)
      : getRelatedProgrammaticLinks(4);

  const internalLinks = related.map((link) => ({
    label: link.title,
    href: link.href,
    reason: link.description || "Related topical page for internal linking",
  }));

  const aiSummary =
    metaDescription.length >= 80
      ? metaDescription
      : `${title} — ${metaDescription} Built for AI search discoverability with clear entities and answers.`;

  const callToAction = `Open ${SITE_NAME} to generate ${seedTitle.toLowerCase()} assets in your authenticated workspace.`;

  return {
    title,
    metaDescription,
    openGraph: {
      title,
      description: metaDescription,
      type: "website",
    },
    faq,
    schema,
    aiSummary,
    callToAction,
    internalLinks,
    source: "rules",
  };
}

export async function enrichContentOptimizeWithAi(
  result: ContentOptimizeResult,
  input: ContentOptimizeBody,
): Promise<ContentOptimizeResult> {
  try {
    const { providerManager } = await import("@/lib/ai/provider-manager");
    const { getDefaultTextProvider } = await import("@/lib/ai/provider-config");
    const providerName = providerManager.resolve(getDefaultTextProvider());
    if (!providerName) return result;

    const raw = await providerManager.generateText(
      {
        system:
          "You optimize pages for Google, AI Overviews, ChatGPT, Perplexity and Copilot. Return plain text sections exactly in this order with labels: TITLE:, META:, SUMMARY:, CTA:, FAQ1_Q:, FAQ1_A:, FAQ2_Q:, FAQ2_A:. No markdown.",
        prompt: `Seed title: ${input.title ?? result.title}
Seed description: ${input.description ?? result.metaDescription}
Path: ${input.path ?? "/"}
Keywords: ${(input.keywords ?? []).join(", ")}
Content excerpt: ${(input.content ?? "").slice(0, 1200)}

Improve TITLE (max 60 chars), META (max 155 chars), SUMMARY (2 sentences), CTA (1 sentence), and two FAQ pairs.`,
        temperature: 0.4,
      },
      providerName,
    );

    const pick = (label: string) => {
      const match = raw.match(new RegExp(`${label}:\\s*(.+)`, "i"));
      return match?.[1]?.trim();
    };

    const title = pick("TITLE") || result.title;
    const metaDescription = pick("META") || result.metaDescription;
    const aiSummary = pick("SUMMARY") || result.aiSummary;
    const callToAction = pick("CTA") || result.callToAction;
    const faq = [
      {
        question: pick("FAQ1_Q") || result.faq[0]?.question || "",
        answer: pick("FAQ1_A") || result.faq[0]?.answer || "",
      },
      {
        question: pick("FAQ2_Q") || result.faq[1]?.question || "",
        answer: pick("FAQ2_A") || result.faq[1]?.answer || "",
      },
      ...result.faq.slice(2),
    ].filter((f) => f.question && f.answer);

    return {
      ...result,
      title: title.slice(0, 60),
      metaDescription: metaDescription.slice(0, 160),
      openGraph: {
        title: title.slice(0, 60),
        description: metaDescription.slice(0, 160),
        type: "website",
      },
      faq: faq.length ? faq : result.faq,
      aiSummary,
      callToAction,
      schema: {
        ...result.schema,
        "@graph": [
          (() => {
            const page = webPageJsonLd({
              name: title.slice(0, 60),
              description: metaDescription.slice(0, 160),
              path: input.path || "/",
            });
            const { ["@context"]: _ignoredContext, ...rest } = page;
            void _ignoredContext;
            return rest;
          })(),
          (() => {
            const faqNode = faqPageJsonLd(faq.length ? faq : result.faq);
            const { ["@context"]: _ignoredContext, ...rest } = faqNode;
            void _ignoredContext;
            return rest;
          })(),
        ],
      },
      source: "rules+ai",
    };
  } catch {
    return result;
  }
}
