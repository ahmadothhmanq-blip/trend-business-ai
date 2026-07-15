"use client";

import { useState } from "react";
import { Bot, GitBranch, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { AiAgentsTool } from "./ai-agents-tool";
import { WorkflowBuilder } from "./workflow-builder";
import { PromptLibrary } from "./prompt-library";
import type { Agent, AgentExecution } from "@/types/agents";

const TABS = [
  { id: "agents", label: "Agents", icon: Bot },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "prompts", label: "Prompt Library", icon: BookOpen },
] as const;

type Props = {
  initialAgents?: Agent[];
  initialExecutions?: AgentExecution[];
};

export function AiAgentsWorkspace({ initialAgents = [], initialExecutions = [] }: Props) {
  const [tab, setTab] = useState("agents");

  return (
    <div className="space-y-6">
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={cn(
            "flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-medium transition-all",
            tab === id ? "bg-premium-gold/10 text-premium-gold-light" : "text-white/40 hover:text-white/60",
          )}>
            <Icon className="size-3.5" /> {label}
          </button>
        ))}
      </div>
      {tab === "agents" && <AiAgentsTool initialAgents={initialAgents} initialExecutions={initialExecutions} />}
      {tab === "workflows" && <WorkflowBuilder />}
      {tab === "prompts" && <PromptLibrary />}
    </div>
  );
}
