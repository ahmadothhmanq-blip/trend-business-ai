import {
  businessIdeasSystemPrompt,
  businessIdeasUserPrompt,
} from "@/lib/ai/prompts/legacy-services";

export type IdeaInput = {
  interests: string;
  skills: string;
  budget: string;
  industry?: string;
};

export type GeneratedIdea = {
  title: string;
  description: string;
  industry: string;
  target_market: string;
  revenue_model: string;
};

export async function generateBusinessIdeas(
  input: IdeaInput,
): Promise<{
  ideas: GeneratedIdea[];
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
      "No AI provider configured. Set DEEPSEEK_API_KEY to enable idea generation.",
    );
  }

  const ideas = await providerManager.generateJson<{ ideas?: GeneratedIdea[] }>(
    {
      system: businessIdeasSystemPrompt,
      prompt: businessIdeasUserPrompt(input),
      temperature: 0.8,
    },
    providerName,
  );

  if (!ideas.ideas?.length) {
    throw new Error("Invalid AI response format from provider.");
  }

  return {
    ideas: ideas.ideas.slice(0, 3).map((idea) => ({
      title: idea.title?.trim() || "Untitled Idea",
      description: idea.description?.trim() || "",
      industry: idea.industry?.trim() || "General",
      target_market: idea.target_market?.trim() || "General market",
      revenue_model: idea.revenue_model?.trim() || "Subscription",
    })),
    source: providerName,
    usage: providerManager.getLastUsage(providerName) ?? undefined,
    generationTimeMs: Date.now() - startedAt,
  };
}
