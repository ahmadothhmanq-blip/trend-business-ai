import type { GeneratedWebsiteProject } from "@/lib/website/types/generation";
import type { WebsiteGenerationInput } from "@/lib/website/types";
import { deriveSitePlan, attachSitePlanToProject } from "@/lib/website/site-plan/derive";
import type { SiteImageStrategy } from "@/lib/website/site-plan/image-strategy";
import { resolveSiteImageStrategy } from "@/lib/website/site-plan/image-strategy";
import { isSitePlanV1Enabled } from "@/lib/website/generation-flags";
import {
  mergeStrategyWithSitePlan,
  shouldUseSitePlanAsStructureSource,
} from "@/lib/website/site-plan/structure-first";
import {
  applyVisitorLocalesToSitePlan,
  buildVisitorLocaleConfig,
} from "@/lib/website/site-plan/visitor-locales";
import { resolveWebsiteIndustry } from "@/lib/website/industry/industry-resolver";

export type ApplySitePlanOptions = {
  input: WebsiteGenerationInput;
  imageStrategy?: SiteImageStrategy;
};

/** Attach SitePlan to project when WB_SITE_PLAN_V1=1. No-op otherwise. */
export function applySitePlanIfEnabled(
  project: GeneratedWebsiteProject,
  options: ApplySitePlanOptions,
): GeneratedWebsiteProject {
  if (!isSitePlanV1Enabled()) return project;

  const imageStrategy = resolveSiteImageStrategy(
    options.imageStrategy ??
      options.input.imageStrategyMode ??
      project.sitePlan?.imageStrategy,
  );

  const routing = resolveWebsiteIndustry({
    prompt: options.input.prompt ?? project.prompt,
    title: project.title,
    description: project.description,
    industryId:
      options.input.industryId ??
      project.settings?.businessIndustry ??
      project.businessProfile?.routingIndustryId,
    businessIndustry:
      project.settings?.businessIndustry ??
      project.businessProfile?.routingIndustryId,
    sitePlanArchetype: project.settings?.sitePlanArchetype ?? project.sitePlan?.archetypeId,
    archetypeId: project.sitePlan?.archetypeId,
  });

  const industryForPlan =
    options.input.industryId ??
    project.settings?.businessIndustry ??
    project.businessProfile?.routingIndustryId ??
    routing.industryId;


  let plan = deriveSitePlan({
    input: {
      prompt: options.input.prompt ?? project.prompt,
      industry: industryForPlan,
      language: options.input.language,
      imageStrategy,
    },
    strategy: project.strategy ?? null,
  });

  if (options.input.visitorLocales) {
    const localeConfig = buildVisitorLocaleConfig({
      enabled: true,
      contentLanguage: options.input.language,
    });
    plan = applyVisitorLocalesToSitePlan(plan, localeConfig);
  }

  let next = attachSitePlanToProject(project, plan);

  if (shouldUseSitePlanAsStructureSource() && next.strategy) {
    next = {
      ...next,
      strategy: mergeStrategyWithSitePlan(next.strategy, plan),
    };
  }

  next = {
    ...next,
    settings: {
      ...next.settings,
      sitePlanArchetype: plan.archetypeId,
      sitePlanHash: plan.planHash,
      prescriptiveCapabilities: plan.capabilities.join(","),
      businessIndustry:
        options.input.industryId ??
        plan.industry ??
        routing.industryId ??
        next.settings?.businessIndustry,
      ...(options.input.visitorLocales
        ? {
            visitorLocales: plan.capabilities.includes("multi-language")
              ? "enabled"
              : undefined,
          }
        : {}),
    },
  };

  return next;
}
