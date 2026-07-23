import type { CRMLead } from "@/types/crm";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createContact } from "@/lib/crm/contacts";
import { createDeal } from "@/lib/crm/deals";
import { logCrmAudit } from "@/lib/crm/audit";
import { recordActivity } from "@/lib/crm/activities";

export function scoreLeadHeuristic(lead: {
  email: string;
  name?: string;
  company?: string;
  phone?: string;
  message?: string;
  source?: string;
}): number {
  let score = 20;
  if (lead.name?.trim()) score += 10;
  if (lead.company?.trim()) score += 15;
  if (lead.phone?.trim()) score += 10;
  if ((lead.message?.trim().length ?? 0) > 40) score += 15;
  if (lead.source === "marketing") score += 10;
  const domain = lead.email.split("@")[1]?.toLowerCase() ?? "";
  if (domain && !["gmail.com", "yahoo.com", "hotmail.com"].includes(domain)) score += 10;
  return Math.max(0, Math.min(100, score));
}

export async function listLeads(supabase: SupabaseClient, userId: string, status?: string) {
  let q = supabase
    .from("crm_leads")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (status) q = q.eq("status", status);
  return q;
}

export async function createLead(
  supabase: SupabaseClient,
  row: Partial<CRMLead> & { user_id: string; email: string },
) {
  const score = row.score ?? scoreLeadHeuristic(row);
  return supabase
    .from("crm_leads")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      email: row.email.toLowerCase(),
      name: row.name ?? "",
      company: row.company ?? "",
      phone: row.phone ?? "",
      source: row.source ?? "manual",
      status: row.status ?? "new",
      score,
      assignee_name: row.assignee_name ?? "",
      assignee_email: row.assignee_email ?? "",
      message: row.message ?? "",
      growth_lead_id: row.growth_lead_id ?? null,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateLead(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("crm_leads")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export async function convertLead(
  supabase: SupabaseClient,
  userId: string,
  leadId: string,
  options?: { createDeal?: boolean; dealTitle?: string; ownerName?: string; ownerEmail?: string },
) {
  const { data: lead, error: leadError } = await supabase
    .from("crm_leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", userId)
    .single();
  if (leadError || !lead) return { error: leadError ?? new Error("Lead not found") };

  const parts = String(lead.name ?? "").trim().split(/\s+/);
  const { data: contact, error: contactError } = await createContact(supabase, {
    user_id: userId,
    email: lead.email,
    first_name: parts[0] ?? "",
    last_name: parts.slice(1).join(" "),
    phone: lead.phone ?? "",
    lifecycle_stage: "opportunity",
    lead_id: leadId,
    owner_name: options?.ownerName ?? lead.assignee_name ?? "",
    owner_email: options?.ownerEmail ?? lead.assignee_email ?? "",
    metadata: { convertedFromLead: leadId, growthLeadId: lead.growth_lead_id },
  });
  if (contactError) return { error: contactError };

  let deal = null;
  if (options?.createDeal !== false) {
    const dealRes = await createDeal(supabase, {
      user_id: userId,
      title: options?.dealTitle ?? `${lead.company || lead.name || lead.email} — Opportunity`,
      contact_id: contact.id,
      lead_id: leadId,
      stage: "qualified",
      owner_name: options?.ownerName ?? "",
      owner_email: options?.ownerEmail ?? "",
    });
    if (dealRes.error) return { error: dealRes.error };
    deal = dealRes.data;
  }

  await updateLead(supabase, userId, leadId, {
    status: "converted",
    converted_contact_id: contact.id,
    converted_deal_id: deal?.id ?? null,
  });

  await recordActivity(supabase, {
    user_id: userId,
    lead_id: leadId,
    contact_id: contact.id,
    deal_id: deal?.id ?? null,
    activity_type: "system",
    subject: "Lead converted",
    body: `Converted to contact${deal ? " and deal" : ""}.`,
  });

  await logCrmAudit(supabase, {
    user_id: userId,
    action: "lead.convert",
    entity_type: "lead",
    entity_id: leadId,
    details: { contactId: contact.id, dealId: deal?.id },
  });

  return { contact, deal, error: null };
}
