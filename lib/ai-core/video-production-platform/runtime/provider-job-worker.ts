/**
 * Background poll / resume for ProviderJobs (Phase 6D).
 * HTTP submit persists the job and returns; this worker completes the render.
 */

import { randomUUID } from "node:crypto";
import { nowIso } from "@/lib/ai-core/video-production-platform/ids";
import { isValidVideoArtifact } from "@/lib/ai-core/video-production-platform/domain/validation";
import {
  insertQualityReport,
  listDueProviderJobs,
  loadPlayableSceneArtifact,
  loadSceneById,
  updateProviderJob,
  updateSceneRecord,
  type ProviderJobRecord,
} from "@/lib/ai-core/video-production-platform/persistence";
import { persistRoutedProviderJob, createSupabaseProviderJobStore, createProviderRegistry } from "@/lib/ai-core/video-production-platform/provider-router";
import type { ProviderJobHandle, ProviderV2Id, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { buildSceneRouterInput } from "@/lib/ai-core/video-production-platform/provider-router/scene-to-provider";
import { isRetryableProviderError } from "@/lib/ai-core/video-production-platform/providers/provider-errors";
import { ingestProviderArtifact } from "@/lib/ai-core/video-production-platform/runtime/ingest";
import { resumeDomainRender } from "@/lib/ai-core/video-production-platform/runtime/render-pipeline";
import {
  PROVIDER_MAX_RETRY_COUNT,
  isProviderJobStale,
  nextPollAt,
} from "@/lib/ai-core/video-production-platform/runtime/timeouts";
import { loadGenerationDomainRow } from "@/lib/ai-core/video-production-platform/runtime/seed";
import { extractProductionModel } from "@/lib/ai-core/video-production-platform/management";
import {
  applyVideoStudioCreditOutcome,
  isRegenerationProviderJob,
  renderCreditOutcome,
  videoStudioCreditOperationId,
} from "@/lib/ai-core/video-production-platform/runtime/video-credits";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySupabase = any;

export type ProcessDueProviderJobsResult = {
  processed: number;
  polled: number;
  succeeded: number;
  failed: number;
  retried: number;
  stale: number;
  resumedProjects: number;
  results: Array<{ jobId: string; status: string; action: string }>;
};

function registryFor(options?: { registry?: Record<ProviderV2Id, VideoProviderV2> }) {
  return options?.registry || createProviderRegistry();
}

async function ingestIfNeeded(input: {
  supabase: AnySupabase;
  job: ProviderJobRecord;
  handle: ProviderJobHandle;
}): Promise<"ingested" | "kept" | "skipped"> {
  if (input.handle.status !== "succeeded") return "skipped";
  const existing = await loadPlayableSceneArtifact(input.supabase, input.job.projectId, input.job.sceneId);
  if (existing && isValidVideoArtifact(existing)) return "kept";
  if (!input.job.userId) return "skipped";
  const scene = await loadSceneById(input.supabase, input.job.sceneId);
  const artifact = await ingestProviderArtifact({
    supabase: input.supabase,
    userId: input.job.userId,
    projectId: input.job.projectId,
    sceneId: input.job.sceneId,
    handle: input.handle,
    declaredDurationSec: scene?.duration || 8,
    aspectRatio: "16:9",
    kind: "scene_clip",
  });
  await updateSceneRecord(input.supabase, {
    id: input.job.sceneId,
    status: "ready",
    artifactId: artifact.id,
  });
  try {
    await insertQualityReport(input.supabase, {
      userId: input.job.userId,
      report: {
        id: randomUUID(),
        projectId: input.job.projectId,
        subject: "scene",
        subjectId: input.job.sceneId,
        ready: true,
        score: 100,
        summary: "Async provider artifact passed validation.",
        blockers: [],
      },
      warnings: [],
    });
  } catch {
    /* QC additive */
  }
  return "ingested";
}

async function providerRetry(input: {
  supabase: AnySupabase;
  job: ProviderJobRecord;
  registry: Record<ProviderV2Id, VideoProviderV2>;
}): Promise<ProviderJobRecord | null> {
  if (!input.job.userId) return null;
  if (input.job.retryCount >= PROVIDER_MAX_RETRY_COUNT) return null;
  const existing = await loadPlayableSceneArtifact(input.supabase, input.job.projectId, input.job.sceneId);
  if (existing && isValidVideoArtifact(existing)) return null;
  const scene = await loadSceneById(input.supabase, input.job.sceneId);
  if (!scene) return null;
  const nextAttempt = (input.job.attempt || 1) + 1;
  const routed = await persistRoutedProviderJob({
    userId: input.job.userId,
    routeInput: buildSceneRouterInput(scene, {
      projectId: input.job.projectId,
      aspectRatio: "16:9",
      mode: "full",
      quality: "standard",
      idempotencySalt: `provider-retry:${nextAttempt}`,
    }),
    store: createSupabaseProviderJobStore(input.supabase),
    registry: input.registry,
    attempt: nextAttempt,
  });
  await updateProviderJob(input.supabase, {
    id: input.job.id,
    userId: input.job.userId,
    retryCount: input.job.retryCount + 1,
    errorMessage: input.job.errorMessage,
  });
  if (routed.reused) return routed.job as ProviderJobRecord;
  await updateProviderJob(input.supabase, {
    id: routed.job.id,
    userId: input.job.userId,
    retryCount: input.job.retryCount + 1,
    nextPollAt: nextPollAt(),
  });
  return routed.job as ProviderJobRecord;
}

async function applyRegenJobCredits(input: {
  supabase: AnySupabase;
  job: ProviderJobRecord;
  outcome: "success" | "failed";
}) {
  if (!input.job.userId || !isRegenerationProviderJob(input.job)) return;
  await applyVideoStudioCreditOutcome({
    supabase: input.supabase,
    userId: input.job.userId,
    operationId: videoStudioCreditOperationId({
      kind: "regenerate",
      projectId: input.job.projectId,
      sceneId: input.job.sceneId,
      attempt: input.job.attempt || 1,
    }),
    outcome: input.outcome,
  });
}

async function resumeProjects(input: {
  supabase: AnySupabase;
  projectIds: string[];
  registry?: Record<ProviderV2Id, VideoProviderV2>;
}): Promise<number> {
  let resumed = 0;
  for (const projectId of [...new Set(input.projectIds)]) {
    const jobs = await input.supabase
      .from("video_provider_jobs")
      .select("user_id")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();
    const userId = jobs?.data?.user_id as string | undefined;
    if (!userId) continue;
    const generation = await loadGenerationDomainRow(input.supabase, projectId, userId);
    if (!generation) continue;
    const model = extractProductionModel(generation.blueprint, {
      prompt: generation.prompt,
      style: generation.style,
      aspectRatio: generation.aspect_ratio,
      duration: generation.duration,
      videoType: generation.video_type,
    });
    try {
      await resumeDomainRender({
        model,
        supabase: input.supabase,
        userId,
        generationId: projectId,
        skipAudio: false,
        registry: input.registry,
        skipCredits: true,
      });
      resumed += 1;
    } catch {
      /* resume is best-effort after artifact ingest */
    }
  }
  return resumed;
}

export async function processDueProviderJobs(params: {
  supabase: AnySupabase;
  limit?: number;
  registry?: Record<ProviderV2Id, VideoProviderV2>;
  nowMs?: number;
  /** When set, only poll/update jobs owned by this tenant. Omit only for the secret-gated cron worker. */
  userId?: string;
}): Promise<ProcessDueProviderJobsResult> {
  const registry = registryFor(params);
  const due = await listDueProviderJobs(params.supabase, {
    limit: params.limit ?? 10,
    userId: params.userId,
  });
  const results: ProcessDueProviderJobsResult["results"] = [];
  const projectIds: string[] = [];
  let polled = 0;
  let succeeded = 0;
  let failed = 0;
  let retried = 0;
  let stale = 0;

  for (const job of due) {
    if (params.userId && job.userId !== params.userId) {
      continue;
    }
    const provider = registry[job.provider as ProviderV2Id];
    if (!provider || provider.status() === "unconfigured") {
      await updateProviderJob(params.supabase, {
        id: job.id,
        userId: job.userId,
        status: "failed",
        errorCode: "unconfigured",
        errorMessage: `Provider ${job.provider} is unavailable.`,
        completedAt: nowIso(),
      });
      failed += 1;
      results.push({ jobId: job.id, status: "failed", action: "unavailable" });
      await applyRegenJobCredits({ supabase: params.supabase, job, outcome: "failed" });
      continue;
    }

    if (
      isProviderJobStale({
        startedAt: job.startedAt,
        submittedAt: job.submittedAt,
        createdAt: job.createdAt,
        nextPollAt: job.nextPollAt,
        nowMs: params.nowMs,
      })
    ) {
      await updateProviderJob(params.supabase, {
        id: job.id,
        userId: job.userId,
        status: "failed",
        errorCode: "stale_job",
        errorMessage: "Provider job exceeded stale-job timeout after poll eligibility.",
        completedAt: nowIso(),
      });
      await updateSceneRecord(params.supabase, { id: job.sceneId, status: "failed" });
      stale += 1;
      failed += 1;
      results.push({ jobId: job.id, status: "failed", action: "stale" });
      await applyRegenJobCredits({ supabase: params.supabase, job, outcome: "failed" });
      continue;
    }

    let handle: ProviderJobHandle;
    try {
      if (job.externalJobId) {
        polled += 1;
        handle = await provider.pollJob(job.externalJobId, job.idempotencyKey);
      } else {
        handle = {
          provider: job.provider as ProviderV2Id,
          status: "processing",
          idempotencyKey: job.idempotencyKey,
          message: "Waiting for provider submission handle.",
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Provider poll failed.";
      await updateProviderJob(params.supabase, {
        id: job.id,
        userId: job.userId,
        status: "failed",
        errorCode: "provider_failed",
        errorMessage: message,
        completedAt: nowIso(),
      });
      failed += 1;
      results.push({ jobId: job.id, status: "failed", action: "poll-error" });
      await applyRegenJobCredits({ supabase: params.supabase, job, outcome: "failed" });
      continue;
    }

    if (handle.status === "processing" || handle.status === "queued" || handle.status === "submitted") {
      await updateProviderJob(params.supabase, {
        id: job.id,
        userId: job.userId,
        status: handle.status === "queued" ? "queued" : "processing",
        externalJobId: handle.externalJobId ?? job.externalJobId ?? null,
        nextPollAt: nextPollAt(params.nowMs),
        errorCode: null,
        errorMessage: handle.message,
      });
      results.push({ jobId: job.id, status: "processing", action: "poll" });
      continue;
    }

    if (handle.status === "succeeded") {
      let ingest: "ingested" | "kept" | "skipped" | "failed" = "skipped";
      try {
        ingest = await ingestIfNeeded({ supabase: params.supabase, job, handle });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Artifact ingest failed.";
        await updateProviderJob(params.supabase, {
          id: job.id,
          userId: job.userId,
          status: "failed",
          errorCode: "invalid_artifact",
          errorMessage: message,
          completedAt: nowIso(),
        });
        failed += 1;
        results.push({ jobId: job.id, status: "failed", action: "ingest-failed" });
        await applyRegenJobCredits({ supabase: params.supabase, job, outcome: "failed" });
        continue;
      }
      await updateProviderJob(params.supabase, {
        id: job.id,
        userId: job.userId,
        status: "succeeded",
        externalJobId: handle.externalJobId ?? job.externalJobId ?? null,
        errorCode: null,
        errorMessage: null,
        completedAt: nowIso(),
        nextPollAt: null,
      });
      succeeded += 1;
      results.push({ jobId: job.id, status: "succeeded", action: ingest });
      await applyRegenJobCredits({ supabase: params.supabase, job, outcome: "success" });
      projectIds.push(job.projectId);
      continue;
    }

    await updateProviderJob(params.supabase, {
      id: job.id,
      userId: job.userId,
      status: "failed",
      errorCode: handle.errorCode || "provider_failed",
      errorMessage: handle.message,
      completedAt: nowIso(),
    });
    failed += 1;
    results.push({ jobId: job.id, status: "failed", action: "failed" });
    await applyRegenJobCredits({ supabase: params.supabase, job, outcome: "failed" });

    if (isRetryableProviderError(handle.errorCode) && job.retryCount < PROVIDER_MAX_RETRY_COUNT) {
      const retriedJob = await providerRetry({ supabase: params.supabase, job, registry });
      if (retriedJob) {
        retried += 1;
        results.push({ jobId: retriedJob.id, status: retriedJob.status, action: "provider-retry" });
      }
    } else {
      const existing = await loadPlayableSceneArtifact(params.supabase, job.projectId, job.sceneId);
      await updateSceneRecord(params.supabase, {
        id: job.sceneId,
        status: existing && isValidVideoArtifact(existing) ? "ready" : "failed",
        artifactId: existing?.id ?? null,
      });
    }
  }

  const resumedProjects = projectIds.length ? await resumeProjects({ supabase: params.supabase, projectIds, registry: params.registry }) : 0;
  for (const projectId of [...new Set(projectIds)]) {
    const sample = due.find((job) => job.projectId === projectId && !isRegenerationProviderJob(job));
    if (!sample?.userId) continue;
    const generation = await loadGenerationDomainRow(params.supabase, projectId, sample.userId);
    if (!generation) continue;
    await applyVideoStudioCreditOutcome({
      supabase: params.supabase,
      userId: sample.userId,
      operationId: videoStudioCreditOperationId({
        kind: "render",
        projectId,
        attempt: sample.attempt || 1,
      }),
      outcome: renderCreditOutcome({
        domainState: String(generation.domain_state || ""),
        job: { status: String(generation.status || "") },
        errorCode: null,
      }),
    });
  }
  return {
    processed: results.length,
    polled,
    succeeded,
    failed,
    retried,
    stale,
    resumedProjects,
    results,
  };
}
