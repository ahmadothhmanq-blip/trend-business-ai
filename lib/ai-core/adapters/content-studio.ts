/**
 * Content Studio → AI Core ProductEngineAdapter (Phase 3).
 *
 * Reuses plugins/content-studio analyze → plan → generate → validate → export.
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
  trackProviderUsage,
  validationToQualityReport,
} from "@/lib/ai-core/adapters/derive-layers";
import { contentStudioPlugin } from "@/plugins/content-studio";
import type {
  ContentAnalysis,
  ContentOutput,
  ContentPlanResult,
  ContentPluginInput,
} from "@/plugins/content-studio/types";

export const CONTENT_STUDIO_PRODUCT_ID = "content-studio";

const INPUT_META_KEY = "contentPluginInput";

export function contentInputToBrief(input: ContentPluginInput): CoreBrief {
  return {
    prompt: input.prompt,
    productId: CONTENT_STUDIO_PRODUCT_ID,
    language: input.language,
    theme: input.tone,
    features: input.options,
    metadata: {
      [INPUT_META_KEY]: input,
      contentTool: input.contentTool,
      contentType: input.contentType,
      audience: input.audience,
    },
  };
}

function getContentInput(brief: CoreBrief): ContentPluginInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Content Studio adapter requires contentPluginInput in brief.metadata.",
    );
  }
  return raw as ContentPluginInput;
}

export function createContentStudioAdapter(): ProductEngineAdapter<
  ContentOutput,
  ContentOutput
> {
  let analysis: ContentAnalysis | undefined;
  let plan: ContentPlanResult | undefined;
  let output: ContentOutput | undefined;

  return {
    productId: CONTENT_STUDIO_PRODUCT_ID,
    label: "Content Studio",
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
      const input = getContentInput(brief);
      analysis = await contentStudioPlugin.analyze(input, ctx);
      trackProviderUsage(ctx);
      return {
        ...profileFromProductAnalysis({
          projectName: analysis.title,
          industry: analysis.contentType,
          summary: analysis.mainMessage,
          goals: analysis.keyPoints,
          requiredSections: analysis.keyPoints,
          offer: analysis.title,
        }),
        targetAudience: analysis.targetAudience,
        tone: analysis.toneAnalysis || input.tone,
      };
    },

    async runStrategy(brief, _profile, ctx) {
      const input = getContentInput(brief);
      if (!analysis) {
        throw new Error("Content Studio adapter: strategy requires idea analysis.");
      }
      plan = await contentStudioPlugin.plan(input, analysis, ctx);
      trackProviderUsage(ctx);
      return deriveStrategyFromPages({
        positioning: analysis.competitiveAngle || analysis.mainMessage,
        pages: ["Content"],
        sections: plan.sections.map((s) => s.heading),
        ctas: plan.headlineVariants.slice(0, 2),
        seoFocus: [
          plan.primaryKeyword,
          ...plan.secondaryKeywords.slice(0, 5),
        ].filter(Boolean),
      });
    },

    async runDesign(brief) {
      const input = getContentInput(brief);
      return deriveDesignSystem({
        style: input.writingStyle || input.tone,
        colorStyle: input.brandVoice || "neutral",
        components: plan?.sections.map((s) => s.heading),
        industryPattern: analysis?.contentType || input.contentType,
      });
    },

    async runAssets(_brief) {
      const labels =
        plan?.sections.map((s) => s.heading) ??
        analysis?.keyPoints ??
        ["Primary content"];
      return derivePendingAssetManifest(labels);
    },

    async runGeneration(brief, _artifacts, ctx) {
      const input = getContentInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Content Studio adapter: generation requires analysis and plan.",
        );
      }
      output = await contentStudioPlugin.generate(input, analysis, plan, ctx);
      trackProviderUsage(ctx);
      return output;
    },

    async runQuality(_brief, _artifacts, generation, ctx) {
      const result = await contentStudioPlugin.validate(generation, ctx);
      const report = validationToQualityReport(result);
      if (!result.valid) {
        throw new Error(
          result.issues.join("\n") ||
            result.reason ||
            "Content Studio failed validation.",
        );
      }
      return report;
    },

    async finalize(_brief, _artifacts, generation, ctx) {
      const finished = output ?? generation;
      await contentStudioPlugin.export(finished, ctx);
      output = finished;
      return finished;
    },
  };
}

registerProductEngineAdapter(createContentStudioAdapter());
