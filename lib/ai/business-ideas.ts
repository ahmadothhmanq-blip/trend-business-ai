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

const IDEA_TEMPLATES: GeneratedIdea[] = [
  {
    title: "AI-Powered Niche Marketplace",
    description:
      "A curated marketplace connecting specialized freelancers with businesses seeking expert talent in emerging fields like AI ethics consulting and sustainable design.",
    industry: "Technology",
    target_market: "SMBs and startups needing specialized expertise",
    revenue_model: "Commission on transactions + premium listing fees",
  },
  {
    title: "Local Wellness Subscription Box",
    description:
      "Monthly subscription delivering locally-sourced wellness products, mindfulness tools, and personalized health recommendations based on user preferences.",
    industry: "Health & Wellness",
    target_market: "Health-conscious urban professionals aged 25-45",
    revenue_model: "Monthly subscription tiers ($29-$79/month)",
  },
  {
    title: "Smart Inventory SaaS for Retail",
    description:
      "Cloud-based inventory management with predictive restocking, demand forecasting, and multi-location sync for small retail chains.",
    industry: "Retail Tech",
    target_market: "Independent retailers with 2-10 locations",
    revenue_model: "SaaS subscription per location ($49-$199/month)",
  },
];

function pickTemplate(seed: string): GeneratedIdea {
  const index =
    seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    IDEA_TEMPLATES.length;
  return IDEA_TEMPLATES[index];
}

function generateFallbackIdeas(input: IdeaInput): GeneratedIdea[] {
  const seed = `${input.interests}-${input.skills}-${input.budget}`;
  const base = pickTemplate(seed);
  const niche =
    input.industry || input.interests.split(",")[0]?.trim() || "Your Niche";

  return [
    {
      ...base,
      title: `${base.title} for ${niche}`,
      description: `${base.description} Tailored for someone with skills in ${input.skills || "business"} and a budget of ${input.budget || "moderate"}.`,
    },
    {
      title: `Micro-SaaS: ${input.interests.split(",")[0]?.trim() || "Automation"} Toolkit`,
      description: `Build a focused tool that automates repetitive ${input.interests || "business"} workflows. Leverage your ${input.skills || "technical"} background to create a product users pay $15-49/month for.`,
      industry: input.industry || "SaaS",
      target_market: "Solo entrepreneurs and small teams",
      revenue_model: "Freemium SaaS with pro tier",
    },
    {
      title: "Consulting + Digital Product Hybrid",
      description: `Offer premium ${input.interests || "industry"} consulting while selling templates, courses, or playbooks as scalable revenue. Ideal with a ${input.budget} starting budget.`,
      industry: input.industry || "Professional Services",
      target_market: "Businesses seeking expert guidance",
      revenue_model: "Consulting fees + digital product sales",
    },
  ];
}

export async function generateBusinessIdeas(
  input: IdeaInput,
): Promise<{ ideas: GeneratedIdea[]; source: "openai" | "deepseek" | "fallback"; usage?: { promptTokens: number; completionTokens: number; totalTokens: number }; generationTimeMs?: number }> {
  const startedAt = Date.now();
  const { getAIProvider, resolveAvailableProvider } = await import("@/lib/ai/adapters");
  const providerName = resolveAvailableProvider("openai");

  if (providerName) {
    try {
      const provider = getAIProvider(providerName);
      const ideas = await provider.generateJson<{ ideas?: GeneratedIdea[] }>({
        system: businessIdeasSystemPrompt,
        prompt: businessIdeasUserPrompt(input),
        temperature: 0.8,
      });

      if (!ideas.ideas?.length) {
        throw new Error("Invalid AI response format");
      }

      return {
        ideas: ideas.ideas.slice(0, 3).map((idea) => ({
          title: idea.title?.trim() || "Untitled Idea",
          description: idea.description?.trim() || "",
          industry: idea.industry?.trim() || "General",
          target_market: idea.target_market?.trim() || "General market",
          revenue_model: idea.revenue_model?.trim() || "Subscription",
        })),
        source: providerName === "deepseek" ? "deepseek" : "openai",
        usage: provider.getLastUsage?.() ?? undefined,
        generationTimeMs: Date.now() - startedAt,
      };
    } catch (error) {
      console.error("AI generation failed, using fallback:", error);
    }
  }

  return {
    ideas: generateFallbackIdeas(input),
    source: "fallback",
    generationTimeMs: Date.now() - startedAt,
  };
}
