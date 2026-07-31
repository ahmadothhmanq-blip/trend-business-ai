import type { CoreBrief } from "@/lib/ai-core/layers/types";

export const MAOE_TRACE_KEY = "multiAgentOrchestrationTrace";
export const MAOE_WORKFLOW_STATE_KEY = "multiAgentWorkflowState";
export const MAOE_SHARED_MEMORY_KEY = "multiAgentSharedMemory";
export const MAOE_EXECUTION_PLAN_KEY = "multiAgentExecutionPlan";
export const MAOE_ENGINE_ID = "multi-agent-orchestration-engine";
export const MAOE_ENGINE_VERSION = "1.0.0";

export type AgentId = "PRE" | "CIE" | "DIE" | "IIE" | "SAIE" | "QASHE";

export type AgentHealthStatus =
  | "pending"
  | "ready"
  | "running"
  | "completed"
  | "failed"
  | "skipped"
  | "escalated";

export type MaoePhaseId =
  | "workflow-init"
  | "agent-discovery"
  | "dependency-resolution"
  | "scheduling"
  | "agent-execution"
  | "context-sharing"
  | "cross-agent-validation"
  | "failure-recovery"
  | "human-escalation"
  | "workflow-complete";

export type MaoeTraceEntry = {
  id: string;
  phase: MaoePhaseId;
  ruleId: string;
  agentId?: AgentId;
  passed: boolean;
  severity: "info" | "warning" | "error" | "critical";
  message: string;
  timestamp: string;
  durationMs?: number;
};

export type MultiAgentOrchestrationTrace = {
  version: "1";
  engineId: typeof MAOE_ENGINE_ID;
  engineVersion: typeof MAOE_ENGINE_VERSION;
  createdAt: string;
  workflowId: string;
  phases: MaoePhaseId[];
  entries: MaoeTraceEntry[];
  summary: string;
};

export type AgentCapability = {
  id: string;
  description: string;
};

export type AgentContract = {
  id: AgentId;
  engineId: string;
  name: string;
  capabilities: AgentCapability[];
  inputs: string[];
  outputs: string[];
  traceKey: string;
  specKey?: string;
  validationKey?: string;
  dependsOn: AgentId[];
  preconditionRules: string[];
  postconditionRules: string[];
  parallelSafe: boolean;
  maxRetries: number;
  sequentialRequired: boolean;
};

export type AgentExecutionState = {
  agentId: AgentId;
  status: AgentHealthStatus;
  startedAt?: string;
  completedAt?: string;
  attempts: number;
  error?: string;
  durationMs?: number;
  escalated?: boolean;
};

export type WorkflowState = {
  version: "1";
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed" | "escalated";
  agents: AgentExecutionState[];
  currentAgent?: AgentId;
  parallelGroups: AgentId[][];
  startedAt: string;
  completedAt?: string;
};

export type ExecutionPlanStep = {
  agentId: AgentId;
  order: number;
  dependsOn: AgentId[];
  parallelGroup: number;
};

export type ExecutionPlan = {
  version: "1";
  workflowId: string;
  steps: ExecutionPlanStep[];
  totalAgents: number;
};

export type SharedMemoryEntry = {
  key: string;
  agentId: AgentId;
  artifactType: string;
  timestamp: string;
};

export type SharedMemory = {
  version: "1";
  entries: SharedMemoryEntry[];
  artifacts: Record<string, unknown>;
};

export type MaoeEventType =
  | "workflow:started"
  | "workflow:completed"
  | "workflow:failed"
  | "agent:scheduled"
  | "agent:started"
  | "agent:completed"
  | "agent:failed"
  | "agent:retry"
  | "agent:escalated"
  | "context:shared"
  | "validation:passed"
  | "validation:failed";

export type MaoeEvent = {
  id: string;
  type: MaoeEventType;
  agentId?: AgentId;
  timestamp: string;
  payload?: Record<string, unknown>;
};

export type PerformanceMetrics = {
  totalDurationMs: number;
  agentDurations: Partial<Record<AgentId, number>>;
  retryCount: number;
  escalationCount: number;
};

export type MaoeValidation = {
  valid: boolean;
  warnings: string[];
  errors: string[];
  trace: MaoeTraceEntry[];
};

export type MultiAgentOrchestrationResult = {
  brief: CoreBrief;
  trace: MultiAgentOrchestrationTrace;
  workflowState: WorkflowState;
  executionPlan: ExecutionPlan;
  sharedMemory: SharedMemory;
  validation: MaoeValidation;
  metrics: PerformanceMetrics;
};

export type SuperviseAgentParams<T> = {
  agentId: AgentId;
  brief: CoreBrief;
  onProgress?: (message: string) => void;
  /** When true, skip strict dependency checks (e.g. CIE nested inside PRE). */
  relaxedDependencies?: boolean;
  executor: () => T | Promise<T>;
  /** Merge agent result artifacts into shared memory. */
  shareArtifacts?: (result: T) => Record<string, unknown>;
  /** Optional brief mutation after successful execution. */
  updateBrief?: (result: T, brief: CoreBrief) => CoreBrief;
};

export type SuperviseAgentResult<T> = {
  result: T;
  brief: CoreBrief;
  events: MaoeEvent[];
};
