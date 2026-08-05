import type { MasterPlan } from "@/lib/ai-core/generation-engine/master-plan/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";

/**
 * Bridge Master Plan → legacy MasterWebsitePlan for Website Builder adapter.
 * Does not modify lib/ai-core/master-planner.
 */
export function masterPlanToLegacyWebsitePlan(plan: MasterPlan): MasterWebsitePlan {
  const sections = plan.sections
    .sort((a, b) => a.order - b.order)
    .map((section) => ({
      key: section.type,
      label: section.label,
      componentId: section.componentId,
      purpose: `${section.type} section on page ${section.pageId}`,
    }));

  return {
    id: plan.id,
    version: "1",
    createdAt: plan.createdAt,
    promptHash: plan.project.sourcePromptHash,

    industry: plan.business.industryId,
    industryLabel: plan.business.industry,
    businessType: plan.business.businessType,
    style: plan.brand.style,
    audience: plan.audience.join(", "),
    country: plan.localization.country,
    language: plan.localization.language,
    tone: plan.brand.tone,

    template: plan.business.industryId,
    theme: plan.brand.style,
    layout: plan.websiteType,
    hero: plan.sections.find((s) => s.type === "hero")?.label ?? "Hero",
    navigation: plan.navigation.map((n) => n.label).join(" · "),

    colorPalette: {
      primary: "#111827",
      secondary: "#6B7280",
      accent: "#D4AF37",
      background: "#FFFFFF",
      foreground: "#111827",
      surface: "#F9FAFB",
    },
    typography: {
      display: "Inter",
      heading: "Inter",
      body: "Inter",
    },

    imageStyle: plan.mediaStrategy.imageStyle,
    imageKeywords: plan.seoStrategy.targetKeywords,

    sections,
    ctaStyle: plan.brand.style,
    ctaPrimary: plan.ctaStrategy.primary,
    ctaSecondary: plan.ctaStrategy.secondary,
    features: plan.businessFeatures,

    components: plan.componentsNeeded.map((c) => c.componentPath),

    locked: {
      industry: true,
      template: true,
      theme: true,
      layout: true,
      sections: true,
      images: true,
      hero: true,
      navigation: true,
    },

    sources: {
      industry: "master-plan",
      template: "master-plan",
      theme: "master-plan",
      design: "master-plan",
      route: "master-plan",
      reasoningChain: [
        `Master Plan ${plan.id} v${plan.version}`,
        `Authority: ${plan.schemaVersion}`,
        `Website type: ${plan.websiteType}`,
      ],
      validation: "master-plan",
    },
  };
}
