/**
 * EDS-008 Multi-Agent Orchestration — architecture verification.
 * Usage: node scripts/verify-multi-agent-orchestration.mjs
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const maoeTypes = read("lib/ai-core/multi-agent-orchestration/maoe-types.ts");
const registry = read("lib/ai-core/multi-agent-orchestration/agent-registry.ts");
const workflow = read("lib/ai-core/multi-agent-orchestration/workflow-definition.ts");
const supervisor = read("lib/ai-core/multi-agent-orchestration/supervisor.ts");
const validate = read("lib/ai-core/multi-agent-orchestration/validate-workflow.ts");
const sharedMemory = read("lib/ai-core/multi-agent-orchestration/shared-memory.ts");
const eventBus = read("lib/ai-core/multi-agent-orchestration/event-bus.ts");
const failure = read("lib/ai-core/multi-agent-orchestration/failure-recovery.ts");
const maoeEngine = read("lib/ai-core/multi-agent-orchestration/maoe-engine.ts");
const runner = read("lib/ai-core/layers/runner.ts");
const adapter = read("lib/ai-core/adapters/website-builder.ts");
const agency = read("lib/ai-core/agency-orchestrator/orchestrate.ts");
const designPlan = read("lib/ai-core/design-plan/engine.ts");
const imageEngine = read("lib/ai-core/image-engine/engine.ts");
const index = read("lib/ai-core/multi-agent-orchestration/index.ts");
const pkg = read("package.json");

assert.ok(maoeTypes.includes("MultiAgentOrchestrationTrace"), "MAOE trace type required");
assert.ok(maoeTypes.includes("AgentContract"), "agent contract type required");
assert.ok(maoeTypes.includes("WorkflowState"), "workflow state type required");
assert.ok(maoeTypes.includes("MAOE_TRACE_KEY"), "trace metadata key required");
assert.ok(maoeTypes.includes("MAOE_WORKFLOW_STATE_KEY"), "workflow state key required");

assert.ok(registry.includes("AGENT_REGISTRY"), "agent registry required");
assert.ok(registry.includes("PRE"), "Planning Agent required");
assert.ok(registry.includes("CIE"), "Content Agent required");
assert.ok(registry.includes("DIE"), "Design Agent required");
assert.ok(registry.includes("IIE"), "Image Agent required");
assert.ok(registry.includes("SAIE"), "SEO Agent required");
assert.ok(registry.includes("QASHE"), "Quality Agent required");
assert.ok(registry.includes("discoverAgents"), "agent discovery required");
assert.ok(registry.includes("discoverAgentCapabilities"), "capability registry required");

assert.ok(workflow.includes("CANONICAL_WORKFLOW_ORDER"), "canonical workflow required");
assert.ok(workflow.includes("buildExecutionPlan"), "execution plan builder required");
assert.ok(workflow.includes("getNextPendingAgents"), "scheduling required");

assert.ok(supervisor.includes("superviseAgentExecution"), "async supervision required");
assert.ok(supervisor.includes("superviseAgentSync"), "sync supervision required");

assert.ok(validate.includes("validateAgentPreconditions"), "precondition validation required");
assert.ok(validate.includes("validateAgentPostconditions"), "postcondition validation required");
assert.ok(validate.includes("validateWorkflowCompletion"), "cross-agent validation required");

assert.ok(sharedMemory.includes("shareArtifact"), "artifact exchange required");
assert.ok(eventBus.includes("MaoeEventBus"), "event bus required");
assert.ok(failure.includes("executeWithRetry"), "retry policy required");

assert.ok(
  maoeEngine.includes("runMultiAgentOrchestrationEngine"),
  "authoritative MAOE entry required",
);

assert.ok(
  runner.includes("runMultiAgentOrchestrationEngine"),
  "LayerRunner must initialize MAOE",
);
assert.ok(
  runner.includes("superviseAgentExecution"),
  "LayerRunner must supervise PRE via MAOE",
);
assert.ok(
  runner.includes("completeMaoeWorkflow"),
  "LayerRunner must complete MAOE workflow",
);

assert.ok(
  agency.includes("superviseAgentSync"),
  "agency orchestrator must supervise CIE via MAOE",
);
assert.ok(
  designPlan.includes("superviseAgentSync"),
  "design planning must supervise DIE via MAOE",
);
assert.ok(
  imageEngine.includes("superviseAgentSync"),
  "image engine must supervise IIE via MAOE",
);
assert.ok(
  adapter.includes("superviseAgentSync"),
  "website builder must supervise SAIE/QASHE via MAOE",
);

assert.ok(index.includes("runMultiAgentOrchestrationEngine"), "public index export required");
assert.ok(
  pkg.includes("verify:multi-agent-orchestration"),
  "package.json verify script required",
);

console.log("EDS-008 Multi-Agent Orchestration architecture verified.");
