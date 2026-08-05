import type {
  Tbge2IntentAnalysis,
  Tbge2PlanningInput,
  Tbge2RequirementId,
  Tbge2RequirementsAnalysis,
} from "@/lib/ai-core/generation-engine/core/types";
import {
  TBGE2_BASE_REQUIREMENTS,
  TBGE2_REQUIREMENT_PATTERNS,
} from "@/lib/ai-core/generation-engine/registry/requirements";

const INTENT_DEFAULT_REQUIREMENTS: Partial<Record<Tbge2IntentAnalysis["category"], Tbge2RequirementId[]>> = {
  restaurant: ["booking", "gallery", "contact"],
  medical: ["booking", "faq", "testimonials", "contact"],
  saas: ["pricing", "authentication", "dashboard"],
  ecommerce: ["ecommerce", "payments", "gallery"],
  "real-estate": ["gallery", "contact", "forms"],
  blog: ["blog", "newsletter", "seo"],
  "landing-page": ["forms", "pricing", "testimonials"],
  portfolio: ["gallery", "contact", "social"],
};

/**
 * Requirements Analyzer — detects features and capabilities from prompt.
 */
export function analyzeRequirements(
  input: Tbge2PlanningInput,
  intent: Tbge2IntentAnalysis,
): Tbge2RequirementsAnalysis {
  const text = input.userPrompt.toLowerCase();
  const explicitFeatures = (input.features ?? []).map((f) => f.toLowerCase());
  const signals: string[] = [];
  const scores = new Map<Tbge2RequirementId, number>();

  for (const pattern of TBGE2_REQUIREMENT_PATTERNS) {
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword) || explicitFeatures.some((f) => f.includes(keyword))) {
        scores.set(pattern.id, (scores.get(pattern.id) ?? 0) + pattern.weight);
        signals.push(`${pattern.id}:${keyword}`);
      }
    }
  }

  const intentDefaults = INTENT_DEFAULT_REQUIREMENTS[intent.category] ?? [];
  for (const req of intentDefaults) {
    scores.set(req, (scores.get(req) ?? 0) + 0.8);
    signals.push(`intent-default:${req}`);
  }

  for (const req of TBGE2_BASE_REQUIREMENTS) {
    scores.set(req, (scores.get(req) ?? 0) + 1.0);
  }

  const threshold = 0.7;
  const required: Tbge2RequirementId[] = [];
  const optional: Tbge2RequirementId[] = [];

  for (const [id, score] of scores.entries()) {
    if (score >= threshold || TBGE2_BASE_REQUIREMENTS.includes(id)) {
      required.push(id);
    } else {
      optional.push(id);
    }
  }

  return {
    required: [...new Set(required)],
    optional: [...new Set(optional)],
    confidence: signals.length > 0 ? 0.85 : 0.6,
    signals: [...new Set(signals)],
  };
}
