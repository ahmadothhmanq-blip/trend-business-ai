import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { businessSuitePlugin } from "@/plugins/business-suite";
import type {
  BusinessOutput,
  BusinessPluginInput,
} from "@/plugins/business-suite";

export type { BusinessOutput, BusinessPluginInput };

type GenerateBusinessInput = BusinessPluginInput & {
  onProgress?: (event: string) => void;
};

export type BusinessGenerationResult = BusinessOutput & {
  progressEvents: string[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export async function generateBusiness(
  input: GenerateBusinessInput,
): Promise<BusinessGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(businessSuitePlugin, pluginInput, {
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
