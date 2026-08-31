import { createHash } from "node:crypto";
import type { LipSyncJobHandle } from "@/lib/ai-core/video-production-platform/lip-sync/contract";

const succeeded = new Map<string, LipSyncJobHandle>();

function key(provider: string, idempotencyKey: string) {
  return `${provider}:${idempotencyKey}`;
}

export function rememberSucceededLipSyncJob(handle: LipSyncJobHandle): void {
  if (handle.status !== "succeeded") return;
  if (!handle.bytes?.byteLength && !handle.remoteUrl) return;
  succeeded.set(key(handle.provider, handle.idempotencyKey), handle);
}

export function recallSucceededLipSyncJob(provider: string, idempotencyKey: string): LipSyncJobHandle | null {
  return succeeded.get(key(provider, idempotencyKey)) ?? null;
}

export function clearLipSyncJobCache(): void {
  succeeded.clear();
}

export function buildLipSyncIdempotencyKey(input: {
  projectId: string;
  videoArtifactId: string;
  audioArtifactId: string;
  provider: string;
  attempt?: number;
}): string {
  const hash = createHash("sha256")
    .update(`${input.videoArtifactId}|${input.audioArtifactId}`)
    .digest("hex")
    .slice(0, 24);
  const attempt = input.attempt && input.attempt > 1 ? `:a${input.attempt}` : "";
  return `${input.projectId}:lipsync:${input.provider}:${hash}${attempt}`;
}
