import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { normalizeRoutingIndustryId } from "@/lib/ai-core/architecture-knowledge-base";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { ImageSystemSpec } from "@/lib/ai-core/image-intelligence/iie-types";
import {
  getAeoKnowledgeEntry,
  getSeoKnowledgeEntry,
} from "@/lib/ai-core/seo-aeo-intelligence/knowledge-base/catalog";
import type { SeoPolicy } from "@/lib/ai-core/seo-aeo-intelligence/saie-types";

export type ResolveSeoPolicyParams = {
  industryId: string;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  imageSystemSpec?: ImageSystemSpec | null;
  premiumKeywords?: string[];
};

export type ExplainableSeoPolicyLookup = {
  value: SeoPolicy;
  entryId: string;
  entryVersion: string;
  resolvedFrom: string[];
};

export function resolveSeoPolicy(
  params: ResolveSeoPolicyParams,
): ExplainableSeoPolicyLookup {
  const industryId = normalizeRoutingIndustryId(
    params.websiteGenerationPlan?.routingIndustryId ||
      params.businessProfile?.routingIndustryId ||
      params.masterPlan?.industry ||
      params.industryId ||
      "business",
  );

  const skb = getSeoKnowledgeEntry(industryId);
  const akb = getAeoKnowledgeEntry(skb.aeoKnowledgeEntryId);

  const lockedKeywords = [
    ...new Set([
      ...(params.masterPlan?.imageKeywords ?? []),
      ...(params.websiteGenerationPlan?.imageKeywords ?? []),
      ...(params.premiumKeywords ?? []),
      ...skb.topicClusterSeeds,
    ]),
  ].filter(Boolean);

  const policy: SeoPolicy = {
    industryId,
    knowledgeEntryId: skb.id,
    aeoKnowledgeEntryId: akb.id,
    primaryIntent: skb.primaryIntent,
    minTitleLength: skb.minTitleLength,
    maxTitleLength: skb.maxTitleLength,
    minDescriptionLength: skb.minDescriptionLength,
    maxDescriptionLength: skb.maxDescriptionLength,
    requiredSchemaTypes: [...skb.requiredSchemaTypes],
    topicClusterSeeds: [...skb.topicClusterSeeds],
    internalLinkingMin: skb.internalLinkingMin,
    voiceSearchPatterns: [...skb.voiceSearchPatterns],
    featuredSnippetFormats: [...skb.featuredSnippetFormats],
    aeoCitationSignals: [...akb.citationSignals],
    headingRules: [...akb.headingRules],
    accessibilitySeoPolicies: [...akb.accessibilitySeoPolicies],
    lockedKeywords,
  };

  return {
    value: policy,
    entryId: skb.id,
    entryVersion: skb.version,
    resolvedFrom: [
      `skb:${skb.id}`,
      `aeo:${akb.id}`,
      params.masterPlan ? `master-plan:${params.masterPlan.id}` : "",
      params.websiteGenerationPlan
        ? `website-generation-plan:${params.websiteGenerationPlan.industryId}`
        : "",
      params.imageSystemSpec ? "image-system-spec" : "",
    ].filter(Boolean),
  };
}
