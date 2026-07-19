/**
 * AI Template recommendations — industry + business goal + audience → best templates.
 */

import { getPremiumTemplate } from "@/lib/ai-core/premium-templates/catalog";
import {
  getMarketplaceTemplate,
  listMarketplaceTemplates,
  MARKETPLACE_CATEGORIES,
} from "@/lib/ai-core/template-marketplace/catalog";
import type {
  MarketplaceCategory,
  MarketplaceRecommendInput,
  MarketplaceRecommendResult,
  MarketplaceRecommendation,
  MarketplaceStyleVariation,
} from "@/lib/ai-core/template-marketplace/types";

function detectCategory(text: string): MarketplaceCategory | undefined {
  const t = text.toLowerCase();
  if (/restaurant|dining|café|cafe|menu|hospitality|food/i.test(t)) {
    return "restaurant";
  }
  if (/auto|car|vehicle|dealership|showroom|mobility/i.test(t)) {
    return "automotive";
  }
  if (/real.?estate|property|listing|broker|home.?buyer/i.test(t)) {
    return "real-estate";
  }
  if (/e-?comm|shop|store|retail|product catalog/i.test(t)) return "ecommerce";
  if (/clinic|health|dental|medical|wellness|patient/i.test(t)) {
    return "healthcare";
  }
  if (/financ|bank|invest|wealth|fintech|advisory/i.test(t)) return "finance";
  if (/portfolio|personal brand|photographer|designer showcase/i.test(t)) {
    return "portfolio";
  }
  if (/school|education|course|campus|university|learning/i.test(t)) {
    return "education";
  }
  if (/agency|studio|creative firm|marketing agency/i.test(t)) return "agency";
  if (/saas|software|b2b platform|subscription product/i.test(t)) return "saas";
  if (/tech|ai platform|developer|cloud|software company/i.test(t)) {
    return "technology";
  }
  return undefined;
}

function detectStyle(text: string): MarketplaceStyleVariation | undefined {
  const t = text.toLowerCase();
  if (/luxury|premium|exclusive|editorial|high-end/i.test(t)) return "luxury";
  if (/corporate|enterprise|trust|professional firm/i.test(t)) return "corporate";
  if (/creative|bold|expressive|artistic/i.test(t)) return "creative";
  if (/minimal|clean|simple|quiet/i.test(t)) return "minimal";
  if (/premium.?saas|product-led|plg/i.test(t)) return "premium-saas";
  if (/technolog|futuristic|cyber|developer/i.test(t)) return "technology";
  if (/modern|contemporary/i.test(t)) return "modern";
  return undefined;
}

function goalBoost(goal: string | null | undefined, category: MarketplaceCategory): number {
  if (!goal) return 0;
  const g = goal.toLowerCase();
  if (/book|reserv|appoint/i.test(g) && (category === "restaurant" || category === "healthcare")) {
    return 12;
  }
  if (/sale|lead|consult/i.test(g) && (category === "finance" || category === "agency" || category === "real-estate")) {
    return 10;
  }
  if (/trial|demo|signup|conversion/i.test(g) && (category === "saas" || category === "technology")) {
    return 12;
  }
  if (/shop|purchase|cart/i.test(g) && category === "ecommerce") return 12;
  return 0;
}

/**
 * Recommend marketplace templates from industry / goal / audience signals.
 */
export function recommendMarketplaceTemplates(
  input: MarketplaceRecommendInput,
): MarketplaceRecommendResult {
  const blob = [
    input.industry,
    input.businessGoal,
    input.audience,
    input.prompt,
    input.preferredStyle,
  ]
    .filter(Boolean)
    .join(" ");

  const category =
    detectCategory(blob) ||
    (input.industry
      ? detectCategory(input.industry)
      : undefined);
  const style =
    detectStyle(input.preferredStyle || "") ||
    detectStyle(blob);

  const pool = listMarketplaceTemplates(
    category ? { category } : undefined,
  );
  const candidates = pool.length ? pool : listMarketplaceTemplates();

  const scored: MarketplaceRecommendation[] = candidates.map((template) => {
    let score = 40;
    const reasons: string[] = [];

    if (category && template.category === category) {
      score += 28;
      reasons.push(`Matches ${MARKETPLACE_CATEGORIES.find((c) => c.id === category)?.label} industry`);
    }
    if (style && template.style === style) {
      score += 18;
      reasons.push(`Fits ${template.style} design direction`);
    } else if (style && template.designPreset.includes(style.slice(0, 4))) {
      score += 6;
    }
    if (template.popular) {
      score += 6;
      reasons.push("Popular marketplace pick");
    }
    score += goalBoost(input.businessGoal, template.category);

    const audience = (input.audience || "").toLowerCase();
    if (
      audience &&
      template.recommendedAudience.toLowerCase().split(/\s+/).some((w) =>
        w.length > 4 && audience.includes(w),
      )
    ) {
      score += 8;
      reasons.push("Audience alignment");
    }

    if (!reasons.length) {
      reasons.push("Strong premium layout and connected AI systems");
    }

    return {
      template,
      score: Math.min(99, Math.round(score)),
      reason: reasons.slice(0, 2).join(" · "),
    };
  });

  scored.sort((a, b) => b.score - a.score);
  const limit = input.limit ?? 6;
  const recommendations = scored.slice(0, limit);

  const catLabel = category
    ? MARKETPLACE_CATEGORIES.find((c) => c.id === category)?.label
    : null;

  return {
    recommendations,
    summary: recommendations.length
      ? `Recommended ${recommendations.length} template${recommendations.length === 1 ? "" : "s"}${
          catLabel ? ` for ${catLabel}` : ""
        }${style ? ` · ${style}` : ""}`
      : "No strong matches — browse the full marketplace.",
    detected: {
      category,
      style,
      industry: input.industry || catLabel || undefined,
    },
  };
}

/** Resolve marketplace id → generation template id (premium pack). */
export function resolveMarketplaceSelection(marketplaceTemplateId: string): {
  marketplaceTemplateId: string;
  premiumTemplateId: string;
  smartTemplateId: string;
  designPreset: string;
  style: MarketplaceStyleVariation;
  themeHint: string;
  audience: string;
  features: string[];
} | null {
  const tpl = getMarketplaceTemplate(marketplaceTemplateId);
  if (!tpl) return null;
  const premium = getPremiumTemplate(tpl.premiumTemplateId);
  return {
    marketplaceTemplateId: tpl.id,
    premiumTemplateId: tpl.premiumTemplateId,
    smartTemplateId: premium.smartTemplateId,
    designPreset: tpl.designPreset,
    style: tpl.style,
    themeHint: `${tpl.style} ${tpl.designPreset}`,
    audience: tpl.recommendedAudience,
    features: tpl.features,
  };
}
