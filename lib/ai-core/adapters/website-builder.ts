/**
 * Website Builder → AI Core ProductEngineAdapter (Phase 1).
 *
 * Reuses existing website plugin layers; does not rewrite Website Builder UI
 * or delivery (preview / ZIP / publish stay on existing routes).
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import type {
  CoreAssetManifest,
  CoreBrief,
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreLayerArtifacts,
  CoreProductStrategy,
  CoreQualityReport,
} from "@/lib/ai-core/layers/types";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import { analyzeBusinessIdea } from "@/plugins/website/layers/business-idea";
import { generateWebsiteAssets } from "@/plugins/website/layers/assets";
import { buildDesignSystem } from "@/plugins/website/layers/design-engine";
import { buildWebsiteStrategy } from "@/plugins/website/layers/strategy";
import {
  generateWebsite as generateWebsiteFiles,
  runWebsiteQualityLayer,
} from "@/plugins/website/generate";
import { planWebsite } from "@/plugins/website/plan";
import type {
  AssetManifest,
  DesignSystem,
  GeneratedWebsiteProject,
  QualityReport,
  WebsiteGenerationInput,
  WebsitePlanResult,
  WebsiteProjectAnalysis,
  WebsiteStrategy,
} from "@/plugins/website/types";

export const WEBSITE_BUILDER_PRODUCT_ID = "website-builder";

const INPUT_META_KEY = "websiteGenerationInput";

export function websiteInputToBrief(
  input: WebsiteGenerationInput,
): CoreBrief {
  return {
    prompt: input.prompt,
    productId: WEBSITE_BUILDER_PRODUCT_ID,
    language: input.language,
    theme: input.theme,
    features: input.features,
    metadata: {
      [INPUT_META_KEY]: input,
    },
  };
}

function getWebsiteInput(brief: CoreBrief): WebsiteGenerationInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Website Builder adapter requires websiteGenerationInput in brief.metadata.",
    );
  }
  return raw as WebsiteGenerationInput;
}

/**
 * Fresh adapter instance per run (holds analysis/plan session state).
 */
export function createWebsiteBuilderAdapter(): ProductEngineAdapter<
  GeneratedWebsiteProject,
  GeneratedWebsiteProject
> {
  let analysis: WebsiteProjectAnalysis | undefined;
  let plan: WebsitePlanResult | undefined;
  let project: GeneratedWebsiteProject | undefined;

  return {
    productId: WEBSITE_BUILDER_PRODUCT_ID,
    label: "Website Builder",
    layers: {
      idea: true,
      strategy: true,
      design: true,
      assets: true,
      generation: true,
      quality: true,
      finalize: true,
    },

    async runIdea(brief, ctx) {
      const input = getWebsiteInput(brief);
      analysis = await analyzeBusinessIdea(input, ctx);
      return analysis.businessProfile as CoreBusinessProfile;
    },

    async runStrategy(brief, profile, ctx) {
      const input = getWebsiteInput(brief);
      if (!analysis) {
        analysis = {
          projectName: profile.projectName,
          projectType: input.projectType,
          pages: [],
          features: input.features,
          designSystem: [],
          technologies: [],
          databaseProvider: "none",
          requiresAuth: false,
          requiresDatabase: false,
          requiresDashboard: false,
          isEcommerce: false,
          isSaas: false,
          businessProfile: profile as WebsiteProjectAnalysis["businessProfile"],
        };
      }
      const strategy = await buildWebsiteStrategy(input, analysis, ctx);
      return strategy as CoreProductStrategy;
    },

    async runDesign(brief, profile, strategy, ctx) {
      const input = getWebsiteInput(brief);
      if (!analysis) {
        throw new Error(
          "Website Builder adapter: design requires prior idea analysis.",
        );
      }
      // Keep profile in sync if Core priorArtifacts supplied it
      analysis = {
        ...analysis,
        businessProfile: profile as WebsiteProjectAnalysis["businessProfile"],
      };
      return (await buildDesignSystem(
        input,
        analysis,
        strategy as WebsiteStrategy,
        ctx,
      )) as CoreDesignSystem;
    },

    async runAssets(brief, artifacts, ctx) {
      const input = getWebsiteInput(brief);
      if (!analysis || !artifacts.strategy || !artifacts.designSystem) {
        throw new Error(
          "Website Builder adapter: assets require idea/strategy/design artifacts.",
        );
      }
      const manifest = await generateWebsiteAssets({
        input,
        businessProfile: analysis.businessProfile,
        strategy: artifacts.strategy as WebsiteStrategy,
        designSystem: artifacts.designSystem as DesignSystem,
        ctx,
        userId: input.userId,
        generationKey: input.parentGenerationId ?? `draft-${Date.now()}`,
      });
      return manifest as CoreAssetManifest;
    },

    async runGeneration(brief, artifacts, ctx) {
      const input = getWebsiteInput(brief);
      if (
        !analysis ||
        !artifacts.strategy ||
        !artifacts.designSystem ||
        !artifacts.assetManifest
      ) {
        throw new Error(
          "Website Builder adapter: generation requires full upstream artifacts.",
        );
      }

      plan = await planWebsite(input, analysis, ctx, {
        strategy: artifacts.strategy as WebsiteStrategy,
        designSystem: artifacts.designSystem as DesignSystem,
      });

      project = await generateWebsiteFiles(input, analysis, plan, ctx, {
        assetManifest: artifacts.assetManifest as AssetManifest,
        skipAssetGeneration: true,
        skipQuality: true,
      });

      return project;
    },

    async runQuality(brief, artifacts, generation, ctx) {
      const input = getWebsiteInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Website Builder adapter: quality requires analysis and plan.",
        );
      }
      const assetManifest =
        (artifacts.assetManifest as AssetManifest | undefined) ??
        generation.assetManifest;
      if (!assetManifest) {
        throw new Error(
          "Website Builder adapter: quality requires assetManifest.",
        );
      }

      const qualityResult = await runWebsiteQualityLayer({
        input,
        analysis,
        plan,
        files: generation.files,
        assetManifest,
        ctx,
      });

      project = {
        ...generation,
        files: qualityResult.files,
        qualityReport: qualityResult.qualityReport,
        businessProfile: analysis.businessProfile,
        strategy: plan.strategy,
        designSystem: plan.designSystem,
        assetManifest,
      };

      return qualityResult.qualityReport as CoreQualityReport;
    },

    async finalize(_brief, artifacts, generation) {
      const finished: GeneratedWebsiteProject = {
        ...(project ?? generation),
        businessProfile:
          (artifacts.businessProfile as GeneratedWebsiteProject["businessProfile"]) ??
          project?.businessProfile ??
          generation.businessProfile,
        strategy:
          (artifacts.strategy as WebsiteStrategy | undefined) ??
          project?.strategy ??
          generation.strategy,
        designSystem:
          (artifacts.designSystem as DesignSystem | undefined) ??
          project?.designSystem ??
          generation.designSystem,
        assetManifest:
          (artifacts.assetManifest as AssetManifest | undefined) ??
          project?.assetManifest ??
          generation.assetManifest,
        qualityReport:
          (artifacts.qualityReport as QualityReport | undefined) ??
          project?.qualityReport ??
          generation.qualityReport,
      };
      project = finished;
      return finished;
    },
  };
}

/** Registry entry for discovery (not used for concurrent runs — create fresh instances). */
const websiteBuilderAdapterDefinition = createWebsiteBuilderAdapter();
registerProductEngineAdapter(websiteBuilderAdapterDefinition);

export function priorArtifactsFromWebsiteInput(
  input: WebsiteGenerationInput,
): Partial<CoreLayerArtifacts> | undefined {
  if (
    !input.previousBusinessProfile &&
    !input.previousStrategy &&
    !input.previousDesignSystem &&
    !input.previousAssetManifest
  ) {
    return undefined;
  }
  return {
    businessProfile: input.previousBusinessProfile as
      | CoreBusinessProfile
      | undefined,
    strategy: input.previousStrategy as CoreProductStrategy | undefined,
    designSystem: input.previousDesignSystem as CoreDesignSystem | undefined,
    assetManifest: input.previousAssetManifest as CoreAssetManifest | undefined,
  };
}
