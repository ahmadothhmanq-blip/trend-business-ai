import { generateJsonWithValidation } from "@/lib/ai/generator";
import { websiteStrategyPrompt } from "@/lib/ai/prompts/website-layers";
import { buildWebsiteIterationPrompt } from "@/plugins/website/iteration";
import { websiteStrategySchema } from "@/plugins/website/layers/schemas";
import type { WebsiteStrategy } from "@/plugins/website/layers/types";
import type {
  WebsiteGenerationInput,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

function fallbackStrategy(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
): WebsiteStrategy {
  const pages = (analysis.pages.length ? analysis.pages : ["Home", "About", "Contact"]).map(
    (name, i) => ({
      name,
      path: i === 0 ? "/" : `/${name.toLowerCase().replace(/\s+/g, "-")}`,
      purpose: `${name} page for ${analysis.businessProfile.industry}`,
      keySections: ["Hero", "Value", "CTA"],
      primaryCta: "Get started",
    }),
  );

  const required =
    analysis.businessProfile.requiredSections?.length
      ? analysis.businessProfile.requiredSections
      : ["Hero", "Benefits", "Social proof", "CTA"];

  const homeSections = required.slice(0, 5);
  const normalizedPages = pages.map((p, i) =>
    i === 0 ? { ...p, keySections: homeSections } : p,
  );

  return {
    positioning: analysis.businessProfile.summary || analysis.businessProfile.offer,
    sitemap: normalizedPages.map((p) => p.path),
    pages: normalizedPages,
    sectionPlan: normalizedPages.flatMap((p) =>
      p.keySections.map((section, idx) => ({
        id: `${p.name.toLowerCase().replace(/\s+/g, "-")}-${idx}`,
        page: p.name,
        name: section,
        goal: `Support ${p.purpose}`,
        contentNotes: analysis.businessProfile.offer,
      })),
    ),
    conversionFunnel: ["Awareness", "Interest", "Conversion"],
    contentStructure: required,
    contentStrategy: {
      brandVoice: analysis.businessProfile.tone || "Professional",
      messagingPillars: analysis.businessProfile.businessGoals.slice(0, 4),
      proofPoints: ["Customer outcomes", "Trusted expertise"],
      objectionHandlers: ["Clear pricing path", "Fast contact"],
      seoTopics: [analysis.businessProfile.industry, analysis.projectName],
    },
    ctas: ["Get started", "Contact us"],
    seoFocus: [analysis.businessProfile.industry, analysis.projectName],
  };
}

function coerceStrategy(
  strategy: WebsiteStrategy,
  analysis: WebsiteProjectAnalysis,
): WebsiteStrategy {
  const fallback = fallbackStrategy(
    {
      prompt: analysis.businessProfile.summary,
      projectType: analysis.projectType,
      projectKind: "website",
      language: "English",
      theme: analysis.businessProfile.tone,
      features: analysis.features,
    },
    analysis,
  );
  return {
    ...fallback,
    ...strategy,
    contentStrategy: strategy.contentStrategy ?? fallback.contentStrategy,
    contentStructure:
      strategy.contentStructure?.length
        ? strategy.contentStructure
        : fallback.contentStructure,
  };
}

export function validateWebsiteStrategy(value: WebsiteStrategy): {
  valid: boolean;
  reason?: string;
} {
  if (!value.pages?.length) {
    return { valid: false, reason: "strategy.pages required" };
  }
  if (!value.positioning?.trim()) {
    return { valid: false, reason: "strategy.positioning required" };
  }
  return { valid: true };
}

export async function buildWebsiteStrategy(
  input: WebsiteGenerationInput,
  analysis: WebsiteProjectAnalysis,
  ctx: GenerationContext,
): Promise<WebsiteStrategy> {
  ctx.progress.emit("Building strategy...");

  const instruction = input.continueInstruction?.toLowerCase() ?? "";
  if (
    input.mode === "continue" &&
    input.previousStrategy &&
    !instruction.includes("[strategy]") &&
    !instruction.includes("[idea]")
  ) {
    return coerceStrategy(input.previousStrategy, analysis);
  }

  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  try {
    const raw = await generateJsonWithValidation<WebsiteStrategy>({
      provider: ctx.provider,
      prompt: websiteStrategyPrompt(iterationInput, analysis),
      schema: websiteStrategySchema,
      maxAttempts: 3,
      validate: validateWebsiteStrategy,
    });
    return coerceStrategy(raw, analysis);
  } catch (error) {
    console.error("strategy layer failed; using fallback", error);
    return fallbackStrategy(input, analysis);
  }
}
