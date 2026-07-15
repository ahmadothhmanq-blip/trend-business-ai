import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { contentStudioPlugin } from "@/plugins/content-studio";
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

export async function generateContent(
  input: GenerateContentInput,
): Promise<ContentGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(contentStudioPlugin, pluginInput, {
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents,
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
