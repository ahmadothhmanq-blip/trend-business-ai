import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MAOE_ENGINE_ID,
  MAOE_TRACE_KEY,
  MAOE_WORKFLOW_STATE_KEY,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-types";
import {
  runMultiAgentOrchestrationEngine,
  getMaoeTraceFromBrief,
  completeMaoeWorkflow,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-engine";
import {
  AGENT_REGISTRY,
  discoverAgents,
  discoverAgentCapabilities,
  getAgentContract,
} from "@/lib/ai-core/multi-agent-orchestration/agent-registry";
import {
  CANONICAL_WORKFLOW_ORDER,
  buildExecutionPlan,
  getNextPendingAgents,
  areDependenciesSatisfied,
} from "@/lib/ai-core/multi-agent-orchestration/workflow-definition";
import {
  validateAgentPreconditions,
  validateWorkflowCompletion,
  resetMaoeValidationTraceCounter,
} from "@/lib/ai-core/multi-agent-orchestration/validate-workflow";
import {
  superviseAgentSync,
  getWorkflowStateFromBrief,
} from "@/lib/ai-core/multi-agent-orchestration/supervisor";
import { PLANNING_REASONING_TRACE_KEY } from "@/lib/ai-core/planning-reasoning-engine/types";
import type { CoreBrief } from "@/lib/ai-core/layers/types";

function testBrief(): CoreBrief {
  return {
    productId: "website-builder",
    prompt: "Luxury furniture showroom in New York",
    language: "en",
    metadata: {},
  };
}

describe("EDS-008 Multi-Agent Orchestration Engine", () => {
  it("exposes agent registry with all six domain agents", () => {
    assert.equal(Object.keys(AGENT_REGISTRY).length, 6);
    const agents = discoverAgents();
    assert.deepEqual(
      agents.map((a) => a.id),
      CANONICAL_WORKFLOW_ORDER,
    );
    assert.equal(getAgentContract("PRE").engineId, "planning-reasoning-engine");
    assert.equal(getAgentContract("QASHE").engineId, "quality-assurance-self-healing-engine");
  });

  it("discovers agent capabilities", () => {
    const caps = discoverAgentCapabilities();
    assert.ok(caps.length >= 15);
    assert.ok(caps.some((c) => c.agentId === "CIE" && c.capability.id === "content-policy"));
  });

  it("builds execution plan with dependency resolution", () => {
    const plan = buildExecutionPlan("wf-test");
    assert.equal(plan.totalAgents, 6);
    assert.equal(plan.steps[0].agentId, "PRE");
    assert.equal(plan.steps[5].agentId, "QASHE");
    assert.deepEqual(plan.steps[2].dependsOn, ["PRE", "CIE"]);
  });

  it("resolves next pending agents from completed set", () => {
    const plan = buildExecutionPlan("wf-test");
    const next = getNextPendingAgents(plan, new Set());
    assert.deepEqual(next, ["PRE"]);
    const afterPre = getNextPendingAgents(plan, new Set(["PRE"]));
    assert.deepEqual(afterPre, ["CIE"]);
    assert.equal(areDependenciesSatisfied("DIE", new Set(["PRE", "CIE"])), true);
    assert.equal(areDependenciesSatisfied("DIE", new Set(["PRE"])), false);
  });

  it("initializes MAOE workflow on brief", () => {
    const result = runMultiAgentOrchestrationEngine({
      brief: testBrief(),
    });
    assert.equal(result.trace.engineId, MAOE_ENGINE_ID);
    assert.equal(result.workflowState.status, "running");
    assert.equal(result.executionPlan.totalAgents, 6);
    assert.ok(getWorkflowStateFromBrief(result.brief));
    assert.ok(getMaoeTraceFromBrief(result.brief));
    assert.ok(result.brief.metadata?.[MAOE_WORKFLOW_STATE_KEY]);
    assert.ok(result.brief.metadata?.[MAOE_TRACE_KEY]);
  });

  it("supervises PRE agent execution with trace persistence", () => {
    resetMaoeValidationTraceCounter();
    let brief = runMultiAgentOrchestrationEngine({ brief: testBrief() }).brief;

    const supervised = superviseAgentSync({
      agentId: "PRE",
      brief,
      executor: () => {
        brief = {
          ...brief,
          metadata: {
            ...(brief.metadata ?? {}),
            [PLANNING_REASONING_TRACE_KEY]: {
              version: "1",
              engineId: "planning-reasoning-engine",
              summary: "test",
            },
          },
        };
        return { plan: { industry: "furniture" }, brief };
      },
      updateBrief: (result) => result.brief,
      shareArtifacts: (result) => ({ masterWebsitePlan: result.plan }),
    });

    assert.ok(supervised.result);
    assert.ok(supervised.brief.metadata?.[PLANNING_REASONING_TRACE_KEY]);
    const state = getWorkflowStateFromBrief(supervised.brief);
    const preState = state?.agents.find((a) => a.agentId === "PRE");
    assert.equal(preState?.status, "completed");
  });

  it("validates agent preconditions and workflow completion", () => {
    resetMaoeValidationTraceCounter();
    const brief = testBrief();
    const pre = validateAgentPreconditions("PRE", brief);
    assert.equal(pre.valid, true);

    const completion = validateWorkflowCompletion(brief);
    assert.equal(completion.valid, false);
    assert.ok(completion.warnings.length > 0);
  });

  it("completes workflow with status update", () => {
    let brief = runMultiAgentOrchestrationEngine({ brief: testBrief() }).brief;
    brief = completeMaoeWorkflow(brief);
    const state = getWorkflowStateFromBrief(brief);
    assert.ok(state?.completedAt);
    assert.ok(state?.status === "completed" || state?.status === "failed");
  });
});
