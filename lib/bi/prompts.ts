import type { BiAssistantAction } from "@/types/bi";

const PROMPTS: Record<BiAssistantAction, string> = {
  analyze_performance: "Analyze overall business performance from the integrated metrics. Return JSON with summary, strengths, weaknesses, and top drivers.",
  explain_kpi: "Explain why the KPI values changed based on the data context. Return JSON with kpi, explanation, contributingFactors, and confidence.",
  detect_trends: "Detect trends in the metrics time series. Return JSON with trends array (metric, direction, magnitude, insight).",
  detect_anomalies: "Detect anomalies in the metrics. Return JSON with anomalies array (metric, expected, actual, severity, recommendation).",
  forecast_revenue: "Forecast revenue for the next period. Return JSON with forecastValue, confidence, assumptions, and scenarios.",
  generate_executive_report: "Generate an executive BI report. Return JSON with title, executiveSummary, keyMetrics, risks, opportunities, and recommendations.",
  natural_language_query: "Answer the natural language business question using the provided metrics. Return JSON with question, answer, supportingData, and followUpQuestions.",
};

export function buildBiAssistantPrompt(action: BiAssistantAction, input: { text: string; context?: string }): string {
  return `${PROMPTS[action]}\n\nContext:\n${input.context ?? "none"}\n\nData/Question:\n${input.text}`;
}
