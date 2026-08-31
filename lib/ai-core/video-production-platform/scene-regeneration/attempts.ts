import { createHash } from "node:crypto";
import type { ProviderJobRecord } from "@/lib/ai-core/video-production-platform/persistence/mappers";

export function nextSceneAttempt(jobs: ProviderJobRecord[]): number {
  if (!jobs.length) return 1;
  return Math.max(...jobs.map((job) => job.attempt || 1)) + 1;
}

export function buildRegenerationIdempotencySalt(input: {
  attempt: number;
  requestId?: string;
  promptOverride?: string;
  retry?: boolean;
}): string {
  if (input.retry) {
    return `regen:retry:${input.attempt}`;
  }
  if (input.requestId?.trim()) {
    return `regen:req:${input.requestId.trim()}`;
  }
  const promptPart = input.promptOverride?.trim()
    ? createHash("sha256").update(input.promptOverride.trim()).digest("hex").slice(0, 12)
    : "as-is";
  return `regen:attempt:${input.attempt}:${promptPart}`;
}
