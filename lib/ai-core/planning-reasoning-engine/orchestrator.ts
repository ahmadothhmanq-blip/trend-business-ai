/**
 * Planning & Reasoning Engine (PRE) — EDS-002
 * Single orchestration entry for website planning with structured decision traces.
 */

import { createHash } from "node:crypto";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  applyBusinessIntelligenceToBrief,
  detectionFromBusinessIntelligence,
  getBusinessIntelligenceFromBrief,
  runBusinessIntelligenceAnalysis,
} from "@/lib/ai-core/business-intelligence";
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
} from "@/lib/ai-core/template-intelligence";
import { runAutoDesignDecision } from "@/lib/ai-core/website-design-platform/auto-design";
import { isIndustryId } from "@/lib/ai-core/templates/industries";
import type { IndustryId } from "@/lib/ai-core/templates/types";
import {
  resolveStructureTemplateForIndustry,
} from "@/lib/website/builder/structure-templates";
import { getWebsiteThemeEntry } from "@/lib/website/builder/theme-catalog";
import { runAgencyOrchestrator } from "@/lib/ai-core/agency-orchestrator/orchestrate";
import { validateAndRouteWebsiteGeneration } from "@/lib/ai-core/architecture-validation/orchestrate";
import { PlanningTraceCollector } from "@/lib/ai-core/planning-reasoning-engine/trace/collector";
import {
  explainPlanningTrace,
  summarizePlanningTrace,
} from "@/lib/ai-core/planning-reasoning-engine/trace/explain";
import type {
  PlanningReasoningEngineParams,
  PlanningReasoningEngineResult,
  PlanningReasoningTrace,
} from "@/lib/ai-core/planning-reasoning-engine/types";
import { PLANNING_REASONING_TRACE_KEY } from "@/lib/ai-core/planning-reasoning-engine/types";

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
  routingIndustryId?: string,
): string {
  const country = inferCountry(prompt);
  const visuals = resolveIndustryVisualBrief(
    routingIndustryId || industryId,
    "hero",
    0,
  );
  if (country && industryId === "tourism") {
    return `${country} skyline + travel atmosphere · ${visuals}`;
  }
  return dnaHero || visuals;
}

function buildImageKeywords(
  industryId: string,
  photographyStyle: string[],
  prompt: string,
  routingIndustryId?: string,
): string[] {
  const imageIndustry = routingIndustryId || industryId;
  const hero = resolveIndustryVisualBrief(imageIndustry, "hero", 0);
  const gallery = resolveIndustryVisualBrief(imageIndustry, "gallery", 1);
  const country = inferCountry(prompt);
  const base = [...photographyStyle.slice(0, 8), hero, gallery].filter(Boolean);
  if (country && industryId === "tourism") {
    base.unshift(country);
  }
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

function persistTraceOnBrief(
  brief: CoreBrief,
  trace: PlanningReasoningTrace,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [PLANNING_REASONING_TRACE_KEY]: trace,
    },
  };
}

export function getPlanningReasoningTraceFromBrief(
  brief: CoreBrief,
): PlanningReasoningTrace | null {
  const raw = brief.metadata?.[PLANNING_REASONING_TRACE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as PlanningReasoningTrace;
}

/**
 * Authoritative planning orchestrator — analyzes prompt once, routes, validates,
 * and locks the Master Website Plan with a full structured decision trace.
 */
export async function runPlanningReasoningEngine(
  params: PlanningReasoningEngineParams,
): Promise<PlanningReasoningEngineResult> {
  const { onProgress } = params;
  const traceCollector = new PlanningTraceCollector();
  let brief = params.brief;
  const prompt = brief.prompt?.trim() || "";
  const promptHash = hashPrompt(prompt);

  const existing = getMasterWebsitePlan(brief);
  if (
    params.reuseExisting !== false &&
    existing &&
    existing.promptHash === promptHash
  ) {
    traceCollector.beginPhase("reuse");
    traceCollector.record({
      phase: "reuse",
      ruleId: "reuse-locked-plan",
      category: "planning",
      passed: true,
      severity: "info",
      message: `Reusing locked plan for ${existing.industry} · ${existing.template}`,
      outputs: { planId: existing.id, industry: existing.industry },
    });
    const trace = traceCollector.toTrace(promptHash);
    onProgress?.(
      `[pre] Reusing locked plan · ${existing.industry} · ${existing.template}`,
    );
    return {
      plan: existing,
      brief: persistTraceOnBrief(brief, trace),
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
      trace,
    };
  }

  onProgress?.("[pre] Phase 1/5 · Business analysis…");
  traceCollector.beginPhase("business-analysis");

  let businessIntel = getBusinessIntelligenceFromBrief(brief);
  if (!businessIntel) {
    businessIntel = await runBusinessIntelligenceAnalysis({
      brief,
      onProgress,
    });
    brief = applyBusinessIntelligenceToBrief(brief, businessIntel);
    traceCollector.record({
      ruleId: "bi-llm-analysis",
      category: "business",
      passed: true,
      severity: "info",
      message: `Business intelligence analyzed · ${businessIntel.profile.industry}`,
      confidence: businessIntel.profile.confidence,
      outputs: {
        industry: businessIntel.profile.industry,
        routingIndustryId: businessIntel.profile.routingIndustryId,
        source: businessIntel.source,
      },
    });
  } else {
    traceCollector.record({
      ruleId: "bi-reuse",
      category: "business",
      passed: true,
      severity: "info",
      message: `Reusing business intelligence · ${businessIntel.profile.industry}`,
      confidence: businessIntel.profile.confidence,
    });
  }

  onProgress?.("[pre] Phase 2/5 · Agency synthesis…");
  traceCollector.beginPhase("agency-synthesis");
  const agency = await runAgencyOrchestrator({ brief, onProgress });
  brief = agency.brief;
  traceCollector.record({
    ruleId: "agency-contract",
    category: "agency",
    passed: true,
    severity: "info",
    message: `Agency contract · ${agency.contract.brandKit.companyName} · ${agency.contract.designDNA.label}`,
    outputs: {
      companyName: agency.contract.brandKit.companyName,
      designDNA: agency.contract.designDNA.benchmark,
    },
  });

  const industryDetection = detectionFromBusinessIntelligence(businessIntel);
  const industryId = industryDetection.industryId;
  const profile = industryDetection.profile;
  const businessProfile = businessIntel.profile;

  traceCollector.record({
    ruleId: "industry-lock",
    category: "industry",
    passed: true,
    severity: "info",
    message: `Industry locked: ${profile.label} (${industryDetection.source})`,
    confidence: industryDetection.confidence,
    outputs: { industryId, source: industryDetection.source },
  });

  onProgress?.("[pre] Phase 3/5 · Auto-design heuristics…");
  traceCollector.beginPhase("auto-design");

  const explicitTemplateId =
    typeof brief.metadata?.templateIntelligenceId === "string"
      ? brief.metadata.templateIntelligenceId
      : null;
  const explicitStructureId =
    typeof brief.metadata?.websiteStructureTemplateId === "string"
      ? brief.metadata.websiteStructureTemplateId
      : null;
  const explicitThemeId =
    typeof brief.metadata?.websiteThemeId === "string"
      ? brief.metadata.websiteThemeId
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
  traceCollector.record({
    ruleId: "auto-design-decision",
    category: "heuristic",
    passed: true,
    severity: "info",
    message: `Auto-design · ${autoDesign.vertical} · ${autoDesign.family}`,
    confidence: autoDesign.confidence,
    outputs: {
      vertical: autoDesign.vertical,
      family: autoDesign.family,
      brandStyle: autoDesign.brandStyle,
    },
  });

  const layoutTemplateSeed = getTemplateIntelligence(
    explicitTemplateId ||
      resolveStructureTemplateForIndustry(String(industryId))
        .templateIntelligenceId,
  );
  const designDnaSeed = layoutTemplateSeed
    ? resolveTemplateDNA(layoutTemplateSeed)
    : null;
  const heroSeed =
    businessProfile.heroMessaging[0] ||
    inferHeroBrief(
      industryId,
      prompt,
      designDnaSeed?.heroProfile ?? "",
      businessProfile.routingIndustryId,
    );
  const imageKeywordsSeed = buildImageKeywords(
    industryId,
    businessProfile.photographyStyle,
    prompt,
    businessProfile.routingIndustryId,
  );

  onProgress?.("[pre] Phase 4/5 · Template routing + architecture validation…");
  traceCollector.beginPhase("template-routing");

  const validated = await validateAndRouteWebsiteGeneration({
    brief,
    industryId: String(industryId),
    industryDetection,
    businessProfile,
    agencyContract: agency.contract,
    sectionOrder:
      businessProfile.recommendedSections.length >= 3
        ? businessProfile.recommendedSections
        : profile.requiredSections,
    hero: heroSeed,
    imageKeywords: imageKeywordsSeed,
    options: {
      maxRetries:
        typeof brief.metadata?.architectureValidationMaxRetries === "number"
          ? brief.metadata.architectureValidationMaxRetries
          : 2,
      allowLegacyBypass: brief.metadata?.allowLegacyArchitectureBypass === true,
      onProgress,
    },
  });
  brief = validated.brief;
  const route = validated.route;
  const generationPlan = validated.plan;

  traceCollector.mergeReasoningChain(
    route.reasoningChain,
    "template-routing",
    "route",
  );
  traceCollector.beginPhase("architecture-validation");
  traceCollector.mergeArchitectureValidationTrace(validated.validation.trace);
  traceCollector.record({
    ruleId: "validation-status",
    category: "planning",
    passed: validated.validation.status !== "failed",
    severity:
      validated.validation.status === "failed"
        ? "error"
        : validated.validation.status === "warning"
          ? "warning"
          : "info",
    message: `Architecture validation ${validated.validation.status} · attempt ${validated.validation.attempt} · confidence ${validated.validation.confidence.toFixed(2)}`,
    confidence: validated.validation.confidence,
    outputs: {
      status: validated.validation.status,
      errors: validated.validation.errors.length,
      warnings: validated.validation.warnings.length,
    },
  });

  onProgress?.("[pre] Phase 5/5 · Locking master website plan…");
  traceCollector.beginPhase("master-plan-lock");

  const layoutTemplate =
    getTemplateIntelligence(route.layoutTemplateIntelligenceId)!;
  const visualThemeEntry = getWebsiteThemeEntry(route.visualThemePresetId)!;
  const visualThemeTemplate =
    getTemplateIntelligence(route.visualThemeTemplateIntelligenceId) ||
    layoutTemplate;

  const country = inferCountry(prompt);
  const style =
    businessProfile.visualStyle.join(", ") ||
    autoDesign.brandStyle ||
    profile.designStyle ||
    layoutTemplate.designStyle;
  const tone = inferTone(prompt, style);

  const designDna = resolveTemplateDNA(layoutTemplate);
  const hero = generationPlan.hero;
  const imageKeywords = generationPlan.imageKeywords;
  const sectionOrder = generationPlan.sections;
  const sections = buildSections(sectionOrder, generationPlan.components);

  const trace = traceCollector.toTrace(promptHash);
  const explainableChain = explainPlanningTrace(trace);

  const plan: MasterWebsitePlan = {
    id: `master-plan-${promptHash}`,
    version: "1",
    createdAt: new Date().toISOString(),
    promptHash,

    industry: industryId,
    industryLabel: businessProfile.industry,
    businessType: businessProfile.subcategory || autoDesign.businessType,
    style,
    audience:
      businessProfile.audience.join(", ") ||
      autoDesign.targetAudience ||
      profile.contentStyle,
    country,
    language: brief.language || autoDesign.locale.language,
    tone,

    template: layoutTemplate.id,
    templateCategory: layoutTemplate.category,
    theme: route.visualThemePresetId,
    themeLabel: visualThemeEntry.label,
    layout: route.pageTopology,
    hero,
    navigation: designDna.navigationProfile,

    colorPalette: {
      primary: visualThemeTemplate.colors.primary,
      secondary: visualThemeTemplate.colors.secondary,
      accent: visualThemeTemplate.colors.accent,
      background: visualThemeTemplate.colors.background,
      foreground: visualThemeTemplate.colors.foreground,
      surface: visualThemeTemplate.colors.surface,
    },
    typography: {
      display: visualThemeTemplate.typography.display,
      heading:
        visualThemeTemplate.typography.heading ||
        visualThemeTemplate.typography.display,
      body: visualThemeTemplate.typography.body,
    },

    imageStyle: businessProfile.photographyStyle[0] || profile.designStyle,
    imageKeywords,

    sections,
    ctaStyle: visualThemeTemplate.designPreset,
    ctaPrimary: businessProfile.primaryCta || profile.ctaTypes[0],
    ctaSecondary: businessProfile.secondaryCta || profile.ctaTypes[1],
    features: Array.from(
      new Set([...(brief.features ?? []), ...profile.requiredFeatures]),
    ),

    components: generationPlan.components,

    locked: {
      industry: true,
      template: Boolean(explicitStructureId || explicitTemplateId),
      theme: Boolean(explicitThemeId),
      layout: true,
      sections: true,
      images: true,
      hero: true,
      navigation: true,
    },

    sources: {
      industry: `business-intelligence:${industryDetection.source}`,
      template: explicitStructureId
        ? "explicit-structure"
        : explicitTemplateId
          ? "explicit"
          : "industry-structure-router",
      theme: explicitThemeId ? "explicit" : "industry-visual-tokens",
      design: `template-dna:${designDna.id}`,
      route: route.reason,
      reasoningChain: explainableChain,
      validation: `${validated.validation.status} · attempt ${validated.validation.attempt} · confidence ${validated.validation.confidence.toFixed(2)}`,
    },
  };

  traceCollector.record({
    ruleId: "master-plan-locked",
    category: "planning",
    passed: true,
    severity: "info",
    message: summarizePlanningTrace(traceCollector.toTrace(promptHash)),
    outputs: {
      planId: plan.id,
      industry: plan.industry,
      template: plan.template,
      theme: plan.theme,
      sections: plan.sections.length,
    },
  });

  const finalTrace = traceCollector.toTrace(promptHash);
  const updatedBrief = persistTraceOnBrief(
    applyMasterWebsitePlanToBrief(brief, plan, {
      industryDetection,
      autoDesign,
      templateDna: designDna,
      structureTemplateId: route.structureTemplateId,
      layoutTemplateIntelligenceId: layoutTemplate.id,
      visualThemePresetId: route.visualThemePresetId,
      visualThemeTemplateIntelligenceId: route.visualThemeTemplateIntelligenceId,
      premiumTemplateId: route.premiumTemplateId,
    }),
    finalTrace,
  );

  onProgress?.(
    `[pre] Plan approved · ${plan.industryLabel} · structure=${route.structureTemplateId} · layout=${layoutTemplate.id} · theme=${route.visualThemePresetId} · validation=${validated.validation.status} · trace=${finalTrace.entries.length} decisions`,
  );

  return {
    plan,
    brief: updatedBrief,
    industryDetection,
    trace: finalTrace,
  };
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
      `[pre] ${engineName} attempted industry override ${attempted} → blocked (locked: ${locked})`,
    );
  }
}

export function lockedIndustryId(brief: CoreBrief): IndustryId | string | null {
  const plan = getMasterWebsitePlan(brief);
  return plan?.industry ?? null;
}
