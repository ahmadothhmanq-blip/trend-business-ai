import { analyzeBusinessIdea } from "@/plugins/website/layers/business-idea";
import type { WebsiteGenerationInput, WebsiteProjectAnalysis } from "@/plugins/website/types";
import type { GenerationContext } from "@/lib/ai/types";

export async function analyzeWebsite(
  input: WebsiteGenerationInput,
  ctx: GenerationContext,
): Promise<WebsiteProjectAnalysis> {
  return analyzeBusinessIdea(input, ctx);
}
