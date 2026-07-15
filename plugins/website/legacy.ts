import { providerManager } from "@/lib/ai/provider-manager";
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
    const result = await providerManager.runPlugin(websitePlugin, input);

    return {
      ...result.output,
      progressEvents: result.progressEvents as WebsiteGenerationProgressEvent[],
    };
  }
}
