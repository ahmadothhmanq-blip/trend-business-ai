import type { AgencyGenerationContract } from "@/lib/ai-core/agency-orchestrator/types";
import type { ProductionContentPack } from "@/lib/ai-core/content/production-content";
import { agencyContentToProductionPack } from "@/lib/ai-core/content-intelligence/to-production-pack";
import { buildIndustryCopyPack } from "@/lib/ai-core/content/industry-copy";
import { buildProductionContentPack } from "@/lib/ai-core/content/production-content";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type { BusinessIntelligenceProfile } from "@/lib/ai-core/business-intelligence/types";
import { resolveContentPolicy } from "@/lib/ai-core/content-intelligence/policies";
import { remediateAgencyContent } from "@/lib/ai-core/content-intelligence/remediate";
import { validateAgencyContent } from "@/lib/ai-core/content-intelligence/validate-content";
import type {
  ContentIntelligenceTrace,
  ProductionContentResolution,
} from "@/lib/ai-core/content-intelligence/types";
import {
  CONTENT_INTELLIGENCE_ENGINE_ID,
  CONTENT_INTELLIGENCE_ENGINE_VERSION,
} from "@/lib/ai-core/content-intelligence/types";

export type ResolveProductionContentParams = {
  agencyContract?: AgencyGenerationContract | null;
  brandName: string;
  language?: string;
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  masterPlan?: MasterWebsitePlan | null;
  businessProfile?: BusinessIntelligenceProfile | null;
};

function buildTrace(
  industryId: string,
  source: ContentIntelligenceTrace["contentSource"],
  phases: ContentIntelligenceTrace["phases"],
  entries: ContentIntelligenceTrace["entries"],
  summary: string,
): ContentIntelligenceTrace {
  return {
    version: "1",
    engineId: CONTENT_INTELLIGENCE_ENGINE_ID,
    engineVersion: CONTENT_INTELLIGENCE_ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    industryId,
    contentSource: source,
    phases,
    entries,
    summary,
  };
}

/**
 * Authoritative content resolution — agency first, static CKB-aligned fallback last.
 * Validates, remediates, and traces every decision (EDS-003).
 */
export function resolveProductionContentWithIntelligence(
  params: ResolveProductionContentParams,
): ProductionContentResolution {
  const industryId =
    params.masterPlan?.industry ||
    params.businessProfile?.routingIndustryId ||
    params.profile?.industry ||
    "business";

  const policyLookup = resolveContentPolicy({
    industryId: String(industryId),
    masterPlan: params.masterPlan,
    businessProfile: params.businessProfile ?? null,
  });
  const policy = policyLookup.value;

  if (params.agencyContract?.content) {
    const phases: ContentIntelligenceTrace["phases"] = [
      "resolve",
      "policy-check",
      "remediation",
      "anti-cliche",
      "section-alignment",
      "production-pack",
    ];

    let content = params.agencyContract.content;
    const resolveEntry = {
      id: "cie-resolve-agency",
      phase: "resolve" as const,
      ruleId: "source-agency",
      passed: true,
      severity: "info" as const,
      message: `Agency LLM content selected · ${params.agencyContract.brandKit.companyName}`,
      knowledgeEntryId: policy.knowledgeEntryId,
      timestamp: new Date().toISOString(),
    };

    const { content: remediated, changes } = remediateAgencyContent(content, policy);
    content = remediated;
    const remediationEntries = changes.length
      ? [
          {
            id: "cie-remediate",
            phase: "remediation" as const,
            ruleId: "auto-remediate",
            passed: true,
            severity: "info" as const,
            message: `Auto-remediated fields: ${changes.join(", ")}`,
            knowledgeEntryId: policy.knowledgeEntryId,
            timestamp: new Date().toISOString(),
          },
        ]
      : [];

    const validation = validateAgencyContent(content, policy);
    const pack = agencyContentToProductionPack({
      content,
      brandKit: params.agencyContract.brandKit,
      profile: params.agencyContract.businessIntelligence.profile,
      language: params.language,
    });

    const productionEntry = {
      id: "cie-production-pack",
      phase: "production-pack" as const,
      ruleId: "agency-to-production",
      passed: true,
      severity: "info" as const,
      message: `Production pack built · hero="${pack.heroHeadline.slice(0, 40)}…"`,
      knowledgeEntryId: policy.knowledgeEntryId,
      timestamp: new Date().toISOString(),
    };

    const trace = buildTrace(
      policy.industryId,
      "agency",
      phases,
      [
        resolveEntry,
        ...remediationEntries,
        ...validation.trace,
        productionEntry,
      ],
      validation.valid
        ? validation.warnings.length > 0
          ? `Agency content valid with ${validation.warnings.length} warning(s).`
          : "Agency content passed all intelligence checks."
        : `Agency content failed: ${validation.errors.join("; ")}`,
    );

    return { pack, trace, validation, source: "agency", policy };
  }

  const copyPack = buildIndustryCopyPack({
    industryId: String(industryId),
    profile: params.profile ?? undefined,
    strategy: params.strategy ?? undefined,
    language: params.language,
  });
  const pack = buildProductionContentPack(
    copyPack,
    params.brandName,
    params.language,
  );

  const trace = buildTrace(
    policy.industryId,
    "static",
    ["resolve", "production-pack"],
    [
      {
        id: "cie-resolve-static",
        phase: "resolve",
        ruleId: "source-static",
        passed: true,
        severity: "info",
        message: `Static industry copy pack · industry=${industryId}`,
        knowledgeEntryId: policy.knowledgeEntryId,
        timestamp: new Date().toISOString(),
      },
      {
        id: "cie-static-pack",
        phase: "production-pack",
        ruleId: "static-to-production",
        passed: true,
        severity: "info",
        message: `Static production pack · hero="${pack.heroHeadline.slice(0, 40)}…"`,
        knowledgeEntryId: policy.knowledgeEntryId,
        timestamp: new Date().toISOString(),
      },
    ],
    "Static industry content pack used (no agency contract).",
  );

  return {
    pack,
    trace,
    validation: { valid: true, warnings: [], errors: [], trace: trace.entries },
    source: "static",
    policy,
  };
}

/** Backward-compatible resolver — returns pack only. */
export function resolveProductionContent(
  params: ResolveProductionContentParams,
): ProductionContentPack {
  return resolveProductionContentWithIntelligence(params).pack;
}
