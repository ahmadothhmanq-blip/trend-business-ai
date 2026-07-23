/**
 * Business Manager AI → AI Core ProductEngineAdapter.
 *
 * Reuses workspace managerPlugin (createTextPlugin). Legacy workspace API
 * remains /api/workspaces/manager.
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
import { managerPlugin } from "@/plugins/workspace/plugins";
import type { PluginBriefInput, TextPluginOutput } from "@/plugins/types";

export const BUSINESS_MANAGER_AI_PRODUCT_ID = "business-manager-ai";

const INPUT_META_KEY = "managerPluginInput";

export function managerInputToBrief(input: PluginBriefInput): CoreBrief {
  return {
    prompt: input.prompt,
    productId: BUSINESS_MANAGER_AI_PRODUCT_ID,
    language: input.language,
    theme: input.theme,
    features: input.features,
    metadata: {
      [INPUT_META_KEY]: input,
    },
  };
}

function getManagerInput(brief: CoreBrief): PluginBriefInput {
  const raw = brief.metadata?.[INPUT_META_KEY];
  if (!raw || typeof raw !== "object") {
    throw new Error("Business Manager AI adapter requires managerPluginInput in brief.metadata.");
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
  return ["Roadmap", "Task board", "Milestones", "Operations dashboard"];
}

export function createBusinessManagerAiAdapter(): ProductEngineAdapter<
  TextPluginOutput,
  TextPluginOutput
> {
  let analysis: Record<string, unknown> | undefined;
  let plan: Record<string, unknown> | undefined;
  let output: TextPluginOutput | undefined;

  return {
    productId: BUSINESS_MANAGER_AI_PRODUCT_ID,
    label: "Business Manager AI",
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
      const input = getManagerInput(brief);
      analysis = await managerPlugin.analyze(input, ctx);
      trackProviderUsage(ctx);
      const title = asString(analysis.title ?? analysis.planName, "Business operations plan");
      const summary = asString(analysis.summary ?? analysis.overview, input.prompt.slice(0, 240));
      const goals = Array.isArray(analysis.goals)
        ? analysis.goals.map(String)
        : Array.isArray(analysis.objectives)
          ? analysis.objectives.map(String)
          : ["Execute strategy"];

      return profileFromProductAnalysis({
        projectName: title,
        industry: asString(analysis.industry, "operations"),
        summary,
        goals,
        requiredSections: goals,
        offer: title,
      });
    },

    async runStrategy(brief, profile, ctx) {
      const input = getManagerInput(brief);
      if (!analysis) {
        throw new Error("Business Manager AI adapter: strategy requires idea analysis.");
      }
      plan = await managerPlugin.plan(input, analysis, ctx);
      trackProviderUsage(ctx);
      const labels = sectionLabels(plan);
      return deriveStrategyFromPages({
        positioning: asString(plan.positioning ?? plan.summary ?? analysis.positioning, profile.summary),
        pages: ["Operations"],
        sections: labels,
        ctas: ["Assign tasks", "Review progress"],
        seoFocus: labels.slice(0, 4),
      });
    },

    async runDesign(brief) {
      const input = getManagerInput(brief);
      return deriveDesignSystem({
        style: input.theme || "modern",
        colorStyle: asString(analysis?.tone, "professional"),
        components: plan ? sectionLabels(plan) : undefined,
        industryPattern: "business-operations",
      });
    },

    async runAssets(_brief) {
      const labels = plan ? sectionLabels(plan) : ["Roadmap", "Kanban board", "KPI dashboard"];
      return derivePendingAssetManifest(labels);
    },

    async runGeneration(brief, _artifacts, ctx) {
      const input = getManagerInput(brief);
      if (!analysis || !plan) {
        throw new Error("Business Manager AI adapter: generation requires analysis and plan.");
      }
      output = await managerPlugin.generate(input, analysis, plan, ctx);
      trackProviderUsage(ctx);
      return output;
    },

    async runQuality(_brief, _artifacts, generation, ctx) {
      const result = await managerPlugin.validate(generation, ctx);
      const report = validationToQualityReport(result);
      if (!result.valid) {
        throw new Error(
          result.issues.join("\n") || result.reason || "Business Manager AI failed validation.",
        );
      }
      return report;
    },

    async finalize(_brief, _artifacts, generation, ctx) {
      const finished = output ?? generation;
      await managerPlugin.export(finished, ctx);
      output = finished;
      return finished;
    },
  };
}

registerProductEngineAdapter(createBusinessManagerAiAdapter());
