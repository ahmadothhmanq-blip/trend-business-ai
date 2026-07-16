import { lpAnalyzePrompt } from "@/lib/ai/prompts/landing-page";
import { lpAnalysisSchema } from "@/plugins/landing-page/schemas";
import type { LandingPagePluginInput, LPAnalysis } from "@/plugins/landing-page/types";
import type { GenerationContext } from "@/lib/ai/types";

export async function analyzeLandingPage(
  input: LandingPagePluginInput,
  ctx: GenerationContext,
): Promise<LPAnalysis> {
  ctx.progress.emit("Analyzing requirements...");

  const analysis = await ctx.provider.generateJson<LPAnalysis>({
    prompt: lpAnalyzePrompt(input),
    schema: lpAnalysisSchema,
  });

  return {
    ...analysis,
    requiresAuth: false,
    requiresDatabase: false,
    requiresDashboard: false,
    isEcommerce: false,
    isSaas: false,
    databaseProvider: "none",
  };
}
