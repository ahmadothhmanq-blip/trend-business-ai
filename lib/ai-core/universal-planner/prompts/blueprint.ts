import type { CoreBrief } from "@/lib/ai-core/layers/types";
import type { RequirementAnalysisResult } from "@/lib/ai-core/universal-planner/types";

export function universalPlannerBlueprintPrompt(
  brief: CoreBrief,
  requirements: RequirementAnalysisResult,
): string {
  return `You are the Universal AI Planner blueprint generator.

Core brief:
${JSON.stringify(brief, null, 2)}

Requirements:
${JSON.stringify(requirements, null, 2)}

Generate a universal, service-agnostic blueprint with:
- intent
- requirements matrix
- clarification needs
- per-service planning contracts
- trace references

Return strict JSON only.`;
}
