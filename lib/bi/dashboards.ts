import type { BiDashboard, BiWidget } from "@/types/bi";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listDashboards(supabase: SupabaseClient, userId: string) {
  return supabase.from("bi_dashboards").select("*").eq("user_id", userId).order("updated_at", { ascending: false });
}

export async function createDashboard(
  supabase: SupabaseClient,
  row: Partial<BiDashboard> & { user_id: string; name: string },
) {
  return supabase
    .from("bi_dashboards")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      name: row.name,
      description: row.description ?? "",
      layout: row.layout ?? {},
      filters: row.filters ?? {},
      is_default: row.is_default ?? false,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function listWidgets(supabase: SupabaseClient, userId: string, dashboardId: string) {
  return supabase
    .from("bi_widgets")
    .select("*")
    .eq("user_id", userId)
    .eq("dashboard_id", dashboardId)
    .order("created_at");
}

export async function createWidget(
  supabase: SupabaseClient,
  row: Partial<BiWidget> & { user_id: string; dashboard_id: string; title: string; widget_type: BiWidget["widget_type"] },
) {
  return supabase
    .from("bi_widgets")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      dashboard_id: row.dashboard_id,
      title: row.title,
      widget_type: row.widget_type,
      metric_key: row.metric_key ?? "",
      config: row.config ?? {},
      position: row.position ?? { x: 0, y: 0, w: 4, h: 2 },
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function ensureDefaultDashboard(supabase: SupabaseClient, userId: string) {
  const { data: existing } = await supabase.from("bi_dashboards").select("id").eq("user_id", userId).limit(1);
  if (existing?.length) return { dashboardId: existing[0].id as string };

  const { data: dashboard } = await createDashboard(supabase, {
    user_id: userId,
    name: "Executive Overview",
    description: "Default BI dashboard",
    is_default: true,
  });
  if (!dashboard) throw new Error("Failed to create dashboard");

  const widgets = [
    { title: "Revenue", widget_type: "kpi" as const, metric_key: "revenue" },
    { title: "Profit", widget_type: "kpi" as const, metric_key: "profit" },
    { title: "Pipeline", widget_type: "bar" as const, metric_key: "pipeline_value" },
    { title: "Conversion", widget_type: "trend" as const, metric_key: "conversion_rate" },
  ];
  for (const w of widgets) {
    await createWidget(supabase, { user_id: userId, dashboard_id: dashboard.id, ...w });
  }
  return { dashboardId: dashboard.id };
}
