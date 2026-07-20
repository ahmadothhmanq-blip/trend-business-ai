/**
 * Supabase persistence for deployment history (migration 042).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DeploymentEventKind,
  DeploymentHistoryEvent,
} from "@/lib/ai-core/deployment/types";

type DeploymentRow = {
  id: string;
  user_id: string;
  generation_id: string;
  kind: string;
  message: string;
  url: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export function isDeploymentEventsTableMissing(
  error: { message?: string; code?: string } | null,
) {
  if (!error) return false;
  const msg = error.message?.toLowerCase() ?? "";
  return (
    error.code === "42P01" ||
    msg.includes("website_deployment_events") ||
    (msg.includes("relation") && msg.includes("does not exist"))
  );
}

function rowToEvent(row: DeploymentRow): DeploymentHistoryEvent {
  return {
    id: row.id,
    generationId: row.generation_id,
    kind: row.kind as DeploymentEventKind,
    message: row.message,
    url: row.url,
    createdAt: row.created_at,
  };
}

export async function insertDeploymentEventDb(
  client: SupabaseClient,
  params: {
    userId: string;
    generationId: string;
    kind: DeploymentEventKind;
    message: string;
    url?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<DeploymentHistoryEvent | null> {
  const { data, error } = await client
    .from("website_deployment_events")
    .insert({
      user_id: params.userId,
      generation_id: params.generationId,
      kind: params.kind,
      message: params.message,
      url: params.url ?? null,
      metadata: params.metadata ?? {},
    })
    .select("*")
    .single();

  if (error || !data) return null;
  return rowToEvent(data as DeploymentRow);
}

export async function listDeploymentHistoryDb(
  client: SupabaseClient,
  generationId: string,
  limit = 30,
): Promise<DeploymentHistoryEvent[]> {
  const { data, error } = await client
    .from("website_deployment_events")
    .select("*")
    .eq("generation_id", generationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as DeploymentRow[]).map(rowToEvent);
}
