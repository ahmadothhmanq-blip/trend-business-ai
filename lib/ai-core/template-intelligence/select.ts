import {
  getTemplateIntelligence,
  isTemplateIntelligenceId,
  listTemplateIntelligence,
  TEMPLATE_INTELLIGENCE_CATALOG,
} from "@/lib/ai-core/template-intelligence/catalog";
import type {
  TemplateIntelligenceCategory,
  TemplateIntelligenceDefinition,
  TemplateIntelligenceSelectionInput,
  TemplateIntelligenceSelectionResult,
} from "@/lib/ai-core/template-intelligence/types";
import { TEMPLATE_INTELLIGENCE_CATEGORIES } from "@/lib/ai-core/template-intelligence/types";
import type { CoreBrief } from "@/lib/ai-core/layers/types";

function haystack(input: TemplateIntelligenceSelectionInput): string {
  return [
    input.businessType,
    input.industry,
    input.targetAudience,
    input.brandStyle,
    input.designStyle,
    input.prompt,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreTemplate(
  tpl: TemplateIntelligenceDefinition,
  input: TemplateIntelligenceSelectionInput,
  text: string,
): number {
  let score = 0;

  if (input.category && tpl.category === input.category) score += 40;

  if (input.industry) {
    const ind = input.industry.toLowerCase();
    if (tpl.industry !== "multi" && (tpl.industry === ind || ind.includes(tpl.industry))) {
      score += 35;
    }
    for (const k of tpl.keywords) {
      if (ind.includes(k) || k.includes(ind)) score += 8;
    }
  }

  for (const hint of tpl.brandStyleHints) {
    if (text.includes(hint)) score += 10;
  }
  for (const hint of tpl.audienceHints) {
    if (text.includes(hint)) score += 6;
  }
  for (const k of tpl.keywords) {
    if (text.includes(k)) score += 5;
  }

  // Category keyword boosts from free text
  const categoryBoosts: Record<TemplateIntelligenceCategory, string[]> = {
    Luxury: ["luxury", "premium", "exclusive", "fine dining", "michelin"],
    Modern: ["modern", "contemporary", "clean"],
    Minimal: ["minimal", "simple", "stripped"],
    Corporate: ["corporate", "enterprise", "b2b", "professional"],
    Creative: ["creative", "agency", "studio", "portfolio", "artist"],
    Technology: ["technology", "tech", "ai", "platform", "hardware"],
    SaaS: ["saas", "software", "subscription", "dashboard"],
    Automotive: ["automotive", "car", "dealership", "vehicle", "ev"],
    Restaurant: ["restaurant", "dining", "chef", "menu", "cafe"],
    "Real Estate": ["real estate", "property", "homes", "listings", "realtor"],
  };
  for (const word of categoryBoosts[tpl.category] || []) {
    if (text.includes(word)) score += 12;
  }

  if (tpl.industry === "multi") score += 2;
  return score;
}

/**
 * Automatically select the best visual template from business signals.
 */
export function selectTemplateIntelligence(
  input: TemplateIntelligenceSelectionInput,
): TemplateIntelligenceSelectionResult {
  if (input.explicitTemplateId && isTemplateIntelligenceId(input.explicitTemplateId)) {
    const template = getTemplateIntelligence(input.explicitTemplateId)!;
    return {
      template,
      confidence: 1,
      source: "explicit",
      reason: `User selected ${template.name}`,
      alternatives: listTemplateIntelligence({ category: template.category }).filter(
        (t) => t.id !== template.id,
      ),
    };
  }

  if (input.category && TEMPLATE_INTELLIGENCE_CATEGORIES.includes(input.category)) {
    const inCategory = listTemplateIntelligence({ category: input.category });
    const template = inCategory[0] || TEMPLATE_INTELLIGENCE_CATALOG[0]!;
    return {
      template,
      confidence: 0.82,
      source: "category",
      reason: `Matched category ${input.category}`,
      alternatives: inCategory.filter((t) => t.id !== template.id),
    };
  }

  const text = haystack(input);
  const ranked = [...TEMPLATE_INTELLIGENCE_CATALOG]
    .map((tpl) => ({ tpl, score: scoreTemplate(tpl, input, text) }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]!;
  const confidence = Math.min(0.95, 0.35 + best.score / 100);
  const alternatives = ranked.slice(1, 4).map((r) => r.tpl);

  if (best.score <= 0) {
    const fallback =
      getTemplateIntelligence("ti-modern-clean") || TEMPLATE_INTELLIGENCE_CATALOG[0]!;
    return {
      template: fallback,
      confidence: 0.4,
      source: "default",
      reason: "Defaulted to Modern Clean",
      alternatives: TEMPLATE_INTELLIGENCE_CATALOG.filter((t) => t.id !== fallback.id).slice(
        0,
        3,
      ),
    };
  }

  return {
    template: best.tpl,
    confidence,
    source: "scored",
    reason: `Best match for industry/audience/style signals (score ${best.score})`,
    alternatives,
  };
}

/** Build selection input from a Core brief. */
export function selectionInputFromBrief(
  brief: CoreBrief,
): TemplateIntelligenceSelectionInput {
  const meta = brief.metadata || {};
  return {
    businessType:
      (typeof meta.businessType === "string" && meta.businessType) ||
      (typeof meta.industry === "string" && meta.industry) ||
      undefined,
    industry:
      (typeof meta.industryId === "string" && meta.industryId) ||
      (typeof meta.industry === "string" && meta.industry) ||
      undefined,
    targetAudience:
      typeof meta.targetAudience === "string" ? meta.targetAudience : undefined,
    brandStyle:
      typeof meta.brandStyle === "string"
        ? meta.brandStyle
        : typeof meta.designStyle === "string"
          ? meta.designStyle
          : undefined,
    designStyle:
      typeof meta.designStyle === "string" ? meta.designStyle : undefined,
    prompt: brief.prompt,
    explicitTemplateId:
      typeof meta.templateIntelligenceId === "string"
        ? meta.templateIntelligenceId
        : undefined,
    category:
      typeof meta.templateIntelligenceCategory === "string"
        ? (meta.templateIntelligenceCategory as TemplateIntelligenceCategory)
        : undefined,
  };
}
