import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { getWebsiteGenerationPlanFromBrief } from "@/lib/ai-core/architecture-validation/orchestrate";
import {
  getBusinessIntelligenceFromBrief,
  type BusinessIntelligenceProfile,
} from "@/lib/ai-core/business-intelligence";
import type { ImageSystemSpec } from "@/lib/ai-core/image-intelligence/iie-types";
import {
  IMAGE_INTELLIGENCE_SPEC_KEY,
} from "@/lib/ai-core/image-intelligence/iie-types";
import { getImageSystemSpecFromBrief } from "@/lib/ai-core/image-intelligence/iie-engine";
import { getMasterWebsitePlan } from "@/lib/ai-core/master-planner/apply";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import { buildSeoAeoSpecification } from "@/lib/ai-core/seo-aeo-intelligence/build-spec";
import type {
  SeoAeoIntelligenceEngineResult,
  SeoAeoIntelligenceTrace,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-types";
import {
  SEO_AEO_INTELLIGENCE_ENGINE_ID,
  SEO_AEO_INTELLIGENCE_ENGINE_VERSION,
  SEO_AEO_INTELLIGENCE_SPEC_KEY,
  SEO_AEO_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-types";
import { resolveSeoPolicy } from "@/lib/ai-core/seo-aeo-intelligence/policies";
import { validateSeoSpecification } from "@/lib/ai-core/seo-aeo-intelligence/validate-seo";
import type { AssembleSeoPackageInput } from "@/lib/ai-core/seo/assemble-package";

export type RunSeoAeoIntelligenceEngineParams = AssembleSeoPackageInput & {
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  imageSystemSpec?: ImageSystemSpec | null;
  onProgress?: (message: string) => void;
};

/**
 * SEO & AEO Intelligence Engine (SAIE) — EDS-006 authoritative entry.
 * Reasons about search visibility before any page is rendered or published.
 */
export function runSeoAeoIntelligenceEngine(
  params: RunSeoAeoIntelligenceEngineParams,
): SeoAeoIntelligenceEngineResult {
  const phases: SeoAeoIntelligenceTrace["phases"] = [];
  const entries: SeoAeoIntelligenceTrace["entries"] = [];

  params.onProgress?.("[saie] Phase 1/4 · Resolving SEO policy from SKB + AEO KB…");
  phases.push("policy-resolve");

  const policyLookup = resolveSeoPolicy({
    industryId: String(
      params.masterPlan?.industry ||
        params.websiteGenerationPlan?.industryId ||
        params.industryId ||
        params.profile?.industry ||
        "business",
    ),
    masterPlan: params.masterPlan,
    websiteGenerationPlan: params.websiteGenerationPlan,
    businessProfile: params.businessProfile ?? null,
    imageSystemSpec: params.imageSystemSpec,
    premiumKeywords: params.premiumKeywords,
  });
  const policy = policyLookup.value;

  entries.push({
    id: `saie-policy-${Date.now()}`,
    phase: "policy-resolve",
    ruleId: "skb-policy",
    passed: true,
    severity: "info",
    message: `SKB ${policyLookup.entryId} · intent=${policy.primaryIntent} · AEO ${policy.aeoKnowledgeEntryId}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[saie] Phase 2/4 · Keyword + semantic + entity reasoning…");
  phases.push(
    "keyword-intelligence",
    "search-intent",
    "topic-clustering",
    "entity-extraction",
    "metadata-planning",
    "structured-data",
    "open-graph",
    "canonical-urls",
    "url-structure",
    "internal-linking",
    "heading-hierarchy",
    "image-seo",
    "accessibility-seo",
    "aeo-optimization",
    "voice-search",
    "featured-snippets",
  );

  const spec = buildSeoAeoSpecification({
    ...params,
    policy,
  });

  entries.push({
    id: `saie-spec-${Date.now()}`,
    phase: "metadata-planning",
    ruleId: "seo-specification",
    passed: true,
    severity: "info",
    message: `SEOSpec locked · keywords=${spec.keywordIntelligence.primary} · schema=${spec.structuredData.map((s) => s.type).join(",")}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[saie] Phase 3/4 · Validating SEO specification…");
  phases.push("content-alignment", "validation");

  const validation = validateSeoSpecification(spec, policy);
  entries.push(...validation.trace);

  params.onProgress?.("[saie] Phase 4/4 · Locking SEOSpecification…");
  phases.push("spec-lock");

  entries.push({
    id: `saie-lock-${Date.now()}`,
    phase: "spec-lock",
    ruleId: "seo-aeo-spec-lock",
    passed: validation.valid,
    severity: validation.valid ? "info" : "warning",
    message: `SEOSpecification locked · AEO ${spec.aeo.readinessScore}/100 · links=${spec.internalLinks.length}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  const trace: SeoAeoIntelligenceTrace = {
    version: "1",
    engineId: SEO_AEO_INTELLIGENCE_ENGINE_ID,
    engineVersion: SEO_AEO_INTELLIGENCE_ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    industryId: policy.industryId,
    phases,
    entries,
    summary: validation.valid
      ? validation.warnings.length > 0
        ? `SEO/AEO intelligence valid with ${validation.warnings.length} warning(s).`
        : "SEO/AEO intelligence passed all SKB checks."
      : `SEO/AEO issues: ${validation.errors.join("; ")}`,
  };

  params.onProgress?.(
    `[saie] Spec locked · ${spec.metadata.title.slice(0, 40)}… · trace=${trace.entries.length} decisions`,
  );

  return { spec, validation, trace, policy };
}

export function getSeoAeoIntelligenceTraceFromBrief(
  brief: CoreBrief,
): SeoAeoIntelligenceTrace | null {
  const raw = brief.metadata?.[SEO_AEO_INTELLIGENCE_TRACE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as SeoAeoIntelligenceTrace;
}

export function getSeoAeoSpecificationFromBrief(
  brief: CoreBrief,
): SeoAeoIntelligenceEngineResult["spec"] | null {
  const raw = brief.metadata?.[SEO_AEO_INTELLIGENCE_SPEC_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as SeoAeoIntelligenceEngineResult["spec"];
}

export function runSeoAeoIntelligenceFromBrief(
  brief: CoreBrief,
  params: Omit<
    RunSeoAeoIntelligenceEngineParams,
    "masterPlan" | "websiteGenerationPlan" | "imageSystemSpec"
  >,
): SeoAeoIntelligenceEngineResult | null {
  if (!params.strategy) return null;
  return runSeoAeoIntelligenceEngine({
    ...params,
    masterPlan: getMasterWebsitePlan(brief),
    websiteGenerationPlan: getWebsiteGenerationPlanFromBrief(brief),
    imageSystemSpec:
      getImageSystemSpecFromBrief(brief) ??
      (brief.metadata?.[IMAGE_INTELLIGENCE_SPEC_KEY] as ImageSystemSpec | undefined) ??
      null,
    businessProfile:
      params.businessProfile ??
      getBusinessIntelligenceFromBrief(brief)?.profile ??
      null,
  });
}

export function persistSeoAeoIntelligenceOnBrief(
  brief: CoreBrief,
  result: SeoAeoIntelligenceEngineResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [SEO_AEO_INTELLIGENCE_TRACE_KEY]: result.trace,
      [SEO_AEO_INTELLIGENCE_SPEC_KEY]: result.spec,
      seoAeoIntelligenceValidation: result.validation,
    },
  };
}
