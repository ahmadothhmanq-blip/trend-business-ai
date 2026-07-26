import {
  getTemplateIntelligence,
  isTemplateIntelligenceId,
  listTemplateIntelligence,
  TEMPLATE_INTELLIGENCE_CATALOG,
} from "@/lib/ai-core/template-intelligence/catalog";
import {
  inferVerticalFromText,
  normalizeVerticalIndustryId,
  scoreIndustryTemplateAlignment,
  SOFTWARE_SIGNALS,
  AUTOMOTIVE_SIGNALS,
} from "@/lib/ai-core/template-intelligence/industry-palettes";
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

function resolveSelectionIndustry(
  input: TemplateIntelligenceSelectionInput,
  text: string,
): string {
  const fromInput = normalizeVerticalIndustryId(input.industry);
  if (fromInput && fromInput !== "business" && fromInput !== "multi") {
    return fromInput;
  }
  const fromBusinessType = normalizeVerticalIndustryId(input.businessType);
  if (fromBusinessType && fromBusinessType !== "business" && fromBusinessType !== "multi") {
    return fromBusinessType;
  }
  return inferVerticalFromText(text);
}

function scoreTemplate(
  tpl: TemplateIntelligenceDefinition,
  input: TemplateIntelligenceSelectionInput,
  text: string,
  resolvedIndustry: string,
): number {
  let score = 0;

  if (input.category && tpl.category === input.category) score += 40;

  if (resolvedIndustry) {
    const ind = resolvedIndustry.toLowerCase();
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

  const categoryBoosts: Record<TemplateIntelligenceCategory, string[]> = {
    Luxury: ["luxury", "premium", "exclusive", "fine dining", "michelin"],
    Modern: ["modern", "contemporary", "clean"],
    Minimal: ["minimal", "simple", "stripped"],
    Corporate: ["corporate", "enterprise", "b2b", "professional"],
    Creative: ["creative", "agency", "studio", "portfolio", "artist"],
    Technology: ["technology", "tech", "ai", "platform", "hardware", "software"],
    SaaS: ["saas", "software", "subscription", "dashboard", "free trial"],
    Automotive: ["automotive", "car", "dealership", "vehicle", "ev", "showroom"],
    Restaurant: ["restaurant", "dining", "chef", "menu", "cafe", "bistro"],
    "Real Estate": ["real estate", "property", "homes", "listings", "realtor"],
  };
  for (const word of categoryBoosts[tpl.category] || []) {
    if (text.includes(word)) score += 12;
  }

  score += scoreIndustryTemplateAlignment(tpl, resolvedIndustry, text);

  const hasSoftware = SOFTWARE_SIGNALS.some((s) => text.includes(s));
  const hasAutomotive = AUTOMOTIVE_SIGNALS.some((s) => text.includes(s));
  if (tpl.industry === "automotive" && hasSoftware && !hasAutomotive) {
    score -= 50;
  }
  if (tpl.industry === "tourism" && /furniture|sofa|bedroom|أثاث|مفروشات/.test(text)) {
    score -= 80;
  }
  if (tpl.industry === "ecommerce" && /furniture|sofa|bedroom|أثاث/.test(text)) {
    score += 25;
  }
  if (
    (tpl.category === "Technology" || tpl.category === "SaaS") &&
    hasSoftware &&
    !hasAutomotive
  ) {
    score += 20;
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
    const text = haystack(input);
    const resolvedIndustry = resolveSelectionIndustry(input, text);
    const inCategory = listTemplateIntelligence({ category: input.category });
    const ranked = inCategory
      .map((tpl) => ({
        tpl,
        score: scoreTemplate(tpl, input, text, resolvedIndustry),
      }))
      .sort((a, b) => b.score - a.score);
    const template = ranked[0]?.tpl || inCategory[0] || TEMPLATE_INTELLIGENCE_CATALOG[0]!;
    return {
      template,
      confidence: 0.82,
      source: "category",
      reason: `Matched category ${input.category} for ${resolvedIndustry}`,
      alternatives: inCategory.filter((t) => t.id !== template.id),
    };
  }

  const text = haystack(input);
  const resolvedIndustry = resolveSelectionIndustry(input, text);
  const ranked = [...TEMPLATE_INTELLIGENCE_CATALOG]
    .map((tpl) => ({
      tpl,
      score: scoreTemplate(tpl, input, text, resolvedIndustry),
    }))
    .sort((a, b) => b.score - a.score);

  const best = ranked[0]!;
  const confidence = Math.min(0.95, 0.35 + best.score / 100);
  const alternatives = ranked.slice(1, 4).map((r) => r.tpl);

  if (best.score <= 0) {
    const industryFallbackId =
      resolvedIndustry === "furniture"
        ? "ti-ecommerce-atelier"
        : resolvedIndustry === "technology" || resolvedIndustry === "saas"
          ? "ti-technology-dark"
          : resolvedIndustry === "restaurant"
            ? "ti-restaurant-dining"
            : resolvedIndustry === "real-estate"
              ? "ti-real-estate-listings"
              : "ti-modern-clean";
    const fallback =
      getTemplateIntelligence(industryFallbackId) ||
      getTemplateIntelligence("ti-modern-clean") ||
      TEMPLATE_INTELLIGENCE_CATALOG[0]!;
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
    reason: `Best match for ${resolvedIndustry} (score ${best.score})`,
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
