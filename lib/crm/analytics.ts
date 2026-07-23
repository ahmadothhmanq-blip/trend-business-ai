import type { SupabaseClient } from "@supabase/supabase-js";

export type CrmAnalyticsSummary = {
  pipelineValueCents: number;
  wonValueCents: number;
  openDeals: number;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
  winRate: number;
  avgSalesCycleDays: number;
  forecastCents: number;
  byStage: Record<string, { count: number; valueCents: number }>;
};

export function computeCrmAnalytics(input: {
  deals: Array<{ stage: string; value_cents: number; probability: number; created_at: string; updated_at: string }>;
  leads: Array<{ status: string }>;
}): CrmAnalyticsSummary {
  const openDeals = input.deals.filter((d) => d.stage !== "won" && d.stage !== "lost");
  const pipelineValueCents = openDeals.reduce((s, d) => s + (d.value_cents ?? 0), 0);
  const wonDeals = input.deals.filter((d) => d.stage === "won");
  const wonValueCents = wonDeals.reduce((s, d) => s + (d.value_cents ?? 0), 0);
  const closed = input.deals.filter((d) => d.stage === "won" || d.stage === "lost");
  const winRate = closed.length > 0 ? Math.round((wonDeals.length / closed.length) * 100) : 0;

  const totalLeads = input.leads.length;
  const convertedLeads = input.leads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;

  const cycleDays = wonDeals.map((d) => {
    const start = new Date(d.created_at).getTime();
    const end = new Date(d.updated_at).getTime();
    return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
  });
  const avgSalesCycleDays =
    cycleDays.length > 0 ? Math.round(cycleDays.reduce((a, b) => a + b, 0) / cycleDays.length) : 0;

  const forecastCents = openDeals.reduce(
    (s, d) => s + Math.round((d.value_cents ?? 0) * ((d.probability ?? 10) / 100)),
    0,
  );

  const byStage: Record<string, { count: number; valueCents: number }> = {};
  for (const d of input.deals) {
    if (!byStage[d.stage]) byStage[d.stage] = { count: 0, valueCents: 0 };
    byStage[d.stage].count += 1;
    byStage[d.stage].valueCents += d.value_cents ?? 0;
  }

  return {
    pipelineValueCents,
    wonValueCents,
    openDeals: openDeals.length,
    totalLeads,
    convertedLeads,
    conversionRate,
    winRate,
    avgSalesCycleDays,
    forecastCents,
    byStage,
  };
}

export async function getCrmAnalytics(supabase: SupabaseClient, userId: string) {
  const [dealsRes, leadsRes] = await Promise.all([
    supabase.from("crm_deals").select("stage, value_cents, probability, created_at, updated_at").eq("user_id", userId),
    supabase.from("crm_leads").select("status").eq("user_id", userId),
  ]);
  const summary = computeCrmAnalytics({
    deals: dealsRes.data ?? [],
    leads: leadsRes.data ?? [],
  });
  return { summary, error: dealsRes.error ?? leadsRes.error };
}
