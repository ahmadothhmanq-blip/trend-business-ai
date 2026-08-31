import type { TtsJobHandle } from "@/lib/ai-core/video-production-platform/audio-engine/tts/contract";

const succeeded = new Map<string, TtsJobHandle>();

function key(provider: string, idempotencyKey: string) {
  return `${provider}:${idempotencyKey}`;
}

export function rememberSucceededTtsJob(handle: TtsJobHandle): void {
  if (handle.status !== "succeeded" || !handle.bytes?.byteLength) return;
  succeeded.set(key(handle.provider, handle.idempotencyKey), handle);
}

export function recallSucceededTtsJob(provider: string, idempotencyKey: string): TtsJobHandle | null {
  return succeeded.get(key(provider, idempotencyKey)) ?? null;
}

export function clearTtsJobCache(): void {
  succeeded.clear();
}
