/**
 * ERP AI → AI Core ProductEngineAdapter.
 */

import type { ProductEngineAdapter } from "@/lib/ai-core/adapter";
import { registerProductEngineAdapter } from "@/lib/ai-core/registry";
import { runErpAssistant } from "@/lib/erp/engine";
import type { ErpAssistantAction } from "@/types/erp";

export const ERP_AI_PRODUCT_ID = "erp-ai";

export function createErpAiAdapter(): ProductEngineAdapter<Record<string, unknown>, Record<string, unknown>> {
  return {
    productId: ERP_AI_PRODUCT_ID,
    label: "ERP AI",
    layers: { idea: false, strategy: false, design: false, assets: false, generation: true, quality: false, finalize: false },

    async runGeneration(brief) {
      const action = (brief.metadata?.erpAction as ErpAssistantAction) ?? "analyze_financial_data";
      const text = brief.prompt;
      const context = typeof brief.metadata?.erpContext === "string" ? brief.metadata.erpContext : undefined;
      return runErpAssistant(action, { text, context });
    },
  };
}

registerProductEngineAdapter(createErpAiAdapter());
