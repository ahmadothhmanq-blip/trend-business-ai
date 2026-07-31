import type { AgentId } from "@/lib/ai-core/multi-agent-orchestration/maoe-types";
import { getAgentContract } from "@/lib/ai-core/multi-agent-orchestration/agent-registry";

export type RetryPolicy = {
  maxAttempts: number;
  backoffMs: number;
};

export type RetryResult<T> =
  | { ok: true; result: T; attempts: number }
  | { ok: false; error: string; attempts: number; escalate: boolean };

export function getRetryPolicy(agentId: AgentId): RetryPolicy {
  const contract = getAgentContract(agentId);
  return {
    maxAttempts: contract.maxRetries + 1,
    backoffMs: 500,
  };
}

export async function executeWithRetry<T>(
  agentId: AgentId,
  executor: () => T | Promise<T>,
  onRetry?: (attempt: number, error: unknown) => void,
): Promise<RetryResult<T>> {
  const policy = getRetryPolicy(agentId);
  let lastError: unknown;

  for (let attempt = 1; attempt <= policy.maxAttempts; attempt++) {
    try {
      const result = await executor();
      return { ok: true, result, attempts: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < policy.maxAttempts) {
        onRetry?.(attempt, error);
        await sleep(policy.backoffMs * attempt);
      }
    }
  }

  const message =
    lastError instanceof Error ? lastError.message : String(lastError);
  return {
    ok: false,
    error: message,
    attempts: policy.maxAttempts,
    escalate: policy.maxAttempts >= 2,
  };
}

export function shouldEscalateToHuman(
  agentId: AgentId,
  attempts: number,
): boolean {
  const contract = getAgentContract(agentId);
  return attempts > contract.maxRetries;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
