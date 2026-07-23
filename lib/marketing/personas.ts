/**
 * Customer persona helpers.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function listPersonas(supabase: SupabaseClient, userId: string, campaignId?: string) {
  let query = supabase
    .from("marketing_personas")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (campaignId) query = query.eq("campaign_id", campaignId);
  return query;
}

export async function createPersona(supabase: SupabaseClient, row: Record<string, unknown>) {
  return supabase.from("marketing_personas").insert(row).select("*").single();
}

export async function updatePersona(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("marketing_personas")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}
