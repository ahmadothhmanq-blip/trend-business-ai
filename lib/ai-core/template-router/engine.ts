import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import { getBusinessIntelligenceFromBrief } from "@/lib/ai-core/business-intelligence";
import type { IndustryDetectionResult } from "@/lib/ai-core/industry-intelligence/types";
import { getPremiumTemplate } from "@/lib/ai-core/premium-templates/catalog";
import { configurePremiumTemplate } from "@/lib/ai-core/premium-templates/configure";
import { selectPremiumTemplate } from "@/lib/ai-core/premium-templates/select";
import {
  getTemplateIntelligence,
  listTemplateIntelligence,
  selectTemplateIntelligence,
} from "@/lib/ai-core/template-intelligence";
import {
  getWebsiteStructureTemplate,
} from "@/lib/website/builder/structure-templates";
import {
  getIndustryKnowledge,
  isEditorialLayoutIndustry,
  isEditorialLayoutStructure,
  normalizeRoutingIndustryId,
  resolveIndustryLayoutFamily,
  resolveStructureTemplateIdForIndustry,
  resolveVisualThemePresetForIndustry,
} from "@/lib/ai-core/architecture-knowledge-base";
import { getWebsiteThemeEntry } from "@/lib/website/builder/theme-catalog";
import { getThemePageArchitecture } from "@/lib/website/builder/theme-architecture";
import type { AgencyGenerationContract } from "@/lib/ai-core/agency-orchestrator/types";
import {
  UNIFIED_TEMPLATE_ROUTE_KEY,
  type UnifiedTemplateRoute,
} from "@/lib/ai-core/template-router/types";

export type { UnifiedTemplateRoute } from "@/lib/ai-core/template-router/types";
export { UNIFIED_TEMPLATE_ROUTE_KEY } from "@/lib/ai-core/template-router/types";

export function getUnifiedTemplateRouteFromBrief(
  brief: CoreBrief,
): UnifiedTemplateRoute | null {
  const raw = brief.metadata?.[UNIFIED_TEMPLATE_ROUTE_KEY];
  if (!raw || typeof raw !== "object") return null;
  const route = raw as UnifiedTemplateRoute;
  if (!route.layoutTemplateIntelligenceId || !route.structureTemplateId) {
    return null;
  }
  return route;
}

export function applyUnifiedTemplateRouteToBrief(
  brief: CoreBrief,
  route: UnifiedTemplateRoute,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [UNIFIED_TEMPLATE_ROUTE_KEY]: route,
      websiteStructureTemplateId: route.structureTemplateId,
      templateIntelligenceId: route.layoutTemplateIntelligenceId,
      websiteThemeId: route.visualThemePresetId,
      visualThemeTemplateIntelligenceId: route.visualThemeTemplateIntelligenceId,
      premiumTemplateId: route.premiumTemplateId,
      layoutFamily: route.layoutFamily,
    },
  };
}

export type RouteWebsiteGenerationParams = {
  brief: CoreBrief;
  industryId: string;
  industryDetection?: IndustryDetectionResult;
  businessProfile?: BusinessIntelligenceProfile;
  agencyContract?: AgencyGenerationContract | null;
  onProgress?: (message: string) => void;
};

/**
 * Single authoritative routing engine — industry layout first, visual style tokens second.
 * Called from Master Website Planner before plan lock.
 */
export async function routeWebsiteGeneration(
  params: RouteWebsiteGenerationParams,
): Promise<UnifiedTemplateRoute> {
  const reasoningChain: string[] = [];
  const { brief } = params;
  const prompt = brief.prompt?.trim() || "";

  const businessIntel = getBusinessIntelligenceFromBrief(brief);
  const profile =
    params.businessProfile ??
    businessIntel?.profile ??
    params.agencyContract?.businessIntelligence.profile;

  const industryId = normalizeRoutingIndustryId(
    params.industryId ||
      profile?.routingIndustryId ||
      String(brief.metadata?.industryId || "business"),
  );
  reasoningChain.push(`Industry locked: ${industryId}`);

  const explicitStructureId =
    typeof brief.metadata?.websiteStructureTemplateId === "string"
      ? brief.metadata.websiteStructureTemplateId
      : null;
  const explicitTemplateId =
    typeof brief.metadata?.templateIntelligenceId === "string"
      ? brief.metadata.templateIntelligenceId
      : null;
  const explicitThemeId =
    typeof brief.metadata?.websiteThemeId === "string"
      ? brief.metadata.websiteThemeId
      : null;

  const structureSeed =
    (explicitStructureId
      ? getWebsiteStructureTemplate(explicitStructureId)
      : null) ??
    getWebsiteStructureTemplate(
      resolveStructureTemplateIdForIndustry(industryId).value,
    )!;

  reasoningChain.push(
    explicitStructureId
      ? `Structure explicit: ${structureSeed.id}`
      : `Structure from industry map: ${structureSeed.id}`,
  );

  const style =
    profile?.visualStyle.join(", ") ||
    params.industryDetection?.profile.designStyle ||
    (typeof brief.metadata?.brandStyle === "string"
      ? brief.metadata.brandStyle
      : "") ||
    structureSeed.label;

  const visualThemeLookup = resolveVisualThemePresetForIndustry(
    industryId,
    style,
    explicitThemeId,
  );
  const visualThemePresetId = visualThemeLookup.value;
  const visualThemeEntry = getWebsiteThemeEntry(visualThemePresetId)!;
  reasoningChain.push(
    `Visual theme tokens: ${visualThemePresetId} (AKB:${visualThemeLookup.entryId})`,
  );

  const layoutTiId =
    explicitTemplateId || structureSeed.templateIntelligenceId;
  let layoutTemplate =
    getTemplateIntelligence(layoutTiId) ||
    selectTemplateIntelligence({
      prompt,
      industry: industryId,
      businessType: profile?.subcategory || profile?.industry || "",
      targetAudience: profile?.audience.join(", ") || "",
      brandStyle: style,
      designStyle: style,
      explicitTemplateId: layoutTiId,
    }).template;

  const editorialLayoutBlocked = (template: typeof layoutTemplate) =>
    !isEditorialLayoutIndustry(industryId) &&
    isEditorialLayoutStructure(template.layoutStructure);

  if (editorialLayoutBlocked(layoutTemplate)) {
    const structureFallback = getTemplateIntelligence(
      structureSeed.templateIntelligenceId,
    );
    const industryFallback = listTemplateIntelligence({ industry: industryId }).find(
      (tpl) => tpl.industry === industryId && !editorialLayoutBlocked(tpl),
    );
    const fallback =
      (structureFallback && !editorialLayoutBlocked(structureFallback)
        ? structureFallback
        : null) ?? industryFallback;

    if (fallback) {
      layoutTemplate = fallback;
      reasoningChain.push(
        `Blocked editorial layoutStructure for ${industryId} — using TI ${fallback.id} (${fallback.layoutStructure})`,
      );
    }
  }

  reasoningChain.push(`Layout TI: ${layoutTemplate.id} (${layoutTemplate.layoutStructure})`);

  const layoutArch =
    getThemePageArchitecture(layoutTemplate.id) ||
    getThemePageArchitecture(visualThemeEntry.templateIntelligenceId);
  const layoutFamily = resolveIndustryLayoutFamily(industryId).value;
  const pageTopology = layoutArch?.pageTopology ?? "classic-stack";

  params.onProgress?.(
    `[template-router] ${industryId} · structure=${structureSeed.id} · layout=${layoutTemplate.id} · theme=${visualThemePresetId}`,
  );

  const premiumConfigured = await selectPremiumTemplate(brief, {
    preferredIndustryId: industryId,
    context: {
      industryId,
      businessType: profile?.industry,
      targetAudience: profile?.audience.join(", "),
      brandStyle: style,
      designStyle: profile?.tone,
      websiteGoal: profile?.designSystemHints.layoutApproach,
      explicitTemplateId:
        typeof brief.metadata?.premiumTemplateId === "string"
          ? brief.metadata.premiumTemplateId
          : params.industryDetection?.profile.preferredPremiumTemplateId,
    },
  });

  reasoningChain.push(
    `Premium template: ${premiumConfigured.template.id} (${premiumConfigured.source})`,
  );

  const route: UnifiedTemplateRoute = {
    version: "1",
    industryId,
    structureTemplateId: structureSeed.id,
    layoutTemplateIntelligenceId: layoutTemplate.id,
    visualThemePresetId,
    visualThemeTemplateIntelligenceId: visualThemeEntry.templateIntelligenceId,
    premiumTemplateId: premiumConfigured.template.id,
    layoutFamily,
    pageTopology,
    reason: `Industry-aware route · ${industryId} · ${structureSeed.id} · ${layoutTemplate.id}`,
    confidence:
      profile?.confidence ??
      params.industryDetection?.confidence ??
      premiumConfigured.confidence ??
      0.85,
    reasoningChain,
  };

  return route;
}

/** Apply locked premium template from unified route (avoids re-selection in runner). */
export function configurePremiumFromUnifiedRoute(
  brief: CoreBrief,
  route: UnifiedTemplateRoute,
) {
  const detection = brief.metadata?.industryIntelligence as
    | IndustryDetectionResult
    | undefined;
  const profile = getBusinessIntelligenceFromBrief(brief)?.profile;
  return configurePremiumTemplate({
    template: getPremiumTemplate(route.premiumTemplateId as never),
    websiteGoal: profile?.designSystemHints.layoutApproach,
    targetAudience: profile?.audience.join(", "),
    brandStyle: profile?.visualStyle.join(", "),
    designStyle: detection?.profile.designStyle,
    positioning: brief.prompt,
    confidence: route.confidence,
    reason: `Unified route premium: ${route.premiumTemplateId}`,
    source: "industry",
  });
}
