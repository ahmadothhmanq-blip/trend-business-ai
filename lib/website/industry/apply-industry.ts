import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import {
  resolveWebsiteIndustry,
  type WebsiteIndustryInput,
} from "@/lib/website/industry/industry-resolver";

/** Persist canonical industry on project settings + business profile. */
export function applyResolvedIndustryToProject(
  project: GeneratedWebsiteProject,
  input: WebsiteIndustryInput = {},
): GeneratedWebsiteProject {
  const resolved = resolveWebsiteIndustry({
    prompt: input.prompt ?? project.prompt,
    title: input.title ?? project.title,
    description: input.description ?? project.description,
    industryId:
      input.industryId ??
      project.settings?.businessIndustry ??
      project.businessProfile?.routingIndustryId,
    businessIndustry:
      input.businessIndustry ??
      project.settings?.businessIndustry ??
      project.businessProfile?.routingIndustryId,
    sitePlanArchetype:
      input.sitePlanArchetype ?? project.settings?.sitePlanArchetype,
    archetypeId: input.archetypeId ?? project.sitePlan?.archetypeId,
  });

  return {
    ...project,
    settings: {
      ...(project.settings ?? {}),
      businessIndustry: resolved.industryId,
    },
    ...(project.businessProfile
      ? {
          businessProfile: {
            ...project.businessProfile,
            industry: resolved.industryLabel,
            routingIndustryId: resolved.industryId,
          },
        }
      : {}),
    sitePlan: project.sitePlan
      ? {
          ...project.sitePlan,
          industry: project.sitePlan.industry ?? resolved.industryId,
        }
      : project.sitePlan,
  };
}
