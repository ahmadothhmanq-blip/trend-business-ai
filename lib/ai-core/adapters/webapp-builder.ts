/**
 * Web App Builder → AI Core ProductEngineAdapter (Phase 2).
 *
 * Reuses plugins/webapp analyze → plan → generate → validate → export.
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
import { analyzeWebApp } from "@/plugins/webapp/analyze";
import { exportWebApp } from "@/plugins/webapp/export";
import { generateWebApp as generateWebAppFiles } from "@/plugins/webapp/generate";
import { planWebApp } from "@/plugins/webapp/plan";
import { validateWebApp } from "@/plugins/webapp/validate";
import type {
  WebAppAnalysis,
  WebAppOutput,
  WebAppPlanResult,
  WebAppPluginInput,
} from "@/plugins/webapp/types";

export const WEBAPP_BUILDER_PRODUCT_ID = "webapp-builder";

const INPUT_META_KEY = "webappPluginInput";

export function webappInputToBrief(input: WebAppPluginInput): CoreBrief {
  return {
    prompt: input.prompt,
    productId: WEBAPP_BUILDER_PRODUCT_ID,
    language: input.language,
    theme: input.designStyle,
    features: input.features,
    metadata: {
      [INPUT_META_KEY]: input,
      colorStyle: input.colorStyle,
      appType: input.appType,
    },
  };
}

function getWebappInput(brief: CoreBrief): WebAppPluginInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Web App Builder adapter requires webappPluginInput in brief.metadata.",
    );
  }
  return raw as WebAppPluginInput;
}

export function createWebappBuilderAdapter(): ProductEngineAdapter<
  WebAppOutput,
  WebAppOutput
> {
  let analysis: WebAppAnalysis | undefined;
  let plan: WebAppPlanResult | undefined;
  let output: WebAppOutput | undefined;

  return {
    productId: WEBAPP_BUILDER_PRODUCT_ID,
    label: "Web App Builder",
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
      const input = getWebappInput(brief);
      analysis = await analyzeWebApp(input, ctx);
      return profileFromProductAnalysis({
        projectName: analysis.appName,
        industry: analysis.appType,
        summary: `${analysis.appType} app with ${analysis.pages.join(", ")}`,
        goals: analysis.features,
        requiredSections: analysis.pages,
        offer: analysis.appName,
      });
    },

    async runStrategy(brief, _profile, ctx) {
      const input = getWebappInput(brief);
      if (!analysis) {
        throw new Error("Web App Builder adapter: strategy requires idea analysis.");
      }
      // Existing plugin plan = product strategy + file blueprint for this product.
      plan = await planWebApp(input, analysis, ctx);
      return deriveStrategyFromPages({
        positioning: plan.blueprint.description || analysis.appName,
        pages: plan.blueprint.pages.length ? plan.blueprint.pages : analysis.pages,
        sections: plan.blueprint.sections,
        ctas: ["Get started", "Open dashboard"],
        seoFocus: plan.blueprint.roadmap?.slice(0, 4),
      });
    },

    async runDesign(brief, _profile, _strategy) {
      const input = getWebappInput(brief);
      if (!plan) {
        throw new Error("Web App Builder adapter: design requires plan.");
      }
      const base = deriveDesignSystem({
        style: input.designStyle,
        colorStyle: input.colorStyle,
        components:
          plan.appModel?.components.map((c) => c.type) ??
          plan.blueprint.components,
        industryPattern:
          plan.appModel?.industry || analysis?.appType || "web-app",
      });
      const tokens = plan.appModel?.brand.tokens;
      if (!tokens) return base;
      return {
        ...base,
        colors: {
          ...base.colors,
          primary: tokens.primary,
          secondary: tokens.secondary,
          accent: tokens.accent,
          background: tokens.background,
          foreground: tokens.foreground,
          surface: tokens.surface,
        },
        typography: {
          ...base.typography,
          headingFont: tokens.headingFont,
          bodyFont: tokens.bodyFont,
        },
      };
    },

    async runAssets(_brief, artifacts) {
      const labels =
        artifacts.strategy?.pages.map((p) => p.name) ??
        plan?.blueprint.pages ??
        analysis?.pages ??
        [];
      return derivePendingAssetManifest(labels);
    },

    async runGeneration(brief, _artifacts, ctx) {
      const input = getWebappInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Web App Builder adapter: generation requires analysis and plan.",
        );
      }
      output = await generateWebAppFiles(input, analysis, plan, ctx);
      return output;
    },

    async runQuality(_brief, _artifacts, generation, ctx) {
      const result = await validateWebApp(generation, ctx);
      const report = validationToQualityReport(result);
      if (!result.valid) {
        throw new Error(
          result.issues.join("\n") ||
            result.reason ||
            "Web App Builder failed validation.",
        );
      }
      return report;
    },

    async finalize(_brief, _artifacts, generation, ctx) {
      const finished = output ?? generation;
      await exportWebApp(finished, ctx);
      output = finished;
      return finished;
    },
  };
}

registerProductEngineAdapter(createWebappBuilderAdapter());
