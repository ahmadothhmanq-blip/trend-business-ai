/**
 * Spec locking and prompt hashing utilities.
 */

import { createHash } from "node:crypto";

export function hashPrompt(prompt: string): string {
  const normalized = prompt.trim().replace(/\s+/g, " ");
  return createHash("sha256").update(normalized, "utf8").digest("hex").slice(0, 16);
}

export type LockedSpec<T> = {
  spec: T;
  lockedAt: string;
  promptHash: string;
};

export function lockSpec<T extends { promptHash: string }>(
  spec: T,
  prompt: string,
): LockedSpec<T> {
  const promptHash = hashPrompt(prompt);
  const lockedAt = new Date().toISOString();
  return {
    spec: {
      ...spec,
      promptHash,
      provenance: {
        ...(spec as { provenance?: Record<string, unknown> }).provenance,
        lockedAt,
        promptHash,
      },
    } as T,
    lockedAt,
    promptHash,
  };
}

export function isSpecLocked(spec: {
  provenance?: { lockedAt?: string; promptHash?: string };
}): boolean {
  return Boolean(
    spec.provenance?.lockedAt?.trim() && spec.provenance?.promptHash?.trim(),
  );
}
