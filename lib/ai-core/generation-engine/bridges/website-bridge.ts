import type { Tbge2PlanningInput, Tbge2PlanningPlan } from "@/lib/ai-core/generation-engine/core/types";

/**
 * Bridge to website generation input — maps existing WebsiteGenerationInput fields.
 * Does not modify lib/website.
 */
export function bridgeFromWebsiteGenerationInput(input: {
  prompt?: string;
  language?: string;
  industry?: string;
  features?: string[];
  businessName?: string;
}): Tbge2PlanningInput {
  return {
    userPrompt: input.prompt ?? "",
    language: input.language,
    industry: input.industry,
    features: input.features,
    businessName: input.businessName,
    productId: "website-builder",
  };
}

export function planToWebsiteMetadata(plan: Tbge2PlanningPlan): Record<string, unknown> {
  return {
    tbge2PlanHash: plan.business.industryId,
    tbge2Intent: plan.intent.category,
    tbge2WebsiteType: plan.website.websiteType,
    tbge2PageCount: plan.pages.length,
    tbge2SectionCount: plan.sections.length,
    tbge2PrimaryCta: plan.website.primaryCta,
    tbge2Requirements: plan.requirements.required,
  };
}
