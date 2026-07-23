/**
 * Cybersecurity AI → AI Core ProductEngineAdapter.
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import { runCyberAssistant } from "@/lib/cyber/engine";
import type { CyberAssistantAction } from "@/types/cyber";

export const CYBER_AI_PRODUCT_ID = "cyber-ai";

export function createCyberAiAdapter(): ProductEngineAdapter<Record<string, unknown>, Record<string, unknown>> {
  return {
    productId: CYBER_AI_PRODUCT_ID,
    label: "Cybersecurity AI",
    layers: { idea: false, strategy: false, design: false, assets: false, generation: true, quality: false, finalize: false },

    async runGeneration(brief) {
      const action = (brief.metadata?.cyberAction as CyberAssistantAction) ?? "analyze_posture";
      const text = brief.prompt;
      const context = typeof brief.metadata?.cyberContext === "string" ? brief.metadata.cyberContext : undefined;
      return runCyberAssistant(action, { text, context });
    },
  };
}

registerProductEngineAdapter(createCyberAiAdapter());
