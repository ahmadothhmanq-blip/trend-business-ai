/**
 * Email marketing foundation.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export async function listEmailCampaigns(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("marketing_email_campaigns")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });
}

export async function listEmailTemplates(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("marketing_email_templates")
    .select("*")
    .eq("user_id", userId)
    .order("name");
}

export async function listAudienceLists(supabase: SupabaseClient, userId: string) {
  return supabase
    .from("marketing_audience_lists")
    .select("*")
    .eq("user_id", userId)
    .order("name");
}

export async function queueEmailSend(
  supabase: SupabaseClient,
  args: { userId: string; emailCampaignId: string; recipients: string[]; scheduledAt?: string },
) {
  const rows = args.recipients.map((email) => ({
    user_id: args.userId,
    email_campaign_id: args.emailCampaignId,
    recipient_email: email,
    status: "queued",
    scheduled_at: args.scheduledAt ?? new Date().toISOString(),
  }));

  return supabase.from("marketing_email_queue").insert(rows).select("id");
}

export const DEFAULT_EMAIL_TEMPLATES = [
  { name: "Welcome", subject: "Welcome to {{brand}}", category: "onboarding" },
  { name: "Product Launch", subject: "Introducing {{product}}", category: "campaign" },
  { name: "Newsletter", subject: "Your weekly update", category: "newsletter" },
];
