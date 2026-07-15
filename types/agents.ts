/* ------------------------------------------------------------------ */
/*  Agent Definitions                                                  */
/* ------------------------------------------------------------------ */

export type AgentType =
  | "business-startup" | "marketing" | "content" | "seo"
  | "website" | "video-production" | "research" | "brand"
  | "social-media" | "analytics" | "custom";

export type AgentCategory = "business" | "marketing" | "content" | "design" | "development" | "research" | "automation" | "general";

export type AgentStatus = "active" | "inactive" | "draft";

export type Agent = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  description: string;
  agent_type: string;
  category: string;
  icon: string;
  system_prompt: string;
  tools: string[];
  capabilities: string[];
  config: Record<string, unknown>;
  provider: string | null;
  model: string | null;
  temperature: number;
  max_tokens: number;
  is_template: boolean;
  is_public: boolean;
  is_active: boolean;
  version: number;
  parent_agent_id: string | null;
  tags: string[];
  total_runs: number;
  total_tokens_used: number;
  avg_run_time_ms: number;
  created_at: string;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/*  Workflows                                                          */
/* ------------------------------------------------------------------ */

export type TriggerType = "manual" | "schedule" | "webhook" | "event" | "api";

export type WorkflowStepType = "agent" | "condition" | "delay" | "transform" | "notification" | "service";

export type WorkflowStep = {
  id: string;
  name: string;
  type: WorkflowStepType;
  agent_id?: string;
  service?: string;
  config: Record<string, unknown>;
  input_mapping: Record<string, string>;
  output_key: string;
  on_error: "stop" | "skip" | "retry";
  max_retries: number;
  position: { x: number; y: number };
  next_steps: string[];
};

export type AgentWorkflow = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  trigger_type: TriggerType;
  trigger_config: Record<string, unknown>;
  steps: WorkflowStep[];
  variables: Record<string, unknown>;
  is_active: boolean;
  last_run_at: string | null;
  total_runs: number;
  created_at: string;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/*  Executions                                                         */
/* ------------------------------------------------------------------ */

export type ExecutionStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export type ExecutionStepLog = {
  step_id: string;
  step_name: string;
  status: ExecutionStatus;
  input: unknown;
  output: unknown;
  started_at: string;
  completed_at?: string;
  duration_ms: number;
  token_usage?: { prompt: number; completion: number; total: number };
  error?: string;
};

export type AgentExecution = {
  id: string;
  user_id: string;
  agent_id: string | null;
  workflow_id: string | null;
  task_name: string;
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  steps_log: ExecutionStepLog[];
  status: ExecutionStatus;
  error_message: string | null;
  provider: string | null;
  model: string | null;
  token_usage: { prompt: number; completion: number; total: number };
  execution_time_ms: number;
  parent_execution_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  completed_at: string | null;
  agent?: Agent;
};

/* ------------------------------------------------------------------ */
/*  Memory                                                             */
/* ------------------------------------------------------------------ */

export type MemoryType = "conversation" | "fact" | "context" | "preference" | "summary";

export type AgentMemory = {
  id: string;
  agent_id: string;
  user_id: string;
  memory_type: MemoryType;
  key: string;
  content: string;
  relevance_score: number;
  expires_at: string | null;
  created_at: string;
};

/* ------------------------------------------------------------------ */
/*  Prompt Library                                                     */
/* ------------------------------------------------------------------ */

export type PromptLibraryEntry = {
  id: string;
  user_id: string;
  title: string;
  category: string;
  prompt_text: string;
  variables: string[];
  tags: string[];
  usage_count: number;
  is_public: boolean;
  created_at: string;
  updated_at: string;
};

/* ------------------------------------------------------------------ */
/*  Scheduled Jobs                                                     */
/* ------------------------------------------------------------------ */

export type ScheduledJob = {
  id: string;
  user_id: string;
  agent_id: string | null;
  workflow_id: string | null;
  name: string;
  cron_expression: string;
  input: Record<string, unknown>;
  is_active: boolean;
  last_run_at: string | null;
  next_run_at: string | null;
  total_runs: number;
  created_at: string;
};
