/**
 * Undo / Redo history for the Visual Website Editor.
 */

import type { VisualDocument, VisualHistoryEntry } from "@/lib/ai-core/visual-editor/types";

export type VisualHistoryState = {
  past: VisualHistoryEntry[];
  present: VisualDocument;
  future: VisualHistoryEntry[];
};

export function createVisualHistory(document: VisualDocument): VisualHistoryState {
  return { past: [], present: document, future: [] };
}

export function pushVisualHistory(
  state: VisualHistoryState,
  next: VisualDocument,
  label: string,
  limit = 40,
): VisualHistoryState {
  const entry: VisualHistoryEntry = {
    document: state.present,
    label,
  };
  const past = [...state.past, entry].slice(-limit);
  return {
    past,
    present: { ...next, dirty: true, updatedAt: new Date().toISOString() },
    future: [],
  };
}

export function undoVisualHistory(
  state: VisualHistoryState,
): VisualHistoryState {
  if (!state.past.length) return state;
  const previous = state.past[state.past.length - 1]!;
  return {
    past: state.past.slice(0, -1),
    present: {
      ...previous.document,
      dirty: true,
      updatedAt: new Date().toISOString(),
    },
    future: [
      { document: state.present, label: "redo" },
      ...state.future,
    ],
  };
}

export function redoVisualHistory(
  state: VisualHistoryState,
): VisualHistoryState {
  if (!state.future.length) return state;
  const next = state.future[0]!;
  return {
    past: [
      ...state.past,
      { document: state.present, label: "undo" },
    ],
    present: {
      ...next.document,
      dirty: true,
      updatedAt: new Date().toISOString(),
    },
    future: state.future.slice(1),
  };
}
