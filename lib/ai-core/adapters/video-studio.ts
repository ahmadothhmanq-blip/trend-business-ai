/**
 * Video Studio → AI Core ProductEngineAdapter (Phase 4).
 *
 * Reuses plugins/video-studio analyze → plan → generate → validate → export.
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
import { videoStudioPlugin } from "@/plugins/video-studio";
import type {
  VideoAnalysis,
  VideoOutput,
  VideoPlanResult,
  VideoPluginInput,
} from "@/plugins/video-studio/types";

export const VIDEO_STUDIO_PRODUCT_ID = "video-studio";

const INPUT_META_KEY = "videoPluginInput";

export function videoInputToBrief(input: VideoPluginInput): CoreBrief {
  return {
    prompt: input.prompt,
    productId: VIDEO_STUDIO_PRODUCT_ID,
    theme: input.style,
    features: input.options,
    metadata: {
      [INPUT_META_KEY]: input,
      videoType: input.videoType,
      mood: input.mood,
      duration: input.duration,
    },
  };
}

function getVideoInput(brief: CoreBrief): VideoPluginInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Video Studio adapter requires videoPluginInput in brief.metadata.",
    );
  }
  return raw as VideoPluginInput;
}

export function createVideoStudioAdapter(): ProductEngineAdapter<
  VideoOutput,
  VideoOutput
> {
  let analysis: VideoAnalysis | undefined;
  let plan: VideoPlanResult | undefined;
  let output: VideoOutput | undefined;

  return {
    productId: VIDEO_STUDIO_PRODUCT_ID,
    label: "Video Studio",
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
      const input = getVideoInput(brief);
      analysis = await videoStudioPlugin.analyze(input, ctx);
      trackProviderUsage(ctx);
      return {
        ...profileFromProductAnalysis({
          projectName: analysis.title,
          industry: analysis.videoType,
          summary: analysis.concept,
          goals: analysis.keyMessages,
          requiredSections: analysis.keyMessages,
          offer: analysis.title,
        }),
        targetAudience: analysis.targetAudience,
        tone: analysis.mood,
      };
    },

    async runStrategy(brief, _profile, ctx) {
      const input = getVideoInput(brief);
      if (!analysis) {
        throw new Error("Video Studio adapter: strategy requires idea analysis.");
      }
      plan = await videoStudioPlugin.plan(input, analysis, ctx);
      trackProviderUsage(ctx);
      return deriveStrategyFromPages({
        positioning: analysis.concept || plan.narrativeArc,
        pages: ["Video"],
        sections: plan.scenes.map((s) => s.name),
        ctas: analysis.keyMessages.slice(0, 2),
        seoFocus: [analysis.visualTheme, analysis.style].filter(Boolean),
      });
    },

    async runDesign(brief) {
      const input = getVideoInput(brief);
      const colorHint = plan?.colorPalette?.[0] || input.style;
      return deriveDesignSystem({
        style: analysis?.style || input.style,
        colorStyle: colorHint,
        components: plan?.scenes.map((s) => s.name),
        industryPattern: analysis?.videoType || input.videoType,
      });
    },

    async runAssets(_brief) {
      const labels =
        plan?.scenes.map((s) => s.name) ??
        analysis?.keyMessages ??
        ["Storyboard", "Thumbnail"];
      return derivePendingAssetManifest(labels);
    },

    async runGeneration(brief, _artifacts, ctx) {
      const input = getVideoInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Video Studio adapter: generation requires analysis and plan.",
        );
      }
      output = await videoStudioPlugin.generate(input, analysis, plan, ctx);
      trackProviderUsage(ctx);
      return output;
    },

    async runQuality(_brief, _artifacts, generation, ctx) {
      const result = await videoStudioPlugin.validate(generation, ctx);
      const report = validationToQualityReport(result);
      if (!result.valid) {
        throw new Error(
          result.issues.join("\n") ||
            result.reason ||
            "Video Studio failed validation.",
        );
      }
      return report;
    },

    async finalize(_brief, _artifacts, generation, ctx) {
      const finished = output ?? generation;
      await videoStudioPlugin.export(finished, ctx);
      output = finished;
      return finished;
    },
  };
}

registerProductEngineAdapter(createVideoStudioAdapter());
