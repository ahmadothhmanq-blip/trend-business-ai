import { applyBrandIdentityToDesignPlan } from "@/lib/ai-core/brand-identity/apply";
import { runBrandIdentityIntelligence } from "@/lib/ai-core/brand-identity/engine";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import { runDesignIntelligence } from "@/lib/ai-core/design-intelligence/engine";
import { buildVisualDesignPlan } from "@/lib/ai-core/design-plan/build";
import type { VisualDesignPlan } from "@/lib/ai-core/design-plan/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

export type RunDesignPlanningPhaseParams = {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  designStyle?: string | null;
  preferredStyle?: string | null;
  prompt?: string | null;
  onProgress?: (message: string) => void;
};

export type DesignPlanningPhaseResult = {
  plan: VisualDesignPlan;
  brandIdentity: BrandIdentityBrief;
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

  const intelligence = runDesignIntelligence({
    profile: params.profile,
    strategy: params.strategy,
    industryId: params.industryId,
    theme: params.theme,
    designStyle: params.designStyle || brandIdentity.strategy.visualDirection,
    preferredStyle:
      params.preferredStyle ||
      brandIdentity.premiumStyleId ||
      brandIdentity.presetId,
    onProgress: params.onProgress,
  });

  // Brand identity owns the design system family when signals agree.
  const mergedIntelligence = {
    ...intelligence,
    premiumStyleId: brandIdentity.premiumStyleId || intelligence.premiumStyleId,
    enginePreset: brandIdentity.enginePreset || intelligence.enginePreset,
    imageStyle: brandIdentity.imageDirection || intelligence.imageStyle,
    animationDirection:
      brandIdentity.animationDirection || intelligence.animationDirection,
    componentStyle: brandIdentity.componentStyle || intelligence.componentStyle,
    colorDirection: brandIdentity.colors.direction || intelligence.colorDirection,
    typographyDirection:
      brandIdentity.typography.direction || intelligence.typographyDirection,
    spacingDirection: brandIdentity.spacing.notes || intelligence.spacingDirection,
    artDirectionNotes: [
      ...brandIdentity.artDirectionNotes,
      ...intelligence.artDirectionNotes,
    ].slice(0, 16),
  };

  let plan = buildVisualDesignPlan({
    intelligence: mergedIntelligence,
    profile: params.profile,
    strategy: params.strategy,
    industryId: params.industryId,
    prompt: params.prompt,
    brandIdentity,
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

  return { plan, brandIdentity };
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
