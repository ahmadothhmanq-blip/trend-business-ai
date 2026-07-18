import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  contentInputToBrief,
  createContentStudioAdapter,
} from "@/lib/ai-core/adapters/content-studio";
import type {
  ContentOutput,
  ContentPluginInput,
} from "@/plugins/content-studio";

export type { ContentOutput, ContentPluginInput };

type GenerateContentInput = ContentPluginInput & {
  onProgress?: (event: string) => void;
};

export type ContentGenerationResult = ContentOutput & {
  progressEvents: string[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

/**
 * Content Studio entrypoint — Phase 3 runs through AI Core LayerRunner
 * (Idea → Strategy → Design → Assets → Generation → Quality → Finalize).
 */
export async function generateContent(
  input: GenerateContentInput,
): Promise<ContentGenerationResult> {
  const { onProgress, ...pluginInput } = input;

  const resolved = providerManager.resolve();
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error(
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
    );
  }

  const adapter = createContentStudioAdapter();
  const result = await layerRunner.run(
    adapter,
    { brief: contentInputToBrief(pluginInput) },
    { provider: resolved, onProgress },
  );

  const project = result.finalOutput ?? result.generation;

  return {
    ...project,
    progressEvents: result.progressEvents,
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
