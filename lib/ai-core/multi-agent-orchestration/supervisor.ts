import type { CoreBrief } from "@/lib/ai-core/layers/types";
import { getAgentContract } from "@/lib/ai-core/multi-agent-orchestration/agent-registry";
import { MaoeEventBus } from "@/lib/ai-core/multi-agent-orchestration/event-bus";
import {
  executeWithRetry,
  getRetryPolicy,
  shouldEscalateToHuman,
} from "@/lib/ai-core/multi-agent-orchestration/failure-recovery";
import {
  MAOE_WORKFLOW_STATE_KEY,
  type AgentExecutionState,
  type AgentId,
  type SuperviseAgentParams,
  type SuperviseAgentResult,
  type WorkflowState,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-types";
import {
  getSharedMemoryFromBrief,
  persistSharedMemoryOnBrief,
  shareArtifact,
} from "@/lib/ai-core/multi-agent-orchestration/shared-memory";
import { areDependenciesSatisfied } from "@/lib/ai-core/multi-agent-orchestration/workflow-definition";
import {
  validateAgentPostconditions,
  validateAgentPreconditions,
} from "@/lib/ai-core/multi-agent-orchestration/validate-workflow";

const eventBus = new MaoeEventBus();

export function getWorkflowStateFromBrief(brief: CoreBrief): WorkflowState | null {
  const raw = brief.metadata?.[MAOE_WORKFLOW_STATE_KEY];
  if (!raw || typeof raw !== "object") return null;
  return raw as WorkflowState;
}

export function persistWorkflowStateOnBrief(
  brief: CoreBrief,
  state: WorkflowState,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [MAOE_WORKFLOW_STATE_KEY]: state,
    },
  };
}

function getCompletedAgents(state: WorkflowState): Set<AgentId> {
  return new Set(
    state.agents
      .filter((a) => a.status === "completed")
      .map((a) => a.agentId),
  );
}

function updateAgentState(
  state: WorkflowState,
  agentId: AgentId,
  patch: Partial<AgentExecutionState>,
): WorkflowState {
  const agents = state.agents.map((a) =>
    a.agentId === agentId ? { ...a, ...patch } : a,
  );
  return { ...state, agents, currentAgent: agentId };
}

function executeWithRetrySync<T>(
  agentId: AgentId,
  executor: () => T,
  onRetry?: (attempt: number, error: unknown) => void,
): { ok: true; result: T; attempts: number } | { ok: false; error: string; attempts: number } {
  const policy = getRetryPolicy(agentId);
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      return { ok: true, result: executor(), attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < policy.maxAttempts) {
        onRetry?.(attempt, error);
      }
    }
  }

  return {
    ok: false,
    error: lastError instanceof Error ? lastError.message : String(lastError),
    attempts: policy.maxAttempts,
  };
}

function finalizeSupervision<T>(
  params: SuperviseAgentParams<T>,
  brief: CoreBrief,
  workflowState: WorkflowState,
  agentId: AgentId,
  result: T,
  startedAt: number,
): SuperviseAgentResult<T> {
  let nextBrief = brief;
  if (params.updateBrief) {
    nextBrief = params.updateBrief(result, nextBrief);
  }

  const postValidation = validateAgentPostconditions(agentId, nextBrief);
  for (const warning of postValidation.warnings) {
    params.onProgress?.(`[maoe] ${agentId} postcondition warning: ${warning}`);
  }

  if (params.shareArtifacts) {
    const artifacts = params.shareArtifacts(result);
    let memory = getSharedMemoryFromBrief(nextBrief);
    for (const [key, value] of Object.entries(artifacts)) {
      memory = shareArtifact(memory, agentId, key, value, typeof value);
    }
    nextBrief = persistSharedMemoryOnBrief(nextBrief, memory);
    eventBus.emit("context:shared", agentId, { keys: Object.keys(artifacts) });
  }

  let nextState = updateAgentState(workflowState, agentId, {
    status: "completed",
    completedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
  });
  nextBrief = persistWorkflowStateOnBrief(nextBrief, nextState);

  const contract = getAgentContract(agentId);
  eventBus.emit("agent:completed", agentId, {
    durationMs: Date.now() - startedAt,
    postWarnings: postValidation.warnings.length,
  });
  params.onProgress?.(
    `[maoe] ${contract.name} completed · ${Date.now() - startedAt}ms`,
  );

  return {
    result,
    brief: nextBrief,
    events: eventBus.drain(),
  };
}

function beginSupervision(
  agentId: AgentId,
  brief: CoreBrief,
  onProgress?: (message: string) => void,
  relaxedDependencies?: boolean,
): { brief: CoreBrief; workflowState: WorkflowState; startedAt: number } {
  const contract = getAgentContract(agentId);
  let workflowState = getWorkflowStateFromBrief(brief);
  if (!workflowState) {
    throw new Error(
      "MAOE workflow not initialized — call runMultiAgentOrchestrationEngine() first",
    );
  }

  const completed = getCompletedAgents(workflowState);
  if (!relaxedDependencies && !areDependenciesSatisfied(agentId, completed)) {
    const missing = contract.dependsOn.filter((dep) => !completed.has(dep));
    throw new Error(
      `MAOE: cannot run ${agentId} — unsatisfied dependencies: ${missing.join(", ")}`,
    );
  }

  const preValidation = validateAgentPreconditions(agentId, brief);
  for (const warning of preValidation.warnings) {
    onProgress?.(`[maoe] ${agentId} precondition warning: ${warning}`);
  }
  if (!preValidation.valid) {
    throw new Error(
      `MAOE: ${agentId} preconditions failed: ${preValidation.errors.join("; ")}`,
    );
  }

  const startedAt = Date.now();
  workflowState = updateAgentState(workflowState, agentId, {
    status: "running",
    startedAt: new Date().toISOString(),
    attempts:
      (workflowState.agents.find((a) => a.agentId === agentId)?.attempts ?? 0) + 1,
  });
  workflowState = { ...workflowState, status: "running" };
  brief = persistWorkflowStateOnBrief(brief, workflowState);

  eventBus.emit("agent:started", agentId, { engineId: contract.engineId });
  onProgress?.(`[maoe] Supervising ${contract.name} (${agentId})…`);

  return { brief, workflowState, startedAt };
}

function handleSupervisionFailure(
  agentId: AgentId,
  brief: CoreBrief,
  workflowState: WorkflowState,
  error: string,
  attempts: number,
  startedAt: number,
): never {
  const escalate = shouldEscalateToHuman(agentId, attempts);
  const nextState = updateAgentState(
    {
      ...workflowState,
      status: escalate ? "escalated" : "failed",
    },
    agentId,
    {
      status: escalate ? "escalated" : "failed",
      error,
      completedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      escalated: escalate,
    },
  );
  persistWorkflowStateOnBrief(brief, nextState);
  eventBus.emit(escalate ? "agent:escalated" : "agent:failed", agentId, { error });
  throw new Error(
    `MAOE: ${agentId} failed after ${attempts} attempt(s): ${error}`,
  );
}

/**
 * Supervise async agent execution — validates pre/post conditions, retries, updates state.
 */
export async function superviseAgentExecution<T>(
  params: SuperviseAgentParams<T>,
): Promise<SuperviseAgentResult<T>> {
  const { agentId } = params;
  const { brief: startedBrief, workflowState, startedAt } = beginSupervision(
    agentId,
    params.brief,
    params.onProgress,
    params.relaxedDependencies,
  );

  const retryResult = await executeWithRetry(
    agentId,
    async () => {
      const result = params.executor();
      return result instanceof Promise ? await result : result;
    },
    (attempt, error) => {
      eventBus.emit("agent:retry", agentId, {
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });
      params.onProgress?.(`[maoe] ${agentId} retry ${attempt}…`);
    },
  );

  if (!retryResult.ok) {
    handleSupervisionFailure(
      agentId,
      startedBrief,
      workflowState,
      retryResult.error,
      retryResult.attempts,
      startedAt,
    );
  }

  return finalizeSupervision(
    params,
    startedBrief,
    workflowState,
    agentId,
    retryResult.result,
    startedAt,
  );
}

/** Supervise synchronous agent execution (DIE, CIE, etc.). */
export function superviseAgentSync<T>(
  params: SuperviseAgentParams<T> & { executor: () => T },
): SuperviseAgentResult<T> {
  const { agentId } = params;
  const { brief: startedBrief, workflowState, startedAt } = beginSupervision(
    agentId,
    params.brief,
    params.onProgress,
    params.relaxedDependencies,
  );

  const retryResult = executeWithRetrySync(
    agentId,
    params.executor,
    (attempt, error) => {
      eventBus.emit("agent:retry", agentId, {
        attempt,
        error: error instanceof Error ? error.message : String(error),
      });
      params.onProgress?.(`[maoe] ${agentId} retry ${attempt}…`);
    },
  );

  if (!retryResult.ok) {
    handleSupervisionFailure(
      agentId,
      startedBrief,
      workflowState,
      retryResult.error,
      retryResult.attempts,
      startedAt,
    );
  }

  return finalizeSupervision(
    params,
    startedBrief,
    workflowState,
    agentId,
    retryResult.result,
    startedAt,
  );
}

export function resetMaoeEventBus(): void {
  eventBus.reset();
}
