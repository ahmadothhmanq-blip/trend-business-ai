import type {
  AgentId,
  ExecutionPlan,
  ExecutionPlanStep,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-types";
import { AGENT_REGISTRY } from "@/lib/ai-core/multi-agent-orchestration/agent-registry";

/** Canonical intelligence workflow — Planning → Content → Design → Image → SEO → Quality */
export const CANONICAL_WORKFLOW_ORDER: AgentId[] = [
  "PRE",
  "CIE",
  "DIE",
  "IIE",
  "SAIE",
  "QASHE",
];

export function buildExecutionPlan(workflowId: string): ExecutionPlan {
  const steps: ExecutionPlanStep[] = CANONICAL_WORKFLOW_ORDER.map(
    (agentId, index) => ({
      agentId,
      order: index + 1,
      dependsOn: [...AGENT_REGISTRY[agentId].dependsOn],
      parallelGroup: index,
    }),
  );

  return {
    version: "1",
    workflowId,
    steps,
    totalAgents: steps.length,
  };
}

export function resolveParallelGroups(
  plan: ExecutionPlan,
): AgentId[][] {
  const groups = new Map<number, AgentId[]>();
  for (const step of plan.steps) {
    const group = groups.get(step.parallelGroup) ?? [];
    group.push(step.agentId);
    groups.set(step.parallelGroup, group);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, agents]) => agents);
}

export function getNextPendingAgents(
  plan: ExecutionPlan,
  completed: Set<AgentId>,
): AgentId[] {
  return plan.steps
    .filter((step) => !completed.has(step.agentId))
    .filter((step) => step.dependsOn.every((dep) => completed.has(dep)))
    .map((step) => step.agentId);
}

export function areDependenciesSatisfied(
  agentId: AgentId,
  completed: Set<AgentId>,
): boolean {
  return AGENT_REGISTRY[agentId].dependsOn.every((dep) => completed.has(dep));
}
