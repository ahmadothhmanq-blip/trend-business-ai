import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardHeader } from "@/components/dashboard/header";
import { AiAgentsWorkspace } from "@/components/dashboard/ai-agents/ai-agents-workspace";
import { createClient } from "@/lib/supabase/server";
import type { Agent, AgentExecution } from "@/types/agents";
import { getAgentAnalytics } from "@/lib/agents/analytics";

export const metadata: Metadata = {
  title: "AI Agents & Automation",
  description: "Create, manage, and run AI agents with multi-step workflows",
};

export default async function AiAgentsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  let initialAgents: Agent[] = [];
  let initialExecutions: AgentExecution[] = [];
  let analyticsSummary;

  try {
    const { data: agents } = await supabase
      .from("agents")
      .select("*")
      .or(`user_id.eq.${user.id},is_template.eq.true`)
      .order("created_at", { ascending: false })
      .limit(50);
    initialAgents = (agents ?? []) as Agent[];
  } catch { /* table may not exist */ }

  try {
    const { data: executions } = await supabase
      .from("agent_executions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    initialExecutions = (executions ?? []) as AgentExecution[];
  } catch { /* table may not exist */ }

  try {
    const { summary } = await getAgentAnalytics(supabase, user.id);
    analyticsSummary = summary;
  } catch { /* optional */ }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="AI Agents & Automation"
        description="Create intelligent agents, build multi-step workflows, and automate your business processes"
      />
      <AiAgentsWorkspace initialAgents={initialAgents} initialExecutions={initialExecutions} analyticsSummary={analyticsSummary} />
    </div>
  );
}
