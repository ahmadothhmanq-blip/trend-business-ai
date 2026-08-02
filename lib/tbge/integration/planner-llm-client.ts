/**
 * Live PlannerLlmClient — delegates to configured AIProvider (no prompt changes).
 */

import type { AIProvider } from "@/lib/ai/types";
import type { PlannerLlmClient } from "@/lib/tbge/planning/types";

export function createPlannerLlmClientFromProvider(
  provider: AIProvider,
): PlannerLlmClient {
  return {
    async complete({ systemPrompt, userPrompt, model }) {
      let content: string;

      if (provider.generateText) {
        content = await provider.generateText({
          prompt: userPrompt,
          system: systemPrompt,
          audit: { stage: "tbge-master-planner" },
        });
      } else {
        const json = await provider.generateJson<Record<string, unknown>>({
          prompt: userPrompt,
          system: systemPrompt,
          audit: { stage: "tbge-master-planner" },
        });
        content = JSON.stringify(json);
      }

      return {
        content,
        model: model ?? String(provider.name),
      };
    },
  };
}
