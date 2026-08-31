import type { EditorCommand } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";

export type EditorHistory = {
  undoStack: EditorCommand[];
  redoStack: EditorCommand[];
};

export function createEditorHistory(): EditorHistory {
  return { undoStack: [], redoStack: [] };
}

export function pushEditorCommand(history: EditorHistory, command: EditorCommand): EditorHistory {
  return {
    undoStack: [...history.undoStack, command],
    redoStack: [],
  };
}

export function undoEditorCommand(history: EditorHistory): { history: EditorHistory; command: EditorCommand | null } {
  const command = history.undoStack[history.undoStack.length - 1] || null;
  if (!command) return { history, command: null };
  return {
    command,
    history: {
      undoStack: history.undoStack.slice(0, -1),
      redoStack: [...history.redoStack, command],
    },
  };
}

export function redoEditorCommand(history: EditorHistory): { history: EditorHistory; command: EditorCommand | null } {
  const command = history.redoStack[history.redoStack.length - 1] || null;
  if (!command) return { history, command: null };
  return {
    command,
    history: {
      undoStack: [...history.undoStack, command],
      redoStack: history.redoStack.slice(0, -1),
    },
  };
}
