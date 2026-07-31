import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { normalizeRoutingIndustryId } from "@/lib/ai-core/architecture-knowledge-base";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import { getQualityKnowledgeEntry } from "@/lib/ai-core/quality-assurance/knowledge-base/catalog";
import type { QualityPolicy } from "@/lib/ai-core/quality-assurance/qashe-types";

export type ResolveQualityPolicyParams = {
  industryId: string;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
};

export type ExplainableQualityPolicyLookup = {
  value: QualityPolicy;
  entryId: string;
  entryVersion: string;
  resolvedFrom: string[];
};

export function resolveQualityPolicy(
  params: ResolveQualityPolicyParams,
): ExplainableQualityPolicyLookup {
  const industryId = normalizeRoutingIndustryId(
    params.websiteGenerationPlan?.routingIndustryId ||
      params.businessProfile?.routingIndustryId ||
      params.masterPlan?.industry ||
      params.industryId ||
      "business",
  );

  const kb = getQualityKnowledgeEntry(industryId);

  const policy: QualityPolicy = {
    industryId,
    knowledgeEntryId: kb.id,
    minConfidenceScore: kb.minConfidenceScore,
    minPublishScore: kb.minPublishScore,
    requiredEngineTraces: [...kb.requiredEngineTraces],
    requiredDimensions: [...kb.requiredDimensions],
    autoHealEnabled: kb.autoHealEnabled,
    maxAutoHealActions: kb.maxAutoHealActions,
    forbiddenPlaceholderPhrases: [...kb.forbiddenPlaceholderPhrases],
    securityChecks: [...kb.securityChecks],
    complianceChecks: [...kb.complianceChecks],
  };

  return {
    value: policy,
    entryId: kb.id,
    entryVersion: kb.version,
    resolvedFrom: [
      `qkb:${kb.id}`,
      params.masterPlan ? `master-plan:${params.masterPlan.id}` : "",
      params.websiteGenerationPlan
        ? `website-generation-plan:${params.websiteGenerationPlan.industryId}`
        : "",
    ].filter(Boolean),
  };
}
