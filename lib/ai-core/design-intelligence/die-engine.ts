import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { getWebsiteGenerationPlanFromBrief } from "@/lib/ai-core/architecture-validation/orchestrate";
import {
  getBusinessIntelligenceFromBrief,
  type BusinessIntelligenceProfile,
} from "@/lib/ai-core/business-intelligence";
import { resolveDesignDNA } from "@/lib/ai-core/design-dna";
import type { DesignDNAPrinciples } from "@/lib/ai-core/design-dna/types";
import { analyzeDesignIntelligence } from "@/lib/ai-core/design-intelligence/analyze";
import { buildDesignSystemSpec } from "@/lib/ai-core/design-intelligence/build-spec";
import type {
  DesignIntelligenceEngineResult,
  DesignIntelligenceTrace,
} from "@/lib/ai-core/design-intelligence/die-types";
import {
  DESIGN_INTELLIGENCE_ENGINE_ID,
  DESIGN_INTELLIGENCE_ENGINE_VERSION,
  DESIGN_INTELLIGENCE_SPEC_KEY,
  DESIGN_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/design-intelligence/die-types";
import { resolveDesignPolicy } from "@/lib/ai-core/design-intelligence/policies";
import type { DesignIntelligenceBrief } from "@/lib/ai-core/design-intelligence/types";
import {
  applyDesignPolicyCorrections,
  validateDesignIntelligence,
} from "@/lib/ai-core/design-intelligence/validate-design";
import { getMasterWebsitePlan } from "@/lib/ai-core/master-planner/apply";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type {
  CoreBusinessProfile,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateDNAProfile } from "@/lib/ai-core/template-intelligence/template-dna";

export type RunDesignIntelligenceEngineParams = {
  profile?: CoreBusinessProfile | null;
  strategy?: CoreProductStrategy | null;
  industryId?: string | null;
  theme?: string | null;
  designStyle?: string | null;
  preferredStyle?: string | null;
  templateDna?: TemplateDNAProfile | null;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  designDna?: DesignDNAPrinciples | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  prompt?: string | null;
  onProgress?: (message: string) => void;
};

/**
 * Design Intelligence Engine (DIE) — EDS-004 authoritative entry.
 * Reasons about and defines the complete visual system before any rendering or image generation.
 */
export function runDesignIntelligenceEngine(
  params: RunDesignIntelligenceEngineParams,
): DesignIntelligenceEngineResult {
  const phases: DesignIntelligenceTrace["phases"] = [];
  const entries: DesignIntelligenceTrace["entries"] = [];

  params.onProgress?.("[die] Phase 1/4 · Resolving design policy from DKB + AKB…");
  phases.push("policy-resolve");

  const policyLookup = resolveDesignPolicy({
    industryId: String(
      params.industryId ||
        params.masterPlan?.industry ||
        params.websiteGenerationPlan?.industryId ||
        "business",
    ),
    masterPlan: params.masterPlan,
    websiteGenerationPlan: params.websiteGenerationPlan,
    businessProfile: params.businessProfile ?? null,
  });
  const policy = policyLookup.value;

  entries.push({
    id: `die-policy-${Date.now()}`,
    phase: "policy-resolve",
    ruleId: "dkb-policy",
    passed: true,
    severity: "info",
    message: `DKB policy ${policyLookup.entryId} · layout=${policy.layoutFamily} · premium=${policy.defaultPremiumStyleId}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[die] Phase 2/4 · Brand DNA + layout reasoning…");
  phases.push("brand-dna", "layout-reasoning");

  let brandDna = params.designDna ?? null;
  if (!brandDna && params.prompt && params.businessProfile) {
    brandDna = resolveDesignDNA({
      prompt: params.prompt,
      businessProfile: params.businessProfile,
    });
  }
  if (brandDna) {
    entries.push({
      id: `die-dna-${Date.now()}`,
      phase: "brand-dna",
      ruleId: "brand-dna-resolve",
      passed: true,
      severity: "info",
      message: `Brand DNA · ${brandDna.label} · ${brandDna.benchmark}`,
      knowledgeEntryId: policy.knowledgeEntryId,
      timestamp: new Date().toISOString(),
    });
  }

  let intelligence = analyzeDesignIntelligence({
    profile: params.profile,
    strategy: params.strategy,
    industryId: policy.industryId,
    theme: params.theme,
    designStyle: params.designStyle,
    preferredStyle: params.preferredStyle || policy.defaultPremiumStyleId,
    templateDna: params.templateDna,
  });

  entries.push({
    id: `die-layout-${Date.now()}`,
    phase: "layout-reasoning",
    ruleId: "layout-analysis",
    passed: true,
    severity: "info",
    message: `Layout · ${intelligence.layoutVariationId} · ${intelligence.premiumStyleId} · ${intelligence.layoutStyle}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[die] Phase 3/4 · Validating design decisions…");
  phases.push("validation");

  let validation = validateDesignIntelligence(
    intelligence,
    policy,
    params.websiteGenerationPlan,
  );

  if (!validation.valid) {
    intelligence = applyDesignPolicyCorrections(intelligence, policy);
    validation = validateDesignIntelligence(
      intelligence,
      policy,
      params.websiteGenerationPlan,
    );
    entries.push({
      id: `die-correct-${Date.now()}`,
      phase: "validation",
      ruleId: "policy-correction",
      passed: true,
      severity: "warning",
      message: `Applied DKB corrections: ${validation.corrections.join("; ")}`,
      knowledgeEntryId: policy.knowledgeEntryId,
      timestamp: new Date().toISOString(),
    });
  }

  entries.push(...validation.trace);

  params.onProgress?.("[die] Phase 4/4 · Locking DesignSystemSpec…");
  phases.push("color-system", "typography", "spacing-tokens", "component-styling", "hierarchy", "responsive", "accessibility", "spec-lock");

  const spec = buildDesignSystemSpec({
    intelligence,
    policy,
    brandDna,
  });

  entries.push({
    id: `die-spec-${Date.now()}`,
    phase: "spec-lock",
    ruleId: "design-system-spec",
    passed: validation.valid,
    severity: validation.valid ? "info" : "warning",
    message: `DesignSystemSpec locked · ${spec.premiumStyleId} · ${spec.layoutVariationId} · contrast≥${spec.accessibility.minContrastRatio}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  const trace: DesignIntelligenceTrace = {
    version: "1",
    engineId: DESIGN_INTELLIGENCE_ENGINE_ID,
    engineVersion: DESIGN_INTELLIGENCE_ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    industryId: policy.industryId,
    phases,
    entries,
    summary: validation.valid
      ? validation.warnings.length > 0
        ? `Design intelligence valid with ${validation.warnings.length} warning(s).`
        : "Design intelligence passed all DKB checks."
      : `Design intelligence corrected: ${validation.errors.join("; ")}`,
  };

  params.onProgress?.(
    `[die] Spec locked · ${spec.premiumStyleId} · ${spec.layoutVariationId} · trace=${trace.entries.length} decisions`,
  );

  return {
    spec,
    intelligence,
    validation,
    trace,
    policy,
  };
}

export function getDesignIntelligenceTraceFromBrief(
  brief: CoreBrief,
): DesignIntelligenceTrace | null {
  const raw = brief.metadata?.[DESIGN_INTELLIGENCE_TRACE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as DesignIntelligenceTrace;
}

export function getDesignSystemSpecFromBrief(
  brief: CoreBrief,
): DesignIntelligenceEngineResult["spec"] | null {
  const raw = brief.metadata?.[DESIGN_INTELLIGENCE_SPEC_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as DesignIntelligenceEngineResult["spec"];
}

export function runDesignIntelligenceFromBrief(
  brief: CoreBrief,
  params?: Omit<RunDesignIntelligenceEngineParams, "masterPlan" | "websiteGenerationPlan">,
): DesignIntelligenceEngineResult | null {
  const masterPlan = getMasterWebsitePlan(brief);
  const websiteGenerationPlan = getWebsiteGenerationPlanFromBrief(brief);
  if (!masterPlan && !params?.industryId) return null;

  const designDnaRaw = brief.metadata?.designDNA;
  const businessProfile =
    params?.businessProfile ??
    getBusinessIntelligenceFromBrief(brief)?.profile ??
    null;
  return runDesignIntelligenceEngine({
    ...params,
    masterPlan,
    websiteGenerationPlan,
    industryId: masterPlan?.industry ?? params?.industryId,
    businessProfile,
    designDna:
      designDnaRaw && typeof designDnaRaw === "object"
        ? (designDnaRaw as DesignDNAPrinciples)
        : params?.designDna,
    prompt: brief.prompt ?? params?.prompt,
  });
}

export function persistDesignIntelligenceOnBrief(
  brief: CoreBrief,
  result: DesignIntelligenceEngineResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [DESIGN_INTELLIGENCE_TRACE_KEY]: result.trace,
      [DESIGN_INTELLIGENCE_SPEC_KEY]: result.spec,
      designIntelligenceValidation: result.validation,
    },
  };
}

/** Apply DIE spec constraints onto an existing intelligence brief. */
export function intelligenceFromSpec(
  spec: DesignIntelligenceEngineResult["spec"],
): DesignIntelligenceBrief {
  return spec.intelligence;
}
