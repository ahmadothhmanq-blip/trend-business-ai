export { EditorMvpError } from "@/lib/ai-core/video-production-platform/editor-mvp/errors";
export type {
  EditorAudioSnapshot,
  EditorCommand,
  EditorDocument,
  EditorScenePreview,
  ScenePatch,
  SceneEditorState,
  SceneTextOverlay,
} from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
export { editorStateOf, overlaysOf, withEditorState } from "@/lib/ai-core/video-production-platform/editor-mvp/contracts";
export {
  createEditorHistory,
  pushEditorCommand,
  redoEditorCommand,
  undoEditorCommand,
} from "@/lib/ai-core/video-production-platform/editor-mvp/history";
export {
  deleteEditorScene,
  duplicateEditorScene,
  loadEditorDocument,
  loadScenePreview,
  patchEditorScene,
  reorderEditorScenes,
  restoreEditorScene,
  saveEditorScenes,
  splitEditorScene,
  trimEditorScene,
} from "@/lib/ai-core/video-production-platform/editor-mvp/service";
