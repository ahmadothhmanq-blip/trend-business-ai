import type { SupabaseClient } from "@supabase/supabase-js";

export async function getCrmContacts(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("crm_contacts").select("id, first_name, last_name, email, lifecycle_stage, created_at").eq("user_id", userId).limit(50);
  return { contacts: data ?? [], count: data?.length ?? 0 };
}

export async function getCrmDeals(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("crm_deals").select("id, title, stage, value_cents, created_at").eq("user_id", userId).limit(50);
  const rows = data ?? [];
  const pipeline = rows.filter((d) => d.stage !== "won" && d.stage !== "lost");
  return { deals: rows, pipelineCount: pipeline.length, pipelineValueCents: pipeline.reduce((s, d) => s + Number(d.value_cents ?? 0), 0) };
}

export async function getCustomerSummary(supabase: SupabaseClient, userId: string) {
  const [contacts, deals, leads] = await Promise.all([
    supabase.from("crm_contacts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("crm_deals").select("id, stage, value_cents").eq("user_id", userId),
    supabase.from("crm_leads").select("id, status").eq("user_id", userId),
  ]);
  const dealRows = deals.data ?? [];
  const leadRows = leads.data ?? [];
  return {
    contactCount: contacts.count ?? 0,
    dealCount: dealRows.length,
    openDeals: dealRows.filter((d) => d.stage !== "won" && d.stage !== "lost").length,
    convertedLeads: leadRows.filter((l) => l.status === "converted").length,
  };
}

export async function createCrmTask(supabase: SupabaseClient, userId: string, args: Record<string, unknown>) {
  const title = String(args.title ?? "Agent task");
  const { data, error } = await supabase.from("crm_tasks").insert({
    user_id: userId,
    title,
    description: String(args.description ?? "Created by AI Agent"),
    status: "pending",
    priority: String(args.priority ?? "medium"),
  }).select("*").single();
  if (error) throw error;
  return { task: data };
}
