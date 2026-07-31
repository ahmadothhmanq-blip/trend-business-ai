import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { getAgencyContractFromBrief } from "@/lib/ai-core/agency-orchestrator/orchestrate";
import { getBusinessIntelligenceFromBrief } from "@/lib/ai-core/business-intelligence";
import { getMasterWebsitePlan } from "@/lib/ai-core/master-planner/apply";
import { resolveContentPolicy } from "@/lib/ai-core/content-intelligence/policies";
import { remediateAgencyContent } from "@/lib/ai-core/content-intelligence/remediate";
import type {
  ContentIntelligenceEngineParams,
  ContentIntelligenceEngineResult,
  ContentIntelligenceTrace,
} from "@/lib/ai-core/content-intelligence/types";
import {
  CONTENT_INTELLIGENCE_ENGINE_ID,
  CONTENT_INTELLIGENCE_ENGINE_VERSION,
  CONTENT_INTELLIGENCE_TRACE_KEY,
  CONTENT_INTELLIGENCE_VALIDATION_KEY,
} from "@/lib/ai-core/content-intelligence/types";
import { validateAgencyContent } from "@/lib/ai-core/content-intelligence/validate-content";

/**
 * Content Intelligence Engine — validates and traces content against CKB policy.
 */
export function runContentIntelligenceEngine(
  params: ContentIntelligenceEngineParams,
): ContentIntelligenceEngineResult {
  const industryId =
    params.masterPlan?.industry ||
    params.businessProfile?.routingIndustryId ||
    params.industryId ||
    "business";

  const policyLookup = resolveContentPolicy({
    industryId: String(industryId),
    masterPlan: params.masterPlan,
    businessProfile: params.businessProfile,
  });
  const policy = policyLookup.value;

  if (!params.agencyContent) {
    const trace: ContentIntelligenceTrace = {
      version: "1",
      engineId: CONTENT_INTELLIGENCE_ENGINE_ID,
      engineVersion: CONTENT_INTELLIGENCE_ENGINE_VERSION,
      createdAt: new Date().toISOString(),
      industryId: policy.industryId,
      contentSource: "none",
      phases: ["resolve"],
      entries: [
        {
          id: "cie-no-agency-content",
          phase: "resolve",
          ruleId: "agency-content-missing",
          passed: true,
          severity: "info",
          message: "No agency content — static industry pack will be used at generation",
          knowledgeEntryId: policy.knowledgeEntryId,
          timestamp: new Date().toISOString(),
        },
      ],
      summary: "Content intelligence deferred to static pack fallback.",
    };
    return {
      validation: { valid: true, warnings: [], errors: [], trace: trace.entries },
      trace,
      policy,
    };
  }

  const { content: remediated, changes } = remediateAgencyContent(
    params.agencyContent,
    policy,
  );
  const validation = validateAgencyContent(remediated, policy);

  const remediationTrace =
    changes.length > 0
      ? [
          {
            id: "cie-remediate",
            phase: "remediation" as const,
            ruleId: "auto-remediate",
            passed: true,
            severity: "info" as const,
            message: `Auto-remediated: ${changes.join(", ")}`,
            knowledgeEntryId: policy.knowledgeEntryId,
            timestamp: new Date().toISOString(),
          },
        ]
      : [];

  const trace: ContentIntelligenceTrace = {
    version: "1",
    engineId: CONTENT_INTELLIGENCE_ENGINE_ID,
    engineVersion: CONTENT_INTELLIGENCE_ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    industryId: policy.industryId,
    contentSource: "agency",
    phases: ["policy-check", "remediation", "anti-cliche", "section-alignment"],
    entries: [...remediationTrace, ...validation.trace],
    summary: validation.valid
      ? validation.warnings.length > 0
        ? `Content valid with ${validation.warnings.length} warning(s).`
        : "Content passed all intelligence checks."
      : `Content failed: ${validation.errors.join("; ")}`,
  };

  return {
    validation,
    trace,
    policy,
    remediatedContent: remediated,
  };
}

export function getContentIntelligenceTraceFromBrief(
  brief: CoreBrief,
): ContentIntelligenceTrace | null {
  const raw = brief.metadata?.[CONTENT_INTELLIGENCE_TRACE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as ContentIntelligenceTrace;
}

export function runContentIntelligenceFromBrief(
  brief: CoreBrief,
): ContentIntelligenceEngineResult | null {
  const masterPlan = getMasterWebsitePlan(brief);
  const contract = getAgencyContractFromBrief(brief);
  const businessIntel = getBusinessIntelligenceFromBrief(brief);
  if (!masterPlan && !contract && !businessIntel) return null;

  return runContentIntelligenceEngine({
    masterPlan,
    businessProfile: businessIntel?.profile ?? null,
    industryId: masterPlan?.industry
      ? String(masterPlan.industry)
      : businessIntel?.profile.routingIndustryId,
    agencyContent: contract?.content ?? null,
    brandName: contract?.brandKit.companyName ?? masterPlan?.industryLabel ?? "Brand",
    language: brief.language,
  });
}

export function persistContentIntelligenceOnBrief(
  brief: CoreBrief,
  result: ContentIntelligenceEngineResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [CONTENT_INTELLIGENCE_TRACE_KEY]: result.trace,
      [CONTENT_INTELLIGENCE_VALIDATION_KEY]: result.validation,
    },
  };
}

export const persistContentIntelligenceTraceOnBrief = persistContentIntelligenceOnBrief;
