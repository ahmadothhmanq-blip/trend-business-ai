/**
 * Single commit boundary for webapp blueprint mutations.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { withAppModel } from "@/lib/ai-core/app-design-platform/management";
import {
  findWebappIdempotentCommit,
  storeWebappIdempotentCommit,
} from "@/lib/webapp/platform/idempotency";
import { loadWebappGenerationForUser } from "@/lib/webapp/platform/load-generation";
import { recordWebappMutationRun } from "@/lib/webapp/platform/mutation-run";
import {
  nextRevision,
  readBlueprintRevisionFromGeneration,
  stampPlatformRevisionOnBlueprint,
} from "@/lib/webapp/platform/revision";
import type {
  WebAppCommitOptions,
  WebAppCommitPayload,
  WebAppCommitResult,
} from "@/lib/webapp/platform/types";
import type { WebAppBlueprint, WebAppGeneration } from "@/types/webapp";

export type CommitAppBlueprintRevisionParams = {
  supabase: SupabaseClient;
  userId: string;
  generationId: string;
  payload: WebAppCommitPayload;
  input: {
    prompt: string;
    appType: string;
    language: string;
    designStyle: string;
    colorStyle: string;
    features: string[];
    productId?: string;
    projectId?: string;
    mode?: string;
  };
  commit: WebAppCommitOptions;
};

export async function commitAppBlueprintRevision(
  params: CommitAppBlueprintRevisionParams,
): Promise<WebAppCommitResult> {
  const idempotencyKey = params.commit.idempotencyKey?.trim();

  if (idempotencyKey) {
    const cached = await findWebappIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
    });
    if (cached?.response?.generation && cached.response.model) {
      const generation = cached.response.generation as WebAppGeneration;
      const model = cached.response.model as WebAppCommitPayload["model"];
      const files = (cached.response.files as WebAppCommitPayload["files"]) ?? [];
      const blueprint = (cached.response.blueprint as WebAppBlueprint) ?? params.payload.blueprint;
      const payload =
        cached.response.servicePayload &&
        typeof cached.response.servicePayload === "object"
          ? (cached.response.servicePayload as Record<string, unknown>)
          : {};
      return {
        ok: true,
        generation,
        model,
        files,
        blueprint,
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

  const existing = await loadWebappGenerationForUser(
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
  const blueprintWithModel = withAppModel(
    {
      ...params.payload.blueprint,
      files: params.payload.files,
    },
    params.payload.model,
  );
  const stampedBlueprint = stampPlatformRevisionOnBlueprint({
    blueprint: blueprintWithModel as WebAppBlueprint,
    revision: revisionAfter,
    parentRevision: revisionBefore,
    operation: params.commit.operation,
  });

  const { data, error } = await params.supabase
    .from("webapp_generations")
    .update({
      blueprint: stampedBlueprint,
      blueprint_revision: revisionAfter,
      app_name: params.payload.model.settings.appName || existing.app_name,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.generationId)
    .eq("user_id", params.userId)
    .select("*")
    .single();

  if (error) {
    return {
      ok: false,
      error: error.message,
      code: "SERVER",
    };
  }

  const generation = data as WebAppGeneration;
  const aiRunId = await recordWebappMutationRun(params.supabase, {
    userId: params.userId,
    generationId: params.generationId,
    operation: params.commit.operation,
    revisionBefore,
    revisionAfter,
    input: {
      prompt: params.input.prompt,
      appType: params.input.appType,
      language: params.input.language,
      designStyle: params.input.designStyle,
      colorStyle: params.input.colorStyle,
      features: params.input.features,
      productId: params.input.productId,
      projectId: params.input.projectId,
      mode: params.input.mode,
    },
    mutationMeta: params.commit.mutationMeta,
    provider: generation.provider ?? null,
    tokenUsage: generation.token_usage as Record<string, number> | null,
    generationTimeMs: generation.generation_time_ms ?? null,
  });

  const resultRevision = readBlueprintRevisionFromGeneration(generation);

  if (idempotencyKey) {
    await storeWebappIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
      operation: params.commit.operation,
      response: {
        generation,
        model: params.payload.model,
        files: params.payload.files,
        blueprint: stampedBlueprint,
        revision: resultRevision,
        servicePayload: params.commit.idempotencyPayload ?? null,
      },
      aiRunId,
    });
  }

  return {
    ok: true,
    generation,
    model: params.payload.model,
    files: params.payload.files,
    blueprint: stampedBlueprint,
    revision: resultRevision,
    aiRunId,
    fromIdempotency: false,
  };
}
