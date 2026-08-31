import { randomUUID } from "node:crypto";
import type { ProviderJob } from "@/lib/ai-core/video-production-platform/domain/contracts";
import { DomainValidationError } from "@/lib/ai-core/video-production-platform/domain/errors";
import { buildProviderIdempotencyKey } from "@/lib/ai-core/video-production-platform/persistence/guards";
import {
  findProviderJobByIdempotencyKey,
  insertProviderJob,
} from "@/lib/ai-core/video-production-platform/persistence/repository";
import type { ModelRouterDecision, ModelRouterInput, ProviderV2Id, VideoProviderV2 } from "@/lib/ai-core/video-production-platform/provider-router/contract";
import { routeModel } from "@/lib/ai-core/video-production-platform/provider-router/router";
import type { ProviderEnvSnapshot } from "@/lib/ai-core/video-production-platform/provider-router/registry";

export type ProviderJobStore = {
  findByIdempotencyKey(key: string): Promise<ProviderJob | null>;
  insert(input: { userId: string; job: ProviderJob; estimatedCost?: number | null }): Promise<ProviderJob>;
};

export function createMemoryProviderJobStore(): ProviderJobStore {
  const jobs = new Map<string, ProviderJob>();
  return {
    async findByIdempotencyKey(key) {
      return jobs.get(key) ?? null;
    },
    async insert({ job }) {
      if (jobs.has(job.idempotencyKey)) {
        throw new DomainValidationError("Duplicate video_provider_jobs.insert rejected (unique_violation).");
      }
      jobs.set(job.idempotencyKey, job);
      return job;
    },
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createSupabaseProviderJobStore(supabase: any): ProviderJobStore {
  return {
    async findByIdempotencyKey(key) {
      return findProviderJobByIdempotencyKey(supabase, key);
    },
    async insert({ userId, job, estimatedCost }) {
      return insertProviderJob(supabase, { userId, job, estimatedCost });
    },
  };
}

export type RoutedProviderJob = {
  job: ProviderJob;
  reused: boolean;
  route: ModelRouterDecision;
};

export async function persistRoutedProviderJob(input: {
  userId: string;
  jobId?: string;
  routeInput: ModelRouterInput;
  store: ProviderJobStore;
  snapshot?: ProviderEnvSnapshot;
  registry?: Record<ProviderV2Id, VideoProviderV2>;
  attempt?: number;
}): Promise<RoutedProviderJob> {
  const route = routeModel(input.routeInput, { snapshot: input.snapshot, registry: input.registry });
  const baseKey = buildProviderIdempotencyKey({
    projectId: input.routeInput.projectId,
    sceneId: input.routeInput.sceneId,
    provider: route.primaryProvider,
    promptHash: route.metadata.idempotencyPromptHash,
  });
  const idempotencyKey = input.routeInput.idempotencySalt?.startsWith("regen:")
    ? `${input.routeInput.projectId}:${input.routeInput.sceneId}:${route.primaryProvider}:regen:${route.metadata.idempotencyPromptHash}`
    : baseKey;

  const existing = await input.store.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    return { job: existing, reused: true, route };
  }

  const job: ProviderJob = {
    id: input.jobId || randomUUID(),
    projectId: input.routeInput.projectId,
    sceneId: input.routeInput.sceneId,
    provider: route.primaryProvider,
    status: "queued",
    attempt: input.attempt && input.attempt > 0 ? input.attempt : 1,
    idempotencyKey,
  };

  try {
    const inserted = await input.store.insert({
      userId: input.userId,
      job,
      estimatedCost: route.estimatedCost,
    });
    return { job: inserted, reused: false, route };
  } catch (error) {
    if (error instanceof DomainValidationError && /duplicate/i.test(error.message)) {
      const raced = await input.store.findByIdempotencyKey(idempotencyKey);
      if (raced) return { job: raced, reused: true, route };
    }
    throw error;
  }
}
