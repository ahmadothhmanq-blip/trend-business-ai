import type { Tbge2IntentAnalysis, Tbge2PlanningInput } from "@/lib/ai-core/generation-engine/core/types";
import {
  TBGE2_INTENT_PATTERNS,
} from "@/lib/ai-core/generation-engine/registry/intents";

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

/**
 * Intent Analyzer — detects user goal before any LLM call.
 * Deterministic keyword scoring; no network calls.
 */
export function analyzeIntent(input: Tbge2PlanningInput): Tbge2IntentAnalysis {
  const text = normalize(input.userPrompt);
  const explicitIndustry = input.industryId || input.industry;

  if (explicitIndustry) {
    const industryKey = normalize(explicitIndustry).replace(/\s+/g, "-");
    const match = TBGE2_INTENT_PATTERNS.find((p) => p.category === industryKey);
    if (match) {
      return {
        category: match.category,
        goal: `Build a ${match.category} website`,
        confidence: 0.95,
        signals: [`explicit industry: ${explicitIndustry}`],
        source: "explicit",
      };
    }
  }

  const scores = new Map<string, { score: number; signals: string[] }>();

  for (const pattern of TBGE2_INTENT_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword)) {
        const entry = scores.get(pattern.category) ?? { score: 0, signals: [] };
        entry.score += pattern.weight;
        entry.signals.push(keyword);
        scores.set(pattern.category, entry);
      }
    }
  }

  if (scores.size === 0) {
    return {
      category: "website",
      goal: "Build a professional business website",
      confidence: 0.5,
      signals: ["default: no intent keywords matched"],
      source: "default",
    };
  }

  const [bestCategory, best] = [...scores.entries()].sort((a, b) => b[1].score - a[1].score)[0]!;

  return {
    category: bestCategory as Tbge2IntentAnalysis["category"],
    goal: `Build a ${bestCategory.replace(/-/g, " ")} website`,
    confidence: Math.min(0.95, 0.55 + best.score * 0.15),
    signals: best.signals,
    source: "keyword",
  };
}
