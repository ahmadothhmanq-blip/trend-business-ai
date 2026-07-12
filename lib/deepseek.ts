import { aiGenerationEngine } from "@/lib/ai/engine";
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

type GenerateWebsiteInput = WebsiteGenerationInput;

export async function generateWebsiteWithDeepSeek(input: GenerateWebsiteInput) {
  const result = await aiGenerationEngine.run(websitePlugin, input, {
    provider: "deepseek",
  });

  return {
    ...result.output,
    progressEvents: result.progressEvents as WebsiteGenerationProgressEvent[],
  };
}
