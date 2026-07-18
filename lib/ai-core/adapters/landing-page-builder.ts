/**
 * Landing Page Builder → AI Core ProductEngineAdapter (Phase 2).
 *
 * Reuses plugins/landing-page analyze → plan → generate → validate → export.
 * Does not rewrite the generator or UI.
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import {
  deriveDesignSystem,
  derivePendingAssetManifest,
  deriveStrategyFromPages,
  profileFromProductAnalysis,
  validationToQualityReport,
} from "@/lib/ai-core/adapters/derive-layers";
import { analyzeLandingPage } from "@/plugins/landing-page/analyze";
import { exportLandingPage } from "@/plugins/landing-page/export";
import { generateLandingPage as generateLandingPageFiles } from "@/plugins/landing-page/generate";
import { planLandingPage } from "@/plugins/landing-page/plan";
import { validateLandingPage } from "@/plugins/landing-page/validate";
import type {
  LandingPagePluginInput,
  LPAnalysis,
  LPOutput,
  LPPlanResult,
} from "@/plugins/landing-page/types";

export const LANDING_PAGE_BUILDER_PRODUCT_ID = "landing-page-builder";

const INPUT_META_KEY = "landingPagePluginInput";

export function landingPageInputToBrief(
  input: LandingPagePluginInput,
): CoreBrief {
  return {
    prompt: input.prompt,
    productId: LANDING_PAGE_BUILDER_PRODUCT_ID,
    language: input.language,
    theme: input.designStyle,
    features: input.sections,
    metadata: {
      [INPUT_META_KEY]: input,
      colorStyle: input.colorStyle,
      pageType: input.pageType,
    },
  };
}

function getLandingPageInput(brief: CoreBrief): LandingPagePluginInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Landing Page Builder adapter requires landingPagePluginInput in brief.metadata.",
    );
  }
  return raw as LandingPagePluginInput;
}

export function createLandingPageBuilderAdapter(): ProductEngineAdapter<
  LPOutput,
  LPOutput
> {
  let analysis: LPAnalysis | undefined;
  let plan: LPPlanResult | undefined;
  let output: LPOutput | undefined;

  return {
    productId: LANDING_PAGE_BUILDER_PRODUCT_ID,
    label: "Landing Page Builder",
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
      const input = getLandingPageInput(brief);
      analysis = await analyzeLandingPage(input, ctx);
      return profileFromProductAnalysis({
        projectName: analysis.pageName,
        industry: analysis.pageType,
        summary: `${analysis.pageType} landing page: ${analysis.sections.join(", ")}`,
        goals: analysis.features,
        requiredSections: analysis.sections,
        offer: analysis.pageName,
      });
    },

    async runStrategy(brief, _profile, ctx) {
      const input = getLandingPageInput(brief);
      if (!analysis) {
        throw new Error(
          "Landing Page Builder adapter: strategy requires idea analysis.",
        );
      }
      plan = await planLandingPage(input, analysis, ctx);
      return deriveStrategyFromPages({
        positioning:
          plan.blueprint.headline ||
          plan.blueprint.description ||
          analysis.pageName,
        pages: ["Home"],
        sections: plan.blueprint.sections.length
          ? plan.blueprint.sections
          : analysis.sections,
        ctas: ["Get started", "Learn more"],
        seoFocus: plan.blueprint.seo?.slice(0, 6),
      });
    },

    async runDesign(brief, _profile, _strategy) {
      const input = getLandingPageInput(brief);
      if (!plan) {
        throw new Error("Landing Page Builder adapter: design requires plan.");
      }
      return deriveDesignSystem({
        style: input.designStyle,
        colorStyle: input.colorStyle,
        components: plan.blueprint.components,
        industryPattern: analysis?.pageType || "landing-page",
      });
    },

    async runAssets(_brief, artifacts) {
      const labels =
        artifacts.strategy?.sectionPlan.map((s) => s.name) ??
        plan?.blueprint.sections ??
        analysis?.sections ??
        [];
      return derivePendingAssetManifest(labels);
    },

    async runGeneration(brief, _artifacts, ctx) {
      const input = getLandingPageInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Landing Page Builder adapter: generation requires analysis and plan.",
        );
      }
      output = await generateLandingPageFiles(input, analysis, plan, ctx);
      return output;
    },

    async runQuality(_brief, _artifacts, generation, ctx) {
      const result = await validateLandingPage(generation, ctx);
      const report = validationToQualityReport(result);
      if (!result.valid) {
        throw new Error(
          result.issues.join("\n") ||
            result.reason ||
            "Landing Page Builder failed validation.",
        );
      }
      return report;
    },

    async finalize(_brief, _artifacts, generation, ctx) {
      const finished = output ?? generation;
      await exportLandingPage(finished, ctx);
      output = finished;
      return finished;
    },
  };
}

registerProductEngineAdapter(createLandingPageBuilderAdapter());
