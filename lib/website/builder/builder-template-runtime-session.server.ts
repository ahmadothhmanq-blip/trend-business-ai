import { AsyncLocalStorage } from "node:async_hooks";
import type { WbTemplateRendererMeta } from "@/lib/website/template-renderer-contract";
import type { WbTemplateRuntimeModel } from "@/lib/website/template-renderer-contract/types";
import type { BuilderTemplateRuntimeSuccess } from "@/lib/website/builder/template-runtime.types";

type BuilderTemplateRuntimeSessionStore = {
  active: BuilderTemplateRuntimeSuccess | null;
};

const requestSessionStorage = new AsyncLocalStorage<BuilderTemplateRuntimeSessionStore>();

function getRequestStore(): BuilderTemplateRuntimeSessionStore | undefined {
  return requestSessionStorage.getStore();
}

/** Latest runtime model resolved for the current server request. */
export function getActiveBuilderTemplateRuntimeModel(): WbTemplateRuntimeModel | null {
  return getRequestStore()?.active?.model ?? null;
}

export function getActiveBuilderTemplateRuntimeMeta(): WbTemplateRendererMeta | null {
  return getRequestStore()?.active?.meta ?? null;
}

export function setActiveBuilderTemplateRuntime(
  result: BuilderTemplateRuntimeSuccess | null,
): void {
  const requestStore = getRequestStore();
  if (!requestStore) {
    return;
  }

  requestStore.active = result;
}

export function clearActiveBuilderTemplateRuntime(): void {
  setActiveBuilderTemplateRuntime(null);
}

/** Runs work inside an isolated server-side template runtime session. */
export function runBuilderTemplateRuntimeSessionSync<T>(fn: () => T): T {
  return requestSessionStorage.run({ active: null }, fn);
}

/** Runs async work inside an isolated server-side template runtime session. */
export async function runBuilderTemplateRuntimeSession<T>(
  fn: () => T | Promise<T>,
): Promise<T> {
  return requestSessionStorage.run({ active: null }, fn);
}
