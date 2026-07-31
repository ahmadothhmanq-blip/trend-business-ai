import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { normalizeRoutingIndustryId } from "@/lib/ai-core/architecture-knowledge-base";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import {
  getDesignKnowledgeEntry,
} from "@/lib/ai-core/design-intelligence/knowledge-base/catalog";
import type { DesignPolicy } from "@/lib/ai-core/design-intelligence/die-types";
import type { PremiumStyleId } from "@/lib/ai-core/design-system/premium/types";

export type ResolveDesignPolicyParams = {
  industryId: string;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
};

export type ExplainableDesignPolicyLookup = {
  value: DesignPolicy;
  entryId: string;
  entryVersion: string;
  resolvedFrom: string[];
};

export function resolveDesignPolicy(
  params: ResolveDesignPolicyParams,
): ExplainableDesignPolicyLookup {
  const industryId = normalizeRoutingIndustryId(
    params.websiteGenerationPlan?.routingIndustryId ||
      params.businessProfile?.routingIndustryId ||
      params.masterPlan?.industry ||
      params.industryId ||
      "business",
  );

  const kb = getDesignKnowledgeEntry(industryId);
  const layoutFamily =
    params.websiteGenerationPlan?.layoutFamily ||
    params.masterPlan?.layout ||
    kb.layoutFamily;

  let allowedPremiumStyles = [...kb.allowedPremiumStyleIds];
  const themePreset = params.websiteGenerationPlan?.visualThemePresetId;
  if (themePreset === "luxury" && !allowedPremiumStyles.includes("luxury")) {
    allowedPremiumStyles = ["luxury", ...allowedPremiumStyles];
  }
  if (themePreset === "corporate" && !allowedPremiumStyles.includes("corporate")) {
    allowedPremiumStyles = ["corporate", ...allowedPremiumStyles];
  }

  const defaultPremium =
    (themePreset as PremiumStyleId | undefined) &&
    allowedPremiumStyles.includes(themePreset as PremiumStyleId)
      ? (themePreset as PremiumStyleId)
      : kb.defaultPremiumStyleId;

  const policy: DesignPolicy = {
    industryId,
    knowledgeEntryId: kb.id,
    layoutFamily: String(layoutFamily),
    allowedPremiumStyleIds: allowedPremiumStyles,
    defaultPremiumStyleId: defaultPremium,
    defaultLayoutVariationId: kb.defaultLayoutVariationId,
    forbiddenLayoutVariationIds: kb.forbiddenLayoutVariationIds,
    spacingDensity: kb.spacingDensity,
    colorStrategy: kb.colorStrategy,
    typographyStrategy: kb.typographyStrategy,
    componentCardStyle: kb.componentCardStyle,
    navigationStyle: kb.navigationStyle,
    minContrastRatio: kb.minContrastRatio,
    responsiveStrategy: kb.responsiveStrategy,
    visualHierarchyNotes: kb.visualHierarchyNotes,
    accessibilityPolicies: kb.accessibilityPolicies,
    lockedColors: params.masterPlan?.colorPalette ?? null,
    lockedTypography: params.masterPlan?.typography ?? null,
    requiredSections:
      params.websiteGenerationPlan?.sections ??
      params.masterPlan?.sections.map((s) => s.label) ??
      [],
  };

  return {
    value: policy,
    entryId: kb.id,
    entryVersion: kb.version,
    resolvedFrom: [
      `dkb:${kb.id}`,
      params.masterPlan ? `master-plan:${params.masterPlan.id}` : "",
      params.websiteGenerationPlan
        ? `website-generation-plan:${params.websiteGenerationPlan.industryId}`
        : "",
    ].filter(Boolean),
  };
}
