import { createHash } from "node:crypto";
import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { WEBSITE_INDUSTRY_IDS } from "@/lib/ai-core/industry-intelligence/profiles";
import type {
  BusinessIntelligenceProfile,
  BusinessIntelligenceResult,
} from "@/lib/ai-core/business-intelligence/types";
import { BUSINESS_INTELLIGENCE_KEY } from "@/lib/ai-core/business-intelligence/types";

function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt.trim()).digest("hex").slice(0, 16);
}

type AnalysisPayload = Partial<BusinessIntelligenceProfile>;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

function normalizeProfile(
  raw: AnalysisPayload,
  prompt: string,
): BusinessIntelligenceProfile {
  const industry =
    typeof raw.industry === "string" && raw.industry.trim()
      ? raw.industry.trim()
      : "Business";
  const subcategory =
    typeof raw.subcategory === "string" && raw.subcategory.trim()
      ? raw.subcategory.trim()
      : industry;

  return {
    industry,
    subcategory,
    audience: asStringArray(raw.audience).length
      ? asStringArray(raw.audience)
      : ["Target customers"],
    tone:
      typeof raw.tone === "string" && raw.tone.trim()
        ? raw.tone.trim()
        : "Professional",
    visualStyle: asStringArray(raw.visualStyle).length
      ? asStringArray(raw.visualStyle)
      : ["Modern", "Premium"],
    colorPalette: asStringArray(raw.colorPalette).length
      ? asStringArray(raw.colorPalette)
      : ["Neutral", "Professional"],
    typography: asStringArray(raw.typography).length
      ? asStringArray(raw.typography)
      : ["Modern", "Readable"],
    photographyStyle: asStringArray(raw.photographyStyle).length
      ? asStringArray(raw.photographyStyle)
      : [`${industry} professional photography`],
    forbiddenSubjects: asStringArray(raw.forbiddenSubjects),
    heroMessaging: asStringArray(raw.heroMessaging).length
      ? asStringArray(raw.heroMessaging)
      : [`Premium ${subcategory} for discerning clients`],
    recommendedSections: asStringArray(raw.recommendedSections).length
      ? asStringArray(raw.recommendedSections)
      : ["Hero", "About", "Services", "Gallery", "Contact"],
    primaryCta:
      typeof raw.primaryCta === "string" && raw.primaryCta.trim()
        ? raw.primaryCta.trim()
        : "Get Started",
    secondaryCta:
      typeof raw.secondaryCta === "string" && raw.secondaryCta.trim()
        ? raw.secondaryCta.trim()
        : undefined,
    navigationStyle:
      typeof raw.navigationStyle === "string" && raw.navigationStyle.trim()
        ? raw.navigationStyle.trim()
        : "standard",
    designSystemHints: {
      mood:
        typeof raw.designSystemHints?.mood === "string"
          ? raw.designSystemHints.mood
          : raw.tone || "Professional",
      layoutApproach:
        typeof raw.designSystemHints?.layoutApproach === "string"
          ? raw.designSystemHints.layoutApproach
          : "clear hierarchy with industry-specific sections",
    },
    routingIndustryId:
      typeof raw.routingIndustryId === "string" && raw.routingIndustryId.trim()
        ? raw.routingIndustryId.trim().toLowerCase().replace(/\s+/g, "-")
        : industry.toLowerCase().replace(/\s+/g, "-"),
    confidence:
      typeof raw.confidence === "number"
        ? Math.min(1, Math.max(0.3, raw.confidence))
        : 0.75,
    reason:
      typeof raw.reason === "string" && raw.reason.trim()
        ? raw.reason.trim()
        : `AI classified business as ${industry}.`,
  };
}

function fallbackProfile(prompt: string): BusinessIntelligenceProfile {
  const trimmed = prompt.trim().slice(0, 200) || "Business website";
  return normalizeProfile(
    {
      industry: "Business",
      subcategory: "General",
      audience: ["Website visitors"],
      tone: "Professional",
      visualStyle: ["Modern", "Clean"],
      colorPalette: ["Neutral"],
      typography: ["Readable", "Modern"],
      photographyStyle: ["Professional business environment"],
      forbiddenSubjects: ["unrelated retail fashion", "generic stock imagery"],
      heroMessaging: [trimmed.slice(0, 80)],
      recommendedSections: [
        "Hero",
        "About",
        "Services",
        "Testimonials",
        "Contact",
      ],
      primaryCta: "Get Started",
      navigationStyle: "standard",
      designSystemHints: {
        mood: "Professional",
        layoutApproach: "standard corporate layout",
      },
      routingIndustryId: "business",
      confidence: 0.35,
      reason: "AI analysis unavailable — using minimal business profile.",
    },
    prompt,
  );
}

export function getBusinessIntelligenceFromBrief(
  brief: CoreBrief,
): BusinessIntelligenceResult | null {
  const raw = brief.metadata?.[BUSINESS_INTELLIGENCE_KEY];
  if (!raw || typeof raw !== "object") return null;
  const row = raw as BusinessIntelligenceResult;
  if (!row.profile?.industry) return null;
  return row;
}

export function applyBusinessIntelligenceToBrief(
  brief: CoreBrief,
  result: BusinessIntelligenceResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [BUSINESS_INTELLIGENCE_KEY]: result,
      businessIndustry: result.profile.industry,
      businessSubcategory: result.profile.subcategory,
      industrySemantic: result.profile.industry,
    },
  };
}

export type RunBusinessIntelligenceParams = {
  brief: CoreBrief;
  onProgress?: (message: string) => void;
  reuseExisting?: boolean;
};

/**
 * AI Business Analysis — runs before industry lock, template selection, and assets.
 * Produces a structured business profile with photography rules and forbidden subjects.
 */
export async function runBusinessIntelligenceAnalysis(
  params: RunBusinessIntelligenceParams,
): Promise<BusinessIntelligenceResult> {
  const prompt = params.brief.prompt?.trim() || "";
  const promptHash = hashPrompt(prompt);

  const existing = getBusinessIntelligenceFromBrief(params.brief);
  if (
    params.reuseExisting !== false &&
    existing &&
    existing.promptHash === promptHash
  ) {
    params.onProgress?.(
      `[business-intelligence] Reusing locked profile · ${existing.profile.industry}`,
    );
    return existing;
  }

  params.onProgress?.(
    "[business-intelligence] Analyzing business domain before generation…",
  );

  const routingCatalog = WEBSITE_INDUSTRY_IDS.map((id) => ({
    id,
    note: "Use only for template routing — pick the closest match to the real business.",
  }));

  const resolved = providerManager.resolve(getDefaultTextProvider());
  if (!resolved || !prompt) {
    const profile = fallbackProfile(prompt);
    return {
      profile,
      source: "fallback",
      analyzedAt: new Date().toISOString(),
      promptHash,
    };
  }

  try {
    const analysis = await providerManager.generateJson<AnalysisPayload>(
      {
        system: `You are a senior business strategist and creative director for a global website agency.
Analyze the user's business description and produce a precise, industry-specific profile.
You must understand the ACTUAL business domain — not generic retail or fashion when the business is furniture, medical, legal, etc.
Never confuse related-but-different industries (e.g. furniture ≠ fashion retail, restaurant ≠ grocery store).
Respond with JSON only.`,
        prompt: `Business description:
"""
${prompt}
"""

Theme: ${params.brief.theme ?? "n/a"}
Features: ${(params.brief.features ?? []).join(", ") || "n/a"}
Language: ${params.brief.language ?? "en"}

Template routing catalog (pick routingIndustryId — closest internal match):
${JSON.stringify(routingCatalog, null, 2)}

Return JSON with this exact shape:
{
  "industry": "Primary industry label",
  "subcategory": "Specific niche",
  "audience": ["audience segments"],
  "tone": "brand tone",
  "visualStyle": ["visual descriptors"],
  "colorPalette": ["semantic color themes"],
  "typography": ["typography personality"],
  "photographyStyle": ["specific photo subjects for THIS industry only"],
  "forbiddenSubjects": ["subjects that must NEVER appear in images"],
  "heroMessaging": ["3-5 hero headline angles"],
  "recommendedSections": ["industry-specific page sections"],
  "primaryCta": "primary CTA label",
  "secondaryCta": "secondary CTA label",
  "navigationStyle": "navigation approach",
  "designSystemHints": { "mood": "...", "layoutApproach": "..." },
  "routingIndustryId": "<id from catalog>",
  "confidence": 0.0-1.0,
  "reason": "one sentence explaining classification"
}

Critical rules:
- photographyStyle must describe ONLY visuals appropriate for this exact business.
- forbiddenSubjects must list visually similar but WRONG categories (e.g. furniture → fashion, clothing, shoes).
- recommendedSections must be unique to this industry, not generic "Features/Pricing" unless appropriate.
- heroMessaging and primaryCta must be industry-specific.`,
        temperature: 0.2,
      },
      resolved,
    );

    const profile = normalizeProfile(analysis, prompt);
    params.onProgress?.(
      `[business-intelligence] Locked: ${profile.industry} · ${profile.subcategory} (${Math.round(profile.confidence * 100)}%)`,
    );

    return {
      profile,
      source: "analysis",
      analyzedAt: new Date().toISOString(),
      promptHash,
    };
  } catch {
    params.onProgress?.(
      "[business-intelligence] Analysis failed — using minimal fallback profile.",
    );
    return {
      profile: fallbackProfile(prompt),
      source: "fallback",
      analyzedAt: new Date().toISOString(),
      promptHash,
    };
  }
}
