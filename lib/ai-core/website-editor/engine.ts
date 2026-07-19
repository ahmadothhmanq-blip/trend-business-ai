/**
 * Website Editor Intelligence Engine — understand → parse → apply → suggest.
 */

import {
  applyWebsiteEditActions,
  buildContinueInstructionFromActions,
} from "@/lib/ai-core/website-editor/actions";
import { parseWebsiteEditCommand } from "@/lib/ai-core/website-editor/parse-command";
import { buildWebsiteImprovementSuggestions } from "@/lib/ai-core/website-editor/suggestions";
import type {
  WebsiteEditAction,
  WebsiteEditResult,
  WebsiteEditorSuggestionsReport,
} from "@/lib/ai-core/website-editor/types";
import { understandWebsite } from "@/lib/ai-core/website-editor/understand";
import type { GeneratedProjectFile } from "@/lib/ai/types";
import type { GeneratedWebsiteProject } from "@/plugins/website/types";

export type RunWebsiteEditorParams = {
  files: GeneratedProjectFile[];
  project?: GeneratedWebsiteProject | null;
  /** Natural language command from the user. */
  command?: string;
  /** Optional pre-parsed / suggestion actions. */
  actions?: WebsiteEditAction[];
  onProgress?: (message: string) => void;
};

/**
 * Run Website Editor Intelligence on an existing generated site.
 */
export function runWebsiteEditor(
  params: RunWebsiteEditorParams,
): WebsiteEditResult {
  params.onProgress?.("Website Editor: understanding current website…");
  const understanding = understandWebsite({
    files: params.files,
    project: params.project,
    designPlan: params.project?.designPlan,
    brandIdentity: params.project?.designPlan?.brandIdentity,
  });
  params.onProgress?.(understanding.summary);

  const fromCommand = params.command
    ? parseWebsiteEditCommand(params.command, understanding)
    : [];
  const actions = [...(params.actions ?? []), ...fromCommand];

  params.onProgress?.(
    actions.length
      ? `Website Editor: applying ${actions.length} edit action(s)…`
      : "Website Editor: no structural actions — building suggestions…",
  );

  const { files, applied, notes, pendingAiActions } = applyWebsiteEditActions({
    files: params.files,
    actions,
    understanding,
  });

  const refreshed = understandWebsite({
    files,
    project: params.project,
    designPlan: params.project?.designPlan,
    brandIdentity: params.project?.designPlan?.brandIdentity,
  });

  const suggestionReport = buildWebsiteImprovementSuggestions({
    understanding: refreshed,
    project: params.project,
  });

  const continueInstruction = buildContinueInstructionFromActions(
    params.command || "",
    pendingAiActions,
    notes,
  );

  const summary = [
    `Editor applied ${applied.length} action(s)`,
    notes.slice(0, 4).join(" · ") || "No structural changes",
    continueInstruction ? "AI continue recommended for remaining intent" : null,
  ]
    .filter(Boolean)
    .join(" — ");

  params.onProgress?.(summary);

  return {
    files,
    actionsApplied: applied,
    appliedNotes: notes,
    understanding: refreshed,
    continueInstruction,
    suggestions: suggestionReport.suggestions,
    summary,
  };
}

/**
 * Suggestions-only pass (after generation, no mutations).
 */
export function suggestWebsiteImprovements(params: {
  files: GeneratedProjectFile[];
  project?: GeneratedWebsiteProject | null;
}): WebsiteEditorSuggestionsReport {
  const understanding = understandWebsite({
    files: params.files,
    project: params.project,
    designPlan: params.project?.designPlan,
    brandIdentity: params.project?.designPlan?.brandIdentity,
  });
  return buildWebsiteImprovementSuggestions({
    understanding,
    project: params.project,
  });
}
