import type { CRMContact } from "@/types/crm";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listContacts(supabase: SupabaseClient, userId: string, accountId?: string) {
  let q = supabase
    .from("crm_contacts")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (accountId) q = q.eq("account_id", accountId);
  return q;
}

export async function createContact(
  supabase: SupabaseClient,
  row: Partial<CRMContact> & { user_id: string; email: string },
) {
  return supabase
    .from("crm_contacts")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      account_id: row.account_id ?? null,
      email: row.email,
      first_name: row.first_name ?? "",
      last_name: row.last_name ?? "",
      phone: row.phone ?? "",
      title: row.title ?? "",
      lifecycle_stage: row.lifecycle_stage ?? "lead",
      tags: row.tags ?? [],
      custom_fields: row.custom_fields ?? {},
      owner_name: row.owner_name ?? "",
      owner_email: row.owner_email ?? "",
      lead_id: row.lead_id ?? null,
      growth_contact_id: row.growth_contact_id ?? null,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateContact(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("crm_contacts")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

/** Merge secondary contact into primary; deletes secondary. */
export async function mergeContacts(
  supabase: SupabaseClient,
  userId: string,
  primaryId: string,
  secondaryId: string,
) {
  const [{ data: primary }, { data: secondary }] = await Promise.all([
    supabase.from("crm_contacts").select("*").eq("id", primaryId).eq("user_id", userId).single(),
    supabase.from("crm_contacts").select("*").eq("id", secondaryId).eq("user_id", userId).single(),
  ]);
  if (!primary || !secondary) return { error: new Error("Contact not found") };

  const { data: merged, error: updateError } = await supabase
    .from("crm_contacts")
    .update({
      tags: Array.from(new Set([...(primary.tags ?? []), ...(secondary.tags ?? [])])),
      phone: primary.phone || secondary.phone || "",
      metadata: { ...(primary.metadata ?? {}), mergedFrom: secondaryId, mergedEmail: secondary.email },
      updated_at: new Date().toISOString(),
    })
    .eq("id", primaryId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (updateError) return { error: updateError };

  await supabase.from("crm_deals").update({ contact_id: primaryId }).eq("contact_id", secondaryId);
  await supabase.from("crm_tasks").update({ contact_id: primaryId }).eq("contact_id", secondaryId);
  await supabase.from("crm_activities").update({ contact_id: primaryId }).eq("contact_id", secondaryId);
  await supabase.from("crm_contacts").delete().eq("id", secondaryId).eq("user_id", userId);

  return { data: merged, error: null };
}
