import { createHash, randomUUID } from "node:crypto";
import { resolveGlsWebsiteLocale } from "@/lib/language-platform";
import type { Tbge2PlanningInput, Tbge2PlanningPlan } from "@/lib/ai-core/generation-engine/core/types";
import { MASTER_PLAN_SCHEMA_VERSION } from "@/lib/ai-core/generation-engine/master-plan/constants";
import {
  buildAccessibilityTargets,
  buildContentStrategy,
  buildCtaStrategy,
  buildFutureExpansion,
  buildLegalPages,
  buildMediaStrategy,
  buildPerformanceTargets,
  buildSeoStrategy,
  buildTrustStrategy,
  resolveComponentForSection,
} from "@/lib/ai-core/generation-engine/master-plan/strategies";
import type {
  MasterPlan,
  MasterPlanComponent,
  MasterPlanInput,
  MasterPlanNavigationItem,
  MasterPlanPage,
  MasterPlanSection,
} from "@/lib/ai-core/generation-engine/master-plan/types";

function hashPrompt(prompt: string): string {
  return createHash("sha256").update(prompt).digest("hex").slice(0, 16);
}

/**
 * Master Plan Builder — converts TBGE2 analysis into the authoritative Master Plan.
 * All planning decisions are made here; LLMs never modify this output.
 */
export function buildMasterPlan(
  plan: Tbge2PlanningPlan,
  input: MasterPlanInput,
): MasterPlan {
  const locale = resolveGlsWebsiteLocale(plan.business.language);
  const projectId = randomUUID();
  const now = new Date().toISOString();

  const sections: MasterPlanSection[] = plan.sections.map((section) => ({
    ...section,
    componentId: resolveComponentForSection(section.type),
    contentBlocks: plan.content.blocks
      .filter((b) => b.sectionId === section.id)
      .map((b) => b.id),
  }));

  const pages: MasterPlanPage[] = plan.pages.map((page) => ({
    ...page,
    sections: sections
      .filter((s) => s.pageId === page.id)
      .sort((a, b) => a.order - b.order)
      .map((s) => s.id),
  }));

  const navigation: MasterPlanNavigationItem[] = plan.website.navigation.map((item, index) => ({
    ...item,
    order: index,
  }));

  const componentsNeeded: MasterPlanComponent[] = dedupeComponents(sections);

  return {
    id: projectId,
    version: 1,
    createdAt: now,
    schemaVersion: MASTER_PLAN_SCHEMA_VERSION,
    providerIndependent: true,

    project: {
      id: projectId,
      name: input.projectName ?? plan.business.businessName ?? `${plan.business.industry} Website`,
      productId: input.productId ?? "website-builder",
      sourcePromptHash: hashPrompt(input.userPrompt),
    },

    business: {
      name: plan.business.businessName ?? plan.business.industry,
      industry: plan.business.industry,
      industryId: plan.business.industryId,
      businessType: plan.business.businessType,
      offer: plan.business.offer,
      confidence: plan.business.confidence,
    },

    audience: plan.business.audience,
    goals: plan.business.goals,
    brand: {
      style: plan.business.brandStyle,
      tone: plan.content.tone,
      voice: plan.content.voice,
    },

    localization: {
      language: plan.business.language,
      country: plan.business.country,
      strategy: plan.content.localizationStrategy,
      direction: locale.dir,
      htmlLang: locale.htmlLang,
      localeCode: locale.localeCode,
    },

    websiteType: plan.website.websiteType,
    conversionStrategy: plan.website.conversionStrategy,

    pages,
    navigation,
    sections,
    componentsNeeded,
    businessFeatures: plan.requirements.required,

    seoStrategy: buildSeoStrategy(plan.intent, plan.business, plan.website, plan.requirements),
    contentStrategy: buildContentStrategy(plan.content),
    mediaStrategy: buildMediaStrategy(plan.intent, plan.requirements, plan.business.brandStyle),
    ctaStrategy: buildCtaStrategy(plan.website, plan),
    trustStrategy: buildTrustStrategy(plan.intent, plan.requirements),
    legalPages: buildLegalPages(plan.requirements),
    performanceTargets: buildPerformanceTargets(plan.website.websiteType),
    accessibilityTargets: buildAccessibilityTargets(),
    futureExpansion: buildFutureExpansion(),
  };
}

function dedupeComponents(sections: MasterPlanSection[]): MasterPlanComponent[] {
  const seen = new Set<string>();
  const components: MasterPlanComponent[] = [];

  for (const section of sections) {
    if (seen.has(section.componentId)) continue;
    seen.add(section.componentId);
    components.push({
      id: `component-${section.type}`,
      sectionType: section.type,
      componentPath: section.componentId,
      required: section.required,
    });
  }

  return components;
}
