import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  detectTargetServices,
  mapCapabilities,
} from "@/lib/ai-core/universal-planner/requirements/capability-mapper";
import type {
  PlannerIntent,
  RequirementAnalysisResult,
} from "@/lib/ai-core/universal-planner/types";

function deriveIntent(brief: CoreBrief, targetServices: string[]): PlannerIntent {
  const prompt = brief.prompt.trim();
  const goals = (brief.features || []).slice(0, 12);
  const constraints: string[] = [];

  if (prompt.toLowerCase().includes("do not")) constraints.push("Respect explicit user prohibitions.");
  if (prompt.toLowerCase().includes("production")) constraints.push("Production-ready output required.");

  return {
    summary: prompt,
    goals,
    constraints,
    requestedServices: targetServices as PlannerIntent["requestedServices"],
    requestedOutputs: ["blueprint", "execution-plan"],
  };
}

export function analyzeUniversalRequirements(
  brief: CoreBrief,
): RequirementAnalysisResult {
  const targetServices = detectTargetServices(brief);
  const capabilities = mapCapabilities(brief);
  const intent = deriveIntent(brief, targetServices);
  const missingRequirements: string[] = [];

  if (!intent.summary || intent.summary.length < 12) {
    missingRequirements.push("business-objective");
  }
  if (capabilities.database.required && !capabilities.database.entities?.length) {
    missingRequirements.push("data-entities");
  }
  if (targetServices.includes("future-service")) {
    missingRequirements.push("target-service");
  }

  return {
    intent,
    capabilities,
    domainHints: [
      String(brief.metadata?.industry || ""),
      brief.productId,
    ].filter(Boolean),
    targetServices,
    missingRequirements,
  };
}
