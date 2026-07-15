import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { landingPagePlugin } from "@/plugins/landing-page";
import type {
  LPOutput,
  LandingPagePluginInput,
  LPProgressEvent,
  GeneratedProjectFile,
} from "@/plugins/landing-page";

export type {
  LPOutput,
  LandingPagePluginInput,
  LPProgressEvent,
  GeneratedProjectFile,
};

type GenerateLPInput = LandingPagePluginInput & {
  onProgress?: (event: string) => void;
};

export type LPGenerationResult = LPOutput & {
  progressEvents: LPProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export async function generateLandingPage(
  input: GenerateLPInput,
): Promise<LPGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(landingPagePlugin, pluginInput, {
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as LPProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
