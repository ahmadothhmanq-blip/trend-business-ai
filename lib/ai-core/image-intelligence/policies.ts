import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { normalizeRoutingIndustryId } from "@/lib/ai-core/architecture-knowledge-base";
import type { DesignSystemSpec } from "@/lib/ai-core/design-intelligence/die-types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import type { ImageStylePreset } from "@/lib/ai-core/assets/settings";
import {
  getImageKnowledgeEntry,
} from "@/lib/ai-core/image-intelligence/knowledge-base/catalog";
import type { ImagePolicy } from "@/lib/ai-core/image-intelligence/iie-types";

export type ResolveImagePolicyParams = {
  industryId: string;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  designSystemSpec?: DesignSystemSpec | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  preferredStyle?: string | null;
};

export type ExplainableImagePolicyLookup = {
  value: ImagePolicy;
  entryId: string;
  entryVersion: string;
  resolvedFrom: string[];
};

function resolveImageStyle(
  preferred: string | null | undefined,
  designSpec: DesignSystemSpec | null | undefined,
  kbDefault: ImageStylePreset,
): ImageStylePreset {
  const candidates = [
    preferred,
    designSpec?.intelligence.imageStyle,
    designSpec?.premiumStyleId,
  ]
    .filter(Boolean)
    .map((s) => String(s).toLowerCase());

  const known: ImageStylePreset[] = [
    "luxury",
    "modern",
    "corporate",
    "minimal",
    "realistic",
    "cinematic",
    "premium-commercial",
  ];
  for (const c of candidates) {
    const match = known.find((k) => c.includes(k));
    if (match) return match;
  }
  return kbDefault;
}

export function resolveImagePolicy(
  params: ResolveImagePolicyParams,
): ExplainableImagePolicyLookup {
  const industryId = normalizeRoutingIndustryId(
    params.websiteGenerationPlan?.imagePolicy?.routingIndustryId ||
      params.businessProfile?.routingIndustryId ||
      params.websiteGenerationPlan?.routingIndustryId ||
      params.masterPlan?.industry ||
      params.industryId ||
      "business",
  );

  const kb = getImageKnowledgeEntry(industryId);

  const forbiddenSubjects = [
    ...new Set([
      ...kb.forbiddenSubjects,
      ...(params.websiteGenerationPlan?.imagePolicy?.forbiddenSubjects ?? []),
      ...(params.businessProfile?.forbiddenSubjects ?? []),
    ]),
  ];

  const photographyStyle = [
    ...new Set([
      ...(params.masterPlan?.locked.images && params.masterPlan.imageKeywords.length
        ? params.masterPlan.imageKeywords
        : []),
      ...(params.websiteGenerationPlan?.imagePolicy?.photographyStyle ?? []),
      ...(params.businessProfile?.photographyStyle ?? []),
      ...kb.photographyStyle,
    ]),
  ].filter(Boolean);

  const policy: ImagePolicy = {
    industryId,
    knowledgeEntryId: kb.id,
    requiredPurposes: [...kb.requiredPurposes],
    minImageCount: kb.minImageCount,
    maxImageCount: kb.maxImageCount,
    defaultImageStyle: resolveImageStyle(
      params.preferredStyle,
      params.designSystemSpec,
      kb.defaultImageStyle,
    ),
    photographyStyle,
    forbiddenSubjects,
    heroShotSeed: kb.heroShotSeed,
    storytellingNotes: kb.storytellingNotes,
    compositionGuidelines: kb.compositionGuidelines,
    lightingStrategy: kb.lightingStrategy,
    cameraStrategy: kb.cameraStrategy,
    colorHarmonyNotes: [
      ...kb.colorHarmonyNotes,
      params.designSystemSpec
        ? `Locked palette primary ${params.designSystemSpec.colorSystem.primary}`
        : "",
    ].filter(Boolean),
    accessibilityPolicies: kb.accessibilityPolicies,
    seoKeywordMinLength: kb.seoKeywordMinLength,
    lockedKeywords:
      params.masterPlan?.locked.images && params.masterPlan.imageKeywords.length
        ? params.masterPlan.imageKeywords
        : params.websiteGenerationPlan?.imageKeywords ?? [],
  };

  return {
    value: policy,
    entryId: kb.id,
    entryVersion: kb.version,
    resolvedFrom: [
      `ikb:${kb.id}`,
      params.masterPlan ? `master-plan:${params.masterPlan.id}` : "",
      params.websiteGenerationPlan
        ? `website-generation-plan:${params.websiteGenerationPlan.industryId}`
        : "",
      params.designSystemSpec ? "design-system-spec" : "",
    ].filter(Boolean),
  };
}
