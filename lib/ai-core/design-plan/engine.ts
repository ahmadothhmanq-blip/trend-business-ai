import { applyBrandIdentityToDesignPlan } from "@/lib/ai-core/brand-identity/apply";
import { runBrandIdentityIntelligence } from "@/lib/ai-core/brand-identity/engine";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import {
  runDesignIntelligenceEngine,
  type RunDesignIntelligenceEngineParams,
} from "@/lib/ai-core/design-intelligence/die-engine";
import {
  DESIGN_INTELLIGENCE_SPEC_KEY,
  DESIGN_INTELLIGENCE_TRACE_KEY,
  type DesignIntelligenceEngineResult,
} from "@/lib/ai-core/design-intelligence/die-types";
import {
  getWorkflowStateFromBrief,
  superviseAgentSync,
} from "@/lib/ai-core/multi-agent-orchestration";
import { buildVisualDesignPlan } from "@/lib/ai-core/design-plan/build";
import type { VisualDesignPlan } from "@/lib/ai-core/design-plan/types";
import type {
  CoreBrief,
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateDNAProfile } from "@/lib/ai-core/template-intelligence/template-dna";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";

export type RunDesignPlanningPhaseParams = {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  designStyle?: string | null;
  preferredStyle?: string | null;
  prompt?: string | null;
  templateDna?: TemplateDNAProfile | null;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  brief?: CoreBrief | null;
  onProgress?: (message: string) => void;
};

export type DesignPlanningPhaseResult = {
  plan: VisualDesignPlan;
  brandIdentity: BrandIdentityBrief;
  designIntelligence: DesignIntelligenceEngineResult;
};

/**
 * Design Planning Phase — runs BEFORE code generation.
 * 1) Brand Identity Intelligence (complete brand system)
 * 2) Design Intelligence (layout + premium style)
 * 3) Visual Design Plan (approved) seeded by brand identity
 */
export function runDesignPlanningPhase(
  params: RunDesignPlanningPhaseParams,
): VisualDesignPlan {
  return runDesignPlanningPhaseWithBrand(params).plan;
}

/** Full planning result including brand identity for adapters. */
export function runDesignPlanningPhaseWithBrand(
  params: RunDesignPlanningPhaseParams,
): DesignPlanningPhaseResult {
  params.onProgress?.(
    "Design Planning Phase: Brand Identity → Design Intelligence → Visual Plan…",
  );

  const brandIdentity = runBrandIdentityIntelligence({
    profile: params.profile,
    strategy: params.strategy,
    industryId: params.industryId,
    theme: params.theme,
    preferredStyle: params.preferredStyle || params.designStyle,
    onProgress: params.onProgress,
  });

  const dieParams = {
    profile: params.profile,
    strategy: params.strategy,
    industryId: params.industryId,
    theme: params.theme,
    designStyle: params.designStyle || brandIdentity.strategy.visualDirection,
    preferredStyle:
      params.preferredStyle ||
      brandIdentity.premiumStyleId ||
      brandIdentity.presetId,
    templateDna: params.templateDna,
    masterPlan: params.masterPlan,
    websiteGenerationPlan: params.websiteGenerationPlan,
    businessProfile: params.businessProfile,
    prompt: params.prompt,
    onProgress: params.onProgress,
  };

  let dieResult: DesignIntelligenceEngineResult;
  if (params.brief && getWorkflowStateFromBrief(params.brief)) {
    const supervised = superviseAgentSync({
      agentId: "DIE",
      brief: params.brief,
      relaxedDependencies: true,
      onProgress: params.onProgress,
      executor: () => runDesignIntelligenceEngine(dieParams),
      updateBrief: (result, currentBrief) => ({
        ...currentBrief,
        metadata: {
          ...(currentBrief.metadata ?? {}),
          [DESIGN_INTELLIGENCE_TRACE_KEY]: result.trace,
          [DESIGN_INTELLIGENCE_SPEC_KEY]: result.spec,
          designIntelligenceValidation: result.validation,
        },
      }),
      shareArtifacts: (result) => ({
        designSystemSpec: result.spec,
      }),
    });
    dieResult = supervised.result;
  } else {
    dieResult = runDesignIntelligenceEngine(dieParams);
  }

  const mergedIntelligence = {
    ...dieResult.intelligence,
    premiumStyleId:
      brandIdentity.premiumStyleId || dieResult.intelligence.premiumStyleId,
    enginePreset:
      brandIdentity.enginePreset || dieResult.intelligence.enginePreset,
    imageStyle:
      brandIdentity.imageDirection || dieResult.intelligence.imageStyle,
    animationDirection:
      brandIdentity.animationDirection ||
      dieResult.intelligence.animationDirection,
    componentStyle:
      brandIdentity.componentStyle || dieResult.intelligence.componentStyle,
    colorDirection:
      brandIdentity.colors.direction || dieResult.intelligence.colorDirection,
    typographyDirection:
      brandIdentity.typography.direction ||
      dieResult.intelligence.typographyDirection,
    spacingDirection:
      brandIdentity.spacing.notes || dieResult.intelligence.spacingDirection,
    artDirectionNotes: [
      ...brandIdentity.artDirectionNotes,
      ...dieResult.intelligence.artDirectionNotes,
    ].slice(0, 16),
  };

  let plan = buildVisualDesignPlan({
    intelligence: mergedIntelligence,
    profile: params.profile,
    strategy: params.strategy,
    industryId: params.industryId,
    prompt: params.prompt,
    brandIdentity,
    templateDna: params.templateDna,
    designSpec: dieResult.spec,
  });

  plan = applyBrandIdentityToDesignPlan(plan, brandIdentity);

  if (plan.status !== "approved") {
    plan.status = "approved";
    plan.approvedAt = new Date().toISOString();
  }

  params.onProgress?.(
    `[design-plan] APPROVED · brand=${brandIdentity.presetId} · ${plan.visualIdentity} · ${plan.websiteStyle.heroTreatment} · ${plan.sectionStructure.length} sections`,
  );
  params.onProgress?.(plan.summary);

  return { plan, brandIdentity, designIntelligence: dieResult };
}

export function assertDesignPlanApproved(
  plan: VisualDesignPlan | null | undefined,
): VisualDesignPlan {
  if (!plan || plan.status !== "approved") {
    throw new Error(
      "Website generation blocked: Design Planning Phase must approve a VisualDesignPlan before writing code.",
    );
  }
  return plan;
}
