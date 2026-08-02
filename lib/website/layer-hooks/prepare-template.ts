/**
 * Website Builder template preparation — MAOE, PRE, industry intelligence,
 * premium templates, and template intelligence locking.
 *
 * Invoked via ProductEngineAdapter.prepareTemplate (website-builder only).
 */

import type { CoreBrief, CoreLayerArtifacts } from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";

export type PrepareWebsiteTemplateParams = {
  brief: CoreBrief;
  artifacts: CoreLayerArtifacts;
  onProgress?: (message: string) => void;
};

export type PrepareWebsiteTemplateResult = {
  brief: CoreBrief;
  artifacts: CoreLayerArtifacts;
  layersExecuted: string[];
};

export async function prepareWebsiteTemplateStage(
  params: PrepareWebsiteTemplateParams,
): Promise<PrepareWebsiteTemplateResult> {
  const { onProgress } = params;
  let brief = params.brief;
  const artifacts: CoreLayerArtifacts = { ...params.artifacts };
  const layersExecuted: string[] = [];

  const { applyIndustryIntelligenceToBrief } = await import(
    "@/lib/ai-core/industry-intelligence"
  );

  onProgress?.("[maoe] Initializing Multi-Agent Orchestration Engine…");
  const {
    runMultiAgentOrchestrationEngine,
    superviseAgentExecution,
  } = await import("@/lib/ai-core/multi-agent-orchestration");
  const maoeInit = runMultiAgentOrchestrationEngine({ brief, onProgress });
  brief = maoeInit.brief;

  onProgress?.(
    "[pre] Building authoritative Website Plan via Planning & Reasoning Engine…",
  );
  const { runPlanningReasoningEngine } = await import(
    "@/lib/ai-core/planning-reasoning-engine"
  );
  const preSupervised = await superviseAgentExecution({
    agentId: "PRE",
    brief,
    onProgress,
    executor: () => runPlanningReasoningEngine({ brief, onProgress }),
    updateBrief: (result) => result.brief,
    shareArtifacts: (result) => ({ masterWebsitePlan: result.plan }),
  });
  brief = preSupervised.brief;
  const master = preSupervised.result;
  const plan = master.plan;

  onProgress?.(
    `[pre] Locked · ${plan.industryLabel} · ${plan.style} · ${plan.template} · hero=${plan.hero.slice(0, 40)}…`,
  );
  onProgress?.(
    `[pre] Sections: ${plan.sections.map((s) => s.label).join(" · ")}`,
  );

  const withIndustry = applyIndustryIntelligenceToBrief(
    brief,
    master.industryDetection,
  );
  brief = withIndustry.brief;

  onProgress?.(
    "[template] Applying locked premium template from unified route…",
  );
  const {
    configurePremiumFromUnifiedRoute,
    getUnifiedTemplateRouteFromBrief,
  } = await import("@/lib/ai-core/template-router");
  const { applyPremiumTemplateToBrief, selectPremiumTemplate } = await import(
    "@/lib/ai-core/premium-templates"
  );
  const unifiedRoute = getUnifiedTemplateRouteFromBrief(brief);
  const premium = unifiedRoute
    ? configurePremiumFromUnifiedRoute(brief, unifiedRoute)
    : await selectPremiumTemplate(brief, {
        preferredIndustryId: plan.industry,
      });
  const enriched = applyPremiumTemplateToBrief(brief, premium);
  brief = enriched.brief;
  artifacts.brief = brief;
  artifacts.templateSelection = enriched.selection as TemplateSelection;
  layersExecuted.push("template");
  onProgress?.(
    `[template] ${premium.template.name} (${premium.template.id}) · goal=${premium.websiteGoal} · ${premium.brandStyle} · ${premium.designPreset} · ${premium.source}`,
  );

  onProgress?.(
    "[template-intelligence] Applying locked layout template from master plan…",
  );
  const {
    getTemplateIntelligence,
    applyTemplateIntelligenceToBrief,
  } = await import("@/lib/ai-core/template-intelligence");
  const tiTemplate = getTemplateIntelligence(plan.template);
  if (tiTemplate) {
    brief = applyTemplateIntelligenceToBrief(brief, tiTemplate);
  }
  artifacts.brief = brief;
  const autoDesign = brief.metadata?.autoDesignDecision as
    | { vertical?: string; family?: string; confidence?: number }
    | undefined;
  if (autoDesign) {
    onProgress?.(
      `[auto-design] ${autoDesign.vertical} · ${autoDesign.family} · ${plan.template} · confidence=${(autoDesign.confidence ?? 1).toFixed(2)}`,
    );
  }
  onProgress?.(
    `[template-intelligence] ${tiTemplate?.name ?? plan.template} · ${plan.templateCategory ?? "n/a"} · master-plan · locked`,
  );

  return { brief, artifacts, layersExecuted };
}

export async function completeWebsiteBuilderRun(params: {
  brief: CoreBrief;
  artifacts: CoreLayerArtifacts;
  onProgress?: (message: string) => void;
}): Promise<{ brief: CoreBrief; artifacts: CoreLayerArtifacts }> {
  const { completeMaoeWorkflow } = await import(
    "@/lib/ai-core/multi-agent-orchestration"
  );
  const brief = completeMaoeWorkflow(params.brief, params.onProgress);
  return { brief, artifacts: { ...params.artifacts, brief } };
}
