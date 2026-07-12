import { getAIProvider } from "@/lib/ai/adapters";
import { createProgressTracker } from "@/lib/ai/progress";
import { createUsageTracker } from "@/lib/ai/usage";
import type {
  AIProviderName,
  ExportResult,
  GenerationContext,
  TokenUsage,
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
  onProgress?: (event: string) => void;
};

function trackProviderUsage(ctx: GenerationContext) {
  ctx.usage.add(ctx.provider.getLastUsage?.() ?? null);
}

export class AIGenerationEngine {
  async run<TInput, TAnalysis, TPlan, TOutput>(
    plugin: AIPlugin<TInput, TAnalysis, TPlan, TOutput>,
    input: TInput,
    options: EngineRunOptions = {},
  ): Promise<{
    output: TOutput;
    progressEvents: string[];
    exportResult: ExportResult;
    usage: TokenUsage;
    generationTimeMs: number;
    provider: AIProviderName;
  }> {
    const startedAt = Date.now();
    const progress = createProgressTracker(options.progressEvents);
    const usage = createUsageTracker();
    const providerName = options.provider ?? plugin.preferredProvider;
    const provider = getAIProvider(providerName);

    const originalEmit = progress.emit;
    progress.emit = (event) => {
      originalEmit(event);
      options.onProgress?.(event);
    };

    const ctx: GenerationContext = { provider, progress, usage };

    const analysis = await plugin.analyze(input, ctx);
    trackProviderUsage(ctx);
    const plan = await plugin.plan(input, analysis, ctx);
    trackProviderUsage(ctx);
    const output = await plugin.generate(input, analysis, plan, ctx);
    trackProviderUsage(ctx);
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
      usage: usage.get(),
      generationTimeMs: Date.now() - startedAt,
      provider: providerName,
    };
  }
}

export const aiGenerationEngine = new AIGenerationEngine();
