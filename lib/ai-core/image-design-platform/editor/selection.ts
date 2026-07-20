/**
 * Selection system for canvas editor.
 */

import type { CanvasDocumentModel } from "@/lib/ai-core/image-design-platform/editor/types";
import { findElement } from "@/lib/ai-core/image-design-platform/editor/layers";

export type SelectionState = {
  selectedElementIds: string[];
  selectedLayerId: string | null;
};

export function createSelectionState(): SelectionState {
  return { selectedElementIds: [], selectedLayerId: null };
}

export function selectElement(
  state: SelectionState,
  elementId: string,
  multi = false,
): SelectionState {
  if (multi) {
    const exists = state.selectedElementIds.includes(elementId);
    return {
      ...state,
      selectedElementIds: exists
        ? state.selectedElementIds.filter((id) => id !== elementId)
        : [...state.selectedElementIds, elementId],
    };
  }
  return { selectedElementIds: [elementId], selectedLayerId: state.selectedLayerId };
}

export function selectLayer(state: SelectionState, layerId: string): SelectionState {
  return { selectedLayerId: layerId, selectedElementIds: [] };
}

export function clearSelection(state: SelectionState): SelectionState {
  return { selectedElementIds: [], selectedLayerId: state.selectedLayerId };
}

export function getSelectedElements(doc: CanvasDocumentModel, state: SelectionState) {
  return state.selectedElementIds
    .map((id) => findElement(doc, id))
    .filter(Boolean) as NonNullable<ReturnType<typeof findElement>>[];
}
