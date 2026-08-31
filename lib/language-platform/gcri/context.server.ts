import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";
import type { GcriProfile } from "@/lib/language-platform/gcri/types";

const gcriStore = new AsyncLocalStorage<GcriProfile>();

/** Bind GCRI for the rest of this request so prompts can read it without extra args. */
export function bindGcriContext(profile: GcriProfile): void {
  try {
    gcriStore.enterWith(profile);
  } catch {
    /* edge / unsupported — prompts fall back to language default */
  }
}

export function runWithGcriContext<T>(profile: GcriProfile, fn: () => T): T {
  return gcriStore.run(profile, fn);
}

export function getGcriContext(): GcriProfile | undefined {
  return gcriStore.getStore();
}
