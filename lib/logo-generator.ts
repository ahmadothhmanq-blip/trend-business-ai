import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { logoDesignerPlugin } from "@/plugins/logo-designer";
import type {
  LogoOutput,
  LogoPluginInput,
  LogoProgressEvent,
} from "@/plugins/logo-designer";

export type { LogoOutput, LogoPluginInput, LogoProgressEvent };

type GenerateLogoInput = LogoPluginInput & {
  onProgress?: (event: string) => void;
};

export type LogoGenerationResult = LogoOutput & {
  progressEvents: LogoProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export async function generateLogo(
  input: GenerateLogoInput,
): Promise<LogoGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(logoDesignerPlugin, pluginInput, {
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as LogoProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
