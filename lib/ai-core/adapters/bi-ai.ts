/**
 * BI AI → AI Core ProductEngineAdapter.
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import { runBiAssistant } from "@/lib/bi/engine";
import type { BiAssistantAction } from "@/types/bi";

export const BI_AI_PRODUCT_ID = "bi-ai";

export function createBiAiAdapter(): ProductEngineAdapter<Record<string, unknown>, Record<string, unknown>> {
  return {
    productId: BI_AI_PRODUCT_ID,
    label: "BI AI",
    layers: { idea: false, strategy: false, design: false, assets: false, generation: true, quality: false, finalize: false },

    async runGeneration(brief) {
      const action = (brief.metadata?.biAction as BiAssistantAction) ?? "analyze_performance";
      const text = brief.prompt;
      const context = typeof brief.metadata?.biContext === "string" ? brief.metadata.biContext : undefined;
      return runBiAssistant(action, { text, context });
    },
  };
}

registerProductEngineAdapter(createBiAiAdapter());
