/**
 * Supabase persistence for website leads (migration 047).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { FormIntegrationConfig } from "@/lib/ai-core/website-design-platform/types";
import type { StoredWebsiteLead } from "@/lib/ai-core/website-design-platform/forms";

type LeadRow = {
  id: string;
  generation_id: string;
  user_id: string | null;
  form_type: string;
  fields: Record<string, string>;
  page_path: string | null;
  locale: string | null;
  status: string;
  integration: FormIntegrationConfig;
  created_at: string;
  updated_at: string;
};

export function isLeadsTableMissing(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("website_leads") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

function rowToLead(row: LeadRow): StoredWebsiteLead {
  return {
    id: row.id,
    generationId: row.generation_id,
    userId: row.user_id ?? undefined,
    formType: row.form_type as StoredWebsiteLead["formType"],
    fields: row.fields,
    pagePath: row.page_path ?? undefined,
    locale: row.locale ?? undefined,
    status: row.status as StoredWebsiteLead["status"],
    integration: row.integration,
    createdAt: row.created_at,
  };
}

export async function insertWebsiteLeadDb(
  client: SupabaseClient,
  lead: StoredWebsiteLead,
): Promise<StoredWebsiteLead | null> {
  const { data, error } = await client
    .from("website_leads")
    .insert({
      generation_id: lead.generationId,
      user_id: lead.userId ?? null,
      form_type: lead.formType,
      fields: lead.fields,
      page_path: lead.pagePath ?? null,
      locale: lead.locale ?? null,
      status: lead.status,
      integration: lead.integration ?? {},
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToLead(data as LeadRow);
}

export async function listWebsiteLeadsDb(
  client: SupabaseClient,
  generationId: string,
  limit = 200,
): Promise<StoredWebsiteLead[]> {
  const { data, error } = await client
    .from("website_leads")
    .select("*")
    .eq("generation_id", generationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as LeadRow[]).map(rowToLead);
}

export async function updateWebsiteLeadStatusDb(
  client: SupabaseClient,
  leadId: string,
  status: StoredWebsiteLead["status"],
): Promise<StoredWebsiteLead | null> {
  const { data, error } = await client
    .from("website_leads")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", leadId)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToLead(data as LeadRow);
}

export function leadsToCsv(leads: StoredWebsiteLead[]): string {
  const headers = ["id", "formType", "status", "pagePath", "createdAt", "fields"];
  const rows = leads.map((lead) =>
    [
      lead.id,
      lead.formType,
      lead.status,
      lead.pagePath ?? "",
      lead.createdAt,
      JSON.stringify(lead.fields),
    ]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(","),
  );
  return [headers.join(","), ...rows].join("\n");
}
