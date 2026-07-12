import { aiGenerationEngine } from "@/lib/ai/engine";
import { websitePlugin } from "@/plugins/website";
import type {
  GeneratedWebsiteProject,
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
} from "@/plugins/website";

export type {
  WebsiteGenerationInput,
  WebsiteGenerationProgressEvent,
};

export class WebsiteGenerationPipeline {
  async run(input: WebsiteGenerationInput): Promise<GeneratedWebsiteProject> {
    const result = await aiGenerationEngine.run(websitePlugin, input, {
      provider: "deepseek",
    });

    return {
      ...result.output,
      progressEvents: result.progressEvents as WebsiteGenerationProgressEvent[],
    };
  }
}
