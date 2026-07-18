import { providerManager } from "@/lib/ai/provider-manager";
import { emptyTokenUsage } from "@/lib/ai/usage";
import type { TokenUsage } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core";
import {
  createVideoStudioAdapter,
  videoInputToBrief,
} from "@/lib/ai-core/adapters/video-studio";
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

/**
 * Video Studio entrypoint — Phase 4 runs through AI Core LayerRunner
 * (Idea → Strategy → Design → Assets → Generation → Quality → Finalize).
 */
export async function generateVideo(
  input: GenerateVideoInput,
): Promise<VideoGenerationResult> {
  const { onProgress, ...pluginInput } = input;

  const resolved = providerManager.resolve();
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error(
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
    );
  }

  const adapter = createVideoStudioAdapter();
  const result = await layerRunner.run(
    adapter,
    { brief: videoInputToBrief(pluginInput) },
    { provider: resolved, onProgress },
  );

  const project = result.finalOutput ?? result.generation;

  return {
    ...project,
    progressEvents: result.progressEvents as VideoProgressEvent[],
    usage: result.usage ?? emptyTokenUsage(),
    generationTimeMs: result.generationTimeMs,
    provider: result.provider,
  };
}
