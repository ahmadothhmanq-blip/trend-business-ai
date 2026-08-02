import { PLANNING_REASONING_TRACE_KEY } from "@/lib/ai-core/planning-reasoning-engine/types";
import {
  CONTENT_INTELLIGENCE_TRACE_KEY,
  CONTENT_INTELLIGENCE_VALIDATION_KEY,
} from "@/lib/ai-core/content-intelligence/types";
import {
  DESIGN_INTELLIGENCE_TRACE_KEY,
  DESIGN_INTELLIGENCE_SPEC_KEY,
} from "@/lib/ai-core/design-intelligence/die-types";
import {
  IMAGE_INTELLIGENCE_TRACE_KEY,
  IMAGE_INTELLIGENCE_SPEC_KEY,
} from "@/lib/ai-core/image-intelligence/iie-types";
import {
  SEO_AEO_INTELLIGENCE_TRACE_KEY,
  SEO_AEO_INTELLIGENCE_SPEC_KEY,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-types";
import {
  QUALITY_ASSURANCE_TRACE_KEY,
  QUALITY_SPECIFICATION_KEY,
} from "@/lib/ai-core/quality-assurance/qashe-types";
import type { AgentContract, AgentId } from "@/lib/ai-core/multi-agent-orchestration/maoe-types";

/** Agent Registry — SSOT for domain agent contracts. Engines remain logic owners. */
export const AGENT_REGISTRY: Record<AgentId, AgentContract> = {
  PRE: {
    id: "PRE",
    engineId: "planning-reasoning-engine",
    name: "Planning Agent",
    capabilities: [
      { id: "business-analysis", description: "Business intelligence and industry detection" },
      { id: "master-planning", description: "Authoritative master website plan" },
      { id: "architecture-routing", description: "Architecture validation and routing" },
    ],
    inputs: ["CoreBrief"],
    outputs: ["MasterWebsitePlan", "WebsiteGenerationPlan"],
    traceKey: PLANNING_REASONING_TRACE_KEY,
    dependsOn: [],
    preconditionRules: ["brief-present"],
    postconditionRules: ["planning-trace-present", "master-plan-locked"],
    parallelSafe: false,
    maxRetries: 2,
    sequentialRequired: true,
  },
  CIE: {
    id: "CIE",
    engineId: "content-intelligence-engine",
    name: "Content Agent",
    capabilities: [
      { id: "content-policy", description: "Industry content policy enforcement" },
      { id: "anti-cliche", description: "Anti-cliché and quality remediation" },
      { id: "production-pack", description: "Production-ready content pack" },
    ],
    inputs: ["BusinessIntelligenceProfile", "AgencyContentPack"],
    outputs: ["ProductionContentPack"],
    traceKey: CONTENT_INTELLIGENCE_TRACE_KEY,
    validationKey: CONTENT_INTELLIGENCE_VALIDATION_KEY,
    // Runtime: executed inside PRE phase 2 (agency orchestrator), not as a separate MAOE step.
    // See docs/MAOE_EXECUTION_ORDER.md
    dependsOn: ["PRE"],
    preconditionRules: ["pre-trace-or-master-plan"],
    postconditionRules: ["content-trace-present"],
    parallelSafe: false,
    maxRetries: 2,
    sequentialRequired: true,
  },
  DIE: {
    id: "DIE",
    engineId: "design-intelligence-engine",
    name: "Design Agent",
    capabilities: [
      { id: "design-system", description: "Design system specification" },
      { id: "layout-intelligence", description: "Layout and visual hierarchy" },
      { id: "brand-consistency", description: "Brand and accessibility policies" },
    ],
    inputs: ["CoreProductStrategy", "MasterWebsitePlan"],
    outputs: ["DesignSystemSpec", "VisualDesignPlan"],
    traceKey: DESIGN_INTELLIGENCE_TRACE_KEY,
    specKey: DESIGN_INTELLIGENCE_SPEC_KEY,
    validationKey: "designIntelligenceValidation",
    dependsOn: ["PRE", "CIE"],
    preconditionRules: ["master-plan-present"],
    postconditionRules: ["design-trace-present", "design-spec-locked"],
    parallelSafe: false,
    maxRetries: 2,
    sequentialRequired: true,
  },
  IIE: {
    id: "IIE",
    engineId: "image-intelligence-engine",
    name: "Image Agent",
    capabilities: [
      { id: "image-planning", description: "Shot planning and art direction" },
      { id: "provider-prompts", description: "Locked provider prompts" },
      { id: "color-harmony", description: "Color harmony from design spec" },
    ],
    inputs: ["DesignSystemSpec", "CoreProductStrategy"],
    outputs: ["ImageSystemSpec", "CoreAssetManifest"],
    traceKey: IMAGE_INTELLIGENCE_TRACE_KEY,
    specKey: IMAGE_INTELLIGENCE_SPEC_KEY,
    validationKey: "imageIntelligenceValidation",
    dependsOn: ["DIE"],
    preconditionRules: ["design-spec-present"],
    postconditionRules: ["image-trace-present", "image-spec-locked"],
    parallelSafe: false,
    maxRetries: 2,
    sequentialRequired: true,
  },
  SAIE: {
    id: "SAIE",
    engineId: "seo-aeo-intelligence-engine",
    name: "SEO & AEO Agent",
    capabilities: [
      { id: "seo-metadata", description: "Metadata and structured data" },
      { id: "aeo-optimization", description: "AI answer optimization" },
      { id: "internal-linking", description: "Internal linking and heading hierarchy" },
    ],
    inputs: ["ImageSystemSpec", "CoreProductStrategy", "GeneratedFiles"],
    outputs: ["SEOSpecification", "CoreSeoPackage"],
    traceKey: SEO_AEO_INTELLIGENCE_TRACE_KEY,
    specKey: SEO_AEO_INTELLIGENCE_SPEC_KEY,
    validationKey: "seoAeoIntelligenceValidation",
    dependsOn: ["IIE"],
    preconditionRules: ["strategy-present", "image-spec-or-trace"],
    postconditionRules: ["seo-trace-present", "seo-spec-locked"],
    parallelSafe: false,
    maxRetries: 2,
    sequentialRequired: true,
  },
  QASHE: {
    id: "QASHE",
    engineId: "quality-assurance-self-healing-engine",
    name: "Quality Assurance Agent",
    capabilities: [
      { id: "cross-engine-validation", description: "Unified pipeline validation" },
      { id: "self-healing", description: "Safe automated remediation" },
      { id: "production-approval", description: "QualitySpecification lock" },
    ],
    inputs: ["AllEngineTraces", "GeneratedFiles", "CoreSeoPackage"],
    outputs: ["QualitySpecification"],
    traceKey: QUALITY_ASSURANCE_TRACE_KEY,
    specKey: QUALITY_SPECIFICATION_KEY,
    validationKey: "qualityAssuranceValidation",
    dependsOn: ["PRE", "CIE", "DIE", "IIE", "SAIE"],
    preconditionRules: ["upstream-traces-available"],
    postconditionRules: ["quality-spec-locked"],
    parallelSafe: false,
    maxRetries: 1,
    sequentialRequired: true,
  },
};

export function getAgentContract(agentId: AgentId): AgentContract {
  return AGENT_REGISTRY[agentId];
}

export function discoverAgents(): AgentContract[] {
  return Object.values(AGENT_REGISTRY);
}

export function discoverAgentCapabilities(): Array<{
  agentId: AgentId;
  capability: AgentContract["capabilities"][number];
}> {
  return discoverAgents().flatMap((agent) =>
    agent.capabilities.map((capability) => ({
      agentId: agent.id,
      capability,
    })),
  );
}

export function getAgentsDependingOn(agentId: AgentId): AgentId[] {
  return discoverAgents()
    .filter((a) => a.dependsOn.includes(agentId))
    .map((a) => a.id);
}
