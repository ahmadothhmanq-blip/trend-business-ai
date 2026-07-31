import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { WebsiteGenerationPlan } from "@/lib/ai-core/architecture-validation/types";
import { getWebsiteGenerationPlanFromBrief } from "@/lib/ai-core/architecture-validation/orchestrate";
import {
  getBusinessIntelligenceFromBrief,
  type BusinessIntelligenceProfile,
} from "@/lib/ai-core/business-intelligence";
import type { BrandIdentityBrief } from "@/lib/ai-core/brand-identity/types";
import type { DesignSystemSpec } from "@/lib/ai-core/design-intelligence/die-types";
import { DESIGN_INTELLIGENCE_SPEC_KEY } from "@/lib/ai-core/design-intelligence/die-types";
import { getDesignSystemSpecFromBrief } from "@/lib/ai-core/design-intelligence/die-engine";
import {
  buildImageSystemSpec,
} from "@/lib/ai-core/image-intelligence/build-spec";
import type {
  ImageIntelligenceEngineResult,
  ImageIntelligenceTrace,
} from "@/lib/ai-core/image-intelligence/iie-types";
import {
  IMAGE_INTELLIGENCE_ENGINE_ID,
  IMAGE_INTELLIGENCE_ENGINE_VERSION,
  IMAGE_INTELLIGENCE_SPEC_KEY,
  IMAGE_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/image-intelligence/iie-types";
import { resolveImagePolicy } from "@/lib/ai-core/image-intelligence/policies";
import {
  validateImageSpecifications,
} from "@/lib/ai-core/image-intelligence/validate-image";
import type {
  DesignPlanImageContext,
  StructuredImageRequirement,
} from "@/lib/ai-core/image-engine/types";
import { getMasterWebsitePlan } from "@/lib/ai-core/master-planner/apply";
import type { MasterWebsitePlan } from "@/lib/ai-core/master-planner/types";
import type {
  CoreBusinessProfile,
  CoreDesignSystem,
  CoreProductStrategy,
} from "@/lib/ai-core/layers/types";
import type { TemplateSelection } from "@/lib/ai-core/templates/types";

export type RunImageIntelligenceEngineParams = {
  strategy: CoreProductStrategy;
  designSystem: CoreDesignSystem;
  profile?: CoreBusinessProfile;
  templateSelection?: TemplateSelection;
  brandIdentity?: BrandIdentityBrief | null;
  preferredStyle?: string | null;
  designPlanImageRequirements?: string[];
  structuredImageRequirements?: StructuredImageRequirement[];
  designPlanContext?: DesignPlanImageContext;
  maxImages?: number;
  masterPlan?: MasterWebsitePlan | null;
  websiteGenerationPlan?: WebsiteGenerationPlan | null;
  designSystemSpec?: DesignSystemSpec | null;
  businessProfile?: BusinessIntelligenceProfile | null;
  onProgress?: (message: string) => void;
};

/**
 * Image Intelligence Engine (IIE) — EDS-005 authoritative entry.
 * Reasons about every required visual asset and locks ImageSpecifications before generation.
 */
export function runImageIntelligenceEngine(
  params: RunImageIntelligenceEngineParams,
): ImageIntelligenceEngineResult {
  const phases: ImageIntelligenceTrace["phases"] = [];
  const entries: ImageIntelligenceTrace["entries"] = [];

  params.onProgress?.("[iie] Phase 1/4 · Resolving image policy from IKB + DIE…");
  phases.push("policy-resolve");

  const policyLookup = resolveImagePolicy({
    industryId: String(
      params.masterPlan?.industry ||
        params.websiteGenerationPlan?.industryId ||
        params.profile?.industry ||
        "business",
    ),
    masterPlan: params.masterPlan,
    websiteGenerationPlan: params.websiteGenerationPlan,
    designSystemSpec: params.designSystemSpec,
    businessProfile: params.businessProfile ?? null,
    preferredStyle: params.preferredStyle,
  });
  const policy = policyLookup.value;

  entries.push({
    id: `iie-policy-${Date.now()}`,
    phase: "policy-resolve",
    ruleId: "ikb-policy",
    passed: true,
    severity: "info",
    message: `IKB policy ${policyLookup.entryId} · style=${policy.defaultImageStyle} · required=${policy.requiredPurposes.join(",")}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[iie] Phase 2/4 · Scene planning + composition reasoning…");
  phases.push(
    "purpose-classification",
    "placement-reasoning",
    "scene-planning",
    "composition",
    "style-reasoning",
    "lighting",
    "camera-perspective",
    "color-harmony",
  );

  const spec = buildImageSystemSpec({
    policy,
    designSystemSpec: params.designSystemSpec,
    strategy: params.strategy,
    designSystem: params.designSystem,
    profile: params.profile,
    templateSelection: params.templateSelection,
    preferredStyle: params.preferredStyle,
    brandIdentity: params.brandIdentity,
    structuredImageRequirements: params.structuredImageRequirements,
    designPlanImageRequirements: params.designPlanImageRequirements,
    designPlanContext: params.designPlanContext,
    maxImages: params.maxImages,
    masterPlan: params.masterPlan,
    businessProfile: params.businessProfile,
  });

  entries.push({
    id: `iie-plan-${Date.now()}`,
    phase: "scene-planning",
    ruleId: "image-specifications",
    passed: true,
    severity: "info",
    message: `Planned ${spec.specifications.length} ImageSpecifications · coverage=${spec.coverage.plannedPurposes.join(",")}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[iie] Phase 3/4 · Validating image specifications…");
  phases.push("accessibility", "seo-metadata", "validation");

  const validation = validateImageSpecifications(spec, policy);
  entries.push(...validation.trace);

  params.onProgress?.("[iie] Phase 4/4 · Locking ImageSystemSpec…");
  phases.push("spec-lock");

  entries.push({
    id: `iie-spec-${Date.now()}`,
    phase: "spec-lock",
    ruleId: "image-system-spec",
    passed: validation.valid,
    severity: validation.valid ? "info" : "warning",
    message: `ImageSystemSpec locked · ${spec.specifications.length} specs · style=${spec.imageStyle}`,
    knowledgeEntryId: policy.knowledgeEntryId,
    timestamp: new Date().toISOString(),
  });

  const trace: ImageIntelligenceTrace = {
    version: "1",
    engineId: IMAGE_INTELLIGENCE_ENGINE_ID,
    engineVersion: IMAGE_INTELLIGENCE_ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    industryId: policy.industryId,
    phases,
    entries,
    summary: validation.valid
      ? validation.warnings.length > 0
        ? `Image intelligence valid with ${validation.warnings.length} warning(s).`
        : "Image intelligence passed all IKB checks."
      : `Image intelligence issues: ${validation.errors.join("; ")}`,
  };

  params.onProgress?.(
    `[iie] Spec locked · ${spec.specifications.length} images · trace=${trace.entries.length} decisions`,
  );

  return { spec, validation, trace, policy };
}

export function getImageIntelligenceTraceFromBrief(
  brief: CoreBrief,
): ImageIntelligenceTrace | null {
  const raw = brief.metadata?.[IMAGE_INTELLIGENCE_TRACE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as ImageIntelligenceTrace;
}

export function getImageSystemSpecFromBrief(
  brief: CoreBrief,
): ImageIntelligenceEngineResult["spec"] | null {
  const raw = brief.metadata?.[IMAGE_INTELLIGENCE_SPEC_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as ImageIntelligenceEngineResult["spec"];
}

export function runImageIntelligenceFromBrief(
  brief: CoreBrief,
  params: Omit<
    RunImageIntelligenceEngineParams,
    "masterPlan" | "websiteGenerationPlan" | "designSystemSpec"
  >,
): ImageIntelligenceEngineResult | null {
  const masterPlan = getMasterWebsitePlan(brief);
  const websiteGenerationPlan = getWebsiteGenerationPlanFromBrief(brief);
  if (!params.strategy || !params.designSystem) return null;

  const designSystemSpec =
    getDesignSystemSpecFromBrief(brief) ??
    (brief.metadata?.[DESIGN_INTELLIGENCE_SPEC_KEY] as DesignSystemSpec | undefined) ??
    null;

  return runImageIntelligenceEngine({
    ...params,
    masterPlan,
    websiteGenerationPlan,
    designSystemSpec,
    businessProfile:
      params.businessProfile ??
      getBusinessIntelligenceFromBrief(brief)?.profile ??
      null,
  });
}

export function persistImageIntelligenceOnBrief(
  brief: CoreBrief,
  result: ImageIntelligenceEngineResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [IMAGE_INTELLIGENCE_TRACE_KEY]: result.trace,
      [IMAGE_INTELLIGENCE_SPEC_KEY]: result.spec,
      imageIntelligenceValidation: result.validation,
    },
  };
}
