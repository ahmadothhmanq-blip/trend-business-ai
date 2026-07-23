/**
 * Campaign CRUD helpers.
 */

import type { MarketingCampaign, MarketingChannel } from "@/types/marketing";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function listCampaigns(
  supabase: SupabaseClient,
  userId: string,
  filters?: { status?: string; favorite?: boolean },
) {
  let query = supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (filters?.status) query = query.eq("status", filters.status);
  if (filters?.favorite) query = query.eq("is_favorite", true);
  return query;
}

export async function getCampaign(supabase: SupabaseClient, userId: string, id: string) {
  return supabase
    .from("marketing_campaigns")
    .select("*")
    .eq("id", id)
    .eq("user_id", userId)
    .single();
}

export async function createCampaign(
  supabase: SupabaseClient,
  row: Partial<MarketingCampaign> & { user_id: string; name: string },
) {
  return supabase
    .from("marketing_campaigns")
    .insert({
      user_id: row.user_id,
      name: row.name,
      objective: row.objective ?? "",
      status: row.status ?? "draft",
      budget: row.budget ?? null,
      channels: row.channels ?? [],
      start_date: row.start_date ?? null,
      end_date: row.end_date ?? null,
      strategy: row.strategy ?? {},
      timeline: row.timeline ?? [],
      kpis: row.kpis ?? [],
      is_favorite: row.is_favorite ?? false,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateCampaign(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("marketing_campaigns")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export const DEFAULT_CHANNELS: MarketingChannel[] = [
  { type: "email", label: "Email", enabled: false },
  { type: "social", label: "Social Media", enabled: false },
  { type: "ads", label: "Paid Ads", enabled: false },
  { type: "content", label: "Content", enabled: false },
  { type: "seo", label: "SEO", enabled: false },
];
