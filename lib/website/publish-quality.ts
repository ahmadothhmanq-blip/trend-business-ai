/**
 * Shared publish quality gate helpers — used by /publish and /deploy.
 */

import type { PublishGateResult } from "@/lib/website/publish-gates";
import { evaluatePublishGates } from "@/lib/website/publish-gates";
import type { WebsiteGeneration } from "@/types/database";

export type PublishQualityPayload = {
  conversionReady: boolean | null;
  score: number | null;
  goal: string | null;
  publishReady: boolean;
  scores: PublishGateResult["scores"];
  blockers: string[];
  warnings: string[];
  opportunities: string[];
  improvementActions: string[];
  designScore: number | null;
  uxScore: number | null;
  seoScore: number | null;
  conversionScore: number | null;
  performanceScore: number | null;
  mobileScore: number | null;
  overallTechnicalScore: number | null;
  suggestedTitle: string | null;
  suggestedDescription: string | null;
  primaryKeyword: string | null;
};

export type PublishGateBlockPayload = {
  qualityRecommendations: PublishQualityPayload;
  blockers: string[];
};

export const PUBLISH_GATE_BLOCK_MESSAGE =
  "Publishing blocked until critical quality issues are resolved.";

export function buildPublishQualityPayload(
  gates: PublishGateResult,
): PublishQualityPayload {
  return {
    conversionReady: gates.conversionChecklist?.conversionReady ?? null,
    score: gates.scores.overall,
    goal: gates.conversionChecklist?.goal ?? null,
    publishReady: gates.publishReady,
    scores: gates.scores,
    blockers: gates.blockers,
    warnings: gates.warnings,
    opportunities: gates.opportunities,
    improvementActions:
      gates.finalChecklist?.topActions?.map((action) => action.title) ?? [],
    designScore: gates.scores.design,
    uxScore: gates.scores.ux,
    seoScore: gates.scores.seo,
    conversionScore: gates.scores.conversion,
    performanceScore: gates.scores.performance,
    mobileScore: gates.seoChecklist?.mobileScore ?? null,
    overallTechnicalScore: gates.seoChecklist?.overallScore ?? null,
    suggestedTitle: gates.seoChecklist?.suggestedTitle ?? null,
    suggestedDescription: gates.seoChecklist?.suggestedDescription ?? null,
    primaryKeyword: gates.seoChecklist?.primaryKeyword ?? null,
  };
}

export function buildPublishGateBlockPayload(
  gates: PublishGateResult,
): PublishGateBlockPayload {
  return {
    qualityRecommendations: buildPublishQualityPayload(gates),
    blockers: gates.blockers,
  };
}

/** Mirrors /publish force semantics: block when gates fail unless force=true. */
export function shouldBlockPublish(
  gates: PublishGateResult,
  force: boolean,
): boolean {
  return !force && !gates.publishReady;
}

export function evaluateGenerationPublishGates(
  generation: WebsiteGeneration,
): PublishGateResult {
  return evaluatePublishGates(generation);
}

export function publishSuccessMessage(
  gates: PublishGateResult,
  force: boolean,
): string {
  if (force && !gates.publishReady) {
    return "Website published with force override. Review remaining recommendations.";
  }
  if (gates.publishReady) {
    return "Website published. Public URL is live and search-engine ready.";
  }
  return "Website published.";
}

export function prepareSuccessMessage(gates: PublishGateResult): string {
  return gates.publishReady
    ? "Publication prepared. Quality gates passed — click Publish when ready."
    : "Publication prepared. Resolve blockers before publishing.";
}
