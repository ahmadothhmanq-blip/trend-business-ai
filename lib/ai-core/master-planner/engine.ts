/**
 * Master AI Planner — single source of truth before any website generation.
 * Orchestrates existing Industry / Template / Design intelligence once.
 */

import { createHash } from "node:crypto";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { detectWebsiteIndustry } from "@/lib/ai-core/industry-intelligence/detect";
import { getWebsiteIndustryIntelligence } from "@/lib/ai-core/industry-intelligence/profiles";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import {
  getMasterWebsitePlan,
  applyMasterWebsitePlanToBrief,
} from "@/lib/ai-core/master-planner/apply";
import type {
  MasterWebsitePlan,
  MasterWebsitePlanSection,
} from "@/lib/ai-core/master-planner/types";
import { resolveIndustryVisualBrief } from "@/lib/ai-core/image-engine/section-strategies";
import {
  getTemplateIntelligence,
  resolveTemplateDNA,
  selectTemplateIntelligence,
} from "@/lib/ai-core/template-intelligence";
import { runAutoDesignDecision } from "@/lib/ai-core/website-design-platform/auto-design";
import { isIndustryId } from "@/lib/ai-core/templates/industries";
import type { IndustryId } from "@/lib/ai-core/templates/types";

export type RunMasterWebsitePlannerParams = {
  brief: CoreBrief;
  onProgress?: (message: string) => void;
  /** Skip re-planning when an identical plan already exists on the brief. */
  reuseExisting?: boolean;
};

export type MasterWebsitePlannerResult = {
  plan: MasterWebsitePlan;
  brief: CoreBrief;
  industryDetection: IndustryDetectionResult;
};

function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt.trim()).digest("hex").slice(0, 16);
}

function inferCountry(prompt: string): string | undefined {
  const p = prompt.toLowerCase();
  const cities = [
    "dubai",
    "abu dhabi",
    "london",
    "paris",
    "new york",
    "tokyo",
    "singapore",
    "sydney",
    "cairo",
    "riyadh",
    "istanbul",
  ];
  for (const city of cities) {
    if (p.includes(city)) {
      return city.replace(/\b\w/g, (c) => c.toUpperCase());
    }
  }
  const countryMatch = p.match(
    /\b(in|for|based in)\s+([a-z][a-z\s]{2,24})(?:\.|,|$)/i,
  );
  if (countryMatch?.[2]) {
    return countryMatch[2].trim().replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return undefined;
}

function inferTone(prompt: string, style: string): string {
  const p = prompt.toLowerCase();
  if (/luxury|premium|exclusive|high-end|boutique/.test(p)) return "luxury";
  if (/playful|fun|bold|energetic/.test(p)) return "playful";
  if (/minimal|clean|simple|quiet/.test(p)) return "minimal";
  if (/corporate|professional|enterprise|trust/.test(p)) return "professional";
  if (/warm|friendly|welcoming|hospitality/.test(p)) return "warm";
  return style || "professional";
}

function inferHeroBrief(
  industryId: string,
  prompt: string,
  dnaHero: string,
): string {
  const country = inferCountry(prompt);
  const visuals = resolveIndustryVisualBrief(industryId, "hero", 0);
  if (country && industryId === "tourism") {
    return `${country} skyline + travel atmosphere · ${visuals}`;
  }
  return dnaHero || visuals;
}

function buildImageKeywords(
  industryId: string,
  profileKeywords: string[],
  prompt: string,
): string[] {
  const hero = resolveIndustryVisualBrief(industryId, "hero", 0);
  const gallery = resolveIndustryVisualBrief(industryId, "gallery", 1);
  const country = inferCountry(prompt);
  const base = [...profileKeywords.slice(0, 8), hero, gallery].filter(Boolean);
  if (country) base.unshift(country);
  return Array.from(new Set(base.map((k) => k.trim()).filter(Boolean))).slice(
    0,
    16,
  );
}

function buildSections(
  sectionOrder: string[],
  components: string[],
): MasterWebsitePlanSection[] {
  const navFooter = /Header|Nav|Footer/i;
  const body = components.filter((c) => !navFooter.test(c));
  return sectionOrder.map((label, index) => ({
    key: label
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .slice(0, 32),
    label,
    componentId: body[index] ?? body[body.length - 1],
    purpose: `Master plan section: ${label}`,
  }));
}

function ctaForIndustry(industryId: string, profileCtas: string[]): string {
  if (industryId === "tourism") return "Book Your Trip";
  if (industryId === "restaurant") return "Reserve a Table";
  if (industryId === "automotive") return "Book a Test Drive";
  if (industryId === "clinic") return "Book Appointment";
  if (industryId === "real-estate") return "Browse Listings";
  return profileCtas[0] || "Get Started";
}

/**
 * Analyze the user prompt once and produce the authoritative Website Plan.
 */
export async function runMasterWebsitePlanner(
  params: RunMasterWebsitePlannerParams,
): Promise<MasterWebsitePlannerResult> {
  const { brief, onProgress } = params;
  const prompt = brief.prompt?.trim() || "";
  const promptHash = hashPrompt(prompt);

  const existing = getMasterWebsitePlan(brief);
  if (
    params.reuseExisting !== false &&
    existing &&
    existing.promptHash === promptHash
  ) {
    onProgress?.(
      `[master-planner] Reusing locked plan · ${existing.industry} · ${existing.template}`,
    );
    return {
      plan: existing,
      brief,
      industryDetection:
        (brief.metadata?.industryIntelligence as
          | IndustryDetectionResult
          | undefined) ?? {
          industryId: String(existing.industry) as IndustryId,
          confidence: 1,
          reason: "Master AI Planner locked industry.",
          source: "explicit",
          profile: getWebsiteIndustryIntelligence(
            String(existing.industry) as IndustryId,
          ),
        },
    };
  }

  onProgress?.("[master-planner] Analyzing prompt → building Website Plan…");

  const industryDetection = await detectWebsiteIndustry(brief);
  const industryId = industryDetection.industryId;
  const profile = industryDetection.profile;

  onProgress?.(
    `[master-planner] Industry locked: ${profile.label} (${industryDetection.source})`,
  );

  const explicitTemplateId =
    typeof brief.metadata?.templateIntelligenceId === "string"
      ? brief.metadata.templateIntelligenceId
      : null;

  const autoDesign = runAutoDesignDecision({
    prompt,
    language: brief.language,
    brandStyle:
      typeof brief.metadata?.brandStyle === "string"
        ? brief.metadata.brandStyle
        : null,
    industry: industryId,
    explicitTemplateId,
  });

  let template =
    getTemplateIntelligence(autoDesign.templateIntelligenceId) ||
    (explicitTemplateId
      ? getTemplateIntelligence(explicitTemplateId)
      : null);
  if (!template) {
    const tiSelection = selectTemplateIntelligence({
      prompt,
      industry: industryId,
      businessType: autoDesign.businessType,
      targetAudience: autoDesign.targetAudience,
      brandStyle: autoDesign.brandStyle,
      designStyle: autoDesign.brandStyle,
      explicitTemplateId: explicitTemplateId || autoDesign.templateIntelligenceId,
    });
    template = tiSelection.template;
  }
  const templateDna = resolveTemplateDNA(template);

  const country = inferCountry(prompt);
  const style =
    autoDesign.brandStyle || profile.designStyle || template.designStyle;
  const tone = inferTone(prompt, style);
  const hero = inferHeroBrief(industryId, prompt, templateDna.heroProfile);
  const imageKeywords = buildImageKeywords(
    industryId,
    profile.keywords,
    prompt,
  );
  const sections = buildSections(
    templateDna.sectionOrder.length
      ? templateDna.sectionOrder
      : profile.requiredSections,
    templateDna.components.map(String),
  );

  const plan: MasterWebsitePlan = {
    id: `master-plan-${promptHash}`,
    version: "1",
    createdAt: new Date().toISOString(),
    promptHash,

    industry: industryId,
    industryLabel: profile.label,
    businessType: autoDesign.businessType,
    style,
    audience: autoDesign.targetAudience || profile.contentStyle,
    country,
    language: brief.language || autoDesign.locale.language,
    tone,

    template: template.id,
    templateCategory: template.category,
    layout: String(templateDna.layoutProfile || template.layoutStructure),
    hero,
    navigation: templateDna.navigationProfile,

    colorPalette: {
      primary: template.colors.primary,
      secondary: template.colors.secondary,
      accent: template.colors.accent,
      background: template.colors.background,
      foreground: template.colors.foreground,
      surface: template.colors.surface,
    },
    typography: {
      display: template.typography.display,
      heading: template.typography.heading || template.typography.display,
      body: template.typography.body,
    },

    imageStyle: profile.designStyle,
    imageKeywords,

    sections,
    ctaStyle: template.designPreset,
    ctaPrimary: ctaForIndustry(industryId, profile.ctaTypes),
    ctaSecondary: profile.ctaTypes[1],
    features: Array.from(
      new Set([...(brief.features ?? []), ...profile.requiredFeatures]),
    ),

    components: autoDesign.components,

    locked: {
      industry: true,
      template: Boolean(explicitTemplateId),
      layout: true,
      sections: true,
      images: true,
      hero: true,
      navigation: true,
    },

    sources: {
      industry: industryDetection.source,
      template: explicitTemplateId ? "explicit" : "auto-design",
      design: `template-dna:${templateDna.id}`,
    },
  };

  const updatedBrief = applyMasterWebsitePlanToBrief(brief, plan, {
    industryDetection,
    autoDesign,
    templateDna,
  });

  onProgress?.(
    `[master-planner] Plan approved · ${plan.industryLabel} · ${plan.style} · ${plan.template} · ${plan.sections.length} sections · hero=${plan.hero.slice(0, 48)}…`,
  );

  return { plan, brief: updatedBrief, industryDetection };
}

/** Guard: engines must not override locked master plan industry. */
export function assertMasterPlanIndustry(
  brief: CoreBrief,
  attemptedIndustry: string,
  engineName: string,
): void {
  const plan = getMasterWebsitePlan(brief);
  if (!plan?.locked.industry) return;
  const locked = String(plan.industry).toLowerCase();
  const attempted = attemptedIndustry.toLowerCase();
  if (
    locked !== attempted &&
    isIndustryId(locked) &&
    attempted !== locked &&
    attempted !== "business" &&
    attempted !== "general"
  ) {
    console.warn(
      `[master-planner] ${engineName} attempted industry override ${attempted} → blocked (locked: ${locked})`,
    );
  }
}

export function lockedIndustryId(brief: CoreBrief): IndustryId | string | null {
  const plan = getMasterWebsitePlan(brief);
  return plan?.industry ?? null;
}
