import type { CRMDeal, CRMDealStageKey, CRMStage } from "@/types/crm";
import type { SupabaseClient } from "@supabase/supabase-js";

export const DEFAULT_STAGES: Array<Omit<CRMStage, "id" | "user_id" | "organization_id" | "created_at" | "updated_at" | "metadata">> = [
  { key: "new", label: "New", sort_order: 0, probability_default: 10, is_closed: false },
  { key: "qualified", label: "Qualified", sort_order: 1, probability_default: 25, is_closed: false },
  { key: "proposal", label: "Proposal", sort_order: 2, probability_default: 50, is_closed: false },
  { key: "negotiation", label: "Negotiation", sort_order: 3, probability_default: 75, is_closed: false },
  { key: "won", label: "Won", sort_order: 4, probability_default: 100, is_closed: true },
  { key: "lost", label: "Lost", sort_order: 5, probability_default: 0, is_closed: true },
];

export async function ensureDefaultStages(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from("crm_stages").select("id").eq("user_id", userId).limit(1);
  if (data && data.length > 0) return;

  await supabase.from("crm_stages").insert(
    DEFAULT_STAGES.map((s) => ({
      user_id: userId,
      key: s.key,
      label: s.label,
      sort_order: s.sort_order,
      probability_default: s.probability_default,
      is_closed: s.is_closed,
    })),
  );
}

export async function listStages(supabase: SupabaseClient, userId: string) {
  await ensureDefaultStages(supabase, userId);
  return supabase
    .from("crm_stages")
    .select("*")
    .eq("user_id", userId)
    .order("sort_order", { ascending: true });
}

export async function listDeals(supabase: SupabaseClient, userId: string, stage?: CRMDealStageKey) {
  let q = supabase
    .from("crm_deals")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (stage) q = q.eq("stage", stage);
  return q;
}

export async function createDeal(
  supabase: SupabaseClient,
  row: Partial<CRMDeal> & { user_id: string; title: string },
) {
  return supabase
    .from("crm_deals")
    .insert({
      user_id: row.user_id,
      organization_id: row.organization_id ?? null,
      account_id: row.account_id ?? null,
      contact_id: row.contact_id ?? null,
      lead_id: row.lead_id ?? null,
      title: row.title,
      stage: row.stage ?? "new",
      value_cents: row.value_cents ?? 0,
      currency: row.currency ?? "USD",
      probability: row.probability ?? 10,
      expected_close_at: row.expected_close_at ?? null,
      owner_name: row.owner_name ?? "",
      owner_email: row.owner_email ?? "",
      notes: row.notes ?? "",
      growth_deal_id: row.growth_deal_id ?? null,
      metadata: row.metadata ?? {},
    })
    .select("*")
    .single();
}

export async function updateDeal(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  patch: Record<string, unknown>,
) {
  return supabase
    .from("crm_deals")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();
}

export function groupDealsByStage(deals: CRMDeal[]): Record<CRMDealStageKey, CRMDeal[]> {
  const keys: CRMDealStageKey[] = ["new", "qualified", "proposal", "negotiation", "won", "lost"];
  const groups = Object.fromEntries(keys.map((k) => [k, [] as CRMDeal[]])) as Record<
    CRMDealStageKey,
    CRMDeal[]
  >;
  for (const deal of deals) {
    const stage = keys.includes(deal.stage) ? deal.stage : "new";
    groups[stage].push(deal);
  }
  return groups;
}
