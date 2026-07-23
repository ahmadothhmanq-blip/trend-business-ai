import type { Agent, AgentExecution, AgentWorkflow, WorkflowStep } from "@/types/agents";

export type { Agent, AgentExecution, AgentWorkflow, WorkflowStep };

export type AgentToolKind = "read" | "write" | "action";

export type AgentTool = {
  id: string;
  user_id: string;
  organization_id: string | null;
  tool_key: string;
  label: string;
  description: string;
  category: string;
  kind: AgentToolKind;
  config: Record<string, unknown>;
  is_active: boolean;
  requires_permission: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AgentVersion = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string;
  version: number;
  snapshot: Record<string, unknown>;
  created_at: string;
};

export type AgentKnowledgeBase = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string | null;
  name: string;
  description: string;
  document_count: number;
  indexing_status: "pending" | "ready" | "failed";
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AgentKnowledgeDocument = {
  id: string;
  user_id: string;
  organization_id: string | null;
  knowledge_base_id: string;
  title: string;
  content: string;
  source_type: string;
  embedding_ready: boolean;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AgentMemoryEntry = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string;
  memory_type: "conversation" | "fact" | "context" | "preference" | "summary";
  key: string;
  content: string;
  relevance_score: number;
  expires_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AgentRun = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string | null;
  workflow_id: string | null;
  execution_id: string | null;
  task_name: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error_message: string | null;
  provider: string | null;
  model: string | null;
  token_usage: { prompt: number; completion: number; total: number };
  execution_time_ms: number;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
};

export type AgentRunStep = {
  id: string;
  user_id: string;
  run_id: string;
  step_index: number;
  step_name: string;
  step_type: string;
  status: "pending" | "running" | "completed" | "failed" | "skipped";
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  tool_key: string | null;
  duration_ms: number;
  error_message: string | null;
  created_at: string;
};

export type AgentWorkflowRun = {
  id: string;
  user_id: string;
  organization_id: string | null;
  workflow_id: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  steps_log: Record<string, unknown>[];
  error_message: string | null;
  execution_time_ms: number;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
};

export type AgentSchedule = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string | null;
  workflow_id: string | null;
  name: string;
  cron_expression: string;
  input: Record<string, unknown>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  total_runs: number;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AgentTrigger = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string | null;
  workflow_id: string | null;
  trigger_type: "manual" | "schedule" | "webhook" | "event" | "api";
  name: string;
  config: Record<string, unknown>;
  is_active: boolean;
  last_fired_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AgentPermission = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string;
  principal_type: "user" | "role" | "team";
  principal_id: string;
  permission: "view" | "run" | "edit" | "admin";
  created_at: string;
};

export type AgentAnalyticsRow = {
  id: string;
  user_id: string;
  organization_id: string | null;
  agent_id: string | null;
  period: string;
  total_runs: number;
  success_count: number;
  failure_count: number;
  avg_latency_ms: number;
  total_tokens: number;
  estimated_cost_cents: number;
  metadata: Record<string, unknown>;
  recorded_at: string;
};

export type AgentAnalyticsSummary = {
  totalRuns: number;
  successRate: number;
  failureCount: number;
  avgLatencyMs: number;
  totalTokens: number;
  estimatedCostCents: number;
};

export type AgentsAssistantAction =
  | "analyze_agent_performance"
  | "recommend_tools"
  | "optimize_workflow"
  | "summarize_executions"
  | "natural_language_query";
