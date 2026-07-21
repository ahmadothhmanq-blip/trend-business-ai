/**
 * Legacy scheduling helpers (calendar integration).
 */

import type { SocialSchedule, SocialScheduleStatus } from "@/types/social-media";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function queuePostSchedule(
  supabase: SupabaseClient,
  args: {
    userId: string;
    postId: string;
    scheduledAt: string;
    timezone?: string;
    accountId?: string | null;
  },
) {
  const { data, error } = await supabase
    .from("social_schedules")
    .insert({
      user_id: args.userId,
      post_id: args.postId,
      scheduled_at: args.scheduledAt,
      timezone: args.timezone ?? "UTC",
      account_id: args.accountId ?? null,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) return { data: null, error };

  await supabase
    .from("social_posts")
    .update({ status: "scheduled", updated_at: new Date().toISOString() })
    .eq("id", args.postId)
    .eq("user_id", args.userId);

  return { data, error: null };
}

export function canPublish(schedule: SocialSchedule): boolean {
  return schedule.status === "pending" || schedule.status === "queued";
}

export function nextScheduleStatus(
  current: SocialScheduleStatus,
  success: boolean,
): SocialScheduleStatus {
  if (success) return "published";
  return "failed";
}
