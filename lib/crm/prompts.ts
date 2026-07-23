import type { CRMAssistantAction } from "@/types/crm";

export function buildCrmAssistantPrompt(
  action: CRMAssistantAction,
  input: { text: string; context?: string },
): string {
  const base = `CRM context:\n${input.text}\n${input.context ? `\nExtra:\n${input.context}` : ""}`;
  switch (action) {
    case "analyze_customer":
      return `${base}\n\nAnalyze this customer. Return JSON: { "summary": "", "strengths": [], "risks": [], "engagementLevel": "low|medium|high" }`;
    case "score_lead":
      return `${base}\n\nScore this lead 0-100. Return JSON: { "score": 0, "rationale": "", "signals": [] }`;
    case "suggest_next_action":
      return `${base}\n\nSuggest next sales actions. Return JSON: { "actions": [{ "title": "", "priority": "high|medium|low", "dueInDays": 0 }] }`;
    case "summarize_history":
      return `${base}\n\nSummarize customer history. Return JSON: { "headline": "", "timeline": [], "keyPoints": [] }`;
    case "generate_sales_email":
      return `${base}\n\nDraft a sales email. Return JSON: { "subject": "", "body": "", "tone": "" }`;
    case "improve_deal_strategy":
      return `${base}\n\nImprove deal strategy. Return JSON: { "strategy": "", "objections": [], "tactics": [] }`;
    default:
      return base;
  }
}
