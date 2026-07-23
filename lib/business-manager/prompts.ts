import type { BusinessAssistantAction } from "@/types/business-manager";

export function buildBusinessPlanPrompt(input: {
  brief: string;
  industry?: string;
  teamSize?: string;
  timeline?: string;
}): string {
  return `You are a senior business operations consultant. Create a structured business operations plan.

Business brief: ${input.brief}
Industry: ${input.industry ?? "general"}
Team size: ${input.teamSize ?? "small"}
Timeline: ${input.timeline ?? "90 days"}

Return JSON:
{
  "title": "string",
  "summary": "string",
  "objectives": ["string"],
  "recommendations": ["string"],
  "bottlenecks": ["string"],
  "actions": [{ "title": "string", "priority": "high|medium|low", "owner": "string" }]
}`;
}

export function buildAssistantPrompt(
  action: BusinessAssistantAction,
  input: { text: string; context?: string; instruction?: string },
): string {
  const base = `Business context:\n${input.text}\n${input.context ? `\nAdditional context:\n${input.context}` : ""}`;
  switch (action) {
    case "analyze":
      return `${base}\n\nAnalyze business performance, risks, and operational health. Return JSON: { "summary": "string", "strengths": ["string"], "weaknesses": ["string"], "risks": ["string"], "metrics": [{ "name": "string", "value": "string", "trend": "up|down|flat" }] }`;
    case "improve":
      return `${base}\n\nSuggest operational improvements. ${input.instruction ?? ""} Return JSON: { "improvements": [{ "area": "string", "action": "string", "impact": "high|medium|low", "effort": "high|medium|low" }] }`;
    case "summarize":
      return `${base}\n\nSummarize for executive review. Return JSON: { "headline": "string", "summary": "string", "keyPoints": ["string"], "nextSteps": ["string"] }`;
    case "recommend":
      return `${base}\n\nRecommend prioritized actions. Return JSON: { "recommendations": [{ "title": "string", "rationale": "string", "priority": "urgent|high|medium|low", "owner": "string" }], "bottlenecks": ["string"] }`;
    default:
      return base;
  }
}
