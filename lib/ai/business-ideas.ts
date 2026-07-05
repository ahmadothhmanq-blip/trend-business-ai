import { createOpenAIClient, withOpenAIRetry } from "@/lib/ai/openai-client";

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

async function generateWithOpenAI(input: IdeaInput): Promise<GeneratedIdea[]> {
  const openai = await createOpenAIClient();

  const response = await withOpenAIRetry(() =>
    openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a business strategist. Generate exactly 3 unique, actionable business ideas as JSON with this shape:
{"ideas":[{"title":"string","description":"string","industry":"string","target_market":"string","revenue_model":"string"}]}
Each idea must be specific to the user's profile. Descriptions should be 2-3 sentences.`,
      },
      {
        role: "user",
        content: `Interests: ${input.interests}
Skills: ${input.skills}
Budget: ${input.budget}
Preferred industry: ${input.industry || "any"}`,
      },
    ],
      temperature: 0.8,
    }),
  );

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from OpenAI");
  }

  const parsed = JSON.parse(content) as { ideas?: GeneratedIdea[] };
  if (!parsed.ideas?.length) {
    throw new Error("Invalid OpenAI response format");
  }

  return parsed.ideas.slice(0, 3).map((idea) => ({
    title: idea.title?.trim() || "Untitled Idea",
    description: idea.description?.trim() || "",
    industry: idea.industry?.trim() || "General",
    target_market: idea.target_market?.trim() || "General market",
    revenue_model: idea.revenue_model?.trim() || "Subscription",
  }));
}

export async function generateBusinessIdeas(
  input: IdeaInput,
): Promise<{ ideas: GeneratedIdea[]; source: "openai" | "fallback" }> {
  if (process.env.OPENAI_API_KEY) {
    try {
      const ideas = await generateWithOpenAI(input);
      return { ideas, source: "openai" };
    } catch (error) {
      console.error("OpenAI generation failed, using fallback:", error);
    }
  }

  return { ideas: generateFallbackIdeas(input), source: "fallback" };
}
