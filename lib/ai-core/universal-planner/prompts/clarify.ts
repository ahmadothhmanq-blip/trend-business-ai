import type { RequirementAnalysisResult } from "@/lib/ai-core/universal-planner/types";

export function universalPlannerClarifyPrompt(
  prompt: string,
  analysis: RequirementAnalysisResult,
): string {
  return `You are the Universal AI Planner clarification engine.

User request:
${prompt}

Current extracted requirements:
${JSON.stringify(analysis, null, 2)}

Task:
- Identify missing information that blocks production-grade planning.
- Ask only high-value questions.
- Prefer concise, actionable questions.
- Return question objects with: id, question, why, expectedAnswerFormat, priority.
`;
}
