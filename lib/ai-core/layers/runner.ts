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
      const {
        detectWebsiteIndustry,
        applyIndustryIntelligenceToBrief,
      } = await import("@/lib/ai-core/industry-intelligence");
      onProgress?.(
        "[industry] Detecting industry with DeepSeek for agency-grade structure...",
      );
      const detection = await detectWebsiteIndustry(brief);
      const withIndustry = applyIndustryIntelligenceToBrief(brief, detection);
      brief = withIndustry.brief;
      onProgress?.(
        `[industry] ${detection.profile.label} · ${detection.profile.designStyle} · pages=${detection.profile.recommendedPages.length} · ${detection.source}`,
      );

      onProgress?.(
        "[template] Selecting premium template with AI (industry · goal · style)...",
      );
      const { selectPremiumTemplate, applyPremiumTemplateToBrief } =
        await import("@/lib/ai-core/premium-templates");
      const premium = await selectPremiumTemplate(brief, {
        preferredIndustryId: detection.industryId,
      });
      const enriched = applyPremiumTemplateToBrief(brief, premium);
      brief = enriched.brief;
      artifacts.brief = brief;
      artifacts.templateSelection = enriched.selection;
      layersExecuted.push("template");
      onProgress?.(
        `[template] ${premium.template.name} (${premium.template.id}) · goal=${premium.websiteGoal} · ${premium.brandStyle} · ${premium.designPreset} · ${premium.source}`,
      );

      // Template Intelligence — visual style / category layer (auto or explicit)
      onProgress?.(
        "[template-intelligence] Selecting visual template (industry · audience · brand style)...",
      );
      const {
        selectTemplateIntelligence,
        selectionInputFromBrief,
        applyTemplateIntelligenceToBrief,
      } = await import("@/lib/ai-core/template-intelligence");
      const { runAutoDesignDecision } = await import(
        "@/lib/ai-core/website-design-platform"
      );
      const autoDesign = runAutoDesignDecision({
        prompt: brief.prompt,
        language: brief.language,
        brandStyle:
          typeof brief.metadata?.brandStyle === "string"
            ? brief.metadata.brandStyle
            : null,
        industry: detection.industryId,
        explicitTemplateId:
          typeof brief.metadata?.templateIntelligenceId === "string"
            ? brief.metadata.templateIntelligenceId
            : null,
      });
      brief.metadata = {
        ...(brief.metadata || {}),
        autoDesignDecision: autoDesign,
        designPlatformFamily: autoDesign.family,
        designPlatformVertical: autoDesign.vertical,
        requiredSections: autoDesign.requiredSections,
        localeDir: autoDesign.locale.dir,
      };
      const tiSelection = selectTemplateIntelligence({
        ...selectionInputFromBrief(brief),
        explicitTemplateId:
          autoDesign.templateIntelligenceId ||
          selectionInputFromBrief(brief).explicitTemplateId,
      });
      brief = applyTemplateIntelligenceToBrief(brief, tiSelection.template);
      artifacts.brief = brief;
      onProgress?.(
        `[auto-design] ${autoDesign.vertical} · ${autoDesign.family} · ${autoDesign.templateIntelligenceId} · confidence=${autoDesign.confidence.toFixed(2)}`,
      );
      onProgress?.(
        `[template-intelligence] ${tiSelection.template.name} · ${tiSelection.template.category} · ${tiSelection.source} · confidence=${tiSelection.confidence.toFixed(2)}`,
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
