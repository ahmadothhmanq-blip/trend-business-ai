import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { AutoDesignDecision } from "@/lib/ai-core/website-design-platform/types";
import {
  MASTER_WEBSITE_PLAN_KEY,
  type MasterWebsitePlan,
} from "@/lib/ai-core/master-planner/types";

const WEBSITE_INPUT_KEY = "websiteGenerationInput";

export function getMasterWebsitePlan(
  brief: CoreBrief,
): MasterWebsitePlan | null {
  const raw = brief.metadata?.[MASTER_WEBSITE_PLAN_KEY];
  if (!raw || typeof raw !== "object") return null;
  const plan = raw as MasterWebsitePlan;
  if (!plan.industry || !plan.template) return null;
  return plan;
}

export function isMasterPlanLocked(brief: CoreBrief): boolean {
  return Boolean(getMasterWebsitePlan(brief)?.locked.industry);
}

/** Apply Master Website Plan onto brief metadata — downstream engines read from here. */
export function applyMasterWebsitePlanToBrief(
  brief: CoreBrief,
  plan: MasterWebsitePlan,
  extras?: {
    industryDetection?: IndustryDetectionResult;
    autoDesign?: AutoDesignDecision;
    templateDna?: unknown;
  },
): CoreBrief {
  const meta: Record<string, unknown> = {
    ...(brief.metadata ?? {}),
    [MASTER_WEBSITE_PLAN_KEY]: plan,
    industryId: plan.industry,
    industry: plan.industryLabel,
    industryDesignStyle: plan.style,
    templateIntelligenceId: plan.template,
    templateIntelligenceCategory: plan.templateCategory,
    designPreset: extras?.autoDesign?.designPreset,
    brandStyle: plan.style,
    designStyle: plan.style,
    preferredStyle: plan.style,
    templateSectionOrder: plan.sections.map((s) => s.label),
    templateHeroProfile: plan.hero,
    templateNavigationProfile: plan.navigation,
    preferredComponents: plan.components,
    requiredSections: plan.sections.map((s) => s.label),
    imageKeywords: plan.imageKeywords,
    imageStyle: plan.imageStyle,
    masterPlanLocked: true,
  };

  if (extras?.industryDetection) {
    meta.industryIntelligence = extras.industryDetection;
  }
  if (extras?.autoDesign) {
    meta.autoDesignDecision = extras.autoDesign;
    meta.designPlatformFamily = extras.autoDesign.family;
    meta.designPlatformVertical = extras.autoDesign.vertical;
    meta.localeDir = extras.autoDesign.locale.dir;
  }
  if (extras?.templateDna) {
    meta.templateDna = extras.templateDna;
  }

  const nested = meta[WEBSITE_INPUT_KEY];
  if (nested && typeof nested === "object") {
    const row = { ...(nested as Record<string, unknown>) };
    row.templateIndustry = plan.industry;
    row.industryIntelligenceId = plan.industry;
    row.templateIntelligenceId = plan.template;
    row.industryDesignStyle = plan.style;
    meta[WEBSITE_INPUT_KEY] = row;
  }

  return {
    ...brief,
    language: plan.language || brief.language,
    features: Array.from(
      new Set([
        ...(brief.features ?? []),
        ...plan.features,
        `industry:${plan.industry}`,
      ]),
    ),
    metadata: meta,
  };
}

/** Resolved industry id for engines — master plan wins over re-detection. */
export function resolveIndustryFromMasterPlan(
  brief: CoreBrief,
  fallback?: string | null,
): string {
  const plan = getMasterWebsitePlan(brief);
  if (plan?.industry) return String(plan.industry);
  const meta = brief.metadata ?? {};
  if (typeof meta.industryId === "string" && meta.industryId.trim()) {
    return meta.industryId.trim();
  }
  return fallback || "business";
}
