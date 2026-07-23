import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCrmSecurityContext(supabase: SupabaseClient, userId: string) {
  const { data: contacts } = await supabase.from("crm_contacts").select("id, email, lifecycle_stage").eq("user_id", userId).limit(20);
  return { contacts: contacts ?? [], contactCount: contacts?.length ?? 0 };
}

export async function getErpAssetContext(supabase: SupabaseClient, userId: string) {
  const { data: products } = await supabase.from("erp_products").select("id, name, stock_quantity").eq("user_id", userId).limit(20);
  return { inventoryAssets: products ?? [] };
}

export async function getBiSecurityMetrics(supabase: SupabaseClient, userId: string) {
  try {
    const { computeMetricsFromIntegrations } = await import("@/lib/bi/metrics");
    const { collectIntegratedMetrics } = await import("@/lib/bi/integrations");
    const integrations = await collectIntegratedMetrics(supabase, userId);
    return { metrics: computeMetricsFromIntegrations(integrations) };
  } catch {
    return { metrics: {} };
  }
}

export async function getBmIncidentTasks(supabase: SupabaseClient, userId: string) {
  const { data: tasks } = await supabase.from("business_tasks").select("id, title, status, priority").eq("user_id", userId).limit(20);
  return { tasks: tasks ?? [] };
}

export async function collectCyberIntegrations(supabase: SupabaseClient, userId: string) {
  const [crm, erp, bi, bm] = await Promise.all([
    getCrmSecurityContext(supabase, userId).catch(() => ({ contacts: [], contactCount: 0 })),
    getErpAssetContext(supabase, userId).catch(() => ({ inventoryAssets: [] })),
    getBiSecurityMetrics(supabase, userId).catch(() => ({ metrics: {} })),
    getBmIncidentTasks(supabase, userId).catch(() => ({ tasks: [] })),
  ]);
  return { crm, erp, bi, bm };
}
