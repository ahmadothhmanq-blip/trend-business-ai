/**
 * WebsiteEditService — natural-language and structured edits on saved generations.
 * Extracted from POST /api/website-builder/[id]/edit (Phase 0).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { generateWebsite } from "@/lib/website-generator";
import { providerManager } from "@/lib/ai/provider-manager";
import type { AIProviderName } from "@/lib/ai/types";
import {
  asSupabaseMaybeSingleClient,
  asSupabaseSingleClient,
} from "@/lib/api/supabase-query";
import {
  extractWebsiteFilesFromBlueprint,
  loadWebsiteParentContext,
} from "@/plugins/website/iteration";
import {
  runWebsiteEditor,
  type WebsiteEditAction,
  type WebsiteEditResult,
} from "@/lib/ai-core/website-editor";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";
import type { WebsiteGeneration } from "@/types/database";
import { commitBlueprintRevision } from "@/lib/website/platform/commit";
import { findIdempotentCommit } from "@/lib/website/platform/idempotency";
import {
  loadWebsiteGenerationForUser,
  toWebsiteProject,
} from "@/lib/website/platform/load-generation";
import type { WebsiteCommitOptions } from "@/lib/website/platform/types";

export type WebsiteEditRequest = {
  command?: string;
  suggestionId?: string;
  actions?: WebsiteEditAction[];
  applyAi?: boolean;
};

export type WebsiteEditServiceSuccess = {
  ok: true;
  project: GeneratedWebsiteProject;
  generation: WebsiteGeneration;
  revision?: number;
  aiRunId?: string | null;
  editResult: {
    summary: string;
    actionsApplied: WebsiteEditResult["actionsApplied"];
    appliedNotes: WebsiteEditResult["appliedNotes"];
    understanding: WebsiteEditResult["understanding"];
    suggestions: WebsiteEditResult["suggestions"];
    continueInstruction: string | null;
  };
};

export type WebsiteEditServiceFailure = {
  ok: false;
  code: "NOT_FOUND" | "VALIDATION" | "CONFLICT" | "SERVER";
  error: string;
};

export type WebsiteEditServiceResult =
  | WebsiteEditServiceSuccess
  | WebsiteEditServiceFailure;

export type WebsiteEditServiceDeps = {
  generateWebsite?: typeof generateWebsite;
  loadUserSettings?: typeof providerManager.loadUserSettings;
  loadParentContext?: typeof loadWebsiteParentContext;
};

function resolveEditCommandAndActions(
  request: WebsiteEditRequest,
  project: GeneratedWebsiteProject,
): { command: string; actions: WebsiteEditAction[] } | { error: string } {
  let command = request.command?.trim() || "";
  let actions = [...(request.actions ?? [])];

  if (request.suggestionId && project.editorSuggestions?.suggestions) {
    const suggestion = project.editorSuggestions.suggestions.find(
      (s) => s.id === request.suggestionId,
    );
    if (suggestion) {
      command = command || suggestion.command;
      if (suggestion.actions?.length) {
        actions = [...actions, ...suggestion.actions];
      }
    }
  }

  if (!command && !actions.length) {
    return { error: "Provide a command, suggestionId, or actions." };
  }

  return { command, actions };
}

export async function executeWebsiteEdit(
  params: {
    supabase: SupabaseClient;
    userId: string;
    generationId: string;
    request: WebsiteEditRequest;
    commit?: Pick<WebsiteCommitOptions, "expectedRevision" | "idempotencyKey"> &
      Partial<Pick<WebsiteCommitOptions, "operation" | "mutationMeta">>;
  },
  deps: WebsiteEditServiceDeps = {},
): Promise<WebsiteEditServiceResult> {
  const generate = deps.generateWebsite ?? generateWebsite;
  const loadSettings = deps.loadUserSettings ?? providerManager.loadUserSettings.bind(providerManager);
  const loadParent = deps.loadParentContext ?? loadWebsiteParentContext;

  const idempotencyKey = params.commit?.idempotencyKey?.trim();
  if (idempotencyKey) {
    const cached = await findIdempotentCommit(params.supabase, {
      userId: params.userId,
      generationId: params.generationId,
      idempotencyKey,
    });
    const payload = cached?.response?.servicePayload;
    if (
      payload &&
      typeof payload === "object" &&
      "editResult" in payload
    ) {
      const generation = cached!.response.generation as WebsiteGeneration;
      const project = cached!.response.project as GeneratedWebsiteProject;
      return {
        ok: true,
        project,
        generation,
        editResult: payload.editResult as WebsiteEditServiceSuccess["editResult"],
      };
    }
  }

  const generation = await loadWebsiteGenerationForUser(
    params.supabase,
    params.userId,
    params.generationId,
  );
  if (!generation) {
    return { ok: false, code: "NOT_FOUND", error: "Generation not found." };
  }

  const project = toWebsiteProject(generation);
  const files = extractWebsiteFilesFromBlueprint(generation.blueprint);
  if (!files.length) {
    return {
      ok: false,
      code: "VALIDATION",
      error: "Generation has no editable files.",
    };
  }

  const resolved = resolveEditCommandAndActions(params.request, project);
  if ("error" in resolved) {
    return { ok: false, code: "VALIDATION", error: resolved.error };
  }

  const { command, actions } = resolved;

  const editResult = runWebsiteEditor({
    files,
    project,
    command,
    actions,
  });

  const applyAi = params.request.applyAi !== false;
  const settings = await loadSettings(
    asSupabaseSingleClient(params.supabase),
    params.userId,
  );
  const parentContext = await loadParent(
    asSupabaseMaybeSingleClient(params.supabase),
    params.userId,
    params.generationId,
  );

  const baseInput = {
    prompt: generation.business_description || command,
    language: "en",
    theme: "modern",
    features: [] as string[],
    productId: "website-builder",
    projectId: generation.project_id ?? undefined,
    mode: "continue" as const,
    parentGenerationId: params.generationId,
  };

  if (applyAi && editResult.continueInstruction) {
    const generated = await generate({
      prompt:
        generation.business_description ||
        project.description ||
        project.prompt ||
        "Edit this website with AI.",
      projectType: generation.website_type || "Business website",
      projectKind: "website",
      language: "en",
      theme: "modern",
      features: [],
      mode: "continue",
      parentGenerationId: params.generationId,
      continueInstruction: editResult.continueInstruction,
      optimizeWithAi: true,
      previousFiles: editResult.files,
      ...parentContext,
      userId: params.userId,
      preferredProvider: settings?.default_provider as AIProviderName | undefined,
      autoFallback: settings?.auto_fallback ?? true,
    });

    const committed = await commitBlueprintRevision({
      supabase: params.supabase,
      userId: params.userId,
      generationId: params.generationId,
      project: {
        ...generated,
        editorSuggestions: {
          suggestions: editResult.suggestions,
          summary: editResult.summary,
          generatedAt: new Date().toISOString(),
        },
      },
      projectKind: generated.projectKind ?? "website",
      input: {
        ...baseInput,
        continueInstruction: editResult.continueInstruction,
      },
      commit: {
        operation:
          params.commit?.operation ?? "website.edit.ai-continue",
        expectedRevision: params.commit?.expectedRevision,
        idempotencyKey: params.commit?.idempotencyKey,
        mutationMeta: params.commit?.mutationMeta ?? {
          command,
          applyAi: true,
        },
        idempotencyPayload: { editResult: formatEditResult(editResult) },
      },
    });

    if (!committed.ok) {
      return {
        ok: false,
        code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
        error: committed.error,
      };
    }

    return {
      ok: true,
      project: committed.project,
      generation: committed.generation,
      revision: committed.revision,
      aiRunId: committed.aiRunId,
      editResult: formatEditResult(editResult),
    };
  }

  const nextProject: GeneratedWebsiteProject = {
    ...project,
    files: editResult.files,
    sections: editResult.understanding.homeComponentOrder,
    components: editResult.understanding.homeComponentOrder,
    editorSuggestions: {
      suggestions: editResult.suggestions,
      summary: editResult.summary,
      generatedAt: new Date().toISOString(),
    },
    progressEvents: [
      ...(project.progressEvents ?? []),
      `[website-editor] ${editResult.summary}`,
    ],
  };

  const committed = await commitBlueprintRevision({
    supabase: params.supabase,
    userId: params.userId,
    generationId: params.generationId,
    project: nextProject,
    projectKind: nextProject.projectKind ?? "website",
    input: {
      ...baseInput,
      continueInstruction: command || editResult.summary,
    },
    commit: {
      operation: params.commit?.operation ?? "website.edit",
      expectedRevision: params.commit?.expectedRevision,
      idempotencyKey: params.commit?.idempotencyKey,
      mutationMeta: params.commit?.mutationMeta ?? {
        command,
        applyAi: false,
      },
      idempotencyPayload: { editResult: formatEditResult(editResult) },
    },
  });

  if (!committed.ok) {
    return {
      ok: false,
      code: committed.code === "CONFLICT" ? "CONFLICT" : "SERVER",
      error: committed.error,
    };
  }

  return {
    ok: true,
    project: committed.project,
    generation: committed.generation,
    revision: committed.revision,
    aiRunId: committed.aiRunId,
    editResult: formatEditResult(editResult),
  };
}

function formatEditResult(editResult: WebsiteEditResult) {
  return {
    summary: editResult.summary,
    actionsApplied: editResult.actionsApplied,
    appliedNotes: editResult.appliedNotes,
    understanding: editResult.understanding,
    suggestions: editResult.suggestions,
    continueInstruction: editResult.continueInstruction ?? null,
  };
}
