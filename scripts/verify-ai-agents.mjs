/**
 * Verify AI Agents Platform readiness.
 * Usage: npm run verify:ai-agents
 */
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

let failed = 0;
function ok(label, detail = "") {
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}
function fail(label, detail = "") {
  failed++;
  console.log(`  ✗ ${label}${detail ? ` — ${detail}` : ""}`);
}

const FILES = [
  "types/agents-platform.ts",
  "supabase/migrations/069_ai_agents_platform.sql",
  "lib/agents/engine.ts",
  "lib/agents/runner.ts",
  "lib/agents/tool-registry.ts",
  "lib/agents/memory.ts",
  "lib/agents/knowledge.ts",
  "lib/agents/workflows.ts",
  "lib/agents/scheduler.ts",
  "lib/agents/triggers.ts",
  "lib/agents/analytics.ts",
  "lib/agents/health.ts",
  "lib/agents/integrations/index.ts",
  "lib/agents/index.ts",
  "lib/ai-core/adapters/agents-ai.ts",
  "app/api/ai-agents/health/route.ts",
  "app/api/ai-agents/analytics/route.ts",
  "app/api/ai-agents/memory/route.ts",
  "app/api/ai-agents/knowledge/route.ts",
  "app/api/ai-agents/schedules/route.ts",
  "app/api/ai-agents/triggers/route.ts",
  "app/api/ai-agents/tools/route.ts",
  "components/dashboard/ai-agents/ai-agents-workspace.tsx",
  "app/(dashboard)/dashboard/ai-agents/page.tsx",
  "scripts/verify-ai-agents.mjs",
];

console.log("\n[1] Platform files");
for (const rel of FILES) {
  if (existsSync(join(root, rel))) ok(rel);
  else fail(rel, "missing");
}

console.log("\n[2] Migration 069");
const m069 = readFileSync(join(root, "supabase/migrations/069_ai_agents_platform.sql"), "utf8");
for (const t of [
  "agent_tools",
  "agent_versions",
  "agent_knowledge_bases",
  "agent_memory_entries",
  "agent_runs",
  "agent_run_steps",
  "agent_workflow_runs",
  "agent_schedules",
  "agent_triggers",
  "agent_permissions",
  "agent_analytics",
  "agent_audit_log",
]) {
  if (m069.includes(t)) ok(`table: ${t}`);
  else fail(`missing table: ${t}`);
}
if (m069.includes("Users can view own agents and templates")) ok("template RLS fixed");
else fail("template RLS fix missing");

console.log("\n[3] Tool registry");
const registry = readFileSync(join(root, "lib/agents/tool-registry.ts"), "utf8");
if (registry.includes("invokeTool")) ok("invokeTool");
for (const t of ["crm.get_contacts", "erp.invoices", "bm.projects", "marketing.campaigns", "bi.metrics", "social.analytics_summary"]) {
  if (registry.includes(t)) ok(`tool: ${t}`);
  else fail(`tool missing: ${t}`);
}

console.log("\n[4] Workflow engine");
const wf = readFileSync(join(root, "lib/agents/workflows.ts"), "utf8");
if (wf.includes("runWorkflow")) ok("runWorkflow");
for (const s of ["agent", "condition", "delay", "transform", "notification", "service"]) {
  if (wf.includes(`case "${s}"`)) ok(`step: ${s}`);
  else fail(`step missing: ${s}`);
}

console.log("\n[5] API security");
for (const rel of [
  "app/api/ai-agents/route.ts",
  "app/api/ai-agents/memory/route.ts",
  "app/api/ai-agents/workflows/route.ts",
  "app/api/ai-agents/analytics/route.ts",
]) {
  const src = readFileSync(join(root, rel), "utf8");
  if (src.includes("requireUser")) ok(`${rel}: requireUser`);
  else fail(`${rel}: missing requireUser`);
}
const main = readFileSync(join(root, "app/api/ai-agents/route.ts"), "utf8");
if (main.includes("enforceAiUsage")) ok("run: credits");
if (main.includes("enforceMutationRateLimit")) ok("create: rate limit");

console.log("\n[6] Legacy preservation");
const runner = readFileSync(join(root, "lib/agent-runner.ts"), "utf8");
if (runner.includes("runPlatformAgent")) ok("agent-runner delegates to platform");
const plugin = readFileSync(join(root, "plugins/ai-agents/index.ts"), "utf8");
if (plugin.includes("aiAgentPlugin")) ok("plugins/ai-agents preserved");

console.log("\n[7] Dashboard");
const ws = readFileSync(join(root, "components/dashboard/ai-agents/ai-agents-workspace.tsx"), "utf8");
for (const c of ["AiAgentsTool", "AgentEditor", "ToolManager", "MemoryViewer", "KnowledgeManager", "WorkflowRunner", "ExecutionMonitor", "AnalyticsPanel"]) {
  if (ws.includes(c)) ok(`panel: ${c}`);
  else fail(`panel missing: ${c}`);
}

console.log("\n[8] package.json");
const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
if (pkg.scripts?.["verify:ai-agents"]) ok("npm run verify:ai-agents");
else fail("verify script missing");

console.log(failed ? `\nAI Agents verify: ${failed} issue(s)\n` : "\nAI Agents verify: PASS\n");
process.exit(failed ? 1 : 0);
