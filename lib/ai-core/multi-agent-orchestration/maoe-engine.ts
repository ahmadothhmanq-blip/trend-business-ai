import { randomUUID } from "node:crypto";
import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { discoverAgents } from "@/lib/ai-core/multi-agent-orchestration/agent-registry";
import { MaoeEventBus } from "@/lib/ai-core/multi-agent-orchestration/event-bus";
import {
  MAOE_EXECUTION_PLAN_KEY,
  MAOE_TRACE_KEY,
  MAOE_WORKFLOW_STATE_KEY,
  MAOE_SHARED_MEMORY_KEY,
  MAOE_ENGINE_ID,
  MAOE_ENGINE_VERSION,
  type AgentExecutionState,
  type MultiAgentOrchestrationResult,
  type MultiAgentOrchestrationTrace,
  type PerformanceMetrics,
  type WorkflowState,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-types";
import {
  createSharedMemory,
  persistSharedMemoryOnBrief,
} from "@/lib/ai-core/multi-agent-orchestration/shared-memory";
import {
  persistWorkflowStateOnBrief,
} from "@/lib/ai-core/multi-agent-orchestration/supervisor";
import {
  buildExecutionPlan,
  CANONICAL_WORKFLOW_ORDER,
  resolveParallelGroups,
} from "@/lib/ai-core/multi-agent-orchestration/workflow-definition";
import { validateWorkflowCompletion } from "@/lib/ai-core/multi-agent-orchestration/validate-workflow";

export type RunMultiAgentOrchestrationParams = {
  brief: CoreBrief;
  onProgress?: (message: string) => void;
};

const eventBus = new MaoeEventBus();

function buildInitialAgentStates(): AgentExecutionState[] {
  return CANONICAL_WORKFLOW_ORDER.map((agentId) => ({
    agentId,
    status: "pending" as const,
    attempts: 0,
  }));
}

/**
 * Multi-Agent Orchestration Engine (MAOE) — EDS-008 authoritative coordinator.
 * Initializes workflow plan, agent registry bindings, and shared memory.
 * Domain agents execute via superviseAgentExecution / superviseAgentSync.
 */
export function runMultiAgentOrchestrationEngine(
  params: RunMultiAgentOrchestrationParams,
): MultiAgentOrchestrationResult {
  const workflowId = randomUUID();
  const startedAt = Date.now();
  const phases: MultiAgentOrchestrationTrace["phases"] = [
    "workflow-init",
    "agent-discovery",
    "dependency-resolution",
    "scheduling",
  ];
  const entries: MultiAgentOrchestrationTrace["entries"] = [];

  params.onProgress?.("[maoe] Phase 1/4 · Initializing multi-agent workflow…");

  const agents = discoverAgents();
  entries.push({
    id: `maoe-discover-${Date.now()}`,
    phase: "agent-discovery",
    ruleId: "agent-registry",
    passed: true,
    severity: "info",
    message: `Discovered ${agents.length} domain agents: ${agents.map((a) => a.id).join(" → ")}`,
    timestamp: new Date().toISOString(),
  });

  const executionPlan = buildExecutionPlan(workflowId);
  const parallelGroups = resolveParallelGroups(executionPlan);

  entries.push({
    id: `maoe-deps-${Date.now()}`,
    phase: "dependency-resolution",
    ruleId: "workflow-dag",
    passed: true,
    severity: "info",
    message: `Resolved ${executionPlan.steps.length} steps · ${parallelGroups.length} sequential groups`,
    timestamp: new Date().toISOString(),
  });

  params.onProgress?.("[maoe] Phase 2/4 · Scheduling agent execution plan…");

  const workflowState: WorkflowState = {
    version: "1",
    workflowId,
    status: "running",
    agents: buildInitialAgentStates(),
    parallelGroups,
    startedAt: new Date().toISOString(),
  };

  const sharedMemory = createSharedMemory();

  let brief = params.brief;
  brief = persistWorkflowStateOnBrief(brief, workflowState);
  brief = persistSharedMemoryOnBrief(brief, sharedMemory);
  brief = {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [MAOE_EXECUTION_PLAN_KEY]: executionPlan,
    },
  };

  eventBus.emit("workflow:started", undefined, {
    workflowId,
    agents: CANONICAL_WORKFLOW_ORDER,
  });

  params.onProgress?.(
    `[maoe] Workflow ${workflowId.slice(0, 8)} · plan: ${CANONICAL_WORKFLOW_ORDER.join(" → ")}`,
  );

  const trace: MultiAgentOrchestrationTrace = {
    version: "1",
    engineId: MAOE_ENGINE_ID,
    engineVersion: MAOE_ENGINE_VERSION,
    createdAt: new Date().toISOString(),
    workflowId,
    phases,
    entries,
    summary: `Workflow initialized · ${agents.length} agents · sequential pipeline`,
  };

  brief = {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [MAOE_TRACE_KEY]: trace,
    },
  };

  const validation = validateWorkflowCompletion(brief);

  const metrics: PerformanceMetrics = {
    totalDurationMs: Date.now() - startedAt,
    agentDurations: {},
    retryCount: 0,
    escalationCount: 0,
  };

  params.onProgress?.("[maoe] Phase 3/4 · Workflow ready — agents will execute via MAOE supervision");

  return {
    brief,
    trace,
    workflowState,
    executionPlan,
    sharedMemory,
    validation,
    metrics,
  };
}

export function getMaoeTraceFromBrief(
  brief: CoreBrief,
): MultiAgentOrchestrationTrace | null {
  const raw = brief.metadata?.[MAOE_TRACE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as MultiAgentOrchestrationTrace;
}

export function completeMaoeWorkflow(
  brief: CoreBrief,
  onProgress?: (message: string) => void,
): CoreBrief {
  const state = brief.metadata?.[MAOE_WORKFLOW_STATE_KEY] as WorkflowState | undefined;
  if (!state) return brief;

  const validation = validateWorkflowCompletion(brief);
  const completed: WorkflowState = {
    ...state,
    status: validation.valid ? "completed" : "failed",
    completedAt: new Date().toISOString(),
  };

  onProgress?.(
    validation.valid
      ? "[maoe] Workflow complete · all agents supervised"
      : `[maoe] Workflow incomplete · ${validation.warnings.length} warning(s)`,
  );

  eventBus.emit(
    validation.valid ? "workflow:completed" : "workflow:failed",
    undefined,
    { warnings: validation.warnings },
  );

  return persistWorkflowStateOnBrief(brief, completed);
}

export function persistMaoeOnBrief(
  brief: CoreBrief,
  result: MultiAgentOrchestrationResult,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [MAOE_TRACE_KEY]: result.trace,
      [MAOE_EXECUTION_PLAN_KEY]: result.executionPlan,
      [MAOE_WORKFLOW_STATE_KEY]: result.workflowState,
      [MAOE_SHARED_MEMORY_KEY]: result.sharedMemory,
      multiAgentOrchestrationValidation: result.validation,
    },
  };
}
