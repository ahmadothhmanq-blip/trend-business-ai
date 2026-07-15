export type AgentPluginInput = {
  task: string;
  agentType: string;
  systemPrompt: string;
  tools: string[];
  context?: string;
  memory?: string[];
  maxSteps?: number;
};

export type AgentAnalysis = {
  taskSummary: string;
  complexity: "low" | "medium" | "high";
  requiredSteps: string[];
  toolsNeeded: string[];
  estimatedTokens: number;
  risks: string[];
  clarifications: string[];
};

export type AgentPlanStep = {
  id: string;
  name: string;
  description: string;
  tool: string | null;
  action: string;
  expectedOutput: string;
  dependsOn: string[];
};

export type AgentPlanResult = {
  planName: string;
  steps: AgentPlanStep[];
  expectedDuration: string;
  successCriteria: string[];
};

export type AgentStepResult = {
  stepId: string;
  stepName: string;
  result: string;
  data: Record<string, unknown>;
  notes: string[];
  durationMs: number;
};

export type AgentOutputSection = {
  heading: string;
  content: string;
};

export type AgentOutput = {
  title: string;
  summary: string;
  sections: AgentOutputSection[];
  deliverables: string[];
  recommendations: string[];
  metrics: Record<string, number>;
  stepResults: AgentStepResult[];
  files: { path: string; content: string }[];
};
