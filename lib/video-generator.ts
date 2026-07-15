import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { videoStudioPlugin } from "@/plugins/video-studio";
import type {
  VideoOutput,
  VideoPluginInput,
  VideoProgressEvent,
} from "@/plugins/video-studio";

export type { VideoOutput, VideoPluginInput, VideoProgressEvent };

type GenerateVideoInput = VideoPluginInput & {
  onProgress?: (event: string) => void;
};

export type VideoGenerationResult = VideoOutput & {
  progressEvents: VideoProgressEvent[];
  usage: TokenUsage;
  generationTimeMs: number;
  provider: string;
};

export async function generateVideo(
  input: GenerateVideoInput,
): Promise<VideoGenerationResult> {
  const { onProgress, ...pluginInput } = input;
  const result = await providerManager.runPlugin(videoStudioPlugin, pluginInput, {
    onProgress,
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as VideoProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
