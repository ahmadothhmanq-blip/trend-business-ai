import {
  marketAnalysisSystemPrompt,
  marketAnalysisUserPrompt,
} from "@/lib/ai/prompts/legacy-services";

export type MarketAnalysisInput = {
  industry: string;
  region: string;
  targetAudience: string;
};

export type GeneratedMarketAnalysis = {
  industry: string;
  region: string;
  market_size: string;
  growth_rate: string;
  competitors: string[];
  opportunities: string[];
  risks: string[];
  summary: string;
};

export async function generateMarketAnalysis(
  input: MarketAnalysisInput,
): Promise<{
  analysis: GeneratedMarketAnalysis;
  source: string;
  usage?: { promptTokens: number; completionTokens: number; totalTokens: number };
  generationTimeMs?: number;
}> {
  const startedAt = Date.now();
  const { providerManager } = await import("@/lib/ai/provider-manager");
  const { getDefaultTextProvider } = await import("@/lib/ai/provider-config");
  const providerName = providerManager.resolve(getDefaultTextProvider());

  if (!providerName) {
    throw new Error(
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable market analysis.",
    );
  }

  const parsed = await providerManager.generateJson<GeneratedMarketAnalysis>(
    {
      system: marketAnalysisSystemPrompt,
      prompt: marketAnalysisUserPrompt(input),
      temperature: 0.7,
    },
    providerName,
  );

  if (!parsed.summary?.trim() && !parsed.market_size?.trim()) {
    throw new Error("Invalid AI market analysis response from provider.");
  }

  return {
    analysis: {
      industry: parsed.industry?.trim() || input.industry,
      region: parsed.region?.trim() || input.region,
      market_size: parsed.market_size?.trim() || "Not available",
      growth_rate: parsed.growth_rate?.trim() || "Not available",
      competitors: Array.isArray(parsed.competitors)
        ? parsed.competitors.map(String).slice(0, 6)
        : [],
      opportunities: Array.isArray(parsed.opportunities)
        ? parsed.opportunities.map(String).slice(0, 6)
        : [],
      risks: Array.isArray(parsed.risks) ? parsed.risks.map(String).slice(0, 6) : [],
      summary: parsed.summary?.trim() || "",
    },
    source: providerName,
    usage: providerManager.getLastUsage(providerName) ?? undefined,
    generationTimeMs: Date.now() - startedAt,
  };
}
