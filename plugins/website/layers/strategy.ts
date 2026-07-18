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

  return {
    positioning: analysis.businessProfile.summary || analysis.businessProfile.offer,
    sitemap: pages.map((p) => p.path),
    pages,
    sectionPlan: pages.flatMap((p) =>
      p.keySections.map((section, idx) => ({
        id: `${p.name.toLowerCase()}-${idx}`,
        page: p.name,
        name: section,
        goal: `Support ${p.purpose}`,
        contentNotes: analysis.businessProfile.offer,
      })),
    ),
    conversionFunnel: ["Awareness", "Interest", "Conversion"],
    contentStructure: ["Hero", "Benefits", "Social proof", "CTA"],
    ctas: ["Get started", "Contact us"],
    seoFocus: [analysis.businessProfile.industry, analysis.projectName],
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
    return input.previousStrategy;
  }

  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  try {
    return await generateJsonWithValidation<WebsiteStrategy>({
      provider: ctx.provider,
      prompt: websiteStrategyPrompt(iterationInput, analysis),
      schema: websiteStrategySchema,
      maxAttempts: 3,
      validate: validateWebsiteStrategy,
    });
  } catch (error) {
    console.error("strategy layer failed; using fallback", error);
    return fallbackStrategy(input, analysis);
  }
}
