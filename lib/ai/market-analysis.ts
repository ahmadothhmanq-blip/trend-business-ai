import { createOpenAIClient, withOpenAIRetry } from "@/lib/ai/openai-client";

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

function generateFallbackAnalysis(
  input: MarketAnalysisInput,
): GeneratedMarketAnalysis {
  const industry = input.industry || "Technology";
  const region = input.region || "North America";

  return {
    industry,
    region,
    market_size: "$4.2B - $12.8B (estimated TAM)",
    growth_rate: "8.4% - 14.2% CAGR (2024-2029)",
    competitors: [
      `Leading ${industry} incumbents with 25-40% market share`,
      `Emerging AI-native startups disrupting ${region} markets`,
      `Regional players with strong local distribution networks`,
      `Open-source alternatives gaining developer adoption`,
    ],
    opportunities: [
      `Underserved ${input.targetAudience || "mid-market"} segment in ${region}`,
      `AI automation reducing operational costs by 30-45%`,
      `Growing demand for sustainable and ethical ${industry.toLowerCase()} solutions`,
      `Partnership channels with complementary SaaS platforms`,
    ],
    risks: [
      "Regulatory changes affecting data privacy and compliance",
      "Market consolidation by larger players",
      "Rising customer acquisition costs in competitive channels",
      "Technology shifts making current solutions obsolete",
    ],
    summary: `The ${industry} market in ${region} shows strong growth potential, particularly for solutions targeting ${input.targetAudience || "innovative businesses"}. Key success factors include differentiation through AI capabilities, focus on customer experience, and agile go-to-market strategy. Entry barriers are moderate — capital efficiency and niche positioning are recommended.`,
  };
}

async function generateWithOpenAI(
  input: MarketAnalysisInput,
): Promise<GeneratedMarketAnalysis> {
  const openai = await createOpenAIClient();

  const response = await withOpenAIRetry(() =>
    openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a market research analyst. Return JSON with this exact shape:
{"industry":"string","region":"string","market_size":"string","growth_rate":"string","competitors":["string"],"opportunities":["string"],"risks":["string"],"summary":"string"}
Provide 4 items each for competitors, opportunities, and risks. Summary should be 3-4 sentences.`,
      },
      {
        role: "user",
        content: `Industry: ${input.industry}
Region: ${input.region}
Target audience: ${input.targetAudience}`,
      },
    ],
      temperature: 0.7,
    }),
  );

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(content) as GeneratedMarketAnalysis;

  return {
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
    risks: Array.isArray(parsed.risks)
      ? parsed.risks.map(String).slice(0, 6)
      : [],
    summary: parsed.summary?.trim() || "",
  };
}

export async function generateMarketAnalysis(
  input: MarketAnalysisInput,
): Promise<{ analysis: GeneratedMarketAnalysis; source: "openai" | "fallback" }> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const analysis = await generateWithOpenAI(input);
      return { analysis, source: "openai" };
    } catch (error) {
      console.error("OpenAI market analysis failed, using fallback:", error);
    }
  }

  return { analysis: generateFallbackAnalysis(input), source: "fallback" };
}
