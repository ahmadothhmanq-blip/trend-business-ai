import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  getPremiumTemplate,
  isPremiumTemplateId,
  listPremiumTemplates,
  premiumTemplateForIndustry,
} from "@/lib/ai-core/premium-templates/catalog";
import { configurePremiumTemplate } from "@/lib/ai-core/premium-templates/configure";
import type {
  ConfiguredPremiumTemplate,
  PremiumTemplateId,
  PremiumTemplateSelectionContext,
} from "@/lib/ai-core/premium-templates/types";
import { getIndustryDetectionFromBrief } from "@/lib/ai-core/industry-intelligence/apply";
import { resolveMarketplaceSelection } from "@/lib/ai-core/template-marketplace/recommend";
import { isIndustryId } from "@/lib/ai-core/templates/industries";

type LlmPick = {
  templateId?: string;
  confidence?: number;
  reason?: string;
  brandStyle?: string;
  websiteGoal?: string;
};

/**
 * AI Premium Template selection — industry + business + audience + goal + brand style.
 */
export async function selectPremiumTemplate(
  brief: CoreBrief,
  options?: {
    preferredIndustryId?: string;
    context?: PremiumTemplateSelectionContext;
  },
): Promise<ConfiguredPremiumTemplate> {
  const detection = getIndustryDetectionFromBrief(brief);
  const ctx: PremiumTemplateSelectionContext = {
    industryId:
      options?.preferredIndustryId ||
      detection?.industryId ||
      options?.context?.industryId,
    businessType:
      options?.context?.businessType ||
      detection?.profile.label ||
      String(brief.metadata?.industry || ""),
    targetAudience: options?.context?.targetAudience,
    websiteGoal:
      options?.context?.websiteGoal ||
      (typeof brief.metadata?.websiteGoal === "string"
        ? brief.metadata.websiteGoal
        : undefined),
    brandStyle:
      options?.context?.brandStyle ||
      detection?.profile.designStyle ||
      options?.context?.designStyle,
    designStyle: detection?.profile.designStyle,
    prompt: brief.prompt,
    features: brief.features,
    explicitTemplateId:
      options?.context?.explicitTemplateId ||
      extractExplicitTemplateId(brief),
  };

  const configureArgs = {
    websiteGoal: ctx.websiteGoal,
    businessGoals: asStringArray(brief.metadata?.businessGoals),
    positioning: typeof brief.prompt === "string" ? brief.prompt : undefined,
    targetAudience: ctx.targetAudience,
    brandStyle: ctx.brandStyle,
    designStyle: ctx.designStyle,
  };

  // 1) Explicit premium / smart template id
  const explicit = resolveExplicit(ctx.explicitTemplateId);
  if (explicit) {
    return configurePremiumTemplate({
      template: getPremiumTemplate(explicit),
      ...configureArgs,
      confidence: 0.98,
      reason: `Explicit premium template: ${explicit}`,
      source: "explicit",
    });
  }

  // 2) DeepSeek analysis pick (industry · business · audience · goal · brand style)
  const llm = await pickWithDeepSeek(ctx);
  if (llm) return llm;

  // 3) Industry Intelligence preferred premium template
  const preferredPremium = resolveExplicit(
    detection?.profile.preferredPremiumTemplateId,
  );
  if (preferredPremium) {
    return configurePremiumTemplate({
      template: getPremiumTemplate(preferredPremium),
      ...configureArgs,
      confidence: Math.max(detection?.confidence ?? 0.8, 0.84),
      reason: `Industry Intelligence preferred premium template: ${preferredPremium}`,
      source: "industry",
    });
  }

  // 4) Industry + keyword scoring
  const scored = scoreCatalog(ctx);
  if (scored) return scored;

  // 5) Industry default
  const industry =
    (ctx.industryId && isIndustryId(String(ctx.industryId))
      ? String(ctx.industryId)
      : detection?.industryId) || "business";
  const fallback = premiumTemplateForIndustry(industry);
  return configurePremiumTemplate({
    template: fallback,
    ...configureArgs,
    brandStyle: ctx.brandStyle || fallback.designStyle,
    confidence: 0.7,
    reason: `Industry default premium template for ${industry}`,
    source: "industry",
  });
}

function extractExplicitTemplateId(brief: CoreBrief): string | undefined {
  const meta = brief.metadata ?? {};
  for (const key of ["premiumTemplateId", "templateId", "smartTemplateId"]) {
    const value = meta[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  // Template Marketplace Engine → resolve to premium pack id
  const marketplaceId = meta.marketplaceTemplateId;
  if (typeof marketplaceId === "string" && marketplaceId.trim()) {
    const resolved = resolveMarketplaceSelection(marketplaceId.trim());
    if (resolved?.premiumTemplateId) return resolved.premiumTemplateId;
  }
  const feature = (brief.features ?? []).find((f) =>
    f.toLowerCase().startsWith("template:"),
  );
  return feature ? feature.split(":").slice(1).join(":").trim() : undefined;
}

function resolveExplicit(raw?: string): PremiumTemplateId | null {
  if (!raw) return null;
  const v = raw.toLowerCase().trim();
  if (isPremiumTemplateId(v)) return v;
  const aliases: Record<string, PremiumTemplateId> = {
    "luxury-business": "luxury-business",
    luxury: "luxury-business",
    business: "luxury-business",
    "saas-startup": "saas",
    saas: "saas",
    "real-estate": "real-estate",
    "automotive-luxury": "automotive",
    automotive: "automotive",
    "tourism-premium": "tourism",
    tourism: "tourism",
    "restaurant-premium": "restaurant",
    restaurant: "restaurant",
    clinic: "healthcare",
    healthcare: "healthcare",
    "ecommerce-store": "ecommerce",
    ecommerce: "ecommerce",
    agency: "agency",
    "education-campus": "education",
    education: "education",
  };
  return aliases[v] ?? null;
}

async function pickWithDeepSeek(
  ctx: PremiumTemplateSelectionContext,
): Promise<ConfiguredPremiumTemplate | null> {
  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved) return null;

  try {
    const catalog = listPremiumTemplates().map((t) => ({
      id: t.id,
      name: t.name,
      industryId: t.industryId,
      designStyle: t.designStyle,
      brandStyles: t.brandStyles,
      defaultWebsiteGoal: t.defaultWebsiteGoal,
      keywords: t.keywords.slice(0, 8),
    }));

    const pick = await providerManager.generateJson<LlmPick>(
      {
        system:
          "You select the best premium website template for a business. Return JSON only.",
        prompt: `Business prompt: ${ctx.prompt || "n/a"}
Industry: ${ctx.industryId || "n/a"}
Business type: ${ctx.businessType || "n/a"}
Target audience: ${ctx.targetAudience || "n/a"}
Website goal: ${ctx.websiteGoal || "n/a"}
Brand / design style: ${ctx.brandStyle || ctx.designStyle || "n/a"}
Features: ${(ctx.features || []).join(", ") || "n/a"}

Catalog:
${JSON.stringify(catalog, null, 2)}

Return JSON:
{
  "templateId": "<premium template id>",
  "confidence": 0.0-1.0,
  "reason": "<short reason>",
  "brandStyle": "<luxury|modern|corporate|minimal|creative|tech|...>",
  "websiteGoal": "<lead-gen|booking|ecommerce|brand|content|conversion>"
}`,
        temperature: 0.2,
      },
      resolved,
    );

    const id = resolveExplicit(pick.templateId);
    if (!id) return null;

    return configurePremiumTemplate({
      template: getPremiumTemplate(id),
      websiteGoal: pick.websiteGoal || ctx.websiteGoal,
      targetAudience: ctx.targetAudience,
      brandStyle: pick.brandStyle || ctx.brandStyle,
      designStyle: ctx.designStyle,
      confidence:
        typeof pick.confidence === "number" ? pick.confidence : 0.88,
      reason: pick.reason || `DeepSeek selected ${id}`,
      source: "analysis",
    });
  } catch {
    return null;
  }
}

function scoreCatalog(
  ctx: PremiumTemplateSelectionContext,
): ConfiguredPremiumTemplate | null {
  const blob = [
    ctx.prompt,
    ctx.businessType,
    ctx.targetAudience,
    ctx.websiteGoal,
    ctx.brandStyle,
    ctx.designStyle,
    ...(ctx.features || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  let bestId: PremiumTemplateId | null = null;
  let bestScore = -1;

  for (const template of listPremiumTemplates()) {
    let score = 0;
    if (ctx.industryId && template.industryId === ctx.industryId) score += 50;
    if (
      ctx.industryId === "clinic" &&
      template.id === "healthcare"
    ) {
      score += 50;
    }
    if (
      (ctx.industryId === "business" || /luxury|premium|executive/.test(blob)) &&
      template.id === "luxury-business"
    ) {
      score += 40;
    }
    for (const kw of template.keywords) {
      if (blob.includes(kw.toLowerCase())) score += 8;
    }
    for (const style of template.brandStyles) {
      if (blob.includes(style.toLowerCase())) score += 10;
    }
    if (blob.includes(template.defaultWebsiteGoal)) score += 12;
    if (score > bestScore) {
      bestScore = score;
      bestId = template.id;
    }
  }

  if (!bestId || bestScore < 12) return null;

  return configurePremiumTemplate({
    template: getPremiumTemplate(bestId),
    websiteGoal: ctx.websiteGoal,
    targetAudience: ctx.targetAudience,
    brandStyle: ctx.brandStyle,
    designStyle: ctx.designStyle,
    confidence: Math.min(0.9, 0.55 + bestScore / 100),
    reason: `Keyword/industry score selected ${bestId} (${bestScore})`,
    source: "keyword",
  });
}

function asStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value.filter((v): v is string => typeof v === "string");
}
