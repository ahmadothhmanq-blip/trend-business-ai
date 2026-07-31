import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import type { AgencyGenerationContract } from "@/lib/ai-core/agency-orchestrator/types";
import {
  buildWebsiteGenerationPlan,
  resolvePlanComponents,
} from "@/lib/ai-core/architecture-validation/build-plan";
import { ArchitectureValidationFailure } from "@/lib/ai-core/architecture-validation/errors";
import { applyArchitectureCorrectionsToBrief } from "@/lib/ai-core/architecture-validation/replan";
import type {
  ArchitectureValidationOptions,
  ArchitectureValidationResult,
  WebsiteGenerationPlan,
} from "@/lib/ai-core/architecture-validation/types";
import { ARCHITECTURE_VALIDATION_KEY } from "@/lib/ai-core/architecture-validation/types";
import { validateWebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/validate";
import {
  applyUnifiedTemplateRouteToBrief,
  routeWebsiteGeneration,
} from "@/lib/ai-core/template-router/engine";
import type { UnifiedTemplateRoute } from "@/lib/ai-core/template-router/types";
import { WEBSITE_GENERATION_PLAN_KEY } from "@/lib/ai-core/architecture-validation/types";
import { getTemplateIntelligence, resolveTemplateDNA } from "@/lib/ai-core/template-intelligence";

export type ValidateAndRouteWebsiteGenerationParams = {
  brief: CoreBrief;
  industryId: string;
  industryDetection: IndustryDetectionResult;
  businessProfile: BusinessIntelligenceProfile;
  agencyContract?: AgencyGenerationContract | null;
  sectionOrder: string[];
  hero: string;
  imageKeywords: string[];
  options?: ArchitectureValidationOptions;
};

export type ValidateAndRouteWebsiteGenerationResult = {
  plan: WebsiteGenerationPlan;
  route: UnifiedTemplateRoute;
  validation: ArchitectureValidationResult;
  brief: CoreBrief;
};

const DEFAULT_MAX_RETRIES = 2;

function persistValidationOnBrief(
  brief: CoreBrief,
  validation: ArchitectureValidationResult,
  plan?: WebsiteGenerationPlan,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [ARCHITECTURE_VALIDATION_KEY]: validation,
      ...(plan ? { [WEBSITE_GENERATION_PLAN_KEY]: plan } : {}),
    },
  };
}

function buildSectionOrder(
  businessProfile: BusinessIntelligenceProfile,
  layoutTemplateIntelligenceId: string,
  profileSections: string[],
): string[] {
  const layoutTemplate = getTemplateIntelligence(layoutTemplateIntelligenceId);
  const designDna = layoutTemplate ? resolveTemplateDNA(layoutTemplate) : null;
  if (businessProfile.recommendedSections.length >= 3) {
    return businessProfile.recommendedSections;
  }
  if (designDna?.sectionOrder.length) {
    return designDna.sectionOrder;
  }
  return profileSections;
}

/**
 * Route → build plan draft → validate → re-plan on failure (bounded retries).
 * Blocks generation when architecture remains invalid.
 */
export async function validateAndRouteWebsiteGeneration(
  params: ValidateAndRouteWebsiteGenerationParams,
): Promise<ValidateAndRouteWebsiteGenerationResult> {
  const options = params.options ?? {};
  const maxRetries = options.maxRetries ?? DEFAULT_MAX_RETRIES;
  const onProgress = options.onProgress;
  let brief = params.brief;
  let lastValidation: ArchitectureValidationResult | null = null;

  for (let attempt = 1; attempt <= maxRetries + 1; attempt += 1) {
    onProgress?.(
      `[architecture-validation] Attempt ${attempt}/${maxRetries + 1}…`,
    );

    const route = await routeWebsiteGeneration({
      brief,
      industryId: params.industryId,
      industryDetection: params.industryDetection,
      businessProfile: params.businessProfile,
      agencyContract: params.agencyContract,
      onProgress,
    });
    brief = applyUnifiedTemplateRouteToBrief(brief, route);

    const components = resolvePlanComponents(route.layoutTemplateIntelligenceId);
    const sectionLabels = buildSectionOrder(
      params.businessProfile,
      route.layoutTemplateIntelligenceId,
      params.industryDetection.profile.requiredSections,
    );

    const planDraft = buildWebsiteGenerationPlan({
      route,
      industryDetection: params.industryDetection,
      businessProfile: params.businessProfile,
      sectionLabels,
      components,
      hero: params.hero,
      imageKeywords: params.imageKeywords,
    });

    const validation = validateWebsiteGenerationPlan(planDraft, attempt);
    lastValidation = validation;
    brief = persistValidationOnBrief(brief, validation, validation.plan);

    onProgress?.(
      `[architecture-validation] ${validation.status} · ${validation.errors.length} errors · ${validation.warnings.length} warnings · confidence=${validation.confidence.toFixed(2)}`,
    );

    if (validation.status !== "failed") {
      if (!validation.plan) {
        validation.plan = planDraft;
      }
      onProgress?.(
        `[architecture-validation] Approved · ${planDraft.industryId} · ${planDraft.layoutFamily} · ${planDraft.layoutTemplateIntelligenceId}`,
      );
      return {
        plan: validation.plan,
        route,
        validation,
        brief: persistValidationOnBrief(brief, validation, validation.plan),
      };
    }

    if (attempt > maxRetries) {
      break;
    }

    if (!validation.recommendedCorrections.length) {
      onProgress?.(
        "[architecture-validation] No automatic corrections available — stopping re-plan.",
      );
      break;
    }

    onProgress?.(
      `[architecture-validation] Re-planning with ${validation.recommendedCorrections.length} correction(s)…`,
    );
    brief = applyArchitectureCorrectionsToBrief(
      brief,
      validation.recommendedCorrections,
    );
  }

  if (options.allowLegacyBypass && lastValidation) {
    onProgress?.(
      "[architecture-validation] Legacy bypass enabled — proceeding with warnings.",
    );
    const fallbackRoute = await routeWebsiteGeneration({
      brief: params.brief,
      industryId: params.industryId,
      industryDetection: params.industryDetection,
      businessProfile: params.businessProfile,
      agencyContract: params.agencyContract,
    });
    const components = resolvePlanComponents(
      fallbackRoute.layoutTemplateIntelligenceId,
    );
    const plan = buildWebsiteGenerationPlan({
      route: fallbackRoute,
      industryDetection: params.industryDetection,
      businessProfile: params.businessProfile,
      sectionLabels: params.sectionOrder,
      components,
      hero: params.hero,
      imageKeywords: params.imageKeywords,
    });
    const validation: ArchitectureValidationResult = {
      ...lastValidation,
      status: "warning",
      warnings: [
        ...lastValidation.warnings,
        "Legacy architecture validation bypass applied.",
      ],
      plan,
    };
    return {
      plan,
      route: fallbackRoute,
      validation,
      brief: persistValidationOnBrief(params.brief, validation, plan),
    };
  }

  throw new ArchitectureValidationFailure(
    lastValidation ?? {
      status: "failed",
      errors: ["Architecture validation failed with no result."],
      warnings: [],
      confidence: 0,
      reasoning: [],
      recommendedCorrections: [],
      trace: [],
      attempt: maxRetries + 1,
      validatedAt: new Date().toISOString(),
    },
  );
}

export function getArchitectureValidationFromBrief(
  brief: CoreBrief,
): ArchitectureValidationResult | null {
  const raw = brief.metadata?.[ARCHITECTURE_VALIDATION_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as ArchitectureValidationResult;
}

export function getWebsiteGenerationPlanFromBrief(
  brief: CoreBrief,
): WebsiteGenerationPlan | null {
  const raw = brief.metadata?.[WEBSITE_GENERATION_PLAN_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as WebsiteGenerationPlan;
}
