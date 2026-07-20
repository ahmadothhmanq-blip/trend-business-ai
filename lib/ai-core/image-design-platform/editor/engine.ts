/**
 * DesignCanvasEngine — orchestrates document, layers, selection, transforms, history.
 */

import type {
  CanvasDocumentModel,
  CanvasElement,
  CanvasElementType,
} from "@/lib/ai-core/image-design-platform/editor/types";
import {
  createCanvasDocument,
  bumpDocumentVersion,
} from "@/lib/ai-core/image-design-platform/editor/document";
import { createElement } from "@/lib/ai-core/image-design-platform/editor/elements";
import {
  addLayer,
  removeLayer,
  duplicateLayer,
  reorderLayers,
  setLayerVisibility,
  setLayerLocked,
  addElementToLayer,
  removeElement,
  updateElementInDoc,
  findLayer,
} from "@/lib/ai-core/image-design-platform/editor/layers";
import {
  createSelectionState,
  selectElement,
  selectLayer,
  clearSelection,
  type SelectionState,
} from "@/lib/ai-core/image-design-platform/editor/selection";
import {
  moveElement,
  resizeElement,
  rotateElement,
  setOpacity,
  updateTextStyle,
  resizeCanvas,
} from "@/lib/ai-core/image-design-platform/editor/transform";
import {
  createHistoryStack,
  pushHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  type HistoryStack,
} from "@/lib/ai-core/image-design-platform/editor/history";

export type DesignCanvasEngineState = {
  document: CanvasDocumentModel;
  selection: SelectionState;
  history: HistoryStack;
};

export class DesignCanvasEngine {
  private state: DesignCanvasEngineState;

  constructor(initial?: Partial<DesignCanvasEngineState>) {
    this.state = {
      document: initial?.document ?? createCanvasDocument({ generationId: "draft", name: "Untitled" }),
      selection: initial?.selection ?? createSelectionState(),
      history: initial?.history ?? createHistoryStack(),
    };
  }

  getState(): DesignCanvasEngineState {
    return this.state;
  }

  getDocument(): CanvasDocumentModel {
    return this.state.document;
  }

  loadDocument(doc: CanvasDocumentModel): void {
    this.state = {
      document: doc,
      selection: createSelectionState(),
      history: createHistoryStack(),
    };
  }

  private commit(doc: CanvasDocumentModel, action: string): void {
    this.state = {
      ...this.state,
      document: doc,
      history: pushHistory(this.state.history, this.state.document, action),
    };
  }

  addLayer(name?: string): void {
    this.commit(addLayer(this.state.document, name), "add_layer");
  }

  removeLayer(layerId: string): void {
    this.commit(removeLayer(this.state.document, layerId), "remove_layer");
  }

  duplicateLayer(layerId: string): void {
    this.commit(duplicateLayer(this.state.document, layerId), "duplicate_layer");
  }

  reorderLayer(layerId: string, newIndex: number): void {
    this.commit(reorderLayers(this.state.document, layerId, newIndex), "reorder_layers");
  }

  toggleLayerVisibility(layerId: string): void {
    const layer = findLayer(this.state.document, layerId);
    if (!layer) return;
    this.commit(setLayerVisibility(this.state.document, layerId, !layer.visible), "toggle_visibility");
  }

  toggleLayerLock(layerId: string): void {
    const layer = findLayer(this.state.document, layerId);
    if (!layer) return;
    this.commit(setLayerLocked(this.state.document, layerId, !layer.locked), "toggle_lock");
  }

  addElement(layerId: string, type: CanvasElementType, params?: Partial<CanvasElement>): CanvasElement {
    const element = createElement(type, params ?? {});
    this.commit(addElementToLayer(this.state.document, layerId, element), `add_${type}`);
    this.state.selection = selectElement(this.state.selection, element.id);
    return element;
  }

  removeSelectedElements(): void {
    let doc = this.state.document;
    for (const id of this.state.selection.selectedElementIds) {
      doc = removeElement(doc, id);
    }
    this.commit(doc, "remove_elements");
    this.state.selection = clearSelection(this.state.selection);
  }

  selectElement(elementId: string, multi = false): void {
    this.state.selection = selectElement(this.state.selection, elementId, multi);
  }

  selectLayer(layerId: string): void {
    this.state.selection = selectLayer(this.state.selection, layerId);
  }

  updateElement(elementId: string, patch: Partial<CanvasElement>): void {
    this.commit(updateElementInDoc(this.state.document, elementId, patch), "update_element");
  }

  moveElement(elementId: string, x: number, y: number): void {
    this.commit(moveElement(this.state.document, elementId, x, y), "move");
  }

  resizeElement(elementId: string, width: number, height: number): void {
    this.commit(resizeElement(this.state.document, elementId, width, height), "resize");
  }

  rotateElement(elementId: string, rotation: number): void {
    this.commit(rotateElement(this.state.document, elementId, rotation), "rotate");
  }

  setOpacity(elementId: string, opacity: number): void {
    this.commit(setOpacity(this.state.document, elementId, opacity), "opacity");
  }

  updateText(elementId: string, patch: Parameters<typeof updateTextStyle>[2]): void {
    this.commit(updateTextStyle(this.state.document, elementId, patch), "text_style");
  }

  resizeCanvas(width: number, height: number): void {
    this.commit(resizeCanvas(this.state.document, width, height), "resize_canvas");
  }

  applyBrand(brand: CanvasDocumentModel["brand"]): void {
    const doc = bumpDocumentVersion({ ...this.state.document, brand });
    this.commit(doc, "apply_brand");
  }

  undo(): boolean {
    const result = undo(this.state.history, this.state.document);
    if (!result.document) return false;
    this.state = { ...this.state, document: result.document, history: result.stack };
    return true;
  }

  redo(): boolean {
    const result = redo(this.state.history, this.state.document);
    if (!result.document) return false;
    this.state = { ...this.state, document: result.document, history: result.stack };
    return true;
  }

  canUndo(): boolean {
    return canUndo(this.state.history);
  }

  canRedo(): boolean {
    return canRedo(this.state.history);
  }
}

export const designCanvasEngine = DesignCanvasEngine;
