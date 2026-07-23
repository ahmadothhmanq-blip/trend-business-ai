/**
 * CRM AI → AI Core ProductEngineAdapter (lightweight).
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import { runCrmAssistant } from "@/lib/crm/engine";
import type { CRMAssistantAction } from "@/types/crm";

export const CRM_AI_PRODUCT_ID = "crm-ai";

export function createCrmAiAdapter(): ProductEngineAdapter<Record<string, unknown>, Record<string, unknown>> {
  return {
    productId: CRM_AI_PRODUCT_ID,
    label: "CRM AI",
    layers: { idea: false, strategy: false, design: false, assets: false, generation: true, quality: false, finalize: false },

    async runGeneration(brief) {
      const action = (brief.metadata?.crmAction as CRMAssistantAction) ?? "analyze_customer";
      const text = brief.prompt;
      const context = typeof brief.metadata?.crmContext === "string" ? brief.metadata.crmContext : undefined;
      return runCrmAssistant(action, { text, context });
    },
  };
}

registerProductEngineAdapter(createCrmAiAdapter());
