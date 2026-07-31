import type { CoreBrief } from "@/lib/ai-core/layers/types";
import {
  MAOE_SHARED_MEMORY_KEY,
  type AgentId,
  type SharedMemory,
  type SharedMemoryEntry,
} from "@/lib/ai-core/multi-agent-orchestration/maoe-types";

export function createSharedMemory(): SharedMemory {
  return {
    version: "1",
    entries: [],
    artifacts: {},
  };
}

export function getSharedMemoryFromBrief(brief: CoreBrief): SharedMemory {
  const raw = brief.metadata?.[MAOE_SHARED_MEMORY_KEY];
  if (!raw || typeof raw !== "object") return createSharedMemory();
  return raw as SharedMemory;
}

export function shareArtifact(
  memory: SharedMemory,
  agentId: AgentId,
  key: string,
  artifact: unknown,
  artifactType: string,
): SharedMemory {
  const entry: SharedMemoryEntry = {
    key,
    agentId,
    artifactType,
    timestamp: new Date().toISOString(),
  };
  return {
    ...memory,
    entries: [...memory.entries, entry],
    artifacts: {
      ...memory.artifacts,
      [key]: artifact,
    },
  };
}

export function persistSharedMemoryOnBrief(
  brief: CoreBrief,
  memory: SharedMemory,
): CoreBrief {
  return {
    ...brief,
    metadata: {
      ...(brief.metadata ?? {}),
      [MAOE_SHARED_MEMORY_KEY]: memory,
    },
  };
}

export function getSharedArtifact<T>(
  memory: SharedMemory,
  key: string,
): T | undefined {
  return memory.artifacts[key] as T | undefined;
}
