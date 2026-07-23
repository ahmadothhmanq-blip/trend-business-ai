/**
 * Marketing automation / workflow foundation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export const WORKFLOW_STEP_TYPES = [
  "send_email",
  "wait",
  "tag_audience",
  "notify",
  "condition",
  "webhook",
] as const;

export async function listWorkflows(supabase: SupabaseClient, userId: string, campaignId?: string) {
  let query = supabase
    .from("marketing_workflows")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
  if (campaignId) query = query.eq("campaign_id", campaignId);
  return query;
}

export async function createWorkflow(supabase: SupabaseClient, row: Record<string, unknown>) {
  return supabase.from("marketing_workflows").insert(row).select("*").single();
}

export function defaultWelcomeWorkflow(userId: string, campaignId?: string | null) {
  return {
    user_id: userId,
    campaign_id: campaignId ?? null,
    name: "Welcome sequence",
    status: "draft",
    trigger_type: "signup",
    steps: [
      { id: "1", type: "send_email", label: "Welcome email", config: { template: "welcome" } },
      { id: "2", type: "wait", label: "Wait 2 days", config: { days: 2 } },
      { id: "3", type: "send_email", label: "Value email", config: { template: "value" } },
    ],
  };
}
