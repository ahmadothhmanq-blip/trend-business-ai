import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { webappPlugin } from "@/plugins/webapp";
import type {
  WebAppOutput,
  WebAppPluginInput,
  WebAppProgressEvent,
  GeneratedProjectFile,
} from "@/plugins/webapp";

export type {
  WebAppOutput,
  WebAppPluginInput,
  WebAppProgressEvent,
  GeneratedProjectFile,
};

type GenerateWebAppInput = WebAppPluginInput & {
  onProgress?: (event: string) => void;
};

export type WebAppGenerationResult = WebAppOutput & {
  progressEvents: WebAppProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export async function generateWebApp(
  input: GenerateWebAppInput,
): Promise<WebAppGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(webappPlugin, pluginInput, {
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as WebAppProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
