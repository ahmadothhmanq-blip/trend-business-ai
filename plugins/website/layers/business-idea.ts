import { websiteGenerateJson } from "@/lib/ai-core/website-builder/llm-calls";
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
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import {
  applyFeaturesToAnalysis,
  resolveWebsiteFeatures,
} from "@/lib/website/builder/feature-registry";
import {
  getStrategyFallbackLabels,
  usesLlmLocalizedWebsiteCopy,
} from "@/lib/ai-core/content/content-language";

function normalizeDatabaseProvider(
  value: string,
): ProjectCapabilityFlags["databaseProvider"] {
  const provider = value.toLowerCase().trim();
  if (provider.includes("prisma")) return "prisma";
  if (provider.includes("supabase")) return "supabase";
  return "none";
}

function fallbackProfile(input: WebsiteGenerationInput): BusinessProfile {
  const labels = getStrategyFallbackLabels(input.language);
  const localized = usesLlmLocalizedWebsiteCopy(input.language);
  return {
    projectName: input.projectType.slice(0, 60) || "New Website",
    industry: "General",
    targetAudience: localized
      ? input.prompt.slice(0, 120)
      : "Target customers described in the brief",
    businessGoals: localized
      ? [input.prompt.slice(0, 80)]
      : ["Generate leads", "Build trust", "Convert visitors"],
    offer: input.prompt.slice(0, 200),
    tone: input.theme || "Professional",
    geography: "Global",
    competitors: [],
    kpis: localized ? [] : ["Conversion rate", "Engagement"],
    summary: input.prompt.slice(0, 280),
    requiredSections: labels.sections,
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
  lockedBusinessProfile?: BusinessIntelligenceProfile | null,
): Promise<WebsiteProjectAnalysis> {
  ctx.progress.emit("Analyzing business idea...");

  const iterationInput = {
    ...input,
    prompt: buildWebsiteIterationPrompt(input),
  };

  try {
    const resolvedFeatures = resolveWebsiteFeatures(input.features);
    const featurePlanning = resolvedFeatures.aiPlanningBlock
      ? `\n\n${resolvedFeatures.aiPlanningBlock}`
      : "";

    const analysis = await websiteGenerateJson<WebsiteProjectAnalysis>({
      stage: "business-idea",
      input: iterationInput,
      provider: ctx.provider,
      prompt: `${businessIdeaPrompt(iterationInput)}${featurePlanning}`,
      schema: businessIdeaAnalysisSchema,
      maxAttempts: 3,
      validate: validateBusinessIdeaAnalysis,
    });

    const profile =
      analysis.businessProfile ??
      input.previousBusinessProfile ??
      fallbackProfile(input);

    const businessIntel = lockedBusinessProfile
      ? { profile: lockedBusinessProfile }
      : null;

    const lockedIndustry = businessIntel?.profile.industry;
    const lockedSections = businessIntel?.profile.recommendedSections;

    return applyFeaturesToAnalysis(
      {
        ...analysis,
        databaseProvider: normalizeDatabaseProvider(
          String(analysis.databaseProvider ?? "none"),
        ),
        businessProfile: {
          ...profile,
          projectName: profile.projectName || analysis.projectName,
          industry: lockedIndustry || profile.industry,
          requiredSections:
            lockedSections && lockedSections.length >= 3
              ? lockedSections
              : Array.isArray(profile.requiredSections) &&
                  profile.requiredSections.length
                ? profile.requiredSections
                : fallbackProfile(input).requiredSections,
        },
      },
      resolveWebsiteFeatures(input.features),
    );
  } catch (error) {
    console.error("business idea analysis failed; using fallback", error);
    const profile = input.previousBusinessProfile ?? fallbackProfile(input);
    const labels = getStrategyFallbackLabels(input.language);
    return applyFeaturesToAnalysis(
      {
        projectName: profile.projectName,
        projectType: input.projectType,
        pages: labels.pages,
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
      },
      resolveWebsiteFeatures(input.features),
    );
  }
}
