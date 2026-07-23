import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentAnalyticsSummary } from "@/types/agents-platform";

const TOKEN_COST_CENTS_PER_1K = 2;

export async function getAgentAnalytics(supabase: SupabaseClient, userId: string): Promise<{ summary: AgentAnalyticsSummary }> {
  const [runs, executions, agents] = await Promise.all([
    supabase.from("agent_runs").select("status, execution_time_ms, token_usage").eq("user_id", userId),
    supabase.from("agent_executions").select("status, execution_time_ms, token_usage").eq("user_id", userId),
    supabase.from("agents").select("id, total_runs, total_tokens_used").eq("user_id", userId),
  ]);

  const all = [...(runs.data ?? []), ...(executions.data ?? [])];
  const totalRuns = all.length;
  const successCount = all.filter((r) => r.status === "completed").length;
  const failureCount = all.filter((r) => r.status === "failed").length;
  const avgLatencyMs = totalRuns > 0 ? Math.round(all.reduce((s, r) => s + Number(r.execution_time_ms ?? 0), 0) / totalRuns) : 0;
  const totalTokens = all.reduce((s, r) => {
    const u = r.token_usage as { total?: number; totalTokens?: number } | null;
    return s + Number(u?.total ?? u?.totalTokens ?? 0);
  }, 0) + (agents.data ?? []).reduce((s, a) => s + Number(a.total_tokens_used ?? 0), 0);

  return {
    summary: {
      totalRuns: totalRuns + (agents.data ?? []).reduce((s, a) => s + Number(a.total_runs ?? 0), 0),
      successRate: totalRuns > 0 ? Math.round((successCount / totalRuns) * 100) : 0,
      failureCount,
      avgLatencyMs,
      totalTokens,
      estimatedCostCents: Math.round((totalTokens / 1000) * TOKEN_COST_CENTS_PER_1K),
    },
  };
}

export async function recordAnalyticsSnapshot(supabase: SupabaseClient, userId: string, agentId?: string) {
  const { summary } = await getAgentAnalytics(supabase, userId);
  return supabase.from("agent_analytics").insert({
    user_id: userId,
    agent_id: agentId ?? null,
    period: "daily",
    total_runs: summary.totalRuns,
    success_count: summary.totalRuns - summary.failureCount,
    failure_count: summary.failureCount,
    avg_latency_ms: summary.avgLatencyMs,
    total_tokens: summary.totalTokens,
    estimated_cost_cents: summary.estimatedCostCents,
  });
}
