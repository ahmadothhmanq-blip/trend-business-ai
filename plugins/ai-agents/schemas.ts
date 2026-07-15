import { z } from "zod";

export const agentAnalysisSchema = z.object({
  taskSummary: z.string(),
  complexity: z.enum(["low", "medium", "high"]),
  requiredSteps: z.array(z.string()),
  toolsNeeded: z.array(z.string()),
  estimatedTokens: z.number().optional().default(2000),
  risks: z.array(z.string()).optional().default([]),
  clarifications: z.array(z.string()).optional().default([]),
});

export const agentPlanSchema = z.object({
  planName: z.string(),
  steps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    tool: z.string().nullable().optional().default(null),
    action: z.string(),
    expectedOutput: z.string().optional().default(""),
    dependsOn: z.array(z.string()).optional().default([]),
  })),
  expectedDuration: z.string().optional().default(""),
  successCriteria: z.array(z.string()).optional().default([]),
});

export const agentStepOutputSchema = z.object({
  stepResult: z.string(),
  data: z.record(z.string(), z.unknown()).optional().default({}),
  nextAction: z.string().optional().default(""),
  notes: z.array(z.string()).optional().default([]),
});

export const agentSummarySchema = z.object({
  title: z.string(),
  summary: z.string(),
  sections: z.array(z.object({
    heading: z.string(),
    content: z.string(),
  })).optional().default([]),
  deliverables: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),
  metrics: z.record(z.string(), z.number()).optional().default({}),
});
