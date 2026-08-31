import type { GcriProfile } from "@/lib/language-platform/gcri/types";

/** Client-safe no-op; request-scoped GCRI is server-only. */
export function bindGcriContext(profile: GcriProfile): void {
  void profile;
}

export function runWithGcriContext<T>(profile: GcriProfile, fn: () => T): T {
  void profile;
  return fn();
}

export function getGcriContext(): GcriProfile | undefined {
  return undefined;
}
