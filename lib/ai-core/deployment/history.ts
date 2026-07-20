/**
 * Deployment history — Supabase persistence with in-memory fallback.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import {
  insertDeploymentEventDb,
  isDeploymentEventsTableMissing,
  listDeploymentHistoryDb,
} from "@/lib/ai-core/deployment/repository";
import type {
  DeploymentEventKind,
  DeploymentHistoryEvent,
} from "@/lib/ai-core/deployment/types";

type StoreState = {
  events: DeploymentHistoryEvent[];
};

const globalStore = globalThis as typeof globalThis & {
  __tbaDeploymentHistory?: StoreState;
};

function getState(): StoreState {
  if (!globalStore.__tbaDeploymentHistory) {
    globalStore.__tbaDeploymentHistory = { events: [] };
  }
  return globalStore.__tbaDeploymentHistory;
}

export async function recordDeploymentEvent(
  params: {
    userId?: string;
    generationId: string;
    kind: DeploymentEventKind;
    message: string;
    url?: string | null;
  },
  client?: SupabaseClient | null,
): Promise<DeploymentHistoryEvent> {
  if (client && params.userId) {
    const persisted = await insertDeploymentEventDb(client, {
      userId: params.userId,
      generationId: params.generationId,
      kind: params.kind,
      message: params.message,
      url: params.url,
    });
    if (persisted) return persisted;

    const { error } = await client
      .from("website_deployment_events")
      .select("id")
      .limit(1);
    if (!isDeploymentEventsTableMissing(error)) {
      // table exists but insert failed — still fall through to memory
    }
  }

  const event: DeploymentHistoryEvent = {
    id: `dep-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    generationId: params.generationId,
    kind: params.kind,
    message: params.message,
    url: params.url ?? null,
    createdAt: new Date().toISOString(),
  };
  getState().events.unshift(event);
  if (getState().events.length > 5_000) {
    getState().events.length = 4_000;
  }
  return event;
}

export async function listDeploymentHistory(
  generationId: string,
  limit = 30,
  client?: SupabaseClient | null,
): Promise<DeploymentHistoryEvent[]> {
  if (client) {
    const rows = await listDeploymentHistoryDb(client, generationId, limit);
    const { error } = await client
      .from("website_deployment_events")
      .select("id")
      .eq("generation_id", generationId)
      .limit(1);
    if (!isDeploymentEventsTableMissing(error)) return rows;
  }

  return getState()
    .events.filter((e) => e.generationId === generationId)
    .slice(0, limit);
}
