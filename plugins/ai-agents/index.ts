import type { AIPlugin } from "@/lib/ai/engine";
import type { GenerationContext, ValidationResult, ExportResult } from "@/lib/ai/types";
import { agentAnalyzePrompt, agentPlanPrompt, agentExecutePrompt, agentSummarizePrompt } from "@/lib/ai/prompts/ai-agents";
import { agentAnalysisSchema, agentPlanSchema, agentStepOutputSchema, agentSummarySchema } from "./schemas";
import type { AgentPluginInput, AgentAnalysis, AgentPlanResult, AgentStepResult, AgentOutput } from "./types";

async function analyzeTask(input: AgentPluginInput, ctx: GenerationContext): Promise<AgentAnalysis> {
  ctx.progress.emit("Analyzing task requirements...");
  const raw = await ctx.provider.generateJson<AgentAnalysis>({
    prompt: agentAnalyzePrompt(input),
    schema: agentAnalysisSchema,
  });
  ctx.usage.add(ctx.provider.getLastUsage?.());
  return {
    taskSummary: raw.taskSummary ?? "",
    complexity: raw.complexity ?? "medium",
    requiredSteps: raw.requiredSteps ?? [],
    toolsNeeded: raw.toolsNeeded ?? [],
    estimatedTokens: raw.estimatedTokens ?? 2000,
    risks: raw.risks ?? [],
    clarifications: raw.clarifications ?? [],
  };
}

async function planExecution(input: AgentPluginInput, analysis: AgentAnalysis, ctx: GenerationContext): Promise<AgentPlanResult> {
  ctx.progress.emit("Creating execution plan...");
  const raw = await ctx.provider.generateJson<AgentPlanResult>({
    prompt: agentPlanPrompt({ ...input, analysis }),
    schema: agentPlanSchema,
  });
  ctx.usage.add(ctx.provider.getLastUsage?.());
  return {
    planName: raw.planName ?? "Execution Plan",
    steps: (raw.steps ?? []).map((s, i) => ({
      id: s.id ?? `step-${i + 1}`,
      name: s.name ?? `Step ${i + 1}`,
      description: s.description ?? "",
      tool: s.tool ?? null,
      action: s.action ?? "",
      expectedOutput: s.expectedOutput ?? "",
      dependsOn: s.dependsOn ?? [],
    })),
    expectedDuration: raw.expectedDuration ?? "",
    successCriteria: raw.successCriteria ?? [],
  };
}

async function executeAgent(input: AgentPluginInput, analysis: AgentAnalysis, plan: AgentPlanResult, ctx: GenerationContext): Promise<AgentOutput> {
  const maxSteps = Math.min(input.maxSteps ?? 8, plan.steps.length);
  const stepsToRun = plan.steps.slice(0, maxSteps);
  const stepResults: AgentStepResult[] = [];
  const previousOutputs: Record<string, unknown> = {};

  for (let i = 0; i < stepsToRun.length; i++) {
    const step = stepsToRun[i];
    ctx.progress.emit(`Executing step ${i + 1}/${stepsToRun.length}: ${step.name}...`);
    const start = Date.now();

    try {
      const raw = await ctx.provider.generateJson<{
        stepResult: string;
        data: Record<string, unknown>;
        notes: string[];
      }>({
        prompt: agentExecutePrompt({
          ...input,
          step,
          previousOutputs,
          memory: input.memory,
        }),
        schema: agentStepOutputSchema,
      });
      ctx.usage.add(ctx.provider.getLastUsage?.());

      const result: AgentStepResult = {
        stepId: step.id,
        stepName: step.name,
        result: raw.stepResult ?? "",
        data: raw.data ?? {},
        notes: raw.notes ?? [],
        durationMs: Date.now() - start,
      };
      stepResults.push(result);
      previousOutputs[step.id] = raw.data ?? {};
    } catch (err) {
      stepResults.push({
        stepId: step.id,
        stepName: step.name,
        result: `Error: ${err instanceof Error ? err.message : "Unknown error"}`,
        data: {},
        notes: [],
        durationMs: Date.now() - start,
      });
    }
  }

  ctx.progress.emit("Generating final summary...");
  const summaryRaw = await ctx.provider.generateJson<{
    title: string;
    summary: string;
    sections: { heading: string; content: string }[];
    deliverables: string[];
    recommendations: string[];
    metrics: Record<string, number>;
  }>({
    prompt: agentSummarizePrompt({
      task: input.task,
      agentType: input.agentType,
      stepResults: stepResults.map((s) => ({ name: s.stepName, result: s.result })),
    }),
    schema: agentSummarySchema,
  });
  ctx.usage.add(ctx.provider.getLastUsage?.());

  const files: { path: string; content: string }[] = [];
  files.push({
    path: "report.md",
    content: [
      `# ${summaryRaw.title ?? plan.planName}`,
      "",
      summaryRaw.summary ?? "",
      "",
      ...(summaryRaw.sections ?? []).flatMap((s) => [`## ${s.heading}`, "", s.content, ""]),
      "## Deliverables",
      ...(summaryRaw.deliverables ?? []).map((d) => `- ${d}`),
      "",
      "## Recommendations",
      ...(summaryRaw.recommendations ?? []).map((r) => `- ${r}`),
    ].join("\n"),
  });

  files.push({
    path: "execution-log.json",
    content: JSON.stringify({ plan: plan.planName, steps: stepResults, analysis }, null, 2),
  });

  return {
    title: summaryRaw.title ?? plan.planName,
    summary: summaryRaw.summary ?? "",
    sections: summaryRaw.sections ?? [],
    deliverables: summaryRaw.deliverables ?? [],
    recommendations: summaryRaw.recommendations ?? [],
    metrics: { ...(summaryRaw.metrics ?? {}), stepsCompleted: stepResults.length, totalSteps: stepsToRun.length },
    stepResults,
    files,
  };
}

async function validateOutput(output: AgentOutput): Promise<ValidationResult> {
  const issues: string[] = [];
  if (!output.title) issues.push("Missing title");
  if (!output.summary) issues.push("Missing summary");
  if (output.stepResults.length === 0) issues.push("No steps executed");
  return { valid: issues.length === 0, issues };
}

async function exportOutput(output: AgentOutput): Promise<ExportResult> {
  return {
    format: "json",
    data: {
      title: output.title,
      summary: output.summary,
      sections: output.sections,
      deliverables: output.deliverables,
      recommendations: output.recommendations,
      metrics: output.metrics,
      stepResults: output.stepResults,
      files: output.files,
    },
  };
}

export const aiAgentPlugin: AIPlugin<AgentPluginInput, AgentAnalysis, AgentPlanResult, AgentOutput> = {
  id: "ai-agents",
  name: "AI Agent",
  preferredProvider: "deepseek",
  analyze: analyzeTask,
  plan: planExecution,
  generate: executeAgent,
  validate: validateOutput,
  export: exportOutput,
};
