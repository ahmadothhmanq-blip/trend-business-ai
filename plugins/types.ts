import type { AIPlugin } from "@/lib/ai/engine";
import { getActiveProvider } from "@/lib/ai/provider-config";
import type {
  AIProviderName,
  ExportResult,
  ValidationResult,
} from "@/lib/ai/types";

export type { AIPlugin };

export type PluginBriefInput = {
  prompt: string;
  language?: string;
  theme?: string;
  features?: string[];
};

export type TextPluginOutput = {
  title: string;
  summary: string;
  sections: Array<{ heading: string; content: string }>;
  deliverables: string[];
};

export function createTextPlugin(config: {
  id: string;
  name: string;
  preferredProvider?: AIProviderName;
  analyzePrompt: (input: PluginBriefInput) => string;
  planPrompt: (input: PluginBriefInput, analysis: Record<string, unknown>) => string;
  generatePrompt: (
    input: PluginBriefInput,
    analysis: Record<string, unknown>,
    plan: Record<string, unknown>,
  ) => string;
}): AIPlugin<PluginBriefInput, Record<string, unknown>, Record<string, unknown>, TextPluginOutput> {
  const preferredProvider = config.preferredProvider ?? getActiveProvider();

  return {
    id: config.id,
    name: config.name,
    preferredProvider,
    async analyze(input, ctx) {
      ctx.progress.emit("Analyzing...");
      return ctx.provider.generateJson<Record<string, unknown>>({
        prompt: config.analyzePrompt(input),
      });
    },
    async plan(input, analysis, ctx) {
      ctx.progress.emit("Planning...");
      return ctx.provider.generateJson<Record<string, unknown>>({
        prompt: config.planPrompt(input, analysis),
      });
    },
    async generate(input, analysis, plan, ctx) {
      ctx.progress.emit("Generating...");
      return ctx.provider.generateJson<TextPluginOutput>({
        prompt: config.generatePrompt(input, analysis, plan),
      });
    },
    async validate(output): Promise<ValidationResult> {
      const valid = Boolean(output.title && output.summary && output.sections.length);
      return {
        valid,
        reason: valid ? undefined : "Generated output is incomplete.",
        issues: valid ? [] : ["Missing title, summary or sections."],
      };
    },
    async export(output, ctx): Promise<ExportResult> {
      ctx.progress.emit("Exporting...");
      return {
        format: "json",
        data: output,
        filename: `${config.id}-output.json`,
      };
    },
  };
}
