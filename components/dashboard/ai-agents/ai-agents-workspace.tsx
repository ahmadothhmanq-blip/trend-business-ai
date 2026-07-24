"use client";

import { useState } from "react";
import {
  BarChart3, BookOpen, Bot, Brain, GitBranch, History, Wrench,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useProductT } from "@/lib/i18n/use-scoped-t";
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
  { id: "agents", labelKey: "nav.agents", icon: Bot },
  { id: "builder", labelKey: "workspace.tabs.builder", icon: Brain },
  { id: "tools", labelKey: "workspace.tabs.tools", icon: Wrench },
  { id: "memory", labelKey: "workspace.tabs.memory", icon: History },
  { id: "knowledge", labelKey: "workspace.tabs.knowledge", icon: BookOpen },
  { id: "workflows", labelKey: "nav.workflows", icon: GitBranch },
  { id: "runner", labelKey: "workspace.tabs.runner", icon: GitBranch },
  { id: "monitor", labelKey: "workspace.tabs.monitor", icon: History },
  { id: "analytics", labelKey: "workspace.tabs.analytics", icon: BarChart3 },
  { id: "prompts", labelKey: "nav.prompts", icon: BookOpen },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  initialAgents?: Agent[];
  initialExecutions?: AgentExecution[];
  analyticsSummary?: AgentAnalyticsSummary;
};

export function AiAgentsWorkspace({ initialAgents = [], initialExecutions = [], analyticsSummary }: Props) {
  const p = useProductT("aiAgents");
  const [tab, setTab] = useState<TabId>("agents");
  const [agents, setAgents] = useState(initialAgents);

  const refreshAgents = () => {
    void fetch("/api/ai-agents?limit=50").then((r) => r.json()).then((d) => setAgents(d.agents ?? [])).catch(() => undefined);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map(({ id, labelKey, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all",
            tab === id ? "bg-premium-gold/10 text-premium-gold-light" : "text-white/40 hover:text-white/60",
          )}>
            <Icon className="size-3.5" /> <span className="hidden sm:inline">{p(labelKey)}</span>
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
