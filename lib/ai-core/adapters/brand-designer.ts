/**
 * Brand Designer → AI Core ProductEngineAdapter (Phase 3).
 *
 * Reuses plugins/brand-identity analyze → plan → generate → validate → export.
 * Does not rewrite the generator or UI. Core product id: brand-designer.
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import {
  deriveDesignSystemFromBrand,
  derivePendingAssetManifest,
  deriveStrategyFromPages,
  profileFromProductAnalysis,
  trackProviderUsage,
  validationToQualityReport,
} from "@/lib/ai-core/adapters/derive-layers";
import { brandIdentityPlugin } from "@/plugins/brand-identity";
import type {
  BrandAnalysis,
  BrandIdentityPluginInput,
  BrandOutput,
  BrandPlanResult,
} from "@/plugins/brand-identity/types";

export const BRAND_DESIGNER_PRODUCT_ID = "brand-designer";

const INPUT_META_KEY = "brandIdentityPluginInput";

export function brandInputToBrief(input: BrandIdentityPluginInput): CoreBrief {
  return {
    prompt: input.prompt,
    productId: BRAND_DESIGNER_PRODUCT_ID,
    theme: input.brandPersonality,
    features: input.deliverables,
    metadata: {
      [INPUT_META_KEY]: input,
      brandName: input.brandName,
      brandType: input.brandType,
      industry: input.industry,
    },
  };
}

function getBrandInput(brief: CoreBrief): BrandIdentityPluginInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Brand Designer adapter requires brandIdentityPluginInput in brief.metadata.",
    );
  }
  return raw as BrandIdentityPluginInput;
}

export function createBrandDesignerAdapter(): ProductEngineAdapter<
  BrandOutput,
  BrandOutput
> {
  let analysis: BrandAnalysis | undefined;
  let plan: BrandPlanResult | undefined;
  let output: BrandOutput | undefined;

  return {
    productId: BRAND_DESIGNER_PRODUCT_ID,
    label: "Brand Designer",
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
      const input = getBrandInput(brief);
      analysis = await brandIdentityPlugin.analyze(input, ctx);
      trackProviderUsage(ctx);
      return profileFromProductAnalysis({
        projectName: analysis.brandName,
        industry: analysis.industry,
        summary: analysis.positioning || `${analysis.brandName} — ${analysis.personality}`,
        goals: analysis.coreValues,
        requiredSections: input.deliverables,
        offer: analysis.brandName,
      });
    },

    async runStrategy(brief, _profile, ctx) {
      const input = getBrandInput(brief);
      if (!analysis) {
        throw new Error("Brand Designer adapter: strategy requires idea analysis.");
      }
      plan = await brandIdentityPlugin.plan(input, analysis, ctx);
      trackProviderUsage(ctx);
      return deriveStrategyFromPages({
        positioning: analysis.positioning || plan.mission || analysis.brandName,
        pages: ["Brand System"],
        sections: plan.deliverables.length ? plan.deliverables : input.deliverables,
        ctas: [plan.voiceTone.tagline, "Contact us"].filter(Boolean),
        seoFocus: analysis.differentiators.slice(0, 4),
      });
    },

    async runDesign(_brief, _profile, _strategy) {
      if (!analysis || !plan) {
        throw new Error("Brand Designer adapter: design requires analysis and plan.");
      }
      return deriveDesignSystemFromBrand({
        personality: analysis.personality,
        colors: plan.colorPalette,
        typography: plan.typography,
        industry: analysis.industry,
      });
    },

    async runAssets(_brief) {
      const labels =
        plan?.deliverables.length
          ? plan.deliverables
          : analysis
            ? ["Logo system", "Color palette", "Typography"]
            : ["Brand kit"];
      return derivePendingAssetManifest(labels);
    },

    async runGeneration(brief, _artifacts, ctx) {
      const input = getBrandInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Brand Designer adapter: generation requires analysis and plan.",
        );
      }
      output = await brandIdentityPlugin.generate(input, analysis, plan, ctx);
      trackProviderUsage(ctx);
      return output;
    },

    async runQuality(_brief, _artifacts, generation, ctx) {
      const result = await brandIdentityPlugin.validate(generation, ctx);
      const report = validationToQualityReport(result);
      if (!result.valid) {
        throw new Error(
          result.issues.join("\n") ||
            result.reason ||
            "Brand Designer failed validation.",
        );
      }
      return report;
    },

    async finalize(_brief, _artifacts, generation, ctx) {
      const finished = output ?? generation;
      await brandIdentityPlugin.export(finished, ctx);
      output = finished;
      return finished;
    },
  };
}

registerProductEngineAdapter(createBrandDesignerAdapter());
