/**
 * Marketing AI prompts.
 */

import type { MarketingAssistantAction } from "@/types/marketing";

export const MARKETING_CHANNELS = [
  { type: "email" as const, label: "Email" },
  { type: "social" as const, label: "Social Media" },
  { type: "ads" as const, label: "Paid Ads" },
  { type: "content" as const, label: "Content" },
  { type: "seo" as const, label: "SEO" },
];

export function buildCampaignGenerationPrompt(input: {
  brief: string;
  objective?: string;
  budget?: number;
  channels?: string[];
  tone?: string;
}) {
  return `You are a senior marketing strategist. Generate a complete marketing campaign as JSON with:
name, objective, goals[], audience, offer, messaging, channels[{type,label,enabled,budget,notes}],
timeline[{label,date}], kpis[{name,target}], strategy{positioning,competitiveEdge,keyMessages[]}

Brief: ${input.brief}
${input.objective ? `Objective: ${input.objective}` : ""}
${input.budget ? `Budget: $${input.budget}` : ""}
${input.channels?.length ? `Channels: ${input.channels.join(", ")}` : ""}
Tone: ${input.tone ?? "Professional"}`;
}

export function buildPersonaGenerationPrompt(input: {
  brief: string;
  industry?: string;
  product?: string;
}) {
  return `Generate a detailed customer persona as JSON with:
name, title, summary, demographics{age,location,income,role}, painPoints[], behaviors[], motivations[], buyingTriggers[]

Context: ${input.brief}
${input.industry ? `Industry: ${input.industry}` : ""}
${input.product ? `Product: ${input.product}` : ""}`;
}

export function buildAssistantPrompt(action: MarketingAssistantAction, input: {
  text: string;
  campaignContext?: string;
  instruction?: string;
}) {
  const base = `Campaign context:\n${input.campaignContext ?? "N/A"}\n\nContent:\n${input.text}`;
  switch (action) {
    case "improve_campaign":
      return `${base}\n\nImprove this marketing campaign. Return JSON: {improved: string, changes: string[], recommendations: string[]}`;
    case "rewrite_copy":
      return `${base}\n\nRewrite for higher conversion. Return JSON: {headline, body, cta, variations[]}`;
    case "generate_ideas":
      return `${base}\n\nGenerate 8 campaign ideas. Return JSON: {ideas: [{title, description, channel, expectedImpact}]}`;
    case "analyze_campaign":
      return `${base}\n\nAnalyze strengths, weaknesses, risks. Return JSON: {score, strengths[], weaknesses[], risks[], opportunities[]}`;
    case "suggest_improvements":
      return `${base}\n\nSuggest actionable improvements. Return JSON: {improvements: [{area, suggestion, priority, impact}]}`;
    default:
      return base;
  }
}
