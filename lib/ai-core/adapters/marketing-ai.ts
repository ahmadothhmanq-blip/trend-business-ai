/**
 * Marketing AI → AI Core ProductEngineAdapter (Phase 4).
 *
 * Reuses workspace marketingPlugin (createTextPlugin) analyze → plan →
 * generate → validate → export. Dashboard/API remain /dashboard/marketing
 * and /api/workspaces/marketing.
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
import { marketingPlugin } from "@/plugins/workspace/plugins";
import type { PluginBriefInput, TextPluginOutput } from "@/plugins/types";

export const MARKETING_AI_PRODUCT_ID = "marketing-ai";

const INPUT_META_KEY = "marketingPluginInput";

export function marketingInputToBrief(input: PluginBriefInput): CoreBrief {
  return {
    prompt: input.prompt,
    productId: MARKETING_AI_PRODUCT_ID,
    language: input.language,
    theme: input.theme,
    features: input.features,
    metadata: {
      [INPUT_META_KEY]: input,
    },
  };
}

function getMarketingInput(brief: CoreBrief): PluginBriefInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error(
      "Marketing AI adapter requires marketingPluginInput in brief.metadata.",
    );
  }
  return raw as PluginBriefInput;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function sectionLabels(plan: Record<string, unknown>): string[] {
  const sections = plan.sections;
  if (Array.isArray(sections)) {
    return sections
      .map((section) => {
        if (typeof section === "string") return section;
        if (section && typeof section === "object") {
          const row = section as Record<string, unknown>;
          return asString(row.heading ?? row.name ?? row.title, "");
        }
        return "";
      })
      .filter(Boolean);
  }
  const deliverables = plan.deliverables;
  if (Array.isArray(deliverables)) {
    return deliverables.map((d) => String(d)).filter(Boolean);
  }
  return ["Campaign strategy", "Audience", "Offers", "Funnel"];
}

export function createMarketingAiAdapter(): ProductEngineAdapter<
  TextPluginOutput,
  TextPluginOutput
> {
  let analysis: Record<string, unknown> | undefined;
  let plan: Record<string, unknown> | undefined;
  let output: TextPluginOutput | undefined;

  return {
    productId: MARKETING_AI_PRODUCT_ID,
    label: "Marketing AI",
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
      const input = getMarketingInput(brief);
      analysis = await marketingPlugin.analyze(input, ctx);
      trackProviderUsage(ctx);
      const title = asString(
        analysis.title ?? analysis.campaignName ?? analysis.concept,
        "Marketing campaign",
      );
      const summary = asString(
        analysis.summary ?? analysis.positioning ?? analysis.overview,
        input.prompt.slice(0, 240),
      );
      const goals = Array.isArray(analysis.goals)
        ? analysis.goals.map(String)
        : Array.isArray(analysis.objectives)
          ? analysis.objectives.map(String)
          : ["Grow conversions"];

      return profileFromProductAnalysis({
        projectName: title,
        industry: asString(analysis.industry ?? analysis.category, "marketing"),
        summary,
        goals,
        requiredSections: goals,
        offer: title,
      });
    },

    async runStrategy(brief, profile, ctx) {
      const input = getMarketingInput(brief);
      if (!analysis) {
        throw new Error("Marketing AI adapter: strategy requires idea analysis.");
      }
      plan = await marketingPlugin.plan(input, analysis, ctx);
      trackProviderUsage(ctx);
      const labels = sectionLabels(plan);
      return deriveStrategyFromPages({
        positioning: asString(
          plan.positioning ?? plan.summary ?? analysis.positioning,
          profile.summary,
        ),
        pages: ["Campaign"],
        sections: labels,
        ctas: ["Get started", "Learn more"],
        seoFocus: Array.isArray(plan.channels)
          ? plan.channels.map(String).slice(0, 6)
          : labels.slice(0, 4),
      });
    },

    async runDesign(brief) {
      const input = getMarketingInput(brief);
      return deriveDesignSystem({
        style: input.theme || "modern",
        colorStyle: asString(analysis?.tone ?? analysis?.brandTone, "brand"),
        components: plan ? sectionLabels(plan) : undefined,
        industryPattern: "marketing-campaign",
      });
    },

    async runAssets(_brief) {
      const labels = plan
        ? sectionLabels(plan)
        : ["Campaign angles", "Ad copy", "Funnel map"];
      return derivePendingAssetManifest(labels);
    },

    async runGeneration(brief, _artifacts, ctx) {
      const input = getMarketingInput(brief);
      if (!analysis || !plan) {
        throw new Error(
          "Marketing AI adapter: generation requires analysis and plan.",
        );
      }
      output = await marketingPlugin.generate(input, analysis, plan, ctx);
      trackProviderUsage(ctx);
      return output;
    },

    async runQuality(_brief, _artifacts, generation, ctx) {
      const result = await marketingPlugin.validate(generation, ctx);
      const report = validationToQualityReport(result);
      if (!result.valid) {
        throw new Error(
          result.issues.join("\n") ||
            result.reason ||
            "Marketing AI failed validation.",
        );
      }
      return report;
    },

    async finalize(_brief, _artifacts, generation, ctx) {
      const finished = output ?? generation;
      await marketingPlugin.export(finished, ctx);
      output = finished;
      return finished;
    },
  };
}

registerProductEngineAdapter(createMarketingAiAdapter());
