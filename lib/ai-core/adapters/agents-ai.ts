/**
 * Agents AI → AI Core ProductEngineAdapter.
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import { runAgentsAssistant } from "@/lib/agents/engine";
import type { AgentsAssistantAction } from "@/types/agents-platform";

export const AGENTS_AI_PRODUCT_ID = "agents-ai";

export function createAgentsAiAdapter(): ProductEngineAdapter<Record<string, unknown>, Record<string, unknown>> {
  return {
    productId: AGENTS_AI_PRODUCT_ID,
    label: "Agents AI",
    layers: { idea: false, strategy: false, design: false, assets: false, generation: true, quality: false, finalize: false },

    async runGeneration(brief) {
      const action = (brief.metadata?.agentsAction as AgentsAssistantAction) ?? "natural_language_query";
      const text = brief.prompt;
      const context = typeof brief.metadata?.agentsContext === "string" ? brief.metadata.agentsContext : undefined;
      return runAgentsAssistant(action, { text, context });
    },
  };
}

registerProductEngineAdapter(createAgentsAiAdapter());
