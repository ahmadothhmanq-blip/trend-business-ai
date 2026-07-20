/**
 * Undo/redo foundation for canvas editor.
 */

import type {
  CanvasDocumentModel,
  EditorHistoryEntry,
} from "@/lib/ai-core/image-design-platform/editor/types";
import { cloneDocument } from "@/lib/ai-core/image-design-platform/editor/document";
import { createId } from "@/lib/ai-core/image-design-platform/ids";

const MAX_HISTORY = 50;

export type HistoryStack = {
  past: EditorHistoryEntry[];
  future: EditorHistoryEntry[];
};

export function createHistoryStack(): HistoryStack {
  return { past: [], future: [] };
}

export function pushHistory(
  stack: HistoryStack,
  doc: CanvasDocumentModel,
  action: string,
): HistoryStack {
  const entry: EditorHistoryEntry = {
    id: createId("hist"),
    action,
    document: cloneDocument(doc),
    timestamp: new Date().toISOString(),
  };
  const past = [...stack.past, entry].slice(-MAX_HISTORY);
  return { past, future: [] };
}

export function undo(
  stack: HistoryStack,
  current: CanvasDocumentModel,
): { stack: HistoryStack; document: CanvasDocumentModel | null } {
  if (!stack.past.length) return { stack, document: null };
  const past = [...stack.past];
  const entry = past.pop()!;
  const futureEntry: EditorHistoryEntry = {
    id: createId("hist"),
    action: "redo-point",
    document: cloneDocument(current),
    timestamp: new Date().toISOString(),
  };
  return {
    stack: { past, future: [futureEntry, ...stack.future] },
    document: cloneDocument(entry.document),
  };
}

export function redo(
  stack: HistoryStack,
  current: CanvasDocumentModel,
): { stack: HistoryStack; document: CanvasDocumentModel | null } {
  if (!stack.future.length) return { stack, document: null };
  const future = [...stack.future];
  const entry = future.shift()!;
  const pastEntry: EditorHistoryEntry = {
    id: createId("hist"),
    action: "undo-point",
    document: cloneDocument(current),
    timestamp: new Date().toISOString(),
  };
  return {
    stack: { past: [...stack.past, pastEntry], future },
    document: cloneDocument(entry.document),
  };
}

export function canUndo(stack: HistoryStack): boolean {
  return stack.past.length > 0;
}

export function canRedo(stack: HistoryStack): boolean {
  return stack.future.length > 0;
}
