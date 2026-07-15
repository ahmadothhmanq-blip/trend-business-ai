import { AGENT_TOOLS } from "@/lib/constants/ai-agents";
import { sanitizePromptInput } from "@/lib/ai/sanitize";

export function agentAnalyzePrompt(input: {
  task: string;
  agentType: string;
  systemPrompt: string;
  tools: string[];
  context?: string;
}): string {
  const task = sanitizePromptInput(input.task);
  const sysPrompt = sanitizePromptInput(input.systemPrompt);
  const ctx = input.context ? sanitizePromptInput(input.context) : "";
  const toolLabels = input.tools.map((t) => AGENT_TOOLS.find((at) => at.id === t)?.label ?? t).join(", ");
  return `You are an AI agent of type "${input.agentType}".

SYSTEM INSTRUCTIONS:
${sysPrompt}

AVAILABLE TOOLS: ${toolLabels || "None"}

USER TASK:
${task}

${ctx ? `CONTEXT:\n${ctx}` : ""}

Analyze this task and produce a JSON response:
{
  "taskSummary": "Brief summary of what needs to be done",
  "complexity": "low" | "medium" | "high",
  "requiredSteps": ["step1", "step2", ...],
  "toolsNeeded": ["tool-id-1", ...],
  "estimatedTokens": 2000,
  "risks": ["potential risk 1"],
  "clarifications": []
}

Return ONLY valid JSON.`;
}

export function agentPlanPrompt(input: {
  task: string;
  agentType: string;
  systemPrompt: string;
  tools: string[];
  analysis: { taskSummary: string; requiredSteps: string[]; toolsNeeded: string[] };
}): string {
  return `You are an AI agent of type "${input.agentType}".

SYSTEM INSTRUCTIONS:
${input.systemPrompt}

TASK: ${input.task}

ANALYSIS:
- Summary: ${input.analysis.taskSummary}
- Steps: ${input.analysis.requiredSteps.join(", ")}
- Tools needed: ${input.analysis.toolsNeeded.join(", ")}

Create a detailed execution plan as JSON:
{
  "planName": "Descriptive plan name",
  "steps": [
    {
      "id": "step-1",
      "name": "Step name",
      "description": "What this step does",
      "tool": "tool-id or null",
      "action": "What action to take",
      "expectedOutput": "What this step produces",
      "dependsOn": []
    }
  ],
  "expectedDuration": "5 minutes",
  "successCriteria": ["criterion 1"]
}

Return ONLY valid JSON.`;
}

export function agentExecutePrompt(input: {
  task: string;
  agentType: string;
  systemPrompt: string;
  step: { name: string; description: string; action: string; tool: string | null };
  previousOutputs: Record<string, unknown>;
  memory?: string[];
}): string {
  const prev = Object.keys(input.previousOutputs).length > 0
    ? `\nPREVIOUS STEP OUTPUTS:\n${JSON.stringify(input.previousOutputs, null, 2)}`
    : "";

  const mem = input.memory && input.memory.length > 0
    ? `\nAGENT MEMORY:\n${input.memory.join("\n")}`
    : "";

  return `You are an AI agent of type "${input.agentType}".

SYSTEM INSTRUCTIONS:
${input.systemPrompt}

OVERALL TASK: ${input.task}

CURRENT STEP: ${input.step.name}
DESCRIPTION: ${input.step.description}
ACTION: ${input.step.action}
${input.step.tool ? `TOOL: ${input.step.tool}` : ""}
${prev}${mem}

Execute this step and produce a detailed JSON response:
{
  "stepResult": "Detailed output of what was accomplished",
  "data": { ... },
  "nextAction": "What should happen next (if any)",
  "notes": ["any relevant notes"]
}

Be thorough and produce actionable results. Return ONLY valid JSON.`;
}

export function agentSummarizePrompt(input: {
  task: string;
  agentType: string;
  stepResults: { name: string; result: string }[];
}): string {
  const results = input.stepResults.map((s, i) => `${i + 1}. ${s.name}: ${s.result}`).join("\n");

  return `You are an AI agent of type "${input.agentType}".

COMPLETED TASK: ${input.task}

STEP RESULTS:
${results}

Create a comprehensive final summary as JSON:
{
  "title": "Report title",
  "summary": "Executive summary of everything accomplished",
  "sections": [
    {
      "heading": "Section title",
      "content": "Detailed content in markdown"
    }
  ],
  "deliverables": ["List of deliverables produced"],
  "recommendations": ["Follow-up recommendations"],
  "metrics": {
    "stepsCompleted": ${input.stepResults.length},
    "qualityScore": 85
  }
}

Return ONLY valid JSON.`;
}
