/**
 * AI Brand Strategy Layer — analyze business signals → brand style, voice, visual direction.
 */

import {
  getBrandPreset,
  normalizeBrandPresetId,
  type BrandPresetPackage,
} from "@/lib/ai-core/brand-identity/presets";
import type {
  BrandPersonality,
  BrandPresetId,
  BrandStrategyBrief,
} from "@/lib/ai-core/brand-identity/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";

function detectPersonality(hay: string): BrandPersonality {
  if (/playful|fun|witty|delight/.test(hay)) return "playful";
  if (/bold|disrupt|loud|provocat/.test(hay)) return "bold";
  if (/calm|quiet|zen|minimal|serene/.test(hay)) return "calm";
  if (/warm|friendly|human|caring|hospital/.test(hay)) return "warm";
  if (/authorit|expert|leader|command/.test(hay)) return "authoritative";
  if (/innovat|tech|future|ai\b|cutting/.test(hay)) return "innovative";
  if (/trust|secure|professional|enterprise|financ/.test(hay)) {
    return "trustworthy";
  }
  if (/luxury|refin|elegant|exclus|prestige/.test(hay)) return "refined";
  return "trustworthy";
}

function detectMarketPosition(hay: string, strategy?: CoreProductStrategy | null): string {
  if (strategy?.positioning?.trim()) return strategy.positioning.trim();
  if (/luxury|premium|flagship|prestige/.test(hay)) {
    return "Premium / premium-priced category leader";
  }
  if (/enterprise|b2b|compliance/.test(hay)) {
    return "Enterprise-trusted solution provider";
  }
  if (/disrupt|challenger|startup|plg/.test(hay)) {
    return "Challenger / product-led growth brand";
  }
  if (/local|neighborhood|boutique/.test(hay)) {
    return "Boutique local specialist";
  }
  return "Differentiated professional brand in a competitive market";
}

function detectBusinessType(
  industry: string,
  profile?: CoreBusinessProfile | null,
): string {
  const offer = (profile?.offer || "").toLowerCase();
  const ind = industry.toLowerCase();
  if (/restaurant|dining|cafe/.test(ind + offer)) return "Hospitality / dining";
  if (/saas|software|platform/.test(ind + offer)) return "SaaS / software product";
  if (/agency|studio|design/.test(ind + offer)) return "Creative / services agency";
  if (/clinic|health|dental/.test(ind + offer)) return "Healthcare / clinic";
  if (/auto|vehicle|dealership/.test(ind + offer)) return "Automotive / showroom";
  if (/real.?estate|property/.test(ind + offer)) return "Real estate / property";
  if (/ecom|shop|retail/.test(ind + offer)) return "E-commerce / retail";
  if (/tour|travel|hotel/.test(ind + offer)) return "Travel / tourism";
  if (/financ|bank|invest/.test(ind + offer)) return "Finance / advisory";
  if (/educat|school|course/.test(ind + offer)) return "Education / learning";
  return profile?.offer?.trim() || "Professional services business";
}

/** Choose the best brand preset from industry + audience + position + personality. */
export function selectBrandPreset(params: {
  industryId?: string | null;
  industryLabel?: string | null;
  audience?: string | null;
  positioning?: string | null;
  tone?: string | null;
  theme?: string | null;
  preferredStyle?: string | null;
  businessGoals?: string[] | null;
}): BrandPresetId {
  const fromPreferred = normalizeBrandPresetId(
    params.preferredStyle || params.theme,
  );
  if (fromPreferred) return fromPreferred;

  const hay = [
    params.industryId,
    params.industryLabel,
    params.audience,
    params.positioning,
    params.tone,
    ...(params.businessGoals ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const fromHay = normalizeBrandPresetId(hay);
  if (fromHay) return fromHay;

  if (/saas|software|subscription|b2b.?platform/.test(hay)) {
    return "premium-saas-brand";
  }
  if (/tech|ai\b|cyber|hardware|iot/.test(hay)) return "technology-brand";
  if (/luxury|resort|fine dining|showroom|jewelry/.test(hay)) {
    return "luxury-brand";
  }
  if (/agency|studio|creative|portfolio/.test(hay)) return "creative-brand";
  if (/minimal|wellness|scandinavian/.test(hay)) return "minimal-brand";
  if (/financ|bank|clinic|enterprise|legal|insurance/.test(hay)) {
    return "corporate-brand";
  }
  if (/restaurant|tourism|real.?estate|auto/.test(hay)) return "luxury-brand";
  if (/ecommerce|retail|shop/.test(hay)) return "premium-saas-brand";

  return "corporate-brand";
}

/**
 * Analyze industry, business type, audience, market position, personality
 * → brand style, voice, visual direction.
 */
export function analyzeBrandStrategy(params: {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  preferredStyle?: string | null;
  preset?: BrandPresetPackage;
}): { strategy: BrandStrategyBrief; presetId: BrandPresetId } {
  const industry =
    params.industryId ||
    params.profile?.industry ||
    "business";
  const audience =
    params.profile?.targetAudience?.trim() ||
    "Discerning customers who expect clarity and polish";
  const hay = [
    industry,
    params.profile?.offer,
    params.profile?.tone,
    params.strategy?.positioning,
    audience,
    ...(params.profile?.businessGoals ?? []),
    params.theme,
    params.preferredStyle,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const presetId =
    params.preset?.id ||
    selectBrandPreset({
      industryId: params.industryId,
      industryLabel: params.profile?.industry,
      audience,
      positioning: params.strategy?.positioning,
      tone: params.profile?.tone,
      theme: params.theme,
      preferredStyle: params.preferredStyle,
      businessGoals: params.profile?.businessGoals,
    });
  const preset = params.preset || getBrandPreset(presetId);
  const personality = detectPersonality(hay);
  const marketPosition = detectMarketPosition(hay, params.strategy);
  const businessType = detectBusinessType(industry, params.profile);

  const voicePrinciples = [
    `Sound ${personality} — never generic or templated`,
    "Lead with benefit and atmosphere, then proof",
    "One idea per sentence; prefer concrete over abstract",
    "Match the brand preset voice without copying competitors",
  ];

  return {
    presetId,
    strategy: {
      industry: String(industry),
      businessType,
      targetAudience: audience,
      marketPosition,
      brandPersonality: personality,
      brandStyle: `${preset.label} · ${preset.visualDirection.split(";")[0]}`,
      brandVoice: {
        tone: preset.voiceTone,
        principles: voicePrinciples,
        doExamples: [
          "Specific outcomes and sensory detail",
          "Confident, human language that matches the preset",
          "Clear next step in every key moment",
        ],
        dontExamples: [
          "Buzzword stacks (synergy, next-gen, revolutionary)",
          "Lorem-style filler or 'We are passionate about…' openers",
          "Competing CTAs that dilute the primary action",
        ],
        taglineDirection: `Short ${personality} line that names the promise for ${audience.split(/[,.]/)[0]?.trim() || "the audience"}`,
      },
      visualDirection: preset.visualDirection,
      archetype: preset.archetype,
    },
  };
}
