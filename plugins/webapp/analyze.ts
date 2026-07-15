import type { ProjectCapabilityFlags } from "@/lib/ai/validator";
import { webappAnalyzePrompt } from "@/lib/ai/prompts/webapp";
import { webappAnalysisSchema } from "@/plugins/webapp/schemas";
import type { WebAppPluginInput, WebAppAnalysis } from "@/plugins/webapp/types";
import type { GenerationContext } from "@/lib/ai/types";

function normalizeDatabaseProvider(
  value: string,
): ProjectCapabilityFlags["databaseProvider"] {
  const provider = value.toLowerCase().trim();
  if (provider.includes("prisma")) return "prisma";
  if (provider.includes("supabase")) return "supabase";
  return "none";
}

function normalizeComplexity(
  value: string,
): WebAppAnalysis["complexity"] {
  const c = value.toLowerCase().trim();
  if (c === "simple") return "simple";
  if (c === "complex") return "complex";
  return "moderate";
}

export async function analyzeWebApp(
  input: WebAppPluginInput,
  ctx: GenerationContext,
): Promise<WebAppAnalysis> {
  ctx.progress.emit("Analyzing requirements...");

  const analysis = await ctx.provider.generateJson<WebAppAnalysis>({
    prompt: webappAnalyzePrompt(input),
    schema: webappAnalysisSchema,
  });

  return {
    ...analysis,
    requiresAuth: analysis.requiresAuth ?? true,
    requiresDatabase: analysis.requiresDatabase ?? true,
    requiresDashboard: analysis.requiresDashboard ?? true,
    databaseProvider: normalizeDatabaseProvider(analysis.databaseProvider ?? "prisma"),
    complexity: normalizeComplexity(analysis.complexity),
  };
}
