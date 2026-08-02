export type {
  VisualEditorExtensionSlot,
  VisualViewport,
  VisualNodeKind,
  VisualNode,
  VisualDesignTokens,
  VisualDocument,
  VisualHistoryEntry,
  VisualEditorSavePayload,
  VisualEditorCapability,
} from "@/lib/ai-core/visual-editor/types";
// VisualNodeKind re-exported above for marketplace → canvas mapping

export { buildVisualDocument } from "@/lib/ai-core/visual-editor/document";

export {
  createVisualHistory,
  pushVisualHistory,
  undoVisualHistory,
  redoVisualHistory,
  type VisualHistoryState,
} from "@/lib/ai-core/visual-editor/history";

export {
  insertNode,
  insertNodeBefore,
  insertNodeAfter,
  insertNodeAtEnd,
  insertMarketplaceComponent,
  moveNode,
  moveNodeUp,
  moveNodeDown,
  moveNodeToPosition,
  duplicateNode,
  deleteNode,
  updateNodeText,
  updateNodeImage,
  updateNodeSectionBackground,
  updateNodeSectionConfig,
  updateTokens,
  selectNode,
  selectButton,
  selectLink,
  selectIcon,
  setViewport,
  updateNodeButton,
  updateNodeLink,
  updateNodeIcon,
  documentToSaveActions,
} from "@/lib/ai-core/visual-editor/ops";

export { VISUAL_EDITOR_CAPABILITIES } from "@/lib/ai-core/visual-editor/capabilities";
