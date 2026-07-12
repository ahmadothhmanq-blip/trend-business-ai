import { aiGenerationEngine } from "@/lib/ai/engine";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { websitePlugin } from "@/plugins/website";
import type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
} from "@/plugins/website";

export type {
  GeneratedProjectFile,
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
};

type GenerateWebsiteInput = WebsiteGenerationInput & {
  onProgress?: (event: string) => void;
};

export async function generateWebsiteWithDeepSeek(input: GenerateWebsiteInput): Promise<
  GeneratedWebsiteProject & {
    progressEvents: WebsiteGenerationProgressEvent[];
    usage: TokenUsage;
    generationTimeMs: number;
    provider: string;
  }
> {
  const { onProgress, ...pluginInput } = input;
  const result = await aiGenerationEngine.run(websitePlugin, pluginInput, {
    provider: "deepseek",
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as WebsiteGenerationProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: "deepseek",
  };
}
