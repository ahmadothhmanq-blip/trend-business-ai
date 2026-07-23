import type { SupabaseClient } from "@supabase/supabase-js";
import type { CyberAnalyticsSummary } from "@/types/cyber";

export async function getCyberAnalytics(supabase: SupabaseClient, userId: string): Promise<{ summary: CyberAnalyticsSummary }> {
  const [threats, vulns, incidents, alerts, assets, findings, events] = await Promise.all([
    supabase.from("cyber_threats").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "active"),
    supabase.from("cyber_vulnerabilities").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "open"),
    supabase.from("cyber_incidents").select("id, created_at, resolved_at", { count: "exact" }).eq("user_id", userId).in("status", ["open", "investigating", "contained"]),
    supabase.from("cyber_alerts").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("status", "open"),
    supabase.from("cyber_assets").select("id, risk_score", { count: "exact" }).eq("user_id", userId),
    supabase.from("cyber_findings").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("severity", "critical"),
    supabase.from("cyber_events").select("id", { count: "exact", head: true }).eq("user_id", userId).gte("recorded_at", new Date(Date.now() - 86400000).toISOString()),
  ]);

  const assetRows = assets.data ?? [];
  const avgAssetRisk = assetRows.length > 0 ? assetRows.reduce((s, a) => s + Number(a.risk_score ?? 0), 0) / assetRows.length : 0;
  const incidentRows = incidents.data ?? [];
  const resolved = incidentRows.filter((i) => i.resolved_at);
  const avgResponse = resolved.length > 0
    ? resolved.reduce((s, i) => s + (new Date(i.resolved_at!).getTime() - new Date(i.created_at).getTime()), 0) / resolved.length
    : 0;

  const vulnCount = vulns.count ?? 0;
  const threatCount = threats.count ?? 0;
  const riskScore = Math.min(100, Math.round(avgAssetRisk * 0.4 + vulnCount * 3 + threatCount * 5 + (alerts.count ?? 0) * 2));

  await supabase.from("cyber_risk_scores").insert({
    user_id: userId,
    score: riskScore,
    factors: { avgAssetRisk, vulnCount, threatCount, openAlerts: alerts.count ?? 0 },
  });

  return {
    summary: {
      riskScore,
      activeThreats: threatCount,
      openVulnerabilities: vulnCount,
      openIncidents: incidents.count ?? 0,
      openAlerts: alerts.count ?? 0,
      alertVolume24h: events.count ?? 0,
      avgResponseTimeMs: Math.round(avgResponse),
      assetCount: assets.count ?? 0,
      criticalFindings: findings.count ?? 0,
    },
  };
}
