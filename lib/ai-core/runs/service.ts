/**
 * AI Core run orchestration + ai_runs persistence (Phase 5).
 */

import { getDefaultTextProvider } from "@/lib/ai/provider-config";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import { layerRunner } from "@/lib/ai-core/layers/runner";
import type {
  CoreBrief,
  CoreLayerArtifacts,
  CoreRunMode,
} from "@/lib/ai-core/layers/types";
import {
  buildCoreBrief,
  type AiCoreRunRequestBody,
} from "@/lib/ai-core/brief-builder";
import {
  createAdapterForProduct,
  resolveAiCoreProduct,
} from "@/lib/ai-core/products";
import type { AiRun, AiRunStatus } from "@/types/database";
import type { SupabaseClient } from "@supabase/supabase-js";

export type AiCoreRunExecuteResult = {
  run: AiRun;
  output: unknown;
  progressEvents: string[];
  layersExecuted: string[];
};

const PLUGIN_INPUT_KEYS = [
  "websiteGenerationInput",
  "webappPluginInput",
  "landingPagePluginInput",
  "brandIdentityPluginInput",
  "contentPluginInput",
  "videoPluginInput",
  "marketingPluginInput",
] as const;

function isMissingTableError(error: { code?: string; message?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42P01" ||
    (typeof error.message === "string" && error.message.includes("relation"))
  );
}

function serializeArtifacts(artifacts: CoreLayerArtifacts): Record<string, unknown> {
  return {
    brief: artifacts.brief,
    templateSelection: artifacts.templateSelection ?? null,
    businessProfile: artifacts.businessProfile ?? null,
    strategy: artifacts.strategy ?? null,
    designSystem: artifacts.designSystem ?? null,
    designPlan: artifacts.designPlan ?? null,
    assetManifest: artifacts.assetManifest ?? null,
    qualityReport: artifacts.qualityReport ?? null,
    seoPackage: artifacts.seoPackage ?? null,
    performanceReport: artifacts.performanceReport ?? null,
    generationOutput: artifacts.generationOutput ?? null,
    finalOutput: artifacts.finalOutput ?? null,
  };
}

function priorFromArtifacts(
  artifacts: Record<string, unknown> | null | undefined,
): Partial<CoreLayerArtifacts> | undefined {
  if (!artifacts || typeof artifacts !== "object") return undefined;
  const prior: Partial<CoreLayerArtifacts> = {};
  if (artifacts.templateSelection) {
    prior.templateSelection =
      artifacts.templateSelection as CoreLayerArtifacts["templateSelection"];
  }
  if (artifacts.businessProfile) {
    prior.businessProfile =
      artifacts.businessProfile as CoreLayerArtifacts["businessProfile"];
  }
  if (artifacts.strategy) {
    prior.strategy = artifacts.strategy as CoreLayerArtifacts["strategy"];
  }
  if (artifacts.designSystem) {
    prior.designSystem =
      artifacts.designSystem as CoreLayerArtifacts["designSystem"];
  }
  if (artifacts.designPlan) {
    prior.designPlan =
      artifacts.designPlan as CoreLayerArtifacts["designPlan"];
  }
  if (artifacts.assetManifest) {
    prior.assetManifest =
      artifacts.assetManifest as CoreLayerArtifacts["assetManifest"];
  }
  if (artifacts.qualityReport) {
    prior.qualityReport =
      artifacts.qualityReport as CoreLayerArtifacts["qualityReport"];
  }
  if (artifacts.seoPackage) {
    prior.seoPackage = artifacts.seoPackage as CoreLayerArtifacts["seoPackage"];
  }
  if (artifacts.performanceReport) {
    prior.performanceReport =
      artifacts.performanceReport as CoreLayerArtifacts["performanceReport"];
  }
  return Object.keys(prior).length ? prior : undefined;
}

function patchContinueInstruction(
  brief: CoreBrief,
  continueInstruction: string,
): CoreBrief {
  const metadata = { ...(brief.metadata ?? {}) };
  for (const key of PLUGIN_INPUT_KEYS) {
    const nested = metadata[key];
    if (nested && typeof nested === "object") {
      metadata[key] = {
        ...(nested as Record<string, unknown>),
        continueInstruction,
        mode: "continue",
      };
    }
  }
  return { ...brief, metadata };
}

async function insertRun(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
): Promise<{ run: AiRun | null; missingTable: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("ai_runs")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { run: null, missingTable: true, error: null };
    }
    return { run: null, missingTable: false, error: error.message };
  }
  return { run: data as AiRun, missingTable: false, error: null };
}

async function updateRun(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  patch: Record<string, unknown>,
): Promise<{ run: AiRun | null; missingTable: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("ai_runs")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    if (isMissingTableError(error)) {
      return { run: null, missingTable: true, error: null };
    }
    return { run: null, missingTable: false, error: error.message };
  }
  return { run: data as AiRun, missingTable: false, error: null };
}

export async function getAiCoreRun(
  supabase: SupabaseClient,
  userId: string,
  runId: string,
): Promise<{ run: AiRun | null; missingTable: boolean; error: string | null }> {
  const { data, error } = await supabase
    .from("ai_runs")
    .select("*")
    .eq("id", runId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    if (isMissingTableError(error)) {
      return { run: null, missingTable: true, error: null };
    }
    return { run: null, missingTable: false, error: error.message };
  }
  return { run: (data as AiRun | null) ?? null, missingTable: false, error: null };
}

async function executeWithBrief(params: {
  supabase: SupabaseClient;
  userId: string;
  productId: string;
  brief: CoreBrief;
  mode: CoreRunMode;
  continueInstruction?: string;
  parentRunId?: string | null;
  priorArtifacts?: Partial<CoreLayerArtifacts>;
  provider?: string;
  onProgress?: (message: string) => void;
}): Promise<
  | { ok: true; result: AiCoreRunExecuteResult }
  | { ok: false; status: number; error: string }
> {
  const product = resolveAiCoreProduct(params.productId);
  if (!product) {
    return {
      ok: false,
      status: 400,
      error: `Unknown productId "${params.productId}".`,
    };
  }

  const adapter = createAdapterForProduct(product.id);
  if (!adapter) {
    return { ok: false, status: 500, error: `No adapter factory for ${product.id}.` };
  }

  const pendingInsert = await insertRun(params.supabase, {
    user_id: params.userId,
    product_id: product.id,
    status: "running" satisfies AiRunStatus,
    mode: params.mode,
    parent_run_id: params.parentRunId ?? null,
    brief: params.brief,
    artifacts: {},
    layers_executed: [],
    continue_instruction: params.continueInstruction ?? null,
  });

  if (pendingInsert.missingTable) {
    return {
      ok: false,
      status: 503,
      error: "AI Core runs table not found. Apply migration 033_ai_runs.sql.",
    };
  }
  if (pendingInsert.error || !pendingInsert.run) {
    return {
      ok: false,
      status: 500,
      error: pendingInsert.error ?? "Failed to create AI Core run.",
    };
  }

  const runId = pendingInsert.run.id;

  await providerManager.loadUserSettings(params.supabase as never, params.userId);
  const preferred =
    (params.provider as AIProviderName | undefined) ??
    (providerManager.getUserSettings()?.default_provider as
      | AIProviderName
      | undefined) ??
    getDefaultTextProvider();
  const resolved = providerManager.resolve(preferred);
  if (!resolved || !providerManager.isConfigured(resolved)) {
    await updateRun(params.supabase, runId, params.userId, {
      status: "failed",
      error_message: "No AI provider configured.",
    });
    return {
      ok: false,
      status: 503,
      error: "No AI provider configured. Set DEEPSEEK_API_KEY to enable generation.",
    };
  }

  try {
    const result = await layerRunner.run(
      adapter,
      {
        brief: params.brief,
        mode: params.mode,
        continueInstruction: params.continueInstruction,
        priorArtifacts: params.priorArtifacts,
        userId: params.userId,
        parentRunId: params.parentRunId ?? undefined,
      },
      { provider: resolved, onProgress: params.onProgress },
    );

    const output = result.finalOutput ?? result.generation;
    const updated = await updateRun(params.supabase, runId, params.userId, {
      status: "completed",
      artifacts: serializeArtifacts({
        ...result.artifacts,
        generationOutput: result.generation,
        finalOutput: result.finalOutput,
      }),
      layers_executed: result.layersExecuted,
      provider: result.provider,
      token_usage: result.usage,
      generation_time_ms: result.generationTimeMs,
      error_message: null,
    });

    if (updated.error || !updated.run) {
      return {
        ok: false,
        status: 500,
        error: updated.error ?? "Run completed but failed to persist results.",
      };
    }

    return {
      ok: true,
      result: {
        run: updated.run,
        output,
        progressEvents: result.progressEvents,
        layersExecuted: result.layersExecuted,
      },
    };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI Core run failed.";
    await updateRun(params.supabase, runId, params.userId, {
      status: "failed",
      error_message: message,
    });
    return { ok: false, status: 500, error: message };
  }
}

export async function executeAiCoreRun(params: {
  supabase: SupabaseClient;
  userId: string;
  body: AiCoreRunRequestBody;
  onProgress?: (message: string) => void;
}): Promise<
  | { ok: true; result: AiCoreRunExecuteResult }
  | { ok: false; status: number; error: string }
> {
  const { supabase, userId, body, onProgress } = params;
  const product = resolveAiCoreProduct(body.productId);
  if (!product) {
    return {
      ok: false,
      status: 400,
      error: `Unknown productId "${body.productId}". Use GET /api/ai-core/products for the catalog.`,
    };
  }

  const mode = (body.mode ?? "generate") as CoreRunMode;
  let priorArtifacts: Partial<CoreLayerArtifacts> | undefined;
  let parentRunId = body.parentRunId ?? null;

  if (parentRunId) {
    const parent = await getAiCoreRun(supabase, userId, parentRunId);
    if (parent.missingTable) {
      return {
        ok: false,
        status: 503,
        error: "AI Core runs table not found. Apply migration 033_ai_runs.sql.",
      };
    }
    if (parent.error) {
      return { ok: false, status: 500, error: parent.error };
    }
    if (!parent.run) {
      return { ok: false, status: 404, error: "Parent run not found." };
    }
    priorArtifacts = priorFromArtifacts(parent.run.artifacts);
  }

  const brief = buildCoreBrief(product.id, {
    ...body,
    productId: product.id,
    userId,
  });

  return executeWithBrief({
    supabase,
    userId,
    productId: product.id,
    brief,
    mode,
    continueInstruction: body.continueInstruction,
    parentRunId,
    priorArtifacts,
    provider: body.provider,
    onProgress,
  });
}

export async function continueAiCoreRun(params: {
  supabase: SupabaseClient;
  userId: string;
  parentRunId: string;
  continueInstruction: string;
  provider?: string;
  onProgress?: (message: string) => void;
}): Promise<
  | { ok: true; result: AiCoreRunExecuteResult }
  | { ok: false; status: number; error: string }
> {
  const parent = await getAiCoreRun(
    params.supabase,
    params.userId,
    params.parentRunId,
  );
  if (parent.missingTable) {
    return {
      ok: false,
      status: 503,
      error: "AI Core runs table not found. Apply migration 033_ai_runs.sql.",
    };
  }
  if (parent.error) {
    return { ok: false, status: 500, error: parent.error };
  }
  if (!parent.run) {
    return { ok: false, status: 404, error: "Run not found." };
  }

  const parentBrief = parent.run.brief as CoreBrief;
  const brief = patchContinueInstruction(
    parentBrief,
    params.continueInstruction,
  );

  return executeWithBrief({
    supabase: params.supabase,
    userId: params.userId,
    productId: parent.run.product_id,
    brief,
    mode: "continue",
    continueInstruction: params.continueInstruction,
    parentRunId: parent.run.id,
    priorArtifacts: priorFromArtifacts(parent.run.artifacts),
    provider: params.provider,
    onProgress: params.onProgress,
  });
}
