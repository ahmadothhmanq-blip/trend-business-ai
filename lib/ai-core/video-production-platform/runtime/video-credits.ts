/**
 * Video Studio credit semantics on top of the existing AI usage ledger.
 * One platform credit per successful paid path. Provider estimates stay
 * on jobs and are never recorded as actual provider billing.
 */
import {
  authorizeAiUsageCredits,
  type BeginAiUsageResult,
} from "@/lib/billing/ai-usage-settlement";
import {
  consumeCreditsForUsage,
  refundCreditsForUsage,
} from "@/lib/billing/credits";

export const VIDEO_STUDIO_CREDIT_RESOURCE = "video-studio";
export const VIDEO_STUDIO_CREDIT_AMOUNT = 1;

export type VideoCreditOutcome = "success" | "failed" | "deferred" | "reused";

export type VideoCreditPath = "director" | "render" | "regenerate" | "lipsync";

export function videoStudioCreditOperationId(input: {
  kind: VideoCreditPath;
  projectId: string;
  attempt?: number;
  sceneId?: string;
  jobKey?: string;
}): string {
  const attempt = Math.max(1, input.attempt ?? 1);
  switch (input.kind) {
    case "director":
      return `video-studio:director:${input.projectId}`;
    case "render":
      return `video-studio:render:${input.projectId}:a${attempt}`;
    case "regenerate":
      return `video-studio:regenerate:${input.projectId}:${input.sceneId}:a${attempt}`;
    case "lipsync":
      return `video-studio:lipsync:${input.jobKey || `${input.projectId}:a${attempt}`}`;
  }
}

export function directorCreditOutcome(directed: {
  status: string;
  reused?: boolean;
  plan?: unknown;
}): VideoCreditOutcome {
  if (directed.status === "failed" || !directed.plan) return "failed";
  if (directed.reused || directed.status === "reused") return "reused";
  return "success";
}

export function renderCreditOutcome(result: {
  domainState: string;
  job: { status: string; assemblyManifest?: { method?: string } | null };
  errorCode?: string | null;
}): VideoCreditOutcome {
  const assemblyMethod = result.job.assemblyManifest?.method;
  if (assemblyMethod === "first-clip" || assemblyMethod === "manifest-only") {
    return "failed";
  }
  if (result.domainState === "video_rendered") return "success";
  if (
    result.job.status === "processing" ||
    result.domainState === "processing" ||
    result.domainState === "generating"
  ) {
    return "deferred";
  }
  if (result.errorCode || result.job.status === "failed" || result.domainState === "failed") {
    return "failed";
  }
  return "deferred";
}

export function regenerationCreditOutcome(result: {
  status: string;
  reused?: boolean;
}): VideoCreditOutcome {
  if (result.reused && result.status === "ready") return "reused";
  if (result.status === "ready") return "success";
  if (result.status === "processing") return "deferred";
  return "failed";
}

export function lipSyncCreditOutcome(result: {
  reused?: boolean;
  succeeded: boolean;
}): VideoCreditOutcome {
  if (result.reused) return "reused";
  if (result.succeeded) return "success";
  return "failed";
}

/**
 * Persist estimated provider quotes separately from actual billing.
 * Unknown provider prices stay null — never copy estimated into actual.
 */
export function honestProviderJobCost(input: {
  succeeded: boolean;
  reused: boolean;
  estimated: number | null;
  providerActual?: number | null;
}): { estimatedCost: number | null; actualCost: number | null } {
  if (input.reused) {
    return { estimatedCost: null, actualCost: null };
  }
  if (!input.succeeded) {
    return { estimatedCost: input.estimated, actualCost: 0 };
  }
  const actual = input.providerActual;
  const hasActual = typeof actual === "number" && Number.isFinite(actual) && actual >= 0;
  return {
    estimatedCost: input.estimated,
    actualCost: hasActual ? actual : null,
  };
}

export function isRegenerationProviderJob(job: { idempotencyKey: string }): boolean {
  const parts = job.idempotencyKey.split(":");
  return parts[3] === "regen";
}

export async function authorizeVideoStudioCredits(input: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  operationId: string;
}): Promise<BeginAiUsageResult> {
  return authorizeAiUsageCredits(
    input.supabase,
    input.userId,
    VIDEO_STUDIO_CREDIT_RESOURCE,
    VIDEO_STUDIO_CREDIT_AMOUNT,
    input.operationId,
  );
}

export async function applyVideoStudioCreditOutcome(input: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any;
  userId: string;
  operationId: string;
  outcome: VideoCreditOutcome;
}): Promise<void> {
  if (input.outcome === "deferred" || input.outcome === "reused") return;
  if (input.outcome === "success") {
    await consumeCreditsForUsage(
      input.supabase,
      input.userId,
      VIDEO_STUDIO_CREDIT_RESOURCE,
      VIDEO_STUDIO_CREDIT_AMOUNT,
      input.operationId,
    );
    return;
  }
  await refundCreditsForUsage(
    input.supabase,
    input.userId,
    VIDEO_STUDIO_CREDIT_RESOURCE,
    VIDEO_STUDIO_CREDIT_AMOUNT,
    input.operationId,
  );
}
