"use client";

import { useState } from "react";
import {
  BarChart3, BookOpen, Bot, Brain, GitBranch, History, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AiAgentsTool } from "./ai-agents-tool";
import { WorkflowBuilder } from "./workflow-builder";
import { PromptLibrary } from "./prompt-library";
import { AgentEditor } from "./agent-editor";
import { ToolManager } from "./tool-manager";
import { MemoryViewer } from "./memory-viewer";
import { KnowledgeManager } from "./knowledge-manager";
import { WorkflowRunner } from "./workflow-runner";
import { ExecutionMonitor } from "./execution-monitor";
import { AnalyticsPanel } from "./analytics-panel";
import type { Agent, AgentExecution } from "@/types/agents";
import type { AgentAnalyticsSummary } from "@/types/agents-platform";

const TABS = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "builder", label: "Builder", icon: Brain },
  { id: "tools", label: "Tools", icon: Wrench },
  { id: "memory", label: "Memory", icon: History },
  { id: "knowledge", label: "Knowledge", icon: BookOpen },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "runner", label: "Runner", icon: GitBranch },
  { id: "monitor", label: "Monitor", icon: History },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
  { id: "prompts", label: "Prompts", icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  initialAgents?: Agent[];
  initialExecutions?: AgentExecution[];
  analyticsSummary?: AgentAnalyticsSummary;
};

export function AiAgentsWorkspace({ initialAgents = [], initialExecutions = [], analyticsSummary }: Props) {
  const [tab, setTab] = useState<TabId>("agents");
  const [agents, setAgents] = useState(initialAgents);

  const refreshAgents = () => {
    void fetch("/api/ai-agents?limit=50").then((r) => r.json()).then((d) => setAgents(d.agents ?? [])).catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
            tab === id ? "bg-premium-gold/10 text-premium-gold-light" : "text-white/40 hover:text-white/60",
          )}>
            <Icon className="size-3.5" /> <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {tab === "agents" && <AiAgentsTool initialAgents={agents} initialExecutions={initialExecutions} />}
      {tab === "builder" && <AgentEditor onSaved={refreshAgents} />}
      {tab === "tools" && <ToolManager />}
      {tab === "memory" && <MemoryViewer agents={agents} />}
      {tab === "knowledge" && <KnowledgeManager />}
      {tab === "workflows" && <WorkflowBuilder />}
      {tab === "runner" && <WorkflowRunner />}
      {tab === "monitor" && <ExecutionMonitor initialExecutions={initialExecutions} />}
      {tab === "analytics" && <AnalyticsPanel initialSummary={analyticsSummary} />}
      {tab === "prompts" && <PromptLibrary />}
    </div>
  );
}
