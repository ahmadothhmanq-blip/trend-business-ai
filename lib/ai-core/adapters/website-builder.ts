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
import { getTemplateSelectionFromBrief } from "@/lib/ai-core/templates/apply";
import {
  buildAiDesignSystemFromStrategy,
  mergeCoreDesignWithAiDecisions,
} from "@/lib/ai-core/design-system";
import {
  generateCoreAssets,
  planCoreAssets,
} from "@/lib/ai-core/assets";
import {
  buildSeoPackageFromStrategy,
  checkSeoReadiness,
  injectSeoArtifacts,
  withSeoReadiness,
} from "@/lib/ai-core/seo";
import { runPerformanceChecks } from "@/lib/ai-core/performance";
import { buildAutoQualityReport } from "@/lib/ai-core/quality";
import { analyzeBusinessIdea } from "@/plugins/website/layers/business-idea";
import { buildDesignSystem } from "@/plugins/website/layers/design-engine";
import { buildWebsiteStrategy } from "@/plugins/website/layers/strategy";
import { uploadWebsiteAsset } from "@/lib/website/assets-storage";
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
      seo: true,
      performance: true,
      finalize: true,
    },

    async runIdea(brief, ctx) {
      const input = getWebsiteInput(brief);
      const template = getTemplateSelectionFromBrief(brief);
      analysis = await analyzeBusinessIdea(input, ctx);
      if (template) {
        const requiredSections = Array.from(
          new Set([
            ...analysis.businessProfile.requiredSections,
            ...template.sections,
          ]),
        );
        analysis = {
          ...analysis,
          pages:
            analysis.pages.length > 0
              ? analysis.pages
              : template.suggestedPages,
          features: Array.from(
            new Set([...analysis.features, ...template.requiredFeatures]),
          ),
          isEcommerce:
            analysis.isEcommerce || template.industryId === "ecommerce",
          isSaas: analysis.isSaas || template.industryId === "saas",
          businessProfile: {
            ...analysis.businessProfile,
            industry:
              analysis.businessProfile.industry || template.label,
            requiredSections,
            tone: analysis.businessProfile.tone || template.contentTone,
          },
        };
      }
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
      const template = getTemplateSelectionFromBrief(brief);
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
      const designInput = template
        ? {
            ...input,
            theme: input.theme || template.designPreset,
          }
        : input;
      const design = await buildDesignSystem(
        designInput,
        analysis,
        strategy as WebsiteStrategy,
        ctx,
      );
      if (template) {
        design.stylePreset = template.designPreset;
        design.layoutStyle = template.layoutStyle;
        design.industryPattern = template.industryPattern;
      }

      // Phase 7: AI Design System foundation from Strategy.
      const aiDesign = buildAiDesignSystemFromStrategy({
        strategy: strategy as CoreProductStrategy,
        profile,
        preferredPreset: template?.designPreset || design.stylePreset,
        templateSelection: template,
        industryPattern: design.industryPattern,
        layoutStyle: design.layoutStyle,
      });
      return mergeCoreDesignWithAiDecisions(
        design as CoreDesignSystem,
        aiDesign,
      );
    },

    async runAssets(brief, artifacts, ctx) {
      const input = getWebsiteInput(brief);
      if (!analysis || !artifacts.strategy || !artifacts.designSystem) {
        throw new Error(
          "Website Builder adapter: assets require idea/strategy/design artifacts.",
        );
      }

      const instruction = input.continueInstruction?.toLowerCase() ?? "";
      if (
        input.mode === "continue" &&
        input.previousAssetManifest?.items?.length &&
        !instruction.includes("[assets]")
      ) {
        return input.previousAssetManifest as CoreAssetManifest;
      }

      // Phase 7: shared AI Assets Engine (OpenAI when available).
      const planned = planCoreAssets({
        strategy: artifacts.strategy,
        designSystem: artifacts.designSystem,
        profile: analysis.businessProfile,
        maxItems: 4,
      });
      const generationKey =
        input.parentGenerationId ?? `draft-${Date.now()}`;

      return generateCoreAssets({
        items: planned,
        colors: artifacts.designSystem.colors,
        userId: input.userId,
        generationKey,
        maxImages: 4,
        onProgress: (message) => ctx.progress.emit(message),
        upload:
          input.userId
            ? async ({ assetId, bytes, contentType }) => {
                const uploaded = await uploadWebsiteAsset({
                  userId: input.userId!,
                  generationKey,
                  assetId,
                  bytes,
                  contentType,
                });
                return uploaded
                  ? {
                      publicUrl: uploaded.publicUrl,
                      storagePath: uploaded.storagePath,
                    }
                  : null;
              }
            : undefined,
      });
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

      // Phase 8: Auto Quality Engine — sections + design consistency on top of plugin check.
      const autoReport = buildAutoQualityReport({
        baseReport: qualityResult.qualityReport as CoreQualityReport,
        files: qualityResult.files,
        strategy: artifacts.strategy,
        designSystem: artifacts.designSystem,
        assetManifest,
        profile: artifacts.businessProfile ?? analysis.businessProfile,
        improveApplied: qualityResult.qualityReport.improveApplied,
        improveNotes: qualityResult.qualityReport.improveNotes,
      });

      project = {
        ...generation,
        files: qualityResult.files,
        qualityReport: autoReport as QualityReport,
        businessProfile: analysis.businessProfile,
        strategy: plan.strategy,
        designSystem: plan.designSystem,
        assetManifest,
      };

      return autoReport;
    },

    async runSeo(brief, artifacts, generation) {
      if (!artifacts.strategy) {
        throw new Error(
          "Website Builder adapter: SEO requires strategy artifact.",
        );
      }
      const input = getWebsiteInput(brief);
      const pkg = buildSeoPackageFromStrategy({
        strategy: artifacts.strategy,
        profile: artifacts.businessProfile ?? analysis?.businessProfile,
        language: input.language || brief.language,
      });
      const files = project?.files ?? generation.files;
      const readiness = checkSeoReadiness({
        files,
        strategy: artifacts.strategy,
        seoPackage: pkg,
      });
      const seoPackage = withSeoReadiness(pkg, readiness);
      const nextFiles = injectSeoArtifacts(files, seoPackage);

      project = {
        ...(project ?? generation),
        files: nextFiles,
        seo: seoPackage.keywords,
        seoPackage,
      };

      return seoPackage;
    },

    async runPerformance(_brief, artifacts, generation) {
      const files = project?.files ?? generation.files;
      const report = runPerformanceChecks({
        files,
        assetManifest:
          artifacts.assetManifest ??
          project?.assetManifest ??
          generation.assetManifest,
      });

      project = {
        ...(project ?? generation),
        performanceReport: report,
      };

      return report;
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
        seoPackage:
          (artifacts.seoPackage as GeneratedWebsiteProject["seoPackage"]) ??
          project?.seoPackage ??
          generation.seoPackage,
        performanceReport:
          (artifacts.performanceReport as GeneratedWebsiteProject["performanceReport"]) ??
          project?.performanceReport ??
          generation.performanceReport,
        seo:
          artifacts.seoPackage?.keywords ??
          project?.seo ??
          generation.seo,
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
