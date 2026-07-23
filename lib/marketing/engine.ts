/**
 * Marketing AI engine — campaign & persona generation, assistant actions.
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import {
  buildAssistantPrompt,
  buildCampaignGenerationPrompt,
  buildPersonaGenerationPrompt,
} from "@/lib/marketing/prompts";
import type {
  GeneratedMarketingCampaign,
  GeneratedPersona,
  MarketingAssistantAction,
  MarketingChannel,
} from "@/types/marketing";

function parseJson<T>(raw: string): T {
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(cleaned) as T;
}

async function generateJson<T>(prompt: string): Promise<T & { provider: string }> {
  const providerName = getDefaultTextProvider();
  const resolved = providerManager.resolve(providerName);
  if (!resolved || !providerManager.isConfigured(resolved)) {
    throw new Error("No AI provider configured.");
  }
  const raw = await providerManager.generateText(
    { prompt, system: "Return valid JSON only.", temperature: 0.7 },
    resolved,
  );
  return { ...parseJson<T>(raw), provider: resolved };
}

export async function generateCampaign(input: {
  brief: string;
  objective?: string;
  budget?: number;
  channels?: string[];
  tone?: string;
}): Promise<GeneratedMarketingCampaign & { provider: string }> {
  const prompt = buildCampaignGenerationPrompt(input);
  const data = await generateJson<Record<string, unknown>>(prompt);
  const { provider, ...rest } = data;
  const channels = (Array.isArray(rest.channels) ? rest.channels : []) as MarketingChannel[];
  return {
    name: String(rest.name ?? "Campaign"),
    objective: String(rest.objective ?? input.objective ?? ""),
    goals: Array.isArray(rest.goals) ? rest.goals.map(String) : [],
    audience: String(rest.audience ?? ""),
    offer: String(rest.offer ?? ""),
    messaging: String(rest.messaging ?? ""),
    channels: channels.length
      ? channels
      : [{ type: "email", label: "Email", enabled: true }],
    timeline: Array.isArray(rest.timeline)
      ? (rest.timeline as Array<{ label: string; date: string }>)
      : [],
    kpis: Array.isArray(rest.kpis)
      ? (rest.kpis as Array<{ name: string; target: string }>)
      : [],
    strategy: (rest.strategy as Record<string, unknown>) ?? {},
    provider,
  };
}

export async function generatePersona(input: {
  brief: string;
  industry?: string;
  product?: string;
}): Promise<GeneratedPersona & { provider: string }> {
  const prompt = buildPersonaGenerationPrompt(input);
  const data = await generateJson<Record<string, unknown>>(prompt);
  return {
    name: String(data.name ?? "Persona"),
    title: String(data.title ?? ""),
    summary: String(data.summary ?? ""),
    demographics: (data.demographics as Record<string, unknown>) ?? {},
    painPoints: Array.isArray(data.painPoints) ? data.painPoints.map(String) : [],
    behaviors: Array.isArray(data.behaviors) ? data.behaviors.map(String) : [],
    motivations: Array.isArray(data.motivations) ? data.motivations.map(String) : [],
    buyingTriggers: Array.isArray(data.buyingTriggers) ? data.buyingTriggers.map(String) : [],
    provider: data.provider,
  };
}

export async function runMarketingAssistant(
  action: MarketingAssistantAction,
  input: { text: string; campaignContext?: string; instruction?: string },
): Promise<Record<string, unknown> & { provider: string }> {
  const prompt = buildAssistantPrompt(action, input);
  return generateJson<Record<string, unknown>>(prompt);
}

export function generatedCampaignToRow(
  userId: string,
  generated: GeneratedMarketingCampaign,
  brief: string,
) {
  return {
    user_id: userId,
    name: generated.name,
    objective: generated.objective,
    status: "draft" as const,
    channels: generated.channels,
    strategy: { ...generated.strategy, brief, audience: generated.audience, offer: generated.offer, messaging: generated.messaging },
    timeline: generated.timeline,
    kpis: generated.kpis,
    metadata: { goals: generated.goals, generatedAt: new Date().toISOString() },
  };
}

export function generatedPersonaToRow(userId: string, generated: GeneratedPersona, campaignId?: string | null) {
  return {
    user_id: userId,
    campaign_id: campaignId ?? null,
    name: generated.name,
    title: generated.title,
    summary: generated.summary,
    demographics: generated.demographics,
    pain_points: generated.painPoints,
    behaviors: generated.behaviors,
    motivations: generated.motivations,
    buying_triggers: generated.buyingTriggers,
  };
}
