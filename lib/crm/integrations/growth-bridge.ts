/**
 * Read-only Growth Engine bridge — preserves legacy growth_* tables.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function importFromGrowthEngine(supabase: SupabaseClient, userId: string) {
  const [contacts, deals, leads] = await Promise.all([
    supabase.from("growth_contacts").select("*").eq("user_id", userId).limit(50),
    supabase.from("growth_deals").select("*").eq("user_id", userId).limit(50),
    supabase.from("growth_leads").select("*").eq("owner_user_id", userId).limit(50),
  ]);

  let importedContacts = 0;
  let importedDeals = 0;
  let importedLeads = 0;

  for (const c of contacts.data ?? []) {
    const { data: existing } = await supabase
      .from("crm_contacts")
      .select("id")
      .eq("user_id", userId)
      .eq("email", c.email)
      .maybeSingle();
    if (existing) continue;

    const { error } = await supabase.from("crm_contacts").insert({
        user_id: userId,
        email: c.email,
        first_name: c.name?.split(" ")[0] ?? "",
        last_name: c.name?.split(" ").slice(1).join(" ") ?? "",
        phone: c.phone ?? "",
        lifecycle_stage: c.lifecycle_stage ?? "lead",
        tags: c.tags ?? [],
        growth_contact_id: c.id,
        metadata: { importedFromGrowth: true },
    });
    if (!error) importedContacts++;
  }

  for (const l of leads.data ?? []) {
    const { error } = await supabase.from("crm_leads").insert({
      user_id: userId,
      email: l.email,
      name: l.name ?? "",
      company: l.company ?? "",
      phone: l.phone ?? "",
      source: l.source ?? "growth",
      status: l.status === "won" ? "converted" : "new",
      score: l.score ?? 0,
      message: l.message ?? "",
      growth_lead_id: l.id,
      metadata: { importedFromGrowth: true },
    });
    if (!error) importedLeads++;
  }

  for (const d of deals.data ?? []) {
    const { error } = await supabase.from("crm_deals").insert({
      user_id: userId,
      title: d.title,
      stage: d.stage,
      value_cents: d.value_cents ?? 0,
      probability: d.probability ?? 10,
      notes: d.notes ?? "",
      growth_deal_id: d.id,
      metadata: { importedFromGrowth: true },
    });
    if (!error) importedDeals++;
  }

  return { importedContacts, importedDeals, importedLeads };
}
