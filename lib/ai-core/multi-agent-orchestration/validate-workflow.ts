import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { MASTER_WEBSITE_PLAN_KEY } from "@/lib/ai-core/master-planner/types";
import { PLANNING_REASONING_TRACE_KEY } from "@/lib/ai-core/planning-reasoning-engine/types";
import { CONTENT_INTELLIGENCE_TRACE_KEY } from "@/lib/ai-core/content-intelligence/types";
import {
  DESIGN_INTELLIGENCE_SPEC_KEY,
  DESIGN_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/design-intelligence/die-types";
import {
  IMAGE_INTELLIGENCE_SPEC_KEY,
  IMAGE_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/image-intelligence/iie-types";
import {
  SEO_AEO_INTELLIGENCE_SPEC_KEY,
  SEO_AEO_INTELLIGENCE_TRACE_KEY,
} from "@/lib/ai-core/seo-aeo-intelligence/saie-types";
import {
  QUALITY_SPECIFICATION_KEY,
  QUALITY_ASSURANCE_TRACE_KEY,
} from "@/lib/ai-core/quality-assurance/qashe-types";
import type {
  AgentId,
  MaoeTraceEntry,
  MaoeValidation,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-types";
import { getAgentContract } from "@/lib/ai-core/multi-agent-orchestration/agent-registry";

let traceCounter = 0;

function trace(
  ruleId: string,
  passed: boolean,
  severity: MaoeTraceEntry["severity"],
  message: string,
  agentId?: AgentId,
): MaoeTraceEntry {
  traceCounter += 1;
  return {
    id: `maoe-val-${Date.now()}-${traceCounter}`,
    phase: "cross-agent-validation",
    ruleId,
    agentId,
    passed,
    severity,
    message,
    timestamp: new Date().toISOString(),
  };
}

export function resetMaoeValidationTraceCounter(): void {
  traceCounter = 0;
}

function hasMetadataKey(brief: CoreBrief, key: string): boolean {
  return Boolean(brief.metadata?.[key]);
}

export function validateAgentPreconditions(
  agentId: AgentId,
  brief: CoreBrief,
): MaoeValidation {
  const entries: MaoeTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const contract = getAgentContract(agentId);

  for (const rule of contract.preconditionRules) {
    switch (rule) {
      case "brief-present":
        entries.push(
          trace("brief-present", Boolean(brief.prompt), "info", "Brief present", agentId),
        );
        break;
      case "pre-trace-or-master-plan": {
        const ok =
          hasMetadataKey(brief, PLANNING_REASONING_TRACE_KEY) ||
          hasMetadataKey(brief, MASTER_WEBSITE_PLAN_KEY);
        if (!ok) warnings.push("PRE trace or master plan not yet on brief");
        entries.push(
          trace(
            "pre-trace-or-master-plan",
            ok,
            ok ? "info" : "warning",
            ok ? "Planning artifacts available" : "Planning artifacts pending",
            agentId,
          ),
        );
        break;
      }
      case "master-plan-present": {
        const ok = hasMetadataKey(brief, MASTER_WEBSITE_PLAN_KEY);
        if (!ok) errors.push("Master website plan required before design");
        entries.push(
          trace(
            "master-plan-present",
            ok,
            ok ? "info" : "error",
            ok ? "Master plan present" : "Master plan missing",
            agentId,
          ),
        );
        break;
      }
      case "design-spec-present": {
        const ok =
          hasMetadataKey(brief, DESIGN_INTELLIGENCE_SPEC_KEY) ||
          hasMetadataKey(brief, DESIGN_INTELLIGENCE_TRACE_KEY);
        if (!ok) warnings.push("Design spec/trace not yet on brief (may run in same phase)");
        entries.push(
          trace(
            "design-spec-present",
            ok,
            ok ? "info" : "warning",
            ok ? "Design artifacts available" : "Design artifacts pending",
            agentId,
          ),
        );
        break;
      }
      case "strategy-present":
        entries.push(
          trace("strategy-present", true, "info", "Strategy validated at adapter layer", agentId),
        );
        break;
      case "image-spec-or-trace": {
        const ok =
          hasMetadataKey(brief, IMAGE_INTELLIGENCE_SPEC_KEY) ||
          hasMetadataKey(brief, IMAGE_INTELLIGENCE_TRACE_KEY);
        if (!ok) warnings.push("Image spec/trace not yet on brief");
        entries.push(
          trace(
            "image-spec-or-trace",
            ok,
            ok ? "info" : "warning",
            ok ? "Image artifacts available" : "Image artifacts pending",
            agentId,
          ),
        );
        break;
      }
      case "upstream-traces-available": {
        const required = ["PRE", "CIE", "DIE", "IIE", "SAIE"] as const;
        const traceKeys: Record<string, string> = {
          PRE: PLANNING_REASONING_TRACE_KEY,
          CIE: CONTENT_INTELLIGENCE_TRACE_KEY,
          DIE: DESIGN_INTELLIGENCE_TRACE_KEY,
          IIE: IMAGE_INTELLIGENCE_TRACE_KEY,
          SAIE: SEO_AEO_INTELLIGENCE_TRACE_KEY,
        };
        const missing = required.filter((id) => !hasMetadataKey(brief, traceKeys[id]));
        if (missing.length > 0) {
          warnings.push(`Upstream traces missing: ${missing.join(", ")}`);
        }
        entries.push(
          trace(
            "upstream-traces",
            missing.length === 0,
            missing.length === 0 ? "info" : "warning",
            missing.length === 0
              ? "All upstream traces available"
              : `Missing traces: ${missing.join(", ")}`,
            agentId,
          ),
        );
        break;
      }
      default:
        entries.push(trace(rule, true, "info", `Rule ${rule} acknowledged`, agentId));
    }
  }

  for (const dep of contract.dependsOn) {
    const depContract = getAgentContract(dep);
    const depPresent = hasMetadataKey(brief, depContract.traceKey);
    if (!depPresent) {
      warnings.push(`Dependency ${dep} trace not yet present`);
    }
    entries.push(
      trace(
        `dependency-${dep}`,
        depPresent,
        depPresent ? "info" : "warning",
        depPresent ? `${dep} dependency satisfied` : `${dep} dependency pending`,
        agentId,
      ),
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
  };
}

export function validateAgentPostconditions(
  agentId: AgentId,
  brief: CoreBrief,
): MaoeValidation {
  const entries: MaoeTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const contract = getAgentContract(agentId);

  const tracePresent = hasMetadataKey(brief, contract.traceKey);
  if (!tracePresent) {
    errors.push(`${agentId} trace not persisted on brief`);
  }
  entries.push(
    trace(
      "agent-trace",
      tracePresent,
      tracePresent ? "info" : "error",
      tracePresent ? `${agentId} trace present` : `${agentId} trace missing`,
      agentId,
    ),
  );

  if (contract.specKey) {
    const specPresent = hasMetadataKey(brief, contract.specKey);
    if (!specPresent) {
      warnings.push(`${agentId} spec key ${contract.specKey} not on brief`);
    }
    entries.push(
      trace(
        "agent-spec",
        specPresent,
        specPresent ? "info" : "warning",
        specPresent ? `${agentId} spec locked` : `${agentId} spec pending`,
        agentId,
      ),
    );
  }

  if (agentId === "QASHE") {
    const specOk = hasMetadataKey(brief, QUALITY_SPECIFICATION_KEY);
    if (!specOk) errors.push("QualitySpecification not locked");
    entries.push(
      trace(
        "quality-spec-locked",
        specOk,
        specOk ? "info" : "error",
        specOk ? "QualitySpecification locked" : "QualitySpecification missing",
        agentId,
      ),
    );
  }

  if (agentId === "SAIE") {
    const specOk = hasMetadataKey(brief, SEO_AEO_INTELLIGENCE_SPEC_KEY);
    entries.push(
      trace(
        "seo-spec-locked",
        specOk,
        specOk ? "info" : "warning",
        specOk ? "SEOSpecification locked" : "SEOSpecification pending",
        agentId,
      ),
    );
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
  };
}

export function validateWorkflowCompletion(
  brief: CoreBrief,
): MaoeValidation {
  const entries: MaoeTraceEntry[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  const agents: AgentId[] = ["PRE", "CIE", "DIE", "IIE", "SAIE", "QASHE"];
  for (const agentId of agents) {
    const contract = getAgentContract(agentId);
    const present = hasMetadataKey(brief, contract.traceKey);
    if (!present) warnings.push(`${agentId} was not executed or trace missing`);
    entries.push(
      trace(
        `workflow-${agentId}`,
        present,
        present ? "info" : "warning",
        present ? `${agentId} completed` : `${agentId} not recorded`,
        agentId,
      ),
    );
  }

  const qasheOk =
    hasMetadataKey(brief, QUALITY_ASSURANCE_TRACE_KEY) &&
    hasMetadataKey(brief, QUALITY_SPECIFICATION_KEY);
  if (!qasheOk) {
    errors.push("Final quality gate not satisfied");
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
    trace: entries,
  };
}
