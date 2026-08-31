/**
 * React renderer service (Phase 5).
 * RenderDocument → Next.js 16 project files. No publish, API, auth, or database.
 */

import { createHash } from "node:crypto";
import type {
  ReactWebsiteProject,
  WebsiteReactProjectBuilder,
  WebsiteReactRenderInput,
  WebsiteReactRenderResult,
  WebsiteReactRenderStore,
} from "@/lib/ai-core/website-builder/react-renderer/contracts";
import { WebsiteReactRenderError } from "@/lib/ai-core/website-builder/react-renderer/errors";
import { buildReactWebsiteProject } from "@/lib/ai-core/website-builder/react-renderer/renderer";
import { assertReactWebsiteProject, assertWebsiteReactRenderInput } from "@/lib/ai-core/website-builder/react-renderer/validation";

const MAX_ATTEMPTS = 2;
const defaultBuilder: WebsiteReactProjectBuilder = { build: buildReactWebsiteProject };

export function createMemoryWebsiteReactRenderStore(): WebsiteReactRenderStore {
  const projects = new Map<string, ReactWebsiteProject>();
  return {
    get: (key) => projects.get(key),
    set: (key, project) => {
      projects.set(key, project);
    },
  };
}

export function websiteReactRenderIdempotencyKey(input: WebsiteReactRenderInput): string {
  const payload = JSON.stringify({
    projectId: input.document.projectId,
    planId: input.document.planId,
    paths: input.document.pages.map((page) => page.path),
    baseUrl: input.document.baseUrl,
    siteName: input.siteName ?? null,
  });
  return createHash("sha256").update(payload).digest("hex");
}

export type RunWebsiteReactRenderParams = {
  input: WebsiteReactRenderInput;
  builder?: WebsiteReactProjectBuilder;
  store?: WebsiteReactRenderStore;
  now?: () => string;
};

function failedResult(error: WebsiteReactRenderError, attempts: number): WebsiteReactRenderResult {
  return {
    status: "failed",
    project: null,
    reused: false,
    attempts,
    errorCode: error.code,
    errorMessage: error.message,
  };
}

function toReactError(error: unknown, fallback: WebsiteReactRenderError["code"]): WebsiteReactRenderError {
  if (error instanceof WebsiteReactRenderError) return error;
  return new WebsiteReactRenderError(error instanceof Error ? error.message : "React render failed.", fallback);
}

export async function runWebsiteReactRender(params: RunWebsiteReactRenderParams): Promise<WebsiteReactRenderResult> {
  try {
    assertWebsiteReactRenderInput(params.input);
  } catch (error) {
    return failedResult(toReactError(error, "invalid_input"), 0);
  }

  const key = websiteReactRenderIdempotencyKey(params.input);
  const existing = params.store?.get(key);
  if (existing) {
    return { status: "reused", project: existing, reused: true, attempts: 0 };
  }

  const builder = params.builder ?? defaultBuilder;
  const now = params.now ?? (() => new Date().toISOString());
  let attempts = 0;
  let lastError: WebsiteReactRenderError | null = null;

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;
    try {
      const project = builder.build({
        document: params.input.document,
        siteName: params.input.siteName,
        theme: params.input.theme,
        now,
      });
      assertReactWebsiteProject(project);
      params.store?.set(key, project);
      return { status: "ready", project, reused: false, attempts };
    } catch (error) {
      lastError = toReactError(error, attempts === 1 ? "render_failed" : "invalid_react_tree");
    }
  }

  return failedResult(lastError ?? new WebsiteReactRenderError("React render failed.", "render_failed"), attempts);
}
