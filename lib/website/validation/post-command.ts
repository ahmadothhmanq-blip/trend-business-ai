/**
 * Post-command validation gates for Website Builder blueprint commits.
 * L0: structural checks (blocking). L1: generation quality (warn only).
 */

import { validateWebsiteGeneration } from "@/lib/ai-core/website-builder/generation-validation";
import { parseHomeComponentOrder } from "@/lib/ai-core/website-editor/understand";
import type { GeneratedWebsiteProject } from "@/lib/website/types";

export type PostCommandL0Result =
  | { ok: true }
  | { ok: false; error: string };

export type PostCommandL1Result = {
  warnings: string[];
};

function normalizePath(path: string): string {
  return path.replace(/\\/g, "/");
}

/** L0 structural validation — blocks commit when failing. */
export function validatePostCommandL0(
  project: GeneratedWebsiteProject,
): PostCommandL0Result {
  const files = project.files ?? [];
  if (!files.length) {
    return { ok: false, error: "Validation failed: no files in blueprint." };
  }

  const home = files.find((f) => {
    const p = normalizePath(f.path);
    return p === "app/page.tsx" || p.endsWith("/app/page.tsx");
  });

  if (!home) {
    return { ok: false, error: "Validation failed: app/page.tsx not found." };
  }

  if (!home.content.trim()) {
    return { ok: false, error: "Validation failed: app/page.tsx is empty." };
  }

  const homeOrder = parseHomeComponentOrder(home.content);
  if (!homeOrder.length) {
    return {
      ok: false,
      error: "Validation failed: home page has no components.",
    };
  }

  return { ok: true };
}

/** L1 generation validation — non-blocking warnings. */
export function validatePostCommandL1(params: {
  project: GeneratedWebsiteProject;
  prompt?: string;
  language?: string;
}): PostCommandL1Result {
  const prompt =
    params.prompt ||
    params.project.description ||
    params.project.prompt ||
    "Website";
  const language = params.language || "en";
  const result = validateWebsiteGeneration({
    prompt,
    language,
    files: params.project.files ?? [],
    assetManifest: params.project.assetManifest,
  });

  const warnings = result.issues
    .filter((issue) => issue.severity === "warning")
    .map((issue) => issue.message);

  return { warnings };
}
