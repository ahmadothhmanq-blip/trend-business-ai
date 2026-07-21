/**
 * Publishing engine — publish, schedule, retry, worker.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { getDecryptedTokens, refreshAccessToken, saveConnectedAccount } from "@/lib/social-media/oauth/tokens";
import { encryptToken } from "@/lib/social-media/crypto";
import { recordAnalytics } from "@/lib/social-media/analytics";
import { getPublisher } from "./publishers";
import type { PublishResult } from "./types";
import type { SocialPost, SocialPublishJob } from "@/types/social-media";

export type PublishPostInput = {
  userId: string;
  postId: string;
  accountId: string;
  scheduledAt?: string | null;
};

export type PublishPostOutput = {
  job: SocialPublishJob;
  result: PublishResult;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = SupabaseClient<any, any, any>;

import { SAFE_ACCOUNT_SELECT } from "@/lib/social-media/accounts";

export async function publishPost(
  supabase: AnySupabase,
  input: PublishPostInput,
): Promise<PublishPostOutput> {
  const { data: post, error: postErr } = await supabase
    .from("social_posts")
    .select("*")
    .eq("id", input.postId)
    .eq("user_id", input.userId)
    .single();

  if (postErr || !post) throw new Error("Post not found.");

  const { data: account, error: accErr } = await supabase
    .from("social_accounts")
    .select(`${SAFE_ACCOUNT_SELECT}, access_token_encrypted, refresh_token_encrypted, encrypted_token`)
    .eq("id", input.accountId)
    .eq("user_id", input.userId)
    .single();

  if (accErr || !account) throw new Error("Connected account not found.");

  const scheduledAt = input.scheduledAt ?? new Date().toISOString();
  const isImmediate = !input.scheduledAt || new Date(scheduledAt) <= new Date();

  const { data: job, error: jobErr } = await supabase
    .from("social_publish_jobs")
    .insert({
      user_id: input.userId,
      post_id: input.postId,
      account_id: input.accountId,
      platform: post.platform,
      status: isImmediate ? "processing" : "queued",
      scheduled_at: scheduledAt,
      attempts: 0,
    })
    .select("*")
    .single();

  if (jobErr || !job) throw new Error("Failed to create publish job.");

  if (!isImmediate) {
    await supabase
      .from("social_posts")
      .update({ status: "scheduled", updated_at: new Date().toISOString() })
      .eq("id", input.postId);
    return { job: job as SocialPublishJob, result: { ok: true, platformPostId: undefined } };
  }

  return executePublishJob(supabase, job as SocialPublishJob, post as SocialPost, account);
}

export async function schedulePost(
  supabase: AnySupabase,
  input: PublishPostInput & { scheduledAt: string },
) {
  return publishPost(supabase, input);
}

export async function retryFailedJob(
  supabase: AnySupabase,
  userId: string,
  jobId: string,
): Promise<PublishPostOutput> {
  const { data: job } = await supabase
    .from("social_publish_jobs")
    .select("*")
    .eq("id", jobId)
    .eq("user_id", userId)
    .single();

  if (!job) throw new Error("Job not found.");
  if (job.status !== "failed") throw new Error("Only failed jobs can be retried.");
  if (job.attempts >= job.max_attempts) throw new Error("Max retry attempts reached.");

  const { data: post } = await supabase.from("social_posts").select("*").eq("id", job.post_id).single();
  const { data: account } = await supabase
    .from("social_accounts")
    .select(`${SAFE_ACCOUNT_SELECT}, access_token_encrypted, refresh_token_encrypted, encrypted_token`)
    .eq("id", job.account_id)
    .single();

  if (!post || !account) throw new Error("Post or account missing.");

  await supabase
    .from("social_publish_jobs")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", jobId);

  return executePublishJob(supabase, job as SocialPublishJob, post as SocialPost, account);
}

async function executePublishJob(
  supabase: AnySupabase,
  job: SocialPublishJob,
  post: SocialPost,
  account: Record<string, unknown>,
): Promise<PublishPostOutput> {
  const publisher = getPublisher(String(post.platform));
  if (!publisher) {
    await failJob(supabase, job.id, "No publisher for platform.");
    return { job, result: { ok: false, error: "No publisher" } };
  }

  let tokens = await getDecryptedTokens(account as { access_token_encrypted?: string; refresh_token_encrypted?: string; encrypted_token?: string });

  const expiresAt = account.expires_at as string | null;
  if (expiresAt && new Date(expiresAt) < new Date() && tokens.refreshToken) {
    try {
      const refreshed = await refreshAccessToken(String(account.platform), tokens.refreshToken);
      tokens = { accessToken: refreshed.accessToken, refreshToken: refreshed.refreshToken };
      await supabase
        .from("social_accounts")
        .update({
          access_token_encrypted: encryptToken(refreshed.accessToken),
          refresh_token_encrypted: encryptToken(refreshed.refreshToken),
          encrypted_token: encryptToken(refreshed.accessToken),
          expires_at: refreshed.expiresAt,
          token_expires_at: refreshed.expiresAt,
          status: "connected",
          connection_status: "connected",
        })
        .eq("id", account.id as string);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Token refresh failed";
      await failJob(supabase, job.id, msg);
      return { job, result: { ok: false, error: msg } };
    }
  }

  const ctx = {
    accessToken: tokens.accessToken,
    accountId: String(account.account_id ?? account.id),
    platformAccountId: String((account.metadata as Record<string, string>)?.platform_account_id ?? account.account_id ?? ""),
  };

  const validation = await publisher.validateAccount(ctx);
  if (!validation.valid) {
    await failJob(supabase, job.id, validation.error ?? "Invalid account");
    return { job, result: { ok: false, error: validation.error } };
  }

  const result = await publisher.publish(
    {
      caption: post.caption,
      postText: post.post_text,
      mediaUrl: post.media_url,
      hashtags: post.hashtags,
    },
    ctx,
  );

  const attempts = (job.attempts ?? 0) + 1;

  if (result.ok) {
    const now = new Date().toISOString();
    await supabase
      .from("social_publish_jobs")
      .update({
        status: "published",
        published_at: now,
        platform_post_id: result.platformPostId ?? "",
        platform_response: result.response ?? {},
        attempts,
        error: "",
        updated_at: now,
      })
      .eq("id", job.id);

    await supabase
      .from("social_posts")
      .update({
        status: "published",
        metadata: { ...(post.metadata ?? {}), platform_post_id: result.platformPostId, published_at: now },
        updated_at: now,
      })
      .eq("id", post.id);

    await recordAnalytics(supabase, {
      userId: job.user_id,
      postId: post.id,
      platform: post.platform,
      impressions: 0,
      likes: 0,
      comments: 0,
      shares: 0,
    });

    const { data: updatedJob } = await supabase.from("social_publish_jobs").select("*").eq("id", job.id).single();
    return { job: (updatedJob ?? job) as SocialPublishJob, result };
  }

  await supabase
    .from("social_publish_jobs")
    .update({
      status: attempts >= (job.max_attempts ?? 3) ? "failed" : "pending",
      attempts,
      error: result.error ?? "Publish failed",
      platform_response: result.response ?? {},
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id);

  if (attempts >= (job.max_attempts ?? 3)) {
    await supabase.from("social_posts").update({ status: "failed" }).eq("id", post.id);
  }

  const { data: updatedJob } = await supabase.from("social_publish_jobs").select("*").eq("id", job.id).single();
  return { job: (updatedJob ?? job) as SocialPublishJob, result };
}

async function failJob(supabase: AnySupabase, jobId: string, error: string) {
  await supabase
    .from("social_publish_jobs")
    .update({ status: "failed", error, updated_at: new Date().toISOString() })
    .eq("id", jobId);
}

/** Process due scheduled publish jobs (worker foundation). */
export async function processScheduledJobs(supabase: AnySupabase, limit = 20) {
  const now = new Date().toISOString();
  const { data: jobs } = await supabase
    .from("social_publish_jobs")
    .select("*")
    .in("status", ["queued", "pending"])
    .lte("scheduled_at", now)
    .order("scheduled_at")
    .limit(limit);

  const results: PublishPostOutput[] = [];
  for (const job of jobs ?? []) {
    const { data: post } = await supabase.from("social_posts").select("*").eq("id", job.post_id).single();
    const { data: account } = await supabase
      .from("social_accounts")
      .select(`${SAFE_ACCOUNT_SELECT}, access_token_encrypted, refresh_token_encrypted, encrypted_token`)
      .eq("id", job.account_id)
      .single();
    if (!post || !account) continue;
    await supabase.from("social_publish_jobs").update({ status: "processing" }).eq("id", job.id);
    results.push(await executePublishJob(supabase, job as SocialPublishJob, post as SocialPost, account));
  }
  return results;
}

// Re-export schedule helpers from legacy module
export { queuePostSchedule, canPublish, nextScheduleStatus } from "../publishing-legacy";
