import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { UnifiedTemplateRoute } from "@/lib/ai-core/template-router/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { getTemplateIntelligence, resolveTemplateDNA } from "@/lib/ai-core/template-intelligence";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";
import { resolveIndustryLayoutFamily } from "@/lib/website/builder/industry-layout-policy";
import type { IndustryLayoutFamily } from "@/lib/website/builder/industry-layout-policy";

export type BuildWebsiteGenerationPlanParams = {
  route: UnifiedTemplateRoute;
  industryDetection: IndustryDetectionResult;
  businessProfile: BusinessIntelligenceProfile;
  sectionLabels: string[];
  components: string[];
  hero: string;
  imageKeywords: string[];
};

export function buildWebsiteGenerationPlan(
  params: BuildWebsiteGenerationPlanParams,
): WebsiteGenerationPlan {
  const { route, businessProfile, industryDetection } = params;
  const layoutTemplate = getTemplateIntelligence(route.layoutTemplateIntelligenceId);
  const layoutStructure = layoutTemplate?.layoutStructure ?? "classic-stack";
  const layoutArch = getThemePageArchitecture(route.layoutTemplateIntelligenceId);
  const layoutFamily = (route.layoutFamily ||
    resolveIndustryLayoutFamily(route.industryId)) as IndustryLayoutFamily;

  return {
    version: "1",
    industryId: String(industryDetection.industryId),
    industryLabel: businessProfile.industry,
    routingIndustryId: businessProfile.routingIndustryId,
    layoutFamily,
    structureTemplateId: route.structureTemplateId,
    layoutTemplateIntelligenceId: route.layoutTemplateIntelligenceId,
    layoutStructure: String(layoutStructure),
    pageTopology: layoutArch?.pageTopology ?? route.pageTopology,
    visualThemePresetId: route.visualThemePresetId,
    visualThemeTemplateIntelligenceId: route.visualThemeTemplateIntelligenceId,
    premiumTemplateId: route.premiumTemplateId,
    sections: params.sectionLabels,
    components: params.components,
    hero: params.hero,
    imageKeywords: params.imageKeywords,
    imagePolicy: {
      routingIndustryId: businessProfile.routingIndustryId,
      forbiddenSubjects: businessProfile.forbiddenSubjects,
      photographyStyle: businessProfile.photographyStyle,
    },
    businessRules: {
      primaryCta: businessProfile.primaryCta,
      secondaryCta: businessProfile.secondaryCta,
      recommendedSections: businessProfile.recommendedSections,
      confidence: businessProfile.confidence,
      subcategory: businessProfile.subcategory,
    },
    route,
    reasoningChain: [
      ...route.reasoningChain,
      `Plan draft: ${params.sectionLabels.length} sections · ${params.components.length} components`,
    ],
    confidence: Math.min(
      route.confidence,
      businessProfile.confidence,
      industryDetection.confidence,
    ),
  };
}

export function resolvePlanComponents(
  layoutTemplateIntelligenceId: string,
): string[] {
  const layoutTemplate = getTemplateIntelligence(layoutTemplateIntelligenceId);
  if (!layoutTemplate) return [];
  const designDna = resolveTemplateDNA(layoutTemplate);
  const layoutArch = getThemePageArchitecture(layoutTemplateIntelligenceId);
  return layoutArch?.components.length
    ? layoutArch.components.map(String)
    : designDna.components.map(String);
}
