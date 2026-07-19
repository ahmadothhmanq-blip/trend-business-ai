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
    const ctx: GenerationContext = { provider, progress, usage };
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
    // Website Builder → Smart Template Engine (DeepSeek analysis → template + design config)
    // Other products → Industry Template Engine (Phase 6)
    emit(progress, onProgress, "template", "Selecting template...");
    if (adapter.productId === "website-builder") {
      const { selectSmartTemplate, enrichBriefWithSmartTemplate } = await import(
        "@/lib/website/smart-templates"
      );
      onProgress?.("[template] Analyzing business with DeepSeek for best template...");
      const smart = await selectSmartTemplate(brief);
      const enriched = enrichBriefWithSmartTemplate(brief, smart);
      brief = enriched.brief;
      artifacts.brief = brief;
      artifacts.templateSelection = enriched.selection;
      layersExecuted.push("template");
      onProgress?.(
        `[template] ${smart.template.name} (${smart.templateId}) · ${smart.designConfiguration.layoutStyle} · ${smart.designConfiguration.designPreset} · ${smart.source}`,
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
      emit(progress, onProgress, "design", "Creating design system...");
      artifacts.designSystem = await adapter.runDesign(
        brief,
        artifacts.businessProfile,
        artifacts.strategy,
        ctx,
        artifacts,
      );
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
