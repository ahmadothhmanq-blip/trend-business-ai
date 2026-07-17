import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { generateJsonWithValidation } from "@/lib/ai/generator";
import { websiteAnalyzePrompt } from "@/lib/ai/prompts/website";
import { validateWebsiteAnalysis } from "@/plugins/website/pipeline-validate";
import { websiteAnalysisSchema } from "@/plugins/website/schemas";
import type { WebsiteGenerationInput, WebsiteProjectAnalysis } from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

function normalizeDatabaseProvider(
  value: string,
): ProjectCapabilityFlags["databaseProvider"] {
  const provider = value.toLowerCase().trim();
  if (provider.includes("prisma")) return "prisma";
  if (provider.includes("supabase")) return "supabase";
  return "none";
}

export async function analyzeWebsite(
  input: WebsiteGenerationInput,
  ctx: GenerationContext,
): Promise<WebsiteProjectAnalysis> {
  ctx.progress.emit("Analyzing...");

  const analysis = await generateJsonWithValidation<WebsiteProjectAnalysis>({
    provider: ctx.provider,
    prompt: websiteAnalyzePrompt(input),
    schema: websiteAnalysisSchema,
    maxAttempts: 3,
    validate: validateWebsiteAnalysis,
  });

  return {
    ...analysis,
    databaseProvider: normalizeDatabaseProvider(
      String(analysis.databaseProvider ?? "none"),
    ),
  };
}
