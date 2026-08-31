import type { Scene, SceneEditorState, SceneTextOverlay } from "@/lib/ai-core/video-production-platform/domain/contracts";

export type { SceneEditorState, SceneTextOverlay };

export type EditorProjectSummary = {
  id: string;
  title: string;
  state: string | null;
};

export type EditorPlanSummary = {
  id: string;
  version: number;
  isActive: true;
};

export type EditorScenePreview = {
  sceneId: string;
  artifactId: string | null;
  hasPlayable: boolean;
  mimeType?: string;
  url?: string;
  durationSec?: number;
};

export type EditorAudioSnapshot = {
  language: string | null;
  voiceScript: string | null;
  voice: Array<{ id: string; speaker?: string; script?: string; startSec?: number; durationSec?: number; status: string }>;
  music: Array<{ id: string; mood?: string; durationSec?: number; status: string }>;
  sfx: Array<{ id: string; cue?: string; timestampSec?: number; durationSec?: number; status: string }>;
  mixStatus: string | null;
  ttsStatus: "ready" | "unavailable";
  ttsReason: string;
};

export type EditorDocument = {
  project: EditorProjectSummary;
  plan: EditorPlanSummary;
  scenes: Scene[];
  audio: EditorAudioSnapshot;
  compositePreview: EditorScenePreview | null;
};

export type ScenePatch = {
  prompt?: string;
  duration?: number;
  camera?: Partial<Scene["camera"]>;
  visualStyle?: string;
  transition?: string;
  dialogue?: Partial<Scene["dialogue"]>;
  voiceRequired?: boolean;
  providerPreference?: Scene["providerPreference"];
  fallbackProvider?: Scene["fallbackProvider"];
  characters?: string[];
  products?: string[];
  references?: Scene["references"];
  editor?: SceneEditorState;
};

export type EditorCommand =
  | { type: "reorder"; before: string[]; after: string[] }
  | { type: "trim"; sceneId: string; beforeDuration: number; afterDuration: number; beforeTrimIn: number; afterTrimIn: number }
  | {
      type: "split";
      sceneId: string;
      newSceneId: string;
      atSec: number;
      beforeDuration: number;
      rightScene: Scene;
    }
  | { type: "duplicate"; sceneId: string; newSceneId: string; copy: Scene; index: number }
  | { type: "delete"; scene: Scene; index: number }
  | { type: "patch"; sceneId: string; before: ScenePatch; after: ScenePatch };

export function editorStateOf(scene: Scene): SceneEditorState {
  return scene.audio?.editor || {};
}

export function withEditorState(scene: Scene, editor: SceneEditorState): Scene {
  return {
    ...scene,
    audio: {
      ...scene.audio,
      editor: { ...editorStateOf(scene), ...editor },
    },
  };
}

export function overlaysOf(scene: Scene): SceneTextOverlay[] {
  return editorStateOf(scene).overlays || [];
}
