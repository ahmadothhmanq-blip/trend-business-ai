import { getAIProvider } from "@/lib/ai/adapters";
import { createProgressTracker } from "@/lib/ai/progress";
import type {
  AIProviderName,
  ExportResult,
  GenerationContext,
  ValidationResult,
} from "@/lib/ai/types";

export type AIPlugin<TInput, TAnalysis, TPlan, TOutput> = {
  id: string;
  name: string;
  preferredProvider: AIProviderName;
  analyze: (input: TInput, ctx: GenerationContext) => Promise<TAnalysis>;
  plan: (
    input: TInput,
    analysis: TAnalysis,
    ctx: GenerationContext,
  ) => Promise<TPlan>;
  generate: (
    input: TInput,
    analysis: TAnalysis,
    plan: TPlan,
    ctx: GenerationContext,
  ) => Promise<TOutput>;
  validate: (output: TOutput, ctx: GenerationContext) => Promise<ValidationResult>;
  export: (output: TOutput, ctx: GenerationContext) => Promise<ExportResult>;
};

export type EngineRunOptions = {
  provider?: AIProviderName;
  progressEvents?: string[];
};

export class AIGenerationEngine {
  async run<TInput, TAnalysis, TPlan, TOutput>(
    plugin: AIPlugin<TInput, TAnalysis, TPlan, TOutput>,
    input: TInput,
    options: EngineRunOptions = {},
  ): Promise<{
    output: TOutput;
    progressEvents: string[];
    exportResult: ExportResult;
  }> {
    const progress = createProgressTracker(options.progressEvents);
    const provider = getAIProvider(options.provider ?? plugin.preferredProvider);
    const ctx: GenerationContext = { provider, progress };

    const analysis = await plugin.analyze(input, ctx);
    const plan = await plugin.plan(input, analysis, ctx);
    const output = await plugin.generate(input, analysis, plan, ctx);
    const validation = await plugin.validate(output, ctx);
    if (!validation.valid) {
      throw new Error(
        validation.issues.join("\n") ||
          validation.reason ||
          `${plugin.name} failed validation.`,
      );
    }

    const exportResult = await plugin.export(output, ctx);

    return {
      output,
      progressEvents: progress.getEvents(),
      exportResult,
    };
  }
}

export const aiGenerationEngine = new AIGenerationEngine();
