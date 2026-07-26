/**
 * Supabase persistence for website A/B experiments (migration 041).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ExperimentChangeType,
  ExperimentStatus,
  ExperimentVariant,
  WebsiteExperiment,
} from "@/lib/ai-core/ab-testing/types";

export type ExperimentRow = {
  id: string;
  generation_id: string;
  user_id: string;
  name: string;
  hypothesis: string;
  status: ExperimentStatus;
  change_types: string[];
  variants: ExperimentVariant[];
  min_sample_size: number;
  confidence_threshold: number;
  winner_variant_id: string | null;
  winner_declared_at: string | null;
  winner_reason: string | null;
  started_at: string | null;
  ended_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export function isExperimentsTableMissing(
  error: { message?: string; code?: string } | null,
) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("website_experiments") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

export function rowToExperiment(row: ExperimentRow): WebsiteExperiment {
  return {
    id: row.id,
    generationId: row.generation_id,
    userId: row.user_id,
    name: row.name,
    hypothesis: row.hypothesis,
    status: row.status,
    changeTypes: row.change_types as ExperimentChangeType[],
    variants: Array.isArray(row.variants) ? row.variants : [],
    minSampleSize: row.min_sample_size,
    confidenceThreshold: Number(row.confidence_threshold),
    winnerVariantId: row.winner_variant_id,
    winnerDeclaredAt: row.winner_declared_at,
    winnerReason: row.winner_reason,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function experimentToRow(
  experiment: WebsiteExperiment,
): Omit<ExperimentRow, "created_at" | "updated_at"> & {
  created_at?: string;
  updated_at?: string;
} {
  return {
    id: experiment.id,
    generation_id: experiment.generationId,
    user_id: experiment.userId!,
    name: experiment.name,
    hypothesis: experiment.hypothesis,
    status: experiment.status,
    change_types: experiment.changeTypes,
    variants: experiment.variants,
    min_sample_size: experiment.minSampleSize,
    confidence_threshold: experiment.confidenceThreshold,
    winner_variant_id: experiment.winnerVariantId ?? null,
    winner_declared_at: experiment.winnerDeclaredAt ?? null,
    winner_reason: experiment.winnerReason ?? null,
    started_at: experiment.startedAt ?? null,
    ended_at: experiment.endedAt ?? null,
    metadata: {},
    created_at: experiment.createdAt,
    updated_at: experiment.updatedAt,
  };
}

export async function listExperimentsDb(
  client: SupabaseClient,
  generationId: string,
): Promise<WebsiteExperiment[]> {
  const { data, error } = await client
    .from("website_experiments")
    .select("*")
    .eq("generation_id", generationId)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return (data as ExperimentRow[]).map(rowToExperiment);
}

export async function getExperimentDb(
  client: SupabaseClient,
  experimentId: string,
): Promise<WebsiteExperiment | null> {
  const { data, error } = await client
    .from("website_experiments")
    .select("*")
    .eq("id", experimentId)
    .maybeSingle();

  if (error || !data) return null;
  return rowToExperiment(data as ExperimentRow);
}

export async function insertExperimentDb(
  client: SupabaseClient,
  experiment: WebsiteExperiment,
): Promise<WebsiteExperiment | null> {
  const row = experimentToRow(experiment);
  const { data, error } = await client
    .from("website_experiments")
    .insert({
      id: row.id || undefined,
      generation_id: row.generation_id,
      user_id: row.user_id,
      name: row.name,
      hypothesis: row.hypothesis,
      status: row.status,
      change_types: row.change_types,
      variants: row.variants,
      min_sample_size: row.min_sample_size,
      confidence_threshold: row.confidence_threshold,
      winner_variant_id: row.winner_variant_id,
      winner_declared_at: row.winner_declared_at,
      winner_reason: row.winner_reason,
      started_at: row.started_at,
      ended_at: row.ended_at,
      metadata: row.metadata,
      created_at: row.created_at,
      updated_at: row.updated_at,
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToExperiment(data as ExperimentRow);
}

export async function updateExperimentDb(
  client: SupabaseClient,
  experiment: WebsiteExperiment,
): Promise<WebsiteExperiment | null> {
  const row = experimentToRow(experiment);
  const { data, error } = await client
    .from("website_experiments")
    .update({
      name: row.name,
      hypothesis: row.hypothesis,
      status: row.status,
      change_types: row.change_types,
      variants: row.variants,
      min_sample_size: row.min_sample_size,
      confidence_threshold: row.confidence_threshold,
      winner_variant_id: row.winner_variant_id,
      winner_declared_at: row.winner_declared_at,
      winner_reason: row.winner_reason,
      started_at: row.started_at,
      ended_at: row.ended_at,
      metadata: row.metadata,
      updated_at: row.updated_at,
    })
    .eq("id", row.id)
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToExperiment(data as ExperimentRow);
}

export async function deleteExperimentDb(
  client: SupabaseClient,
  experimentId: string,
): Promise<boolean> {
  const { error } = await client
    .from("website_experiments")
    .delete()
    .eq("id", experimentId);

  return !error;
}
