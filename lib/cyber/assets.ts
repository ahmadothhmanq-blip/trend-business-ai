import type { SupabaseClient } from "@supabase/supabase-js";
import type { CyberAsset } from "@/types/cyber";

export async function listAssets(supabase: SupabaseClient, userId: string) {
  return supabase.from("cyber_assets").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function createAsset(supabase: SupabaseClient, row: Partial<CyberAsset> & { user_id: string; name: string }) {
  return supabase.from("cyber_assets").insert({
    user_id: row.user_id,
    organization_id: row.organization_id ?? null,
    name: row.name,
    asset_type: row.asset_type ?? "server",
    hostname: row.hostname ?? "",
    ip_address: row.ip_address ?? "",
    owner: row.owner ?? "",
    environment: row.environment ?? "production",
    status: row.status ?? "active",
    risk_score: row.risk_score ?? 0,
    metadata: row.metadata ?? {},
  }).select("*").single();
}

export async function updateAssetRisk(supabase: SupabaseClient, userId: string, assetId: string, riskScore: number) {
  return supabase.from("cyber_assets").update({ risk_score: riskScore, updated_at: new Date().toISOString() }).eq("id", assetId).eq("user_id", userId);
}
