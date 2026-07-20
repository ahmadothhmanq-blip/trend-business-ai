export type {
  CanvasElementType,
  CanvasElement,
  CanvasLayer,
  CanvasDocumentModel,
  CanvasBrandBinding,
  EditorHistoryEntry,
  CanvasTransform,
  ImageElement,
  TextElement,
  ShapeElement,
} from "@/lib/ai-core/image-design-platform/editor/types";

export {
  CANVAS_SIZE_PRESETS,
  createCanvasDocument,
  cloneDocument,
  bumpDocumentVersion,
  flattenElements,
  getCanvasPreset,
} from "@/lib/ai-core/image-design-platform/editor/document";

export { createElement, updateElement } from "@/lib/ai-core/image-design-platform/editor/elements";

export {
  addLayer,
  removeLayer,
  duplicateLayer,
  reorderLayers,
  findLayer,
  findElement,
  addElementToLayer,
} from "@/lib/ai-core/image-design-platform/editor/layers";

export {
  createSelectionState,
  selectElement,
  selectLayer,
  getSelectedElements,
  type SelectionState,
} from "@/lib/ai-core/image-design-platform/editor/selection";

export {
  moveElement,
  resizeElement,
  rotateElement,
  setOpacity,
  updateTextStyle,
  resizeCanvas,
} from "@/lib/ai-core/image-design-platform/editor/transform";

export {
  createHistoryStack,
  pushHistory,
  undo,
  redo,
  canUndo,
  canRedo,
  type HistoryStack,
} from "@/lib/ai-core/image-design-platform/editor/history";

export {
  DesignCanvasEngine,
  designCanvasEngine,
  type DesignCanvasEngineState,
} from "@/lib/ai-core/image-design-platform/editor/engine";
