import { generateJsonWithValidation } from "@/lib/ai/generator";
import { businessIdeaPrompt } from "@/lib/ai/prompts/website-layers";
import { buildWebsiteIterationPrompt } from "@/plugins/website/iteration";
import { businessIdeaAnalysisSchema } from "@/plugins/website/layers/schemas";
import type { BusinessProfile } from "@/plugins/website/layers/types";
import type {
  WebsiteGenerationInput,
  WebsiteProjectAnalysis,
} from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";
import type { ProjectCapabilityFlags } from "@/lib/ai/validator";

function normalizeDatabaseProvider(
  value: string,
): ProjectCapabilityFlags["databaseProvider"] {
  const provider = value.toLowerCase().trim();
  if (provider.includes("prisma")) return "prisma";
  if (provider.includes("supabase")) return "supabase";
  return "none";
}

function fallbackProfile(input: WebsiteGenerationInput): BusinessProfile {
  return {
    projectName: input.projectType.slice(0, 60) || "New Website",
    industry: "General",
    targetAudience: "Target customers described in the brief",
    businessGoals: ["Generate leads", "Build trust", "Convert visitors"],
    offer: input.prompt.slice(0, 200),
    tone: input.theme || "Professional",
    geography: "Global",
    competitors: [],
    kpis: ["Conversion rate", "Engagement"],
    summary: input.prompt.slice(0, 280),
  };
}

export function validateBusinessIdeaAnalysis(
  value: WebsiteProjectAnalysis,
): { valid: boolean; reason?: string } {
  if (!value.projectName?.trim()) {
    return { valid: false, reason: "projectName is required" };
  }
  if (!value.businessProfile?.industry?.trim()) {
    return { valid: false, reason: "businessProfile.industry is required" };
  }
  return { valid: true };
}

export async function analyzeBusinessIdea(
  input: WebsiteGenerationInput,
  ctx: GenerationContext,
): Promise<WebsiteProjectAnalysis> {
  ctx.progress.emit("Analyzing business idea...");

  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  try {
    const analysis = await generateJsonWithValidation<WebsiteProjectAnalysis>({
      provider: ctx.provider,
      prompt: businessIdeaPrompt(iterationInput),
      schema: businessIdeaAnalysisSchema,
      maxAttempts: 3,
      validate: validateBusinessIdeaAnalysis,
    });

    const profile =
      analysis.businessProfile ??
      input.previousBusinessProfile ??
      fallbackProfile(input);

    return {
      ...analysis,
      databaseProvider: normalizeDatabaseProvider(
        String(analysis.databaseProvider ?? "none"),
      ),
      businessProfile: {
        ...profile,
        projectName: profile.projectName || analysis.projectName,
      },
    };
  } catch (error) {
    console.error("business idea analysis failed; using fallback", error);
    const profile = input.previousBusinessProfile ?? fallbackProfile(input);
    return {
      projectName: profile.projectName,
      projectType: input.projectType,
      pages: ["Home", "About", "Contact"],
      features: input.features,
      designSystem: [input.theme],
      technologies: ["Next.js", "Tailwind CSS"],
      requiresAuth: false,
      requiresDatabase: false,
      requiresDashboard: false,
      isEcommerce: false,
      isSaas: false,
      databaseProvider: "none",
      businessProfile: profile,
    };
  }
}
