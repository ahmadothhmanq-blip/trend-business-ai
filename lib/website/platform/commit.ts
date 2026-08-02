/**
 * Single commit boundary for website blueprint mutations.
 * Wraps persistWebsiteGeneration with revision, OCC, idempotency, and ai_runs.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeneratedWebsiteProject } from "@/lib/website/types";
import type { WebsiteGeneration } from "@/types/database";
import {
  persistWebsiteGeneration,
  type PersistWebsiteGenerationArgs,
} from "@/lib/website/save-generation";
import {
  findIdempotentCommit,
  storeIdempotentCommit,
} from "@/lib/website/platform/idempotency";
import { recordWebsiteMutationRun } from "@/lib/website/platform/mutation-run";
import {
  nextRevision,
  readBlueprintRevisionFromGeneration,
  stampPlatformRevisionOnProject,
} from "@/lib/website/platform/revision";
import { loadWebsiteGenerationForUser } from "@/lib/website/platform/load-generation";
import type {
  WebsiteCommitOptions,
  WebsiteCommitResult,
} from "@/lib/website/platform/types";
import { syncBlueprintMaterializedView } from "@/lib/website/platform/sync-blueprint";
import { validatePostCommandL0 } from "@/lib/website/validation/post-command";

export type CommitBlueprintRevisionParams = {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  project: GeneratedWebsiteProject;
  projectKind: PersistWebsiteGenerationArgs["projectKind"];
  input: PersistWebsiteGenerationArgs["input"];
  commit: WebsiteCommitOptions;
  /** When idempotency hits, return this response shape (route-specific). */
  buildIdempotentResponse?: (cached: Record<string, unknown>) => unknown;
};

export async function commitBlueprintRevision(
  params: CommitBlueprintRevisionParams,
): Promise<WebsiteCommitResult> {
  const idempotencyKey = params.commit.idempotencyKey?.trim();

  if (idempotencyKey) {
    const cached = await findIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
    });
    if (cached?.response?.generation && cached.response.project) {
      const generation = cached.response.generation as WebsiteGeneration;
      const project = cached.response.project as GeneratedWebsiteProject;
      const payload =
        cached.response.servicePayload &&
        typeof cached.response.servicePayload === "object"
          ? (cached.response.servicePayload as Record<string, unknown>)
          : {};
      return {
        ok: true,
        generation,
        project,
        revision:
          typeof cached.response.revision === "number"
            ? cached.response.revision
            : readBlueprintRevisionFromGeneration(generation),
        aiRunId: cached.aiRunId,
        fromIdempotency: true,
        idempotencyPayload: payload,
      };
    }
  }

  const existing = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!existing) {
    return {
      ok: false,
      error: "Generation not found.",
      code: "VALIDATION",
    };
  }

  const revisionBefore = readBlueprintRevisionFromGeneration(existing);

  if (
    params.commit.expectedRevision !== undefined &&
    params.commit.expectedRevision !== revisionBefore
  ) {
    return {
      ok: false,
      error: `Blueprint revision conflict (expected ${params.commit.expectedRevision}, current ${revisionBefore}).`,
      code: "CONFLICT",
    };
  }

  const revisionAfter = nextRevision(revisionBefore);
  const stampedProject = stampPlatformRevisionOnProject({
    project: params.project,
    revision: revisionAfter,
    parentRevision: revisionBefore,
    operation: params.commit.operation,
  });

  let syncedProject: GeneratedWebsiteProject;
  try {
    syncedProject = syncBlueprintMaterializedView(stampedProject);
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Blueprint sync failed.";
    return { ok: false, error: message, code: "VALIDATION" };
  }

  const l0 = validatePostCommandL0(syncedProject);
  if (!l0.ok) {
    return { ok: false, error: l0.error, code: "VALIDATION" };
  }

  const saved = await persistWebsiteGeneration({
    supabase: params.supabase,
    userId: params.userId,
    project: syncedProject,
    projectKind: params.projectKind,
    input: params.input,
    existingGenerationId: params.generationId,
    commit: {
      revisionBefore,
      revisionAfter,
      expectedRevision: params.commit.expectedRevision,
    },
  });

  if (!saved.ok) {
    if (saved.error.includes("revision conflict")) {
      return { ok: false, error: saved.error, code: "CONFLICT" };
    }
    return { ok: false, error: saved.error, code: "SERVER" };
  }

  const aiRunId = await recordWebsiteMutationRun(params.supabase, {
    userId: params.userId,
    generationId: params.generationId,
    operation: params.commit.operation,
    revisionBefore,
    revisionAfter,
    input: params.input,
    mutationMeta: params.commit.mutationMeta,
    provider: saved.generation.provider ?? null,
    tokenUsage: saved.generation.token_usage as Record<string, number> | null,
    generationTimeMs: saved.generation.generation_time_ms ?? null,
  });

  const resultRevision = readBlueprintRevisionFromGeneration(saved.generation);

  if (idempotencyKey) {
    await storeIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
      operation: params.commit.operation,
      response: {
        generation: saved.generation,
        project: saved.project,
        revision: resultRevision,
        servicePayload: params.commit.idempotencyPayload ?? null,
      },
      aiRunId,
    });
  }

  return {
    ok: true,
    generation: saved.generation,
    project: saved.project,
    revision: resultRevision,
    aiRunId,
    fromIdempotency: false,
  };
}
