import type {
  Tbge2BusinessAnalysis,
  Tbge2IntentAnalysis,
  Tbge2PlanningInput,
} from "@/lib/ai-core/generation-engine/core/types";
import { TBGE2_INTENT_TO_INDUSTRY } from "@/lib/ai-core/generation-engine/registry/intents";

const BRAND_STYLE_KEYWORDS: Record<string, string[]> = {
  modern: ["modern", "clean", "minimal", "sleek"],
  luxury: ["luxury", "premium", "elegant", "high-end"],
  bold: ["bold", "vibrant", "energetic", "dynamic"],
  professional: ["professional", "corporate", "trustworthy", "enterprise"],
  playful: ["playful", "fun", "friendly", "casual"],
  editorial: ["editorial", "magazine", "storytelling"],
};

const AUDIENCE_PATTERNS: Array<{ audience: string; keywords: string[] }> = [
  { audience: "Small businesses", keywords: ["small business", "smb", "local business"] },
  { audience: "Enterprise clients", keywords: ["enterprise", "b2b", "corporation"] },
  { audience: "Consumers", keywords: ["consumer", "b2c", "customers", "shoppers"] },
  { audience: "Startups", keywords: ["startup", "founders", "early stage"] },
  { audience: "Professionals", keywords: ["professionals", "executives", "decision makers"] },
  { audience: "Patients", keywords: ["patients", "healthcare seekers"] },
  { audience: "Students", keywords: ["students", "learners", "parents"] },
  { audience: "Home buyers", keywords: ["home buyers", "renters", "property seekers"] },
];

const COUNTRY_PATTERNS: Array<{ country: string; keywords: string[] }> = [
  { country: "United States", keywords: ["usa", "united states", "america"] },
  { country: "United Kingdom", keywords: ["uk", "united kingdom", "britain"] },
  { country: "Saudi Arabia", keywords: ["saudi", "ksa", "riyadh"] },
  { country: "UAE", keywords: ["uae", "dubai", "abu dhabi"] },
  { country: "Germany", keywords: ["germany", "deutschland"] },
  { country: "France", keywords: ["france", "paris"] },
  { country: "Japan", keywords: ["japan", "tokyo"] },
];

function extractBusinessName(prompt: string): string | undefined {
  const match = prompt.match(/(?:called|named|for)\s+["']?([A-Z][\w\s&'-]{2,40})["']?/i);
  return match?.[1]?.trim();
}

/**
 * Business Analyzer — extracts industry, audience, geography, brand style, goals.
 */
export function analyzeBusiness(
  input: Tbge2PlanningInput,
  intent: Tbge2IntentAnalysis,
): Tbge2BusinessAnalysis {
  const text = input.userPrompt.toLowerCase();
  const industryId =
    input.industryId ||
    input.industry?.toLowerCase().replace(/\s+/g, "-") ||
    TBGE2_INTENT_TO_INDUSTRY[intent.category];

  let brandStyle = input.brandStyle ?? "modern";
  for (const [style, keywords] of Object.entries(BRAND_STYLE_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      brandStyle = style;
      break;
    }
  }

  const audience: string[] = [];
  for (const pattern of AUDIENCE_PATTERNS) {
    if (pattern.keywords.some((kw) => text.includes(kw))) {
      audience.push(pattern.audience);
    }
  }
  if (audience.length === 0) {
    audience.push(intent.category === "saas" ? "Enterprise clients" : "General audience");
  }

  let country = input.country;
  if (!country) {
    for (const pattern of COUNTRY_PATTERNS) {
      if (pattern.keywords.some((kw) => text.includes(kw))) {
        country = pattern.country;
        break;
      }
    }
  }

  const goals = input.goals?.length
    ? input.goals
    : extractGoals(text, intent);

  const businessName = input.businessName ?? extractBusinessName(input.userPrompt);
  const language = input.language ?? "English";

  return {
    industry: formatIndustryLabel(industryId),
    industryId,
    businessType: intent.category.replace(/-/g, " "),
    audience,
    country,
    language,
    brandStyle,
    goals,
    businessName,
    offer: extractOffer(input.userPrompt),
    confidence: intent.source === "explicit" ? 0.95 : intent.confidence,
  };
}

function formatIndustryLabel(industryId: string): string {
  return industryId
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function extractGoals(text: string, intent: Tbge2IntentAnalysis): string[] {
  const goals: string[] = [];
  if (text.includes("lead") || text.includes("convert")) goals.push("Generate leads");
  if (text.includes("sell") || text.includes("sales")) goals.push("Drive sales");
  if (text.includes("brand") || text.includes("awareness")) goals.push("Build brand awareness");
  if (text.includes("book") || text.includes("appointment")) goals.push("Increase bookings");
  if (goals.length === 0) {
    goals.push(`Establish a professional ${intent.category.replace(/-/g, " ")} presence`);
  }
  return goals;
}

function extractOffer(prompt: string): string | undefined {
  const match = prompt.match(/(?:offer|provid(?:e|ing)|specializ(?:e|ing) in)\s+([^.!?]{10,80})/i);
  return match?.[1]?.trim();
}
