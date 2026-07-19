/**
 * In-process deployment history per generation.
 */

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

export function recordDeploymentEvent(params: {
  generationId: string;
  kind: DeploymentEventKind;
  message: string;
  url?: string | null;
}): DeploymentHistoryEvent {
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

export function listDeploymentHistory(
  generationId: string,
  limit = 30,
): DeploymentHistoryEvent[] {
  return getState()
    .events.filter((e) => e.generationId === generationId)
    .slice(0, limit);
}
