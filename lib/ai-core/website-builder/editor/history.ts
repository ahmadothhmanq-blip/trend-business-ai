/**
 * In-memory undo/redo stacks for website editor snapshots.
 */

import type { WebsiteGeneratedStructure } from "@/lib/ai-core/website-builder/generation/contracts";
import type { EditorHistoryState } from "@/lib/ai-core/website-builder/editor/contracts";
import { WebsiteEditorError } from "@/lib/ai-core/website-builder/editor/errors";

export const EDITOR_HISTORY_LIMIT = 40;

export function cloneStructure(structure: WebsiteGeneratedStructure): WebsiteGeneratedStructure {
  return structuredClone(structure);
}

export function emptyEditorHistory(): EditorHistoryState {
  return { past: [], future: [] };
}

export function pushEditorHistory(
  history: EditorHistoryState,
  current: WebsiteGeneratedStructure,
): EditorHistoryState {
  const past = [...history.past, cloneStructure(current)].slice(-EDITOR_HISTORY_LIMIT);
  return { past, future: [] };
}

export function undoEditorHistory(
  history: EditorHistoryState,
  current: WebsiteGeneratedStructure,
): { history: EditorHistoryState; structure: WebsiteGeneratedStructure } {
  const previous = history.past.at(-1);
  if (!previous) {
    throw new WebsiteEditorError("Nothing to undo.", "nothing_to_undo");
  }
  return {
    structure: cloneStructure(previous),
    history: {
      past: history.past.slice(0, -1),
      future: [cloneStructure(current), ...history.future].slice(0, EDITOR_HISTORY_LIMIT),
    },
  };
}

export function redoEditorHistory(
  history: EditorHistoryState,
  current: WebsiteGeneratedStructure,
): { history: EditorHistoryState; structure: WebsiteGeneratedStructure } {
  const next = history.future[0];
  if (!next) {
    throw new WebsiteEditorError("Nothing to redo.", "nothing_to_redo");
  }
  return {
    structure: cloneStructure(next),
    history: {
      past: [...history.past, cloneStructure(current)].slice(-EDITOR_HISTORY_LIMIT),
      future: history.future.slice(1),
    },
  };
}
