import type { ErpAssistantAction } from "@/types/erp";

const ACTION_PROMPTS: Record<ErpAssistantAction, string> = {
  analyze_financial_data: "Analyze the following ERP financial data and return JSON with insights, risks, and key metrics.",
  generate_reports: "Generate an executive ERP report summary from the following data. Return JSON with sections and highlights.",
  forecast_revenue: "Forecast revenue for the next quarter based on the following ERP data. Return JSON with forecastCents, confidence, and assumptions.",
  predict_inventory: "Predict inventory needs and reorder recommendations. Return JSON with products, predictedDemand, and reorderSuggestions.",
  recommend_actions: "Recommend top 5 ERP actions for the business. Return JSON with actions array (title, priority, impact).",
  summarize_performance: "Summarize overall business performance from ERP data. Return JSON with summary, strengths, weaknesses, and opportunities.",
};

export function buildErpAssistantPrompt(
  action: ErpAssistantAction,
  input: { text: string; context?: string },
): string {
  const base = ACTION_PROMPTS[action];
  return `${base}\n\nContext:\n${input.context ?? "none"}\n\nData:\n${input.text}`;
}
