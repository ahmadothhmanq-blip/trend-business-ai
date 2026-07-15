import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { imageGeneratorPlugin } from "@/plugins/image-generator";
import type {
  ImageOutput,
  ImagePluginInput,
  ImageProgressEvent,
} from "@/plugins/image-generator";

export type { ImageOutput, ImagePluginInput, ImageProgressEvent };

type GenerateImageInput = ImagePluginInput & {
  onProgress?: (event: string) => void;
};

export type ImageGenerationResult = ImageOutput & {
  progressEvents: ImageProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export async function generateImage(
  input: GenerateImageInput,
): Promise<ImageGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(imageGeneratorPlugin, pluginInput, {
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as ImageProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
