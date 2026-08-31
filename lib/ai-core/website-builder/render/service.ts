/**
 * Website render service (Phase 4).
 * WebsiteGeneratedStructure → RenderDocument. No React, CSS, API, DB, or publish.
 */

import { createHash } from "node:crypto";
import type {
  RenderDocument,
  WebsiteDocumentRenderer,
  WebsiteRenderInput,
  WebsiteRenderResult,
  WebsiteRenderStore,
} from "@/lib/ai-core/website-builder/render/contracts";
import { WebsiteRenderError } from "@/lib/ai-core/website-builder/render/errors";
import { renderWebsiteDocument } from "@/lib/ai-core/website-builder/render/renderer";
import { assertRenderDocument, assertWebsiteRenderInput } from "@/lib/ai-core/website-builder/render/validation";

const MAX_ATTEMPTS = 2;
const defaultRenderer: WebsiteDocumentRenderer = { render: renderWebsiteDocument };

export function createMemoryWebsiteRenderStore(): WebsiteRenderStore {
  const documents = new Map<string, RenderDocument>();
  return {
    get: (key) => documents.get(key),
    set: (key, document) => {
      documents.set(key, document);
    },
  };
}

export function websiteRenderIdempotencyKey(input: WebsiteRenderInput): string {
  const payload = JSON.stringify({
    projectId: input.structure.project.id,
    planId: input.structure.plan.id,
    pageIds: input.structure.plan.pageIds,
    baseUrl: input.documentBaseUrl.trim().replace(/\/$/, ""),
  });
  return createHash("sha256").update(payload).digest("hex");
}

export type RunWebsiteRenderParams = {
  input: WebsiteRenderInput;
  renderer?: WebsiteDocumentRenderer;
  store?: WebsiteRenderStore;
  now?: () => string;
};

function failedResult(error: WebsiteRenderError, attempts: number): WebsiteRenderResult {
  return {
    status: "failed",
    document: null,
    reused: false,
    attempts,
    errorCode: error.code,
    errorMessage: error.message,
  };
}

function toRenderError(error: unknown, fallback: WebsiteRenderError["code"]): WebsiteRenderError {
  if (error instanceof WebsiteRenderError) return error;
  return new WebsiteRenderError(error instanceof Error ? error.message : "Website render failed.", fallback);
}

export async function runWebsiteRender(params: RunWebsiteRenderParams): Promise<WebsiteRenderResult> {
  const input: WebsiteRenderInput = {
    structure: params.input.structure,
    documentBaseUrl: params.input.documentBaseUrl.trim().replace(/\/$/, ""),
  };
  try {
    assertWebsiteRenderInput(input);
  } catch (error) {
    return failedResult(toRenderError(error, "invalid_input"), 0);
  }

  const key = websiteRenderIdempotencyKey(input);
  const existing = params.store?.get(key);
  if (existing) {
    return { status: "reused", document: existing, reused: true, attempts: 0 };
  }

  const renderer = params.renderer ?? defaultRenderer;
  const now = params.now ?? (() => new Date().toISOString());
  let attempts = 0;
  let lastError: WebsiteRenderError | null = null;

  while (attempts < MAX_ATTEMPTS) {
    attempts += 1;
    try {
      const document = renderer.render({
        structure: input.structure,
        documentBaseUrl: input.documentBaseUrl,
        now,
      });
      assertRenderDocument(document);
      params.store?.set(key, document);
      return { status: "ready", document, reused: false, attempts };
    } catch (error) {
      lastError = toRenderError(error, attempts === 1 ? "render_failed" : "invalid_document");
    }
  }

  return failedResult(lastError ?? new WebsiteRenderError("Website render failed.", "render_failed"), attempts);
}
