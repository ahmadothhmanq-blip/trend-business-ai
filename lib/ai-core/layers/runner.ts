import { getAIProvider } from "@/lib/ai/adapters";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { createProgressTracker } from "@/lib/ai/progress";
import { createUsageTracker, emptyTokenUsage } from "@/lib/ai/usage";
import type { AIProviderName, GenerationContext } from "@/lib/ai/types";
import type {
  LayerRunnerInput,
  LayerRunnerResult,
  ProductEngineAdapter,
} from "@/lib/ai-core/adapter";
import type { CoreLayerArtifacts, CoreLayerName } from "@/lib/ai-core/layers/types";
import { enrichBriefWithIndustryTemplate } from "@/lib/ai-core/templates/apply";
import { runPerformanceChecks } from "@/lib/ai-core/performance";
import {
  buildSeoPackageFromStrategy,
  checkSeoReadiness,
  withSeoReadiness,
} from "@/lib/ai-core/seo";
import { finalizeQualityForPublish } from "@/lib/ai-core/quality";

export type LayerRunnerOptions = {
  provider?: AIProviderName;
  onProgress?: (message: string) => void;
  onFilesCheckpoint?: (
    files: import("@/lib/ai/types").GeneratedProjectFile[],
    meta: { message: string },
  ) => void | Promise<void>;
};

function emit(
  progress: { emit: (e: string) => void },
  onProgress: ((message: string) => void) | undefined,
  layer: CoreLayerName | "start" | "done",
  message: string,
) {
  const line = `[${layer}] ${message}`;
  progress.emit(line);
  onProgress?.(line);
}

function generationFiles(generation: unknown):
  | { path: string; content: string }[]
  | undefined {
  if (
    generation &&
    typeof generation === "object" &&
    "files" in generation &&
    Array.isArray((generation as { files: unknown }).files)
  ) {
    return (generation as { files: { path: string; content: string }[] }).files;
  }
  return undefined;
}

/**
 * Orchestrates Idea → Strategy → Design → Assets → Generation → Quality → SEO → Performance → Finalize
 * according to the product adapter's layer flags.
 */
export class LayerRunner {
  async run<TGeneration = unknown, TFinal = unknown>(
    adapter: ProductEngineAdapter<TGeneration, TFinal>,
    input: LayerRunnerInput,
    options: LayerRunnerOptions = {},
  ): Promise<LayerRunnerResult<TGeneration, TFinal>> {
    if (!adapter.layers.generation) {
      throw new Error(
        `ProductEngineAdapter "${adapter.productId}" must enable the generation layer.`,
      );
    }

    const startedAt = Date.now();
    const progress = createProgressTracker();
    const usage = createUsageTracker();
    const providerName = options.provider ?? getDefaultTextProvider();
    const provider = getAIProvider(providerName);
    const ctx: GenerationContext = {
      provider,
      progress,
      usage,
      onFilesCheckpoint: options.onFilesCheckpoint,
    };
    const onProgress = options.onProgress;
    const layersExecuted: string[] = [];

    let brief = {
      ...input.brief,
      productId: input.brief.productId || adapter.productId,
    };

    const artifacts: CoreLayerArtifacts = {
      brief,
      templateSelection: input.priorArtifacts?.templateSelection,
      businessProfile: input.priorArtifacts?.businessProfile,
      strategy: input.priorArtifacts?.strategy,
      designSystem: input.priorArtifacts?.designSystem,
      assetManifest: input.priorArtifacts?.assetManifest,
      qualityReport: input.priorArtifacts?.qualityReport,
      seoPackage: input.priorArtifacts?.seoPackage,
      performanceReport: input.priorArtifacts?.performanceReport,
    };

    emit(progress, onProgress, "start", `${adapter.label} Core run starting`);

    // Template selection:
    // Website Builder → Industry Intelligence → Premium Templates System → design config
    // Other products → Industry Template Engine (Phase 6)
    emit(progress, onProgress, "template", "Selecting template...");
    if (adapter.productId === "website-builder") {
      const { applyIndustryIntelligenceToBrief } = await import(
        "@/lib/ai-core/industry-intelligence"
      );

      onProgress?.(
        "[maoe] Initializing Multi-Agent Orchestration Engine…",
      );
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
      const { applyPremiumTemplateToBrief, selectPremiumTemplate } =
        await import("@/lib/ai-core/premium-templates");
      const unifiedRoute = getUnifiedTemplateRouteFromBrief(brief);
      const premium = unifiedRoute
        ? configurePremiumFromUnifiedRoute(brief, unifiedRoute)
        : await selectPremiumTemplate(brief, {
            preferredIndustryId: plan.industry,
          });
      const enriched = applyPremiumTemplateToBrief(brief, premium);
      brief = enriched.brief;
      artifacts.brief = brief;
      artifacts.templateSelection = enriched.selection;
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
    } else {
      const enriched = enrichBriefWithIndustryTemplate(brief);
      brief = enriched.brief;
      artifacts.brief = brief;
      artifacts.templateSelection = enriched.selection;
      layersExecuted.push("template");
      onProgress?.(
        `[template] ${enriched.selection.label} · ${enriched.selection.layoutStyle} · ${enriched.selection.designPreset}`,
      );
    }

    if (adapter.layers.idea && adapter.runIdea) {
      emit(progress, onProgress, "idea", "Analyzing business idea...");
      artifacts.businessProfile = await adapter.runIdea(
        brief,
        ctx,
        artifacts,
      );
      layersExecuted.push("idea");
    }

    if (adapter.layers.strategy && adapter.runStrategy) {
      if (!artifacts.businessProfile) {
        throw new Error(
          `Adapter "${adapter.productId}" enabled strategy but idea layer produced no businessProfile.`,
        );
      }
      emit(progress, onProgress, "strategy", "Building strategy...");
      artifacts.strategy = await adapter.runStrategy(
        brief,
        artifacts.businessProfile,
        ctx,
        artifacts,
      );
      layersExecuted.push("strategy");
    }

    if (adapter.layers.design && adapter.runDesign) {
      if (!artifacts.businessProfile || !artifacts.strategy) {
        throw new Error(
          `Adapter "${adapter.productId}" enabled design but strategy/idea artifacts are missing.`,
        );
      }
      emit(
        progress,
        onProgress,
        "design",
        "Design Planning Phase → approved plan → design system...",
      );
      artifacts.designSystem = await adapter.runDesign(
        brief,
        artifacts.businessProfile,
        artifacts.strategy,
        ctx,
        artifacts,
      );
      // Adapter may attach approved plan onto artifacts / brief.metadata.
      if (
        !artifacts.designPlan &&
        brief.metadata?.designPlan &&
        typeof brief.metadata.designPlan === "object"
      ) {
        artifacts.designPlan =
          brief.metadata.designPlan as CoreLayerArtifacts["designPlan"];
      }
      layersExecuted.push("design");
    }

    if (adapter.layers.assets && adapter.runAssets) {
      emit(progress, onProgress, "assets", "Generating assets...");
      artifacts.assetManifest = await adapter.runAssets(brief, artifacts, ctx);
      layersExecuted.push("assets");
    }

    emit(progress, onProgress, "generation", "Generating product output...");
    const generation = await adapter.runGeneration(brief, artifacts, ctx);
    artifacts.generationOutput = generation;
    layersExecuted.push("generation");

    if (adapter.layers.quality && adapter.runQuality) {
      emit(progress, onProgress, "quality", "Running quality check...");
      artifacts.qualityReport = await adapter.runQuality(
        brief,
        artifacts,
        generation,
        ctx,
      );
      layersExecuted.push("quality");
    }

    // Phase 8: SEO Engine (adapter override or Core default from Strategy).
    if (adapter.layers.seo) {
      emit(progress, onProgress, "seo", "Building SEO package...");
      if (adapter.runSeo) {
        artifacts.seoPackage = await adapter.runSeo(
          brief,
          artifacts,
          generation,
          ctx,
        );
      } else if (artifacts.strategy) {
        const pkg = buildSeoPackageFromStrategy({
          strategy: artifacts.strategy,
          profile: artifacts.businessProfile,
          language: brief.language,
        });
        const files = generationFiles(generation);
        artifacts.seoPackage = withSeoReadiness(
          pkg,
          checkSeoReadiness({
            files: files ?? [],
            strategy: artifacts.strategy,
            seoPackage: pkg,
          }),
        );
      } else {
        throw new Error(
          `Adapter "${adapter.productId}" enabled seo but strategy artifact is missing.`,
        );
      }
      layersExecuted.push("seo");
    }

    // Phase 8: Performance Engine (adapter override or Core default checks).
    if (adapter.layers.performance) {
      emit(progress, onProgress, "performance", "Running performance checks...");
      if (adapter.runPerformance) {
        artifacts.performanceReport = await adapter.runPerformance(
          brief,
          artifacts,
          generation,
          ctx,
        );
      } else {
        artifacts.performanceReport = runPerformanceChecks({
          files: generationFiles(generation),
          assetManifest: artifacts.assetManifest,
        });
      }
      layersExecuted.push("performance");
    }

    // Refresh Auto Quality report with SEO + Performance before finalize / publish.
    if (
      artifacts.qualityReport &&
      (artifacts.seoPackage || artifacts.performanceReport)
    ) {
      artifacts.qualityReport = finalizeQualityForPublish({
        qualityReport: artifacts.qualityReport,
        seoPackage: artifacts.seoPackage,
        performanceReport: artifacts.performanceReport,
        files: generationFiles(generation),
        strategy: artifacts.strategy,
        designSystem: artifacts.designSystem,
        assetManifest: artifacts.assetManifest,
        profile: artifacts.businessProfile,
        brief,
      });
    }

    let finalOutput: TFinal | undefined;
    if (adapter.layers.finalize && adapter.finalize) {
      emit(progress, onProgress, "finalize", "Finalizing delivery payload...");
      finalOutput = await adapter.finalize(brief, artifacts, generation, ctx);
      artifacts.finalOutput = finalOutput;
      layersExecuted.push("finalize");
    }

    emit(progress, onProgress, "done", `${adapter.label} Core run complete`);

    if (adapter.productId === "website-builder") {
      const { completeMaoeWorkflow } = await import(
        "@/lib/ai-core/multi-agent-orchestration"
      );
      brief = completeMaoeWorkflow(brief, onProgress);
      artifacts.brief = brief;
    }

    return {
      artifacts,
      generation,
      finalOutput,
      progressEvents: progress.getEvents(),
      layersExecuted,
      usage: usage.get() ?? emptyTokenUsage(),
      generationTimeMs: Date.now() - startedAt,
      provider: providerName,
    };
  }
}

export const layerRunner = new LayerRunner();
