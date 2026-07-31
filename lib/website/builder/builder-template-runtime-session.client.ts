import type { WbTemplateRendererMeta } from "@/lib/website/template-renderer-contract";
import type { WbTemplateRuntimeModel } from "@/lib/website/template-renderer-contract/types";
import type { BuilderTemplateRuntimeSuccess } from "@/lib/website/builder/template-runtime.types";

const CLIENT_STORAGE_KEY = "wb.builder.template-runtime";

function readClientSession(): BuilderTemplateRuntimeSuccess | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(CLIENT_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    return JSON.parse(raw) as BuilderTemplateRuntimeSuccess;
  } catch {
    return null;
  }
}

function writeClientSession(result: BuilderTemplateRuntimeSuccess | null): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    if (result) {
      window.sessionStorage.setItem(CLIENT_STORAGE_KEY, JSON.stringify(result));
    } else {
      window.sessionStorage.removeItem(CLIENT_STORAGE_KEY);
    }
  } catch {
    // Ignore quota or serialization failures.
  }
}

/** Latest runtime model cached for the current browser tab. */
export function getActiveBuilderTemplateRuntimeModel(): WbTemplateRuntimeModel | null {
  return readClientSession()?.model ?? null;
}

export function getActiveBuilderTemplateRuntimeMeta(): WbTemplateRendererMeta | null {
  return readClientSession()?.meta ?? null;
}

export function setActiveBuilderTemplateRuntime(
  result: BuilderTemplateRuntimeSuccess | null,
): void {
  writeClientSession(result);
}

export function clearActiveBuilderTemplateRuntime(): void {
  setActiveBuilderTemplateRuntime(null);
}
