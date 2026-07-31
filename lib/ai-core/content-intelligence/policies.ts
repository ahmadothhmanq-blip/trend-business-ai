import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import { normalizeRoutingIndustryId } from "@/lib/ai-core/architecture-knowledge-base";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import {
  contentKnowledgeToPolicy,
  getContentKnowledgeEntry,
} from "@/lib/ai-core/content-intelligence/knowledge-base/catalog";
import type {
  ContentPolicy,
  ExplainableContentPolicyLookup,
} from "@/lib/ai-core/content-intelligence/types";

export type ResolveContentPolicyParams = {
  industryId: string;
  masterPlan?: MasterWebsitePlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
};

/**
 * Resolve content policy from Content Knowledge Base + master plan + BI profile.
 * No hardcoded industry logic — all rules come from CKB entries and locked plan facets.
 */
export function resolveContentPolicy(
  params: ResolveContentPolicyParams | MasterWebsitePlan,
): ExplainableContentPolicyLookup {
  const resolved =
    "industry" in params && "sections" in params
      ? {
          industryId: String(params.industry),
          masterPlan: params as MasterWebsitePlan,
          businessProfile: null,
        }
      : (params as ResolveContentPolicyParams);

  const industryId = normalizeRoutingIndustryId(
    resolved.businessProfile?.routingIndustryId ||
      resolved.industryId ||
      resolved.masterPlan?.industry ||
      "business",
  );

  const kbEntry = getContentKnowledgeEntry(industryId);
  const forbiddenFromBi =
    resolved.businessProfile?.forbiddenSubjects ?? [];
  const requiredSections =
    resolved.masterPlan?.sections.map((s) => s.label) ?? [];
  const heroKeywords =
    resolved.masterPlan?.imageKeywords ??
    resolved.businessProfile?.photographyStyle ??
    [];

  const policy: ContentPolicy = {
    industryId,
    ...contentKnowledgeToPolicy(kbEntry, {
      requiredSections,
      forbiddenSubjects: forbiddenFromBi,
      tone: resolved.masterPlan?.tone ?? resolved.businessProfile?.tone,
      primaryCta:
        resolved.masterPlan?.ctaPrimary ??
        resolved.businessProfile?.primaryCta,
      heroKeywords,
    }),
    knowledgeEntryId: kbEntry.id,
  };

  return {
    value: policy,
    entryId: kbEntry.id,
    entryVersion: kbEntry.version,
    resolvedFrom: [
      `ckb:${kbEntry.id}`,
      resolved.masterPlan ? `master-plan:${resolved.masterPlan.id}` : "",
      resolved.businessProfile
        ? `bi:${resolved.businessProfile.routingIndustryId}`
        : "",
    ].filter(Boolean),
  };
}
